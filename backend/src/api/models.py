"""
winner values: 1 / 2 / None
there is a winner -> winner is not None and finished_at is not None
draw -> winner is None and finished_at is not None
"""
import datetime
from enum import StrEnum

from pydantic import BaseModel, Field, computed_field
from pydantic.fields import FieldInfo
from pydantic.types import NonNegativeInt

from ..constants import PlayerEnum
from ..core import calculate_move_row_by_col
from ..models import CreatedUpdatedMixin, MongoDBModel

PLAYER_FIELD = Field(
    min_length=3,
    max_length=50,
    pattern=r"^[a-zA-Z0-9_ ]+$",
    examples=["name1"],
)


class GameStatusEnum(StrEnum):
    pending = "Pending"
    in_progress = "In progress"
    winner_player1 = "Player 1 won"
    winner_player2 = "Player 2 won"
    draw = "Draw"


class StartGame(BaseModel):
    player: str = PLAYER_FIELD


class MoveInput(BaseModel):
    player: str
    col: NonNegativeInt


class Move(BaseModel):
    row: int
    col: int
    val: int


class Game(MongoDBModel, CreatedUpdatedMixin):
    class Meta:
        collection_name = "games"

    player1: str = PLAYER_FIELD
    player2: str | None = FieldInfo.merge_field_infos(  # type: ignore[assignment]
        PLAYER_FIELD, default=None
    )
    token: str
    move_number: int = 1
    board: list[list[int]]
    moves: list[Move] = Field(default_factory=list)
    winner: PlayerEnum | None = None
    finished_at: datetime.datetime | None = None

    @property
    def next_player_to_move_username(self) -> str | None:
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
        if self.player2 is None:
            return GameStatusEnum.pending
        elif self.finished_at is None:
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
