import { calculateMaxDrawdown, calculateReturns, formatINR } from '../utils';

describe('Financial Utils', () => {
  test('formatINR should format currency correctly', () => {
    expect(formatINR(100000)).toBe('₹1,00,000.00');
    expect(formatINR(0)).toBe('₹0.00');
  });

  test('calculateReturns should return correct percentage changes', () => {
    const prices = [100, 110, 121];
    const returns = calculateReturns(prices);
    expect(returns[0]).toBeCloseTo(0.1);
    expect(returns[1]).toBeCloseTo(0.1);
  });

  test('calculateMaxDrawdown should return maximum drop from peak', () => {
    const prices = [100, 150, 120, 180, 140, 160];
    // Peak 150 -> 120 is 20% drawdown
    // Peak 180 -> 140 is 22.2% drawdown
    const drawdown = calculateMaxDrawdown(prices);
    expect(drawdown).toBeCloseTo(0.2222, 4);
  });
});
