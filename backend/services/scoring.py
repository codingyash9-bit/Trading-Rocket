import uuid
from datetime import datetime
from models.prediction import Prediction
from models.outcome import Outcome, Verdict
from models.accuracy_score import AccuracyScore

def calculate_accuracy_score(prediction: Prediction, outcome: Outcome) -> AccuracyScore:
    # Direction score: 40 if CONFIRMED or PARTIAL, 0 if INVALIDATED
    if outcome.verdict in [Verdict.CONFIRMED, Verdict.PARTIAL]:
        direction_score = 40
    else:
        direction_score = 0
        
    # Range score: 30 if actual close is within predicted range, 15 if within 5% outside, 0 otherwise
    actual = outcome.actual_close_price
    low = prediction.predicted_range_low
    high = prediction.predicted_range_high
    
    if low <= actual <= high:
        range_score = 30
    else:
        # Check if within 5% outside
        lower_bound = low * 0.95
        upper_bound = high * 1.05
        if lower_bound <= actual <= upper_bound:
            range_score = 15
        else:
            range_score = 0
            
    # Time score: 20 if actual days within 30% of predicted horizon, 10 if within 50%, 0 otherwise
    actual_days = outcome.actual_days_to_resolve
    predicted_days = prediction.time_horizon_days
    
    # avoiding division by zero if predicted_days is 0, though unlikely
    if predicted_days > 0:
        error_margin = abs(actual_days - predicted_days) / predicted_days
        if error_margin <= 0.30:
            time_score = 20
        elif error_margin <= 0.50:
            time_score = 10
        else:
            time_score = 0
    else:
        time_score = 0
        
    # Falsification score: 10 if not triggered, 0 if triggered
    if not outcome.falsification_triggered:
        falsification_score = 10
    else:
        falsification_score = 0
        
    total_score = direction_score + range_score + time_score + falsification_score
    
    return AccuracyScore(
        id=str(uuid.uuid4()),
        prediction_id=prediction.id,
        direction_score=direction_score,
        range_score=range_score,
        time_score=time_score,
        falsification_score=falsification_score,
        total_score=total_score,
        calculated_at=datetime.now().isoformat()
    )
