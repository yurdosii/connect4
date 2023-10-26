from environs import Env

env = Env()
env.read_env()


# MongoDB
MONGO_DB_HOST = env.str("MONGO_DB_HOST", "localhost")
MONGO_DB_PORT = env.int("MONGO_DB_PORT", 27017)
MONGO_DB_DB = env.str("MONGO_DB_DB", "db_connect4")
