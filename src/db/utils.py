from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from src.connect4.settings import MONGO_DB_DB, MONGO_DB_HOST, MONGO_DB_PORT


def get_mongodb() -> AsyncIOMotorDatabase:
    """Get MongoDB DB instance"""
    client = AsyncIOMotorClient(MONGO_DB_HOST, MONGO_DB_PORT)
    return client.get_database(MONGO_DB_DB)
