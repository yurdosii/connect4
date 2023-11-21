"""
winner values: 1 / 2 / None
there is a winner -> winner is not None and finished_at is not None
draw -> winner is None and finished_at is not None
"""
import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field, ValidationError, computed_field
from pydantic.types import NonNegativeInt

from ..constants import PlayerEnum
from ..core import calculate_move_row_by_col
from .fields import PyObjectId


class GameStatusEnum(StrEnum):
    in_progress = "In progress"
    winner_player1 = "Player 1 won"
    winner_player2 = "Player 2 won"
    draw = "Draw"


class CreatedUpdatedMixin(BaseModel):
    created_at: datetime.datetime
    updated_at: datetime.datetime


class MongoDBModel(BaseModel):
    class Meta:
        collection_name: str

    id: PyObjectId

    @classmethod
    def get_collection_name(cls) -> str:
        return cls.Meta.collection_name


class GameBase(BaseModel):
    player1: str = Field(
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_]+$",
        examples=["name1"],
    )
    player2: str = Field(
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_]+$",
        examples=["name2"],
    )


class Game(MongoDBModel, GameBase, CreatedUpdatedMixin):
    class Meta:
        collection_name = "games"

    board: list[list[int]]
    move_number: int = 1
    winner: PlayerEnum | None = None
    finished_at: datetime.datetime | None = None

    @property
    def next_player_to_move_username(self) -> str:
        return self.player1 if self.move_number % 2 else self.player2

    @property
    def next_player_to_move_sign(self) -> int:
        next_player_username = self.next_player_to_move_username
        return (
            PlayerEnum.player1
            if next_player_username == self.player1
            else PlayerEnum.player2
        )

    @computed_field
    def status(self) -> GameStatusEnum:
        if self.finished_at is None:
            return GameStatusEnum.in_progress
        elif self.winner:
            return (
                GameStatusEnum.winner_player1
                if self.winner == PlayerEnum.player1
                else GameStatusEnum.winner_player2
            )
        return GameStatusEnum.draw

    def get_move_row_by_col(self, col: int) -> int | None:
        return calculate_move_row_by_col(self.board, col)


class Move(BaseModel):
    player: str
    col: NonNegativeInt


def get_model_safe(
    model: type[BaseModel], model_data: dict[str, Any]
) -> BaseModel | None:
    try:
        return model(**model_data)
    except ValidationError:
        return None
