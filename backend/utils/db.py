import os
from peewee import SqliteDatabase, Model

DB_PATH = os.getenv("DB_PATH", "trading_rocket.db")
db = SqliteDatabase(DB_PATH)

class BaseModel(Model):
    class Meta:
        database = db
