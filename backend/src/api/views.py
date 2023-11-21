import logging
from typing import cast

from fastapi import (
    APIRouter,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)

from .crud import (
    delete_games_from_db,
    get_game_from_db,
    list_games_from_db,
    save_game,
    start_new_game,
)
from .models import Game, GameBase, Move, get_model_safe
from .shortcuts import make_move
from .validators import validate
from .websocket import connection_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/game", tags=["Game"])


@router.post("/start/")
async def start_game(players: GameBase) -> Game | None:
    game = await start_new_game(players.model_dump())
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Game cannot be started right now, please try again later",
        )
    return game


@router.get("/{game_id}/")
async def get_game(game_id: str) -> Game:
    game = await get_game_from_db(game_id)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    return game


@router.get("/")
async def list_games() -> list[Game]:
    return await list_games_from_db()  # type: ignore[return-value]


@router.delete("/")
async def delete_games() -> dict[str, int]:
    deleted_count = await delete_games_from_db()
    return {"deleted_count": deleted_count}


@router.websocket("/ws/game/{game_id}/")
async def websocket_game_endpoint(websocket: WebSocket, game_id: str) -> None:
    await connection_manager.connect(websocket, game_id)

    try:
        while True:
            move_data = await websocket.receive_json()

            # get game and move
            game = await get_game_from_db(game_id)
            move = get_model_safe(Move, move_data)

            # validations
            error_msg = validate(game, move)  # type: ignore[arg-type]
            if error_msg:
                logger.warning(error_msg)
                continue

            # make move
            game = cast(Game, game)
            move = cast(Move, move)
            make_move(game, move.col)  # type: ignore[arg-type]

            # update DB
            result = cast(Game, await save_game(game_id, game.model_dump()))

            # broadcast game to all players
            await connection_manager.broadcast_game(game_id, result)
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, game_id)
