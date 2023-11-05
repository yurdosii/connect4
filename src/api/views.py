import datetime
import logging
from typing import cast

from fastapi import (
    APIRouter,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)

from src.api.crud import get_game_from_db, save_game, start_new_game
from src.api.models import Game, GameBase, PlayerEnum
from src.api.websocket import connection_manager
from src.constants import M, N
from src.core import detect_winner, is_valid_move, make_move

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


@router.websocket("/ws/games/{game_id}/")
async def websocket_game_endpoint(websocket: WebSocket, game_id: str) -> None:
    await connection_manager.connect(websocket, game_id)

    try:
        while True:
            data = await websocket.receive_json()

            # get game from DB
            game = await get_game_from_db(game_id)
            if game is None:
                logger.warning(f"Game {game_id=} not found")
                continue

            if game.finished_at:
                logger.warning(
                    f"Game {game_id=} was finished, game status: {game.get_status()}"
                )
                continue

            # validate move
            player = data.get("player")
            if (
                player is None
                or player != game.get_next_player_to_move_username()
            ):
                logger.warning(f"This is not {player}'s move.")
                continue

            row = data.get("row")
            col = data.get("col")
            if not is_valid_move(row, col, game.board):
                logger.warning(f"Move {row=}{col=} is not valid")
                continue

            # make move
            make_move(
                row, col, game.board, game.get_next_player_to_move_sign()
            )
            game.move_number += 1

            # update game
            winner = detect_winner(game.board)
            if winner:
                game.winner = PlayerEnum(winner)
                game.finished_at = datetime.datetime.now()
            elif game.move_number == N * M:
                game.winner = None
                game.finished_at = datetime.datetime.now()

            # save move
            result = cast(Game, await save_game(game_id, game.model_dump()))

            # broadcast game to all players
            await connection_manager.broadcast_game(game_id, result)
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, game_id)
