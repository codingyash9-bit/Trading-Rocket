export interface AlphaGaugeData {
  probability: number;
  label: string;
  category: 'Strong Opportunity' | 'Moderate Opportunity' | 'Low Opportunity' | 'High Risk';
  glowColor: string;
  isAnimating: boolean;
}
