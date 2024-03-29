import logging
from typing import Any

from ..core import init_board
from ..db.client import MongoDBClient
from ..fields import PyObjectId
from .models import Game

logger = logging.getLogger(__name__)


async def start_new_game(player1: str) -> Game | None:
    client = MongoDBClient()
    game_data = {"player1": player1, "board": init_board()}
    inserted_result = await client.insert(Game, game_data)  # type: ignore[arg-type]
    return await get_game_from_db(id=inserted_result.inserted_id)


async def join_new_game(game: Game, player2: str) -> Game | None:
    client = MongoDBClient()
    game_data = game.model_dump() | {"player2": player2}
    await client.update_one(Game, game.id, game_data)  # type: ignore[arg-type]
    return await get_game_from_db(id=game.id)


async def get_game_from_db(**kwargs) -> Game | None:
    client = MongoDBClient()
    game_data = await client.get(Game, **kwargs)  # type: ignore[arg-type]
    if game_data is None:
        return None
    return Game(**game_data)


async def list_games_from_db() -> list[dict[str, Any]]:
    client = MongoDBClient()
    return await client.list(Game)  # type: ignore[arg-type]


async def save_game(
    game_id: PyObjectId, game_data: dict[str, Any]
) -> Game | None:
    client = MongoDBClient()
    await client.update_one(Game, game_id, game_data)  # type: ignore[arg-type]
    return await get_game_from_db(id=game_id)


async def delete_games_from_db() -> int:
    client = MongoDBClient()
    result = await client.delete_many(Game)  # type: ignore[arg-type]
    return result.deleted_count
