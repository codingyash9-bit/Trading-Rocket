from peewee import CharField, TextField, FloatField, DateTimeField
from utils.db import BaseModel
import datetime
import uuid

class RadarStock(BaseModel):
    id = CharField(primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = CharField(index=True)
    symbol = CharField()
    name = CharField()
    exchange = CharField(default="NSE")
    last_analysis_json = TextField(null=True)
    price = FloatField(null=True)
    change_percent = FloatField(null=True)
    sentiment = CharField(default="neutral")
    key_news_json = TextField(null=True) # Store as JSON list
    added_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)

    class Meta:
        table_name = 'radar_stocks'
