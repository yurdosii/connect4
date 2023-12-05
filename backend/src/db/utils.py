from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from ..connect4.settings import settings

MONGO_DB_MAX_POOL_SIZE: int = 50
MONGO_DB_MIN_POOL_SIZE: int = 0


def get_mongodb() -> AsyncIOMotorDatabase:
    """Get MongoDB DB instance"""
    client = AsyncIOMotorClient(
        host=settings.MONGO_DB_HOST,
        port=settings.MONGO_DB_PORT,
        maxPoolSize=MONGO_DB_MAX_POOL_SIZE,
        minPoolSize=MONGO_DB_MIN_POOL_SIZE,
    )

    return client.get_database(settings.MONGO_DB_DB)
