import datetime
import importlib
from typing import Any, cast

from bson import ObjectId
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase
from pymongo.results import InsertOneResult, UpdateResult

from src.api.models import MongoDBModel


class MongoDBClient:
    __instance = None
    mongodb: AsyncIOMotorDatabase

    def __new__(cls) -> "MongoDBClient":
        if cls.__instance is None:
            cls.__instance = super().__new__(cls)
            app = get_current_app()
            cls.__instance.mongodb = app.mongodb  # type: ignore[attr-defined]
        return cls.__instance

    def get_collection(self, model: MongoDBModel) -> AsyncIOMotorCollection:
        collection_name = model.get_collection_name()
        return self.mongodb.get_collection(collection_name)

    async def insert(
        self, model: MongoDBModel, data: dict[str, Any]
    ) -> InsertOneResult:
        collection = self.get_collection(model)
        now = datetime.datetime.now()
        data |= {"created_at": now, "updated_at": now}
        return await collection.insert_one(data)

    async def get(self, model: MongoDBModel, id: str) -> dict[str, Any] | None:
        collection = self.get_collection(model)
        object_id = ObjectId(id)
        result = cast(
            dict[str, Any], await collection.find_one({"_id": object_id})
        )
        if result is None:
            return None
        return result | {"id": result.pop("_id")}  # _id -> id

    async def update_one(
        self, model: MongoDBModel, id: str, data: dict[str, Any]
    ) -> UpdateResult:
        collection = self.get_collection(model)
        object_id = ObjectId(id)
        data |= {"updated_at": datetime.datetime.now()}
        return await collection.update_one({"_id": object_id}, {"$set": data})


def get_current_app() -> FastAPI:
    module = importlib.import_module("src.main")
    field = "app"
    return cast(FastAPI, getattr(module, field))
