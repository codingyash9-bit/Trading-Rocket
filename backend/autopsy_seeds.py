import uuid
import random
from datetime import datetime, timedelta
import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.prediction import Prediction, Direction, PredictionStatus, MarketCapCategory
from models.outcome import Outcome, Verdict
from models.confidence_snapshot import ConfidenceSnapshot
from services.autopsy_engine import autopsy_engine
from services.scoring import calculate_accuracy_score
from services.bias_engine import update_bias_profile

USER_ID = "seed_user_123"

def generate_snapshots(prediction: Prediction, outcome: Outcome, days: int = 14):
    start_date = datetime.fromisoformat(prediction.sealed_at)
    
    current_price = prediction.price_at_call
    price_diff = outcome.actual_close_price - current_price
    daily_step = price_diff / days
    
    current_confidence = prediction.confidence_score
    
    for day in range(1, days + 1):
        snapshot_date = start_date + timedelta(days=day)
        current_price += daily_step + (random.uniform(-0.01, 0.01) * current_price) # add some noise
        
        distance = abs(((current_price - prediction.falsification_price) / prediction.falsification_price) * 100)
        
        # update confidence
        if distance < 1:
            current_confidence *= 0.40
        elif distance < 3:
            current_confidence *= 0.60
        elif distance < 5:
            current_confidence *= 0.80
        else:
            compounded = current_confidence * 1.05
            current_confidence = min(compounded, 95)
            
        snapshot = ConfidenceSnapshot(
            id=str(uuid.uuid4()),
            prediction_id=prediction.id,
            snapshot_date=snapshot_date.isoformat(),
            price_on_date=current_price,
            confidence_on_date=int(current_confidence),
            distance_from_falsification=distance
        )
        autopsy_engine.save_snapshot(snapshot)

def seed_data():
    print("Seeding Autopsy Data...")
    
    now = datetime.now()
    
    # CASE 1: CONFIRMED
    pred1_id = str(uuid.uuid4())
    pred1 = Prediction(
        id=pred1_id,
        case_id="TR-0001",
        ticker="RELIANCE",
        user_id=USER_ID,
        direction=Direction.BULLISH,
        confidence_score=80,
        price_at_call=2800.0,
        predicted_range_low=2950.0,
        predicted_range_high=3050.0,
        time_horizon_days=30,
        falsification_condition="Closes below 2700",
        falsification_price=2700.0,
        sector="Energy",
        market_cap_category=MarketCapCategory.LARGE,
        sealed_at=(now - timedelta(days=35)).isoformat(),
        status=PredictionStatus.RESOLVED
    )
    autopsy_engine.save_prediction(pred1)
    
    outcome1 = Outcome(
        id=str(uuid.uuid4()),
        prediction_id=pred1_id,
        actual_close_price=3000.0,
        actual_move_percent=7.14,
        actual_days_to_resolve=28,
        falsification_triggered=False,
        falsification_closest_price=2780.0,
        resolved_at=(now - timedelta(days=7)).isoformat(),
        verdict=Verdict.CONFIRMED
    )
    autopsy_engine.save_outcome(outcome1)
    autopsy_engine.save_accuracy_score(calculate_accuracy_score(pred1, outcome1))
    generate_snapshots(pred1, outcome1)
    
    # CASE 2: PARTIAL
    pred2_id = str(uuid.uuid4())
    pred2 = Prediction(
        id=pred2_id,
        case_id="TR-0002",
        ticker="TCS",
        user_id=USER_ID,
        direction=Direction.BEARISH,
        confidence_score=75,
        price_at_call=4100.0,
        predicted_range_low=3800.0,
        predicted_range_high=3900.0,
        time_horizon_days=20,
        falsification_condition="Closes above 4250",
        falsification_price=4250.0,
        sector="IT",
        market_cap_category=MarketCapCategory.LARGE,
        sealed_at=(now - timedelta(days=25)).isoformat(),
        status=PredictionStatus.RESOLVED
    )
    autopsy_engine.save_prediction(pred2)
    
    outcome2 = Outcome(
        id=str(uuid.uuid4()),
        prediction_id=pred2_id,
        actual_close_price=3950.0, # Outside range, but right direction
        actual_move_percent=-3.65,
        actual_days_to_resolve=20,
        falsification_triggered=False,
        falsification_closest_price=4150.0,
        resolved_at=(now - timedelta(days=5)).isoformat(),
        verdict=Verdict.PARTIAL
    )
    autopsy_engine.save_outcome(outcome2)
    autopsy_engine.save_accuracy_score(calculate_accuracy_score(pred2, outcome2))
    generate_snapshots(pred2, outcome2)

    # CASE 3: INVALIDATED
    pred3_id = str(uuid.uuid4())
    pred3 = Prediction(
        id=pred3_id,
        case_id="TR-0003",
        ticker="ZOMATO",
        user_id=USER_ID,
        direction=Direction.BULLISH,
        confidence_score=90,
        price_at_call=150.0,
        predicted_range_low=180.0,
        predicted_range_high=200.0,
        time_horizon_days=15,
        falsification_condition="Closes below 135",
        falsification_price=135.0,
        sector="Consumer",
        market_cap_category=MarketCapCategory.LARGE,
        sealed_at=(now - timedelta(days=16)).isoformat(),
        status=PredictionStatus.RESOLVED
    )
    autopsy_engine.save_prediction(pred3)
    
    outcome3 = Outcome(
        id=str(uuid.uuid4()),
        prediction_id=pred3_id,
        actual_close_price=130.0, # Triggered falsification
        actual_move_percent=-13.33,
        actual_days_to_resolve=12,
        falsification_triggered=True,
        falsification_closest_price=130.0,
        resolved_at=(now - timedelta(days=4)).isoformat(),
        verdict=Verdict.INVALIDATED
    )
    autopsy_engine.save_outcome(outcome3)
    autopsy_engine.save_accuracy_score(calculate_accuracy_score(pred3, outcome3))
    generate_snapshots(pred3, outcome3)
    
    # Update bias profiles for the user
    update_bias_profile(USER_ID, "Energy", MarketCapCategory.LARGE)
    update_bias_profile(USER_ID, "IT", MarketCapCategory.LARGE)
    update_bias_profile(USER_ID, "Consumer", MarketCapCategory.LARGE)
    
    print("Seeding Complete!")

if __name__ == "__main__":
    seed_data()
