import logging
from typing import Any

from src.api.models import Game
from src.core import init_board
from src.db.client import MongoDBClient

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


async def save_game(game_id: str, game_data: dict[str, Any]) -> Game | None:
    client = MongoDBClient()
    await client.update_one(Game, game_id, game_data)  # type: ignore[arg-type]
    return await get_game_from_db(game_id)
