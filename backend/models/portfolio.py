from peewee import CharField, TextField, FloatField, DateTimeField, ForeignKeyField
from utils.db import BaseModel
import datetime
import uuid

class PortfolioReport(BaseModel):
    id = CharField(primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = CharField(index=True)
    ticker = CharField()
    company_name = CharField()
    exchange = CharField()
    generated_at = DateTimeField(default=datetime.datetime.now)
    reports_json = TextField() # Store nested report sections as JSON
    overall_score = FloatField()
    recommendation = CharField()

    class Meta:
        table_name = 'portfolio_reports'
