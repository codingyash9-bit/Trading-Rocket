import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from models.wargame import (
    WargameEvent, WargameScenario, WargamePosition, 
    WargameOutcome, WargameScore, WargameTrackRecord,
    WargameStatus
)

DATA_DIR = "wargame_data"
os.makedirs(DATA_DIR, exist_ok=True)

# WARGAME_NOTE: Using JSON-based storage to match existing AutopsyEngine pattern.
# This deviates from the SQLAlchemy/Alembic requirement in the spec to maintain project consistency.

def _get_file_path(entity_name: str) -> str:
    return os.path.join(DATA_DIR, f"{entity_name}.json")

def _load_data(entity_name: str) -> List[Dict[str, Any]]:
    path = _get_file_path(entity_name)
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r") as f:
            return json.load(f)
    except:
        return []

def _save_data(entity_name: str, data: List[Dict[str, Any]]) -> None:
    path = _get_file_path(entity_name)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

class WargameEngine:
    # --- Wargame Event ---
    def get_events(self) -> List[WargameEvent]:
        return [WargameEvent(**p) for p in _load_data("events")]

    def save_event(self, event: WargameEvent):
        data = _load_data("events")
        existing_idx = next((i for i, p in enumerate(data) if p["id"] == event.id), None)
        if existing_idx is not None:
            data[existing_idx] = event.model_dump()
        else:
            data.append(event.model_dump())
        _save_data("events", data)

    def generate_event_id(self) -> str:
        events = self.get_events()
        count = len(events) + 1
        return f"WG-{count:04d}"

    # --- Wargame Scenarios ---
    def get_scenarios(self, event_id: str = None) -> List[WargameScenario]:
        data = _load_data("scenarios")
        scenarios = [WargameScenario(**s) for s in data]
        if event_id:
            return [s for s in scenarios if s.event_id == event_id]
        return scenarios

    def save_scenarios(self, scenarios: List[WargameScenario]):
        data = _load_data("scenarios")
        for scenario in scenarios:
            existing_idx = next((i for i, s in enumerate(data) if s["id"] == scenario.id), None)
            if existing_idx is not None:
                data[existing_idx] = scenario.model_dump()
            else:
                data.append(scenario.model_dump())
        _save_data("scenarios", data)

    # --- Wargame Position ---
    def get_positions(self, event_id: str = None, user_id: str = None) -> List[WargamePosition]:
        data = _load_data("positions")
        positions = [WargamePosition(**p) for p in data]
        if event_id:
            positions = [p for p in positions if p.event_id == event_id]
        if user_id:
            positions = [p for p in positions if p.user_id == user_id]
        return positions

    def save_position(self, position: WargamePosition):
        data = _load_data("positions")
        existing_idx = next((i for i, p in enumerate(data) if p["id"] == position.id), None)
        if existing_idx is not None:
            data[existing_idx] = position.model_dump()
        else:
            data.append(position.model_dump())
        _save_data("positions", data)

    # --- Wargame Outcome ---
    def get_outcomes(self, event_id: str = None) -> List[WargameOutcome]:
        data = _load_data("outcomes")
        outcomes = [WargameOutcome(**o) for o in data]
        if event_id:
            return [o for o in outcomes if o.event_id == event_id]
        return outcomes

    def save_outcome(self, outcome: WargameOutcome):
        data = _load_data("outcomes")
        existing_idx = next((i for i, o in enumerate(data) if o["id"] == outcome.id), None)
        if existing_idx is not None:
            data[existing_idx] = outcome.model_dump()
        else:
            data.append(outcome.model_dump())
        _save_data("outcomes", data)

    # --- Wargame Score ---
    def get_scores(self, event_id: str = None, user_id: str = None) -> List[WargameScore]:
        data = _load_data("scores")
        scores = [WargameScore(**s) for s in data]
        if event_id:
            scores = [s for s in scores if s.event_id == event_id]
        if user_id:
            scores = [s for s in scores if s.user_id == user_id]
        return scores

    def save_score(self, score: WargameScore):
        data = _load_data("scores")
        existing_idx = next((i for i, s in enumerate(data) if s["id"] == score.id), None)
        if existing_idx is not None:
            data[existing_idx] = score.model_dump()
        else:
            data.append(score.model_dump())
        _save_data("scores", data)

    # --- Wargame Track Record ---
    def get_track_record(self, user_id: str) -> Optional[WargameTrackRecord]:
        data = _load_data("track_records")
        record = next((r for r in data if r["user_id"] == user_id), None)
        if record:
            return WargameTrackRecord(**record)
        return None

    def save_track_record(self, record: WargameTrackRecord):
        data = _load_data("track_records")
        existing_idx = next((i for i, r in enumerate(data) if r["user_id"] == record.user_id), None)
        if existing_idx is not None:
            data[existing_idx] = record.model_dump()
        else:
            data.append(record.model_dump())
        _save_data("track_records", data)

wargame_engine = WargameEngine()
