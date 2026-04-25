/**
 * Projection Engine — Graphical Representation Engine for Trading Rocket
 *
 * Generates future price projections, confidence bands, and trading zone
 * data ready for charting. Zero external dependencies.
 * 
 * UPDATED: Uses deterministic algorithm for consistent results per stock.
 */

export type Trend = 'bullish' | 'bearish' | 'sideways';

export interface ProjectionInput {
  currentPrice: number;
  trend: Trend;
  entryRange: [number, number];
  stopLoss: number;
  target1: number;
  target2: number;
  confidenceScore: number; // 0-100
}

export interface ProjectionOutput {
  labels: string[];
  projection: number[];
  upperBound: number[];
  lowerBound: number[];
  entryZone: [number, number];
  stopLoss: number;
  targets: [number, number];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Simple hash function for deterministic seed from stock data.
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Smooth cosine interpolation between two values.
 * t ∈ [0, 1]
 */
function cosLerp(a: number, b: number, t: number): number {
  const mu = (1 - Math.cos(t * Math.PI)) / 2;
  return a * (1 - mu) + b * mu;
}

/**
 * Generate deterministic wave pattern based on step index.
 * Uses sine waves at fixed frequencies - no randomness.
 */
function deterministicWave(step: number, amplitude: number): number {
  const wave1 = Math.sin(step * 0.3) * amplitude * 0.5;
  const wave2 = Math.sin(step * 0.7 + 1.5) * amplitude * 0.25;
  const wave3 = Math.sin(step * 1.2) * amplitude * 0.15;
  return wave1 + wave2 + wave3;
}

// ─── Core: Price Projection ────────────────────────────────────────────────────

const STEPS = 30;

/**
 * Generates the 30-step future projection curve.
 * Uses DETERMINISTIC algorithm - same input always produces same output.
 *
 * Logic:
 *  - Segment 0→15: price drifts from currentPrice toward target1 with wave pattern
 *  - Segment 15→30: price approaches target2 (or consolidates near t1)
 *  - Wave amplitude based on confidence - higher confidence = smoother curve
 *  - Uses fixed sine waves for predictable, consistent results
 */
function generateProjection(input: ProjectionInput): number[] {
  const { currentPrice, trend, target1, target2, confidenceScore, entryRange } = input;

  // Volatility factor: lower confidence → wider band
  const volFactor = (0.008 + (1 - confidenceScore / 100) * 0.015);
  const volatility = currentPrice * volFactor;

  // Direction
  const isBullish = trend === 'bullish';
  const isBearish = trend === 'bearish';
  const isSideways = trend === 'sideways';

  // Calculate targets based on trend
  let finalTarget: number;
  let midTarget: number;
  
  if (isBullish) {
    finalTarget = target2 || target1 * 1.15;
    midTarget = target1;
  } else if (isBearish) {
    finalTarget = Math.min(input.stopLoss * 0.95, currentPrice * 0.92);
    midTarget = (currentPrice + input.stopLoss) / 2;
  } else {
    // Sideways - oscillate around current price
    finalTarget = (entryRange[0] + entryRange[1]) / 2;
    midTarget = currentPrice;
  }

  const prices: number[] = [];

  for (let i = 0; i < STEPS; i++) {
    const t = i / (STEPS - 1); // 0 → 1

    // Two-phase interpolation toward targets
    let basePrice: number;
    if (t <= 0.5) {
      basePrice = cosLerp(currentPrice, midTarget, t * 2);
    } else {
      basePrice = cosLerp(midTarget, finalTarget, (t - 0.5) * 2);
    }

    // Add deterministic wave pattern (same every time)
    const wave = deterministicWave(i, volatility);

    // Trend-specific adjustments
    let adjustedWave = wave;
    if (isSideways) {
      // Stronger oscillation for sideways
      adjustedWave = wave * 1.2 + Math.sin(i * 0.5) * volatility * 0.3;
    } else if (isBullish) {
      // Upward bias
      adjustedWave = wave * 0.7;
    } else if (isBearish) {
      // Downward bias
      adjustedWave = wave * 0.7;
    }

    // Final price with floor at stop loss
    const price = Math.max(basePrice + adjustedWave, input.stopLoss * 0.85);
    prices.push(Math.round(price * 100) / 100);
  }

  return prices;
}

// ─── Confidence Band ───────────────────────────────────────────────────────────

/**
 * Band width grows with time (uncertainty expansion) and narrows with confidence.
 * highConfidence (90%) → ~1.5% band
 * lowConfidence  (30%) → ~7% band
 */
function generateBands(
  projection: number[],
  confidenceScore: number
): { upper: number[]; lower: number[] } {
  const baseBandPct = 0.015 + (1 - confidenceScore / 100) * 0.055; // 1.5% – 7%

  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < projection.length; i++) {
    // Band expands linearly over time
    const timeExpansion = 1 + (i / projection.length) * 0.6;
    const bandWidth = projection[i] * baseBandPct * timeExpansion;
    upper.push(Math.round((projection[i] + bandWidth) * 100) / 100);
    lower.push(Math.round((projection[i] - bandWidth) * 100) / 100);
  }

  return { upper, lower };
}

// ─── Labels ───────────────────────────────────────────────────────────────────

function generateLabels(): string[] {
  const labels: string[] = [];
  const today = new Date();
  for (let i = 0; i < STEPS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Skip weekends for realism
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1);
    }
    labels.push(
      d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    );
  }
  return labels;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Main entry point.
 * Returns fully-formed JSON ready for the chart renderer.
 */
export function generateProjectionData(input: ProjectionInput): ProjectionOutput {
  // DETERMINISTIC: No random seed needed
  const projection = generateProjection(input);
  const { upper, lower } = generateBands(projection, input.confidenceScore);
  const labels = generateLabels();

  return {
    labels,
    projection,
    upperBound: upper,
    lowerBound: lower,
    entryZone: input.entryRange,
    stopLoss: input.stopLoss,
    targets: [input.target1, input.target2],
  };
}

// ─── Sample Data (for docs / testing) ─────────────────────────────────────────

export const SAMPLE_INPUT: ProjectionInput = {
  currentPrice: 2_450,
  trend: 'bullish',
  entryRange: [2_420, 2_480],
  stopLoss: 2_310,
  target1: 2_650,
  target2: 2_850,
  confidenceScore: 74,
};

export const SAMPLE_OUTPUT = generateProjectionData(SAMPLE_INPUT);
