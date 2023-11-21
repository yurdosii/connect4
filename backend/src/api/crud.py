import logging
from typing import Any

from ..core import init_board
from ..db.client import MongoDBClient
from .models import Game

logger = logging.getLogger(__name__)


async def start_new_game(players_data: dict[str, str]) -> Game | None:
    client = MongoDBClient()
    data = players_data | {"board": init_board()}
    inserted_result = await client.insert(Game, data)  # type: ignore[arg-type]
    return await get_game_from_db(str(inserted_result.inserted_id))


async def get_game_from_db(game_id: str) -> Game | None:
    client = MongoDBClient()
    game_data = await client.get(Game, game_id)  # type: ignore[arg-type]
    if game_data is None:
        return None
    return Game(**game_data)


async def list_games_from_db() -> list[dict[str, Any]]:
    client = MongoDBClient()
    return await client.list(Game)  # type: ignore[arg-type]


async def save_game(game_id: str, game_data: dict[str, Any]) -> Game | None:
    client = MongoDBClient()
    await client.update_one(Game, game_id, game_data)  # type: ignore[arg-type]
    return await get_game_from_db(game_id)


async def delete_games_from_db() -> int:
    client = MongoDBClient()
    result = await client.delete_many(Game)  # type: ignore[arg-type]
    return result.deleted_count
