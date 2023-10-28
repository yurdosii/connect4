from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        env_prefix = "app_"

    # MongoDB
    MONGO_DB_HOST: str
    MONGO_DB_PORT: int
    MONGO_DB_DB: str


settings = AppSettings()
