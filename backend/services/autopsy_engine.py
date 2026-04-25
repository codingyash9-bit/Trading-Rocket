import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from models.prediction import Prediction, PredictionStatus, Direction
from models.outcome import Outcome, Verdict
from models.accuracy_score import AccuracyScore
from models.bias_profile import BiasProfile
from models.confidence_snapshot import ConfidenceSnapshot

DATA_DIR = "autopsy_data"
os.makedirs(DATA_DIR, exist_ok=True)

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

class AutopsyEngine:
    # --- Data Access Methods ---
    def get_predictions(self) -> List[Prediction]:
        return [Prediction(**p) for p in _load_data("predictions")]

    def save_prediction(self, prediction: Prediction):
        data = _load_data("predictions")
        existing_idx = next((i for i, p in enumerate(data) if p["id"] == prediction.id), None)
        if existing_idx is not None:
            data[existing_idx] = prediction.model_dump()
        else:
            data.append(prediction.model_dump())
        _save_data("predictions", data)

    def get_outcomes(self) -> List[Outcome]:
        return [Outcome(**o) for o in _load_data("outcomes")]

    def save_outcome(self, outcome: Outcome):
        data = _load_data("outcomes")
        existing_idx = next((i for i, o in enumerate(data) if o["id"] == outcome.id), None)
        if existing_idx is not None:
            data[existing_idx] = outcome.model_dump()
        else:
            data.append(outcome.model_dump())
        _save_data("outcomes", data)

    def get_accuracy_scores(self) -> List[AccuracyScore]:
        return [AccuracyScore(**a) for a in _load_data("accuracy_scores")]

    def save_accuracy_score(self, score: AccuracyScore):
        data = _load_data("accuracy_scores")
        existing_idx = next((i for i, a in enumerate(data) if a["id"] == score.id), None)
        if existing_idx is not None:
            data[existing_idx] = score.model_dump()
        else:
            data.append(score.model_dump())
        _save_data("accuracy_scores", data)

    def get_bias_profiles(self) -> List[BiasProfile]:
        return [BiasProfile(**b) for b in _load_data("bias_profiles")]

    def save_bias_profile(self, profile: BiasProfile):
        data = _load_data("bias_profiles")
        # Upsert based on user_id, sector, market_cap_category
        existing_idx = next((i for i, b in enumerate(data) if 
                             b["user_id"] == profile.user_id and 
                             b["sector"] == profile.sector and 
                             b["market_cap_category"] == profile.market_cap_category), None)
        if existing_idx is not None:
            data[existing_idx] = profile.model_dump()
        else:
            data.append(profile.model_dump())
        _save_data("bias_profiles", data)

    def get_snapshots(self) -> List[ConfidenceSnapshot]:
        return [ConfidenceSnapshot(**s) for s in _load_data("confidence_snapshots")]

    def save_snapshot(self, snapshot: ConfidenceSnapshot):
        data = _load_data("confidence_snapshots")
        data.append(snapshot.model_dump())
        _save_data("confidence_snapshots", data)

    # --- Business Logic ---
    def generate_case_id(self) -> str:
        preds = self.get_predictions()
        count = len(preds) + 1
        return f"TR-{count:04d}"

    def get_full_report(self, case_id: str) -> Optional[Dict[str, Any]]:
        preds = self.get_predictions()
        prediction = next((p for p in preds if p.case_id == case_id), None)
        if not prediction:
            return None

        outcomes = self.get_outcomes()
        outcome = next((o for o in outcomes if o.prediction_id == prediction.id), None)

        scores = self.get_accuracy_scores()
        score = next((s for s in scores if s.prediction_id == prediction.id), None)

        snapshots = [s for s in self.get_snapshots() if s.prediction_id == prediction.id]
        snapshots.sort(key=lambda x: x.snapshot_date)

        profiles = self.get_bias_profiles()
        profile = next((p for p in profiles if 
                        p.user_id == prediction.user_id and 
                        p.sector == prediction.sector and 
                        p.market_cap_category == prediction.market_cap_category), None)

        # Assemble Verdict Summary
        verdict_summary = "Prediction is currently OPEN."
        if outcome and score:
            if outcome.verdict == Verdict.CONFIRMED:
                verdict_summary = f"Strong outcome. Hit {outcome.actual_move_percent}% move in {outcome.actual_days_to_resolve} days."
            elif outcome.verdict == Verdict.PARTIAL:
                verdict_summary = f"Partial success. Moved in right direction but fell short or took longer."
            else:
                verdict_summary = f"Invalidated. Falsification condition triggered at {outcome.falsification_closest_price}."

        # Assemble Bias Warning
        bias_warning = None
        if profile:
            warnings = []
            if profile.over_bullish_rate > 0.6:
                warnings.append("High Over-Bullish Rate")
            if profile.speed_underestimate_rate > 0.6:
                warnings.append("Chronic Speed Underestimation")
            if warnings:
                bias_warning = "WARNING: " + ", ".join(warnings) + " detected in this sector/cap."

        return {
            "prediction": prediction.model_dump(),
            "outcome": outcome.model_dump() if outcome else None,
            "accuracy_score": score.model_dump() if score else None,
            "bias_profile": profile.model_dump() if profile else None,
            "confidence_snapshots": [s.model_dump() for s in snapshots],
            "verdict_summary": verdict_summary,
            "bias_warning": bias_warning
        }

autopsy_engine = AutopsyEngine()
