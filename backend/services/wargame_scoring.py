# backend/services/wargame_scoring.py
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class WargameScoring:
    DIRECTION_WEIGHT = 40
    PRICE_RANGE_WEIGHT = 30
    TRIGGER_WEIGHT = 20
    PROBABILITY_WEIGHT = 10

    VERDICT_THRESHOLDS = {
        'SHARP': 80,
        'SOLID': 60,
        'PARTIAL': 35,
        'WRONG': 0
    }

    async def calculate(
        self,
        event_id: str,
        position: Dict[str, Any],
        outcome: Dict[str, Any]
    ) -> Dict[str, Any]:
        direction_score = self._calculate_direction_score(
            position['scenario_type'],
            position['position_type'],
            outcome['actual_direction']
        )

        price_range_score = self._calculate_price_range_score(
            position,
            outcome
        )

        trigger_score = self._calculate_trigger_score(
            position,
            outcome
        )

        probability_score = self._calculate_probability_score(
            position,
            outcome
        )

        total_score = direction_score + price_range_score + trigger_score + probability_score

        verdict = self._determine_verdict(total_score)

        score_data = {
            'event_id': event_id,
            'direction_score': direction_score,
            'price_range_score': price_range_score,
            'trigger_score': trigger_score,
            'probability_score': probability_score,
            'total_score': total_score,
            'verdict': verdict
        }

        await self._save_score(score_data)
        await self._update_track_record(position['user_id'], verdict, total_score)

        return score_data

    def _calculate_direction_score(
        self,
        scenario_type: str,
        position_type: str,
        actual_direction: str
    ) -> float:
        expected_direction = 'BULL' if scenario_type == 'BULL' else ('BEAR' if scenario_type == 'BEAR' else 'NEUTRAL')

        if scenario_type == 'BASE':
            if actual_direction == 'NEUTRAL':
                return self.DIRECTION_WEIGHT
            elif abs(self._get_direction_value(actual_direction)) <= 2:
                return self.DIRECTION_WEIGHT * 0.5
            else:
                return self.DIRECTION_WEIGHT * 0.2

        if scenario_type == 'BULL' and position_type == 'LONG':
            return self.DIRECTION_WEIGHT if actual_direction in ['BULL', 'BULLISH'] else 0
        elif scenario_type == 'BEAR' and position_type == 'SHORT':
            return self.DIRECTION_WEIGHT if actual_direction in ['BEAR', 'BEARISH'] else 0
        elif scenario_type == 'BULL' and position_type == 'SHORT':
            return self.DIRECTION_WEIGHT * 0.3 if actual_direction in ['BEAR', 'BEARISH'] else 0
        elif scenario_type == 'BEAR' and position_type == 'LONG':
            return self.DIRECTION_WEIGHT * 0.3 if actual_direction in ['BULL', 'BULLISH'] else 0

        return self.DIRECTION_WEIGHT * 0.5

    async def _calculate_price_range_score(
        self,
        position: Dict[str, Any],
        outcome: Dict[str, Any]
    ) -> float:
        actual_move = abs(outcome['actual_price_move'])

        from db import get_wargame_scenarios
        scenarios = await get_wargame_scenarios(position['event_id'])

        scenario = next((s for s in scenarios if s['type'] == position['scenario_type']), None)
        if not scenario:
            return 0

        low = scenario['price_move_low']
        high = scenario['price_move_high']

        if low <= actual_move <= high:
            return self.PRICE_RANGE_WEIGHT
        elif actual_move < low:
            overshoot = (low - actual_move) / abs(low) if low != 0 else 1
            return self.PRICE_RANGE_WEIGHT * max(0, 1 - overshoot * 2)
        else:
            overshoot = (actual_move - high) / abs(high) if high != 0 else 1
            return self.PRICE_RANGE_WEIGHT * max(0, 1 - overshoot * 2)

    async def _calculate_trigger_score(
        self,
        position: Dict[str, Any],
        outcome: Dict[str, Any]
    ) -> float:
        if not outcome.get('trigger_hit'):
            return 0

        from db import get_wargame_scenarios
        scenarios = await get_wargame_scenarios(position['event_id'])

        scenario = next((s for s in scenarios if s['type'] == position['scenario_type']), None)
        if not scenario:
            return 0

        expected_trigger = scenario.get('trigger', '').lower()
        actual_trigger = outcome['trigger_hit'].lower()

        if expected_trigger in actual_trigger or actual_trigger in expected_trigger:
            return self.TRIGGER_WEIGHT

        keywords = ['revenue', 'eps', 'margin', 'guidance', 'beat', 'miss', 'growth']
        expected_keywords = [k for k in keywords if k in expected_trigger]
        actual_keywords = [k for k in keywords if k in actual_trigger]

        if expected_keywords and actual_keywords:
            match_ratio = len(set(expected_keywords) & set(actual_keywords)) / len(set(expected_keywords))
            return self.TRIGGER_WEIGHT * match_ratio

        return self.TRIGGER_WEIGHT * 0.3

    async def _calculate_probability_score(
        self,
        position: Dict[str, Any],
        outcome: Dict[str, Any]
    ) -> float:
        from db import get_wargame_scenarios
        scenarios = await get_wargame_scenarios(position['event_id'])

        scenario = next((s for s in scenarios if s['type'] == position['scenario_type']), None)
        if not scenario:
            return 0

        probability = scenario['probability']

        if probability >= 40 and probability <= 50:
            return self.PROBABILITY_WEIGHT
        elif probability >= 30 and probability <= 60:
            return self.PROBABILITY_WEIGHT * 0.7
        else:
            return self.PROBABILITY_WEIGHT * 0.4

    def _determine_verdict(self, total_score: float) -> str:
        if total_score >= self.VERDICT_THRESHOLDS['SHARP']:
            return 'SHARP'
        elif total_score >= self.VERDICT_THRESHOLDS['SOLID']:
            return 'SOLID'
        elif total_score >= self.VERDICT_THRESHOLDS['PARTIAL']:
            return 'PARTIAL'
        else:
            return 'WRONG'

    def _get_direction_value(self, direction: str) -> float:
        mapping = {
            'BULLISH': 1, 'BULL': 1, 'UP': 1,
            'BEARISH': -1, 'BEAR': -1, 'DOWN': -1,
            'NEUTRAL': 0
        }
        return mapping.get(direction.upper(), 0)

    async def _save_score(self, score_data: Dict[str, Any]):
        from db import create_wargame_score
        await create_wargame_score(score_data)

    async def _update_track_record(self, user_id: str, verdict: str, total_score: float):
        from db import upsert_wargame_earnings_track_record

        verdict_map = {
            'SHARP': {'sharp': 1, 'solid': 0, 'partial': 0, 'wrong': 0},
            'SOLID': {'sharp': 0, 'solid': 1, 'partial': 0, 'wrong': 0},
            'PARTIAL': {'sharp': 0, 'solid': 0, 'partial': 1, 'wrong': 0},
            'WRONG': {'sharp': 0, 'solid': 0, 'partial': 0, 'wrong': 1}
        }

        counts = verdict_map.get(verdict, {'sharp': 0, 'solid': 0, 'partial': 0, 'wrong': 0})

        await upsert_wargame_earnings_track_record(
            user_id=user_id,
            total_events_delta=1,
            sharp_delta=counts['sharp'],
            solid_delta=counts['solid'],
            partial_delta=counts['partial'],
            wrong_delta=counts['wrong'],
            score_delta=total_score
        )