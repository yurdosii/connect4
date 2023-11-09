from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI

from .api.views import router as api_router
from .db.utils import get_mongodb


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # set up MongoDB
    mongodb = get_mongodb()
    app.mongodb = mongodb  # type: ignore[attr-defined]
    yield
    # close MongoDB connection
    app.mongodb.close()  # type: ignore[attr-defined, operator]


app = FastAPI(lifespan=lifespan)
app.include_router(api_router)


@app.get("/")
async def read_root() -> dict[str, str]:
    return {"Hello": "world"}
