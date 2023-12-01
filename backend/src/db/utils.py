from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from ..connect4.settings import settings


def get_mongodb() -> AsyncIOMotorDatabase:
    """Get MongoDB DB instance"""
    client = AsyncIOMotorClient(settings.MONGO_DB_HOST, settings.MONGO_DB_PORT)
    return client.get_database(settings.MONGO_DB_DB)
