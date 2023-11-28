import datetime
from typing import Any

from pydantic import BaseModel, ValidationError

from .fields import PyObjectId


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


def get_model_safe(
    model: type[BaseModel], model_data: dict[str, Any]
) -> BaseModel | None:
    try:
        return model(**model_data)
    except ValidationError:
        return None
