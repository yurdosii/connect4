import logging
from typing import cast

from fastapi import (
    APIRouter,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)

from ..fields import PyObjectId
from ..models import get_model_safe
from .crud import (
    delete_games_from_db,
    get_game_from_db,
    join_new_game,
    list_games_from_db,
    save_game,
    start_new_game,
)
from .models import Game, MoveInput, StartGame
from .shortcuts import make_move
from .validators import validate
from .websocket import connection_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/game", tags=["Game"])


@router.post("/start/")
async def start_game(player_data: StartGame) -> Game:
    game = await start_new_game(player_data.player)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Game cannot be started right now, please try again later",
        )
    return game


@router.get("/")
async def list_games() -> list[Game]:
    return await list_games_from_db()  # type: ignore[return-value]


@router.get("/{game_id}/")
async def get_game_by_id(game_id: PyObjectId) -> Game:
    game = await get_game_from_db(id=game_id)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    return game


@router.delete("/")
async def delete_games() -> dict[str, int]:
    deleted_count = await delete_games_from_db()
    return {"deleted_count": deleted_count}


@router.post("/join/{token}/")
async def join_game(token: str, player_data: StartGame) -> Game:
    game = await get_game_from_db(token=token)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )

    if game.player2 is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game already started",
        )

    updated_game = await join_new_game(game, player_data.player)
    if updated_game is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Game cannot be joined right now, please try again later",
        )

    # notify first player about joining
    await connection_manager.broadcast_game(updated_game)

    return updated_game


@router.get("/join/{token}/")
async def get_game_by_token(token: str) -> Game:
    game = await get_game_from_db(token=token)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    return game


@router.websocket("/ws/game/{game_id}/")
async def websocket_game_endpoint(
    websocket: WebSocket, game_id: PyObjectId
) -> None:
    await connection_manager.connect(websocket, game_id)

    try:
        while True:
            move_data = await websocket.receive_json()

            # get game and move
            game = await get_game_from_db(id=game_id)
            move = get_model_safe(MoveInput, move_data)

            # validations
            error_msg = validate(game, move)  # type: ignore[arg-type]
            if error_msg:
                logger.warning(error_msg)
                continue

            # make move
            game = cast(Game, game)
            move = cast(MoveInput, move)
            make_move(game, move.col)  # type: ignore[arg-type]

            # update DB
            updated_game = cast(
                Game, await save_game(game_id, game.model_dump())
            )

            # broadcast game to all players
            await connection_manager.broadcast_game(updated_game)
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, game_id)
