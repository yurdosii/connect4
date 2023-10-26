from typing import cast

from fastapi import APIRouter

from src.api.models import Game, GameBase
from src.core import init_board
from src.db.client import MongoDBClient

router = APIRouter(prefix="/game", tags=["Game"])


@router.post("/start")
async def start_new_game(players: GameBase) -> Game:
    data = players.model_dump() | {"board": init_board()}
    client = MongoDBClient()
    inserted_result = await client.insert(Game, data)  # type: ignore[arg-type]
    return cast(
        Game,
        await client.get(
            Game, inserted_result.inserted_id  # type: ignore[arg-type]
        ),
    )
