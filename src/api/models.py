import datetime

from pydantic import BaseModel, Field

from src.api.fields import PyObjectId


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
    is_active: bool = True
