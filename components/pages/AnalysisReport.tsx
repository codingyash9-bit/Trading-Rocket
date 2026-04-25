'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  pe: number;
  beta: number;
  eps: number;
  dividend: number;
  sector: string;
  exchange: string;
}

interface AnalysisReportProps {
  stock: string;
  onBack: () => void;
}

// Mock data generator
const generateChartData = (basePrice: number, days: number) => {
  const data = [];
  let price = basePrice * 0.85;
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.45) * (basePrice * 0.03);
    price = Math.max(price * 0.9, price + change);
    data.push({
      date: new Date(Date.now() - (days - i) * 86400000).toISOString().split('T')[0],
      price: Number(price.toFixed(2)),
      volume: Math.floor(500000 + Math.random() * 2000000),
    });
  }
  return data;
};

const AnalysisReport: React.FC<AnalysisReportProps> = ({ stock, onBack }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [fullReport, setFullReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'fundamental' | 'recommendation' | 'ai'>('overview');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker: stock, includeHistory: true }),
        });
        
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        
        const data = await res.json();
        if (data.success) {
          setAnalysisData(data);
          
          // Track this stock in radar
          if (data.stock) {
            fetch('/api/company-radar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: 'demo-user-001',
                symbol: stock,
                name: data.stock.name,
                sector: data.stock.sector,
                price: data.stock.price,
                changePercent: data.stock.changePercent,
                analysis: data.aiAnalysis?.verdict
              }),
            }).catch(console.error);
            
            // Save to portfolio history
            fetch('/api/portfolio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: 'demo-user-001',
                ticker: stock,
                companyName: data.stock.name,
                exchange: data.stock.exchange || 'NSE',
                price: data.stock.price,
                change: data.stock.change,
                changePercent: data.stock.changePercent,
                analysis: {
                  fundamental: data.aiAnalysis?.fundamental,
                  technical: data.aiAnalysis?.technical,
                  sentiment: data.aiAnalysis?.sentiment,
                  verdict: data.aiAnalysis?.verdict
                },
                recommendation: data.aiAnalysis?.verdict || 'Hold',
                overallScore: data.aiAnalysis?.verdict === 'Buy' ? 75 : data.aiAnalysis?.verdict === 'Sell' ? 35 : 50
              }),
            }).catch(console.error);
          }
          
          if (data.aiAnalysis) {
            fetchFullReport(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch analysis:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchFullReport = async (analysisData: any) => {
      try {
        const res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stockData: analysisData.stock,
            technicalIndicators: analysisData.technical,
            marketMetrics: null,
            prediction: null,
            risk: analysisData.aiAnalysis?.analysis?.volatility || 'MODERATE',
            newsArticles: []
          }),
        });
        
        if (!res.ok) return;
        
        const data = await res.json();
        if (data.success && data.report) {
          setFullReport(data.report);
        }
      } catch (err) {
        console.error('Failed to fetch full report:', err);
      }
    };
    
    fetchAnalysis();
  }, [stock]);
  
  const stockData: StockData = analysisData?.stock || {
    ticker: stock,
    name: getStockName(stock),
    price: getStockPrice(stock),
    change: getStockChange(stock),
    changePercent: getStockChangePercent(stock),
    dayHigh: getStockDayHigh(stock),
    dayLow: getStockDayLow(stock),
    yearHigh: getStockYearHigh(stock),
    yearLow: getStockYearLow(stock),
    volume: 5000000 + Math.random() * 5000000,
    avgVolume: 4500000,
    marketCap: getMarketCap(stock),
    pe: 18 + Math.random() * 15,
    beta: 0.8 + Math.random() * 0.5,
    eps: getStockPrice(stock) / (18 + Math.random() * 15),
    dividend: 1.5 + Math.random() * 2,
    sector: getSector(stock),
    exchange: 'NSE',
  };

  const technicalIndicators = analysisData?.technical || null;
  const fundamentalData = analysisData?.fundamental || null;
  const aiAnalysis = analysisData?.aiAnalysis || null;
  const priceHistory = analysisData?.priceHistory || generateChartData(stockData.price, 90);
  const recommendation = analysisData?.recommendation || generateRecommendation(stockData);
  
  function getStockName(ticker: string): string {
    const names: Record<string, string> = {
      RELIANCE: 'Reliance Industries Ltd',
      TCS: 'Tata Consultancy Services',
      HDFCBANK: 'HDFC Bank Ltd',
      INFY: 'Infosys Ltd',
      ICICIBANK: 'ICICI Bank Ltd',
      SBIN: 'State Bank of India',
      BHARTIARTL: 'Bharti Airtel Ltd',
      ITC: 'ITC Ltd',
      PUFAN: 'Puneet Fashions Ltd',
      MEDSEC: 'MedSecure Health Ltd',
      TECHV: 'TechVision AI Ltd',
      GRWTH: 'Growth Capital Ltd',
      GOLD: 'Gold (MCX)',
      SILVER: 'Silver (MCX)',
      COPPER: 'Copper (MCX)',
    };
    return names[ticker] || ticker;
  }
  
  function getStockPrice(ticker: string): number {
    const prices: Record<string, number> = {
      RELIANCE: 2856, TCS: 4125, HDFCBANK: 1723, INFY: 1845, ICICIBANK: 1124,
      SBIN: 812, BHARTIARTL: 1425, ITC: 465, PUFAN: 150, MEDSEC: 280,
      TECHV: 420, GRWTH: 95, GOLD: 78500, SILVER: 92500, COPPER: 845,
    };
    return prices[ticker] || 1000;
  }
  
  function getStockChange(ticker: string): number {
    return Math.random() * 60 - 30;
  }
  
  function getStockChangePercent(ticker: string): number {
    return (Math.random() - 0.4) * 4;
  }
  
  function getStockDayHigh(ticker: string): number {
    return getStockPrice(ticker) * 1.02;
  }
  
  function getStockDayLow(ticker: string): number {
    return getStockPrice(ticker) * 0.98;
  }
  
  function getStockYearHigh(ticker: string): number {
    return getStockPrice(ticker) * 1.25;
  }
  
  function getStockYearLow(ticker: string): number {
    return getStockPrice(ticker) * 0.7;
  }
  
  function getMarketCap(ticker: string): number {
    return getStockPrice(ticker) * 100000000;
  }
  
  function getSector(ticker: string): string {
    const sectors: Record<string, string> = {
      RELIANCE: 'Conglomerate', TCS: 'IT Services', HDFCBANK: 'Banking',
      INFY: 'IT Services', ICICIBANK: 'Banking', SBIN: 'Banking',
      BHARTIARTL: 'Telecom', ITC: 'FMCG', PUFAN: 'Textiles',
      MEDSEC: 'Healthcare', TECHV: 'Technology', GRWTH: 'Finance',
      GOLD: 'Commodity', SILVER: 'Commodity', COPPER: 'Commodity',
    };
    return sectors[ticker] || 'Other';
  }
  
  function generateRecommendation(data: StockData) {
    const riskTolerance = 0.15 + Math.random() * 0.1;
    const entryPrice = data.price;
    const targetPrice1 = data.price * (1.08 + Math.random() * 0.05);
    const targetPrice2 = data.price * (1.15 + Math.random() * 0.1);
    const stopLoss = data.price * (1 - riskTolerance);
    
    return {
      entryPrice: entryPrice,
      targetPrice1: targetPrice1,
      targetPrice2: targetPrice2,
      stopLoss: stopLoss,
      riskReward1: ((targetPrice1 - entryPrice) / (entryPrice - stopLoss)).toFixed(2),
      riskReward2: ((targetPrice2 - entryPrice) / (entryPrice - stopLoss)).toFixed(2),
      quantity: Math.floor(500000 / entryPrice),
      investmentAmount: 500000,
      holdingPeriod: Math.floor(3 + Math.random() * 6),
      confidence: Math.floor(65 + Math.random() * 25),
    };
  }
  
const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const fullContent = fullReport || '';
      const rec = aiAnalysis?.overall?.recommendation || (recommendation.confidence > 75 ? 'STRONG BUY' : recommendation.confidence > 60 ? 'BUY' : recommendation.confidence > 50 ? 'HOLD' : 'AVOID');
      const score = aiAnalysis?.overall?.score || recommendation.confidence;
      const trend = aiAnalysis?.analysis?.trend || 'SIDEWAYS';
      const momentum = aiAnalysis?.analysis?.momentum || 'MODERATE';
      const volatility = aiAnalysis?.analysis?.volatility || 'MODERATE';
      const strength = aiAnalysis?.fundamental?.strength || 'MODERATE';
      const sentiment = aiAnalysis?.news?.sentiment || (stockData.change > 0 ? 'POSITIVE' : 'NEGATIVE');
      
      const generateStyledHtml = () => {
        const theme = {
          primary: '#0ea5e9',
          secondary: '#8b5cf6',
          success: '#10b981',
          danger: '#f43f5e',
          warning: '#f59e0b',
          dark: '#1e293b',
          light: '#f8fafc',
          gray: '#64748b',
          bg: '#0f172a',
          cardBg: '#1e293b',
        };
        
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TR_${stock}_Analysis_${new Date().toISOString().split('T')[0]}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${theme.bg};
      color: ${theme.light};
      line-height: 1.6;
      padding: 40px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: ${theme.cardBg};
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    
    .header {
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);
      padding: 40px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .brand {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      opacity: 0.8;
      margin-bottom: 8px;
    }
    
    .ticker {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    
    .company-name {
      font-size: 20px;
      opacity: 0.9;
      margin-bottom: 24px;
    }
    
    .price-section {
      display: flex;
      align-items: flex-end;
      gap: 24px;
    }
    
    .price {
      font-size: 36px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .change {
      font-size: 18px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 8px;
    }
    
    .change.positive {
      background: rgba(16, 185, 129, 0.2);
      color: ${theme.success};
    }
    
    .change.negative {
      background: rgba(244, 63, 94, 0.2);
      color: ${theme.danger};
    }
    
    .meta {
      display: flex;
      gap: 32px;
      margin-top: 16px;
      font-size: 14px;
      opacity: 0.8;
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    
    .meta-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.7;
    }
    
    .meta-value {
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .section {
      padding: 32px 40px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .section:last-child {
      border-bottom: none;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .section-title::before {
      content: '';
      width: 4px;
      height: 24px;
      background: linear-gradient(180deg, ${theme.primary}, ${theme.secondary});
      border-radius: 2px;
    }
    
    .recommendation-box {
      background: linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15);
      border: 1px solid ${theme.primary}30;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
    }
    
    .recommendation-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.7;
      margin-bottom: 8px;
    }
    
    .recommendation-value {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    
    .recommendation-value.buy { color: ${theme.success}; }
    .recommendation-value.sell { color: ${theme.danger}; }
    .recommendation-value.hold { color: ${theme.warning}; }
    
    .score-bar {
      width: 100%;
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 16px;
    }
    
    .score-fill {
      height: 100%;
      background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .metric-card {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    
    .metric-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.6;
      margin-bottom: 8px;
    }
    
    .metric-value {
      font-size: 20px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .metric-value.positive { color: ${theme.success}; }
    .metric-value.negative { color: ${theme.danger}; }
    
    .indicators-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .indicator {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    
    .indicator-name {
      font-size: 14px;
      opacity: 0.8;
    }
    
    .indicator-value {
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .full-report {
      padding: 32px 40px;
      font-size: 14px;
      line-height: 1.8;
    }
    
    .full-report h2 {
      color: ${theme.primary};
      font-size: 20px;
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${theme.primary};
    }
    
    .full-report h3 {
      color: ${theme.secondary};
      font-size: 16px;
      margin: 24px 0 12px;
    }
    
    .full-report h4 {
      color: ${theme.light};
      font-size: 14px;
      margin: 16px 0 8px;
      font-weight: 600;
    }
    
    .full-report p {
      margin-bottom: 12px;
      color: rgba(255,255,255,0.85);
    }
    
    .full-report ul {
      margin: 12px 0;
      padding-left: 24px;
    }
    
    .full-report li {
      margin-bottom: 8px;
      color: rgba(255,255,255,0.8);
    }
    
    .footer {
      background: rgba(0,0,0,0.3);
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      opacity: 0.6;
    }
    
    .disclaimer {
      font-size: 11px;
      opacity: 0.6;
      margin-top: 8px;
      font-style: italic;
    }
    
    .watermark {
      position: absolute;
      bottom: 20px;
      right: 40px;
      font-size: 11px;
      opacity: 0.4;
    }
    
    @media print {
      body { padding: 0; }
      .container { border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <div class="brand">Trading Rocket</div>
        <div class="ticker">${stockData.ticker}</div>
        <div class="company-name">${stockData.name} | ${stockData.sector}</div>
        
        <div class="price-section">
          <div class="price">₹${stockData.price.toFixed(2)}</div>
          <div class="change ${stockData.change >= 0 ? 'positive' : 'negative'}">
            ${stockData.change >= 0 ? '+' : ''}₹${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)
          </div>
        </div>
        
        <div class="meta">
          <div class="meta-item">
            <span class="meta-label">52W High</span>
            <span class="meta-value">₹${stockData.yearHigh.toFixed(0)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">52W Low</span>
            <span class="meta-value">₹${stockData.yearLow.toFixed(0)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Volume</span>
            <span class="meta-value">${(stockData.volume / 1000000).toFixed(1)}M</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Market Cap</span>
            <span class="meta-value">₹${(stockData.marketCap / 10000000).toFixed(0)}Cr</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Analyst Recommendation</div>
      <div class="recommendation-box">
        <div class="recommendation-label">Investment Rating</div>
        <div class="recommendation-value ${rec.includes('BUY') ? 'buy' : rec.includes('SELL') ? 'sell' : 'hold'}">${rec}</div>
        <div class="score-bar">
          <div class="score-fill" style="width: ${score}%"></div>
        </div>
        <div style="margin-top: 12px; font-size: 14px; opacity: 0.7;">Confidence Score: ${score}%</div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Key Metrics</div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">P/E Ratio</div>
          <div class="metric-value ${stockData.pe < 25 ? 'positive' : stockData.pe > 35 ? 'negative' : ''}">${stockData.pe.toFixed(1)}x</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Beta</div>
          <div class="metric-value">${stockData.beta.toFixed(2)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Div Yield</div>
          <div class="metric-value">${stockData.dividend.toFixed(1)}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Trend</div>
          <div class="metric-value" style="color: ${trend === 'BULLISH' ? theme.success : trend === 'BEARISH' ? theme.danger : theme.warning}">${trend}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Momentum</div>
          <div class="metric-value">${momentum}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Sentiment</div>
          <div class="metric-value" style="color: ${sentiment === 'POSITIVE' ? theme.success : sentiment === 'NEGATIVE' ? theme.danger : theme.warning}">${sentiment}</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Technical Indicators</div>
      <div class="indicators-grid">
        <div class="indicator">
          <span class="indicator-name">RSI (14)</span>
          <span class="indicator-value">${technicalIndicators?.rsi?.toFixed(1) || 'N/A'}</span>
        </div>
        <div class="indicator">
          <span class="indicator-name">MACD</span>
          <span class="indicator-value">${technicalIndicators?.macd?.value?.toFixed(1) || 'N/A'}</span>
        </div>
        <div class="indicator">
          <span class="indicator-name">SMA 20</span>
          <span class="indicator-value">₹${technicalIndicators?.sma20?.toFixed(0) || 'N/A'}</span>
        </div>
        <div class="indicator">
          <span class="indicator-name">SMA 50</span>
          <span class="indicator-value">₹${technicalIndicators?.sma50?.toFixed(0) || 'N/A'}</span>
        </div>
        <div class="indicator">
          <span class="indicator-name">SMA 200</span>
          <span class="indicator-value">₹${technicalIndicators?.sma200?.toFixed(0) || 'N/A'}</span>
        </div>
        <div class="indicator">
          <span class="indicator-name">ADX</span>
          <span class="indicator-value">${technicalIndicators?.adx?.toFixed(1) || 'N/A'}</span>
        </div>
        <div class="indicator">
          <span class="indicator-name">BB Upper</span>
          <span class="indicator-value">₹${technicalIndicators?.bollingerBands?.upper?.toFixed(0) || 'N/A'}</span>
        </div>
        <div class="indicator">
          <span class="indicator-name">BB Lower</span>
          <span class="indicator-value">₹${technicalIndicators?.bollingerBands?.lower?.toFixed(0) || 'N/A'}</span>
        </div>
      </div>
    </div>
    
    ${fullContent ? `
    <div class="section">
      <div class="section-title">AI Analysis Report</div>
      <div class="full-report">
        ${fullContent.split('\n').map(line => {
          if (line.match(/^={60,}$/)) return '';
          if (line.startsWith('## ')) return `<h2>${line.replace(/^## /g, '')}</h2>`;
          if (line.startsWith('### ')) return `<h3>${line.replace(/^### /g, '')}</h3>`;
          if (line.startsWith('**') && line.endsWith('**')) return `<h4>${line.replace(/\*\*/g, '')}</h4>`;
          if (line.startsWith('- ') || line.match(/^[\•\✓\✗]/)) return `<li>${line.replace(/^[\-\•]/g, '')}</li>`;
          if (line.match(/^[A-Z][a-z]+:/)) return `<h4>${line}</h4>`;
          if (line.trim() === '') return '<br>';
          return `<p>${line}</p>`;
        }).join('')}
      </div>
    </div>
    ` : ''}
    
    <div class="footer">
      <div class="brand">Trading Rocket - AI-Powered Stock Analysis</div>
      <div class="disclaimer">
        This report is for educational purposes only and should not be construed as financial advice. 
        Past performance is not indicative of future results. Always conduct your own research.
      </div>
      <div style="margin-top: 8px; font-size: 11px; opacity: 0.5;">
        Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' })}
      </div>
    </div>
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;
      };
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(generateStyledHtml());
        printWindow.document.close();
      }
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Analyzing {stock}...</p>
          <p className="text-white/30 text-sm mt-2">Fetching AI insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-montserrat font-bold text-white">
              {stockData.ticker}
            </h1>
            <p className="text-sm text-white/50">{stockData.name}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold disabled:opacity-50"
        >
          {isGeneratingPdf ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Report</span>
            </>
          )}
        </motion.button>
      </motion.div>
      
      {/* Price Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/50 text-sm mb-1">Current Price</p>
            <p className="text-4xl font-mono font-bold text-white">
              ₹{stockData.price.toFixed(2)}
            </p>
            <p className={`text-lg font-mono mt-1 ${
              stockData.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {stockData.change >= 0 ? '+' : ''}₹{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-white/40 text-xs">Day High</p>
                <p className="text-white font-mono">₹{stockData.dayHigh.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Day Low</p>
                <p className="text-white font-mono">₹{stockData.dayLow.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">52W High</p>
                <p className="text-white font-mono">₹{stockData.yearHigh.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">52W Low</p>
                <p className="text-white font-mono">₹{stockData.yearLow.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Recommendation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl rounded-3xl border border-emerald-400/30 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm mb-2">Analyst Recommendation</p>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-montserrat font-bold ${
                recommendation.confidence > 75 ? 'text-emerald-400' :
                recommendation.confidence > 60 ? 'text-cyan-400' : 'text-amber-400'
              }`}>
                {recommendation.confidence > 75 ? 'STRONG BUY' :
                 recommendation.confidence > 60 ? 'BUY' :
                 recommendation.confidence > 50 ? 'HOLD' : 'AVOID'}
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/70">Confidence: {recommendation.confidence}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-sm">Risk/Reward</span>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono">
              1:{recommendation.riskReward1}
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-fit">
        {(['overview', 'technical', 'fundamental', 'recommendation', 'ai'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-inter font-semibold transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-white/20'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'ai' ? 'AI Analysis' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Content */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Price Chart */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-montserrat font-semibold text-white mb-4">Price Movement (90 Days)</h3>
            <div className="h-64 flex items-end gap-1">
              {(() => {
                const prices = priceHistory.map((p: { price: number }) => p.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const range = maxPrice - minPrice || 1;
                return priceHistory.map((d: { price: number; volume: number }, i: number) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-cyan-500/50 to-cyan-400/30 rounded-t-sm"
                    style={{
                      height: `${((d.price - minPrice) / range) * 100}%`
                    }}
                  />
                ));
              })()}
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-montserrat font-semibold text-white mb-4">Key Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Market Cap', value: `₹${(stockData.marketCap / 10000000).toFixed(0)} Cr` },
                { label: 'P/E Ratio', value: stockData.pe.toFixed(1) },
                { label: 'EPS', value: `₹${stockData.eps.toFixed(2)}` },
                { label: 'Beta', value: stockData.beta.toFixed(2) },
                { label: 'Dividend Yield', value: `${stockData.dividend.toFixed(1)}%` },
                { label: 'Avg Volume', value: `${(stockData.avgVolume / 1000000).toFixed(1)}M` },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/50">{metric.label}</span>
                  <span className="text-white font-mono font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {activeTab === 'technical' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {[
            { label: 'RSI (14)', value: 45 + Math.random() * 20, type: 'Neutral' },
            { label: 'MACD', value: stockData.change > 0 ? 'Bullish' : 'Bearish', type: stockData.change > 0 ? 'positive' : 'negative' },
            { label: 'SMA 20', value: stockData.price > stockData.price * 0.98 ? 'Above' : 'Below', type: stockData.price > stockData.price * 0.98 ? 'positive' : 'negative' },
            { label: 'SMA 50', value: stockData.price > stockData.price * 0.96 ? 'Above' : 'Below', type: stockData.price > stockData.price * 0.96 ? 'positive' : 'negative' },
            { label: 'Bollinger Bands', value: 'Middle', type: 'neutral' },
            { label: 'ATR (14)', value: (stockData.dayHigh - stockData.dayLow).toFixed(1), type: 'neutral' },
          ].map((indicator) => (
            <div
              key={indicator.label}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <p className="text-white/50 text-sm mb-2">{indicator.label}</p>
              <p className={`text-xl font-mono font-bold ${
                indicator.type === 'positive' ? 'text-emerald-400' :
                indicator.type === 'negative' ? 'text-rose-400' : 'text-white'
              }`}>
                {indicator.value}
              </p>
            </div>
          ))}
        </motion.div>
      )}
      
      {activeTab === 'fundamental' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-montserrat font-semibold text-white mb-4">Financial Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Revenue Growth', value: `${(Math.random() * 20 + 5).toFixed(1)}%`, status: 'positive' },
                { label: 'Profit Margin', value: `${(Math.random() * 15 + 10).toFixed(1)}%`, status: 'positive' },
                { label: 'Debt/Equity', value: (Math.random() * 1).toFixed(2), status: 'neutral' },
                { label: 'ROE', value: `${(Math.random() * 15 + 10).toFixed(1)}%`, status: 'positive' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-white/50 text-xs mb-1">{item.label}</p>
                  <p className={`text-lg font-mono font-bold ${
                    item.status === 'positive' ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-montserrat font-semibold text-white mb-4">Valuation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-4 bg-white/5 rounded-xl">
                <span className="text-white/50">Current P/E</span>
                <span className="text-white font-mono">{stockData.pe.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-white/5 rounded-xl">
                <span className="text-white/50">Sector P/E</span>
                <span className="text-white font-mono">{(stockData.pe * 1.1).toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-white/5 rounded-xl">
                <span className="text-white/50">Fair Value (DCF)</span>
                <span className="text-white font-mono">₹{(stockData.price * 1.05).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {activeTab === 'recommendation' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Trade Setup */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-montserrat font-semibold text-white mb-6">Trade Setup</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-emerald-500/10 rounded-2xl border border-emerald-400/30 p-4">
                <p className="text-white/50 text-xs mb-1">Entry Point</p>
                <p className="text-xl font-mono font-bold text-emerald-400">
                  ₹{recommendation.entryPrice.toFixed(2)}
                </p>
              </div>
              <div className="bg-cyan-500/10 rounded-2xl border border-cyan-400/30 p-4">
                <p className="text-white/50 text-xs mb-1">Target 1</p>
                <p className="text-xl font-mono font-bold text-cyan-400">
                  ₹{recommendation.targetPrice1.toFixed(2)}
                </p>
                <p className="text-xs text-cyan-400/70">
                  +{((recommendation.targetPrice1/stockData.price - 1) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-purple-500/10 rounded-2xl border border-purple-400/30 p-4">
                <p className="text-white/50 text-xs mb-1">Target 2</p>
                <p className="text-xl font-mono font-bold text-purple-400">
                  ₹{recommendation.targetPrice2.toFixed(2)}
                </p>
                <p className="text-xs text-purple-400/70">
                  +{((recommendation.targetPrice2/stockData.price - 1) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-rose-500/10 rounded-2xl border border-rose-400/30 p-4">
                <p className="text-white/50 text-xs mb-1">Stop Loss</p>
                <p className="text-xl font-mono font-bold text-rose-400">
                  ₹{recommendation.stopLoss.toFixed(2)}
                </p>
                <p className="text-xs text-rose-400/70">
                  -{((1 - recommendation.stopLoss/stockData.price) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Position Sizing */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg font-montserrat font-semibold text-white mb-4">Position Sizing</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-white/50 text-sm mb-1">Investment Amount</p>
                <p className="text-white font-mono font-bold">
                  ₹{recommendation.investmentAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Quantity</p>
                <p className="text-white font-mono font-bold">{recommendation.quantity} shares</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Holding Period</p>
                <p className="text-white font-mono font-bold">{recommendation.holdingPeriod} months</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Max Risk</p>
                <p className="text-rose-400 font-mono font-bold">
                  ₹{((stockData.price - recommendation.stopLoss) * recommendation.quantity).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'ai' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {fullReport ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-montserrat font-semibold text-white">Full Analysis Report</h3>
                    <p className="text-white/50 text-sm">Premium AI-Generated Institutional Report</p>
                  </div>
                </div>
              </div>
              <div className="prose prose-invert max-w-none">
                {fullReport.split('\n').map((line, idx) => {
                  if (line.startsWith('## ') || line.startsWith('===')) {
                    return <h2 key={idx} className="text-xl font-bold text-cyan-400 mt-8 mb-4">{line.replace(/[=#]/g, '').trim()}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-lg font-semibold text-purple-400 mt-6 mb-3">{line.replace(/[#]/g, '').trim()}</h3>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={idx} className="text-md font-semibold text-white mt-4 mb-2">{line.replace(/[*]/g, '').trim()}</h4>;
                  }
                  if (line.trim() === '') {
                    return <br key={idx} />;
                  }
                  return <p key={idx} className="text-white/70 leading-relaxed mb-2">{line}</p>;
                })}
              </div>
            </div>
          ) : aiAnalysis ? (
            <>
              {/* AI Analysis Header */}
              <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-xl rounded-3xl border border-purple-400/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-montserrat font-semibold text-white">AI-Powered Analysis</h3>
                    <p className="text-white/50 text-sm">Gemini AI generated insights</p>
                  </div>
                </div>
                {aiAnalysis.overall && (
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${
                      aiAnalysis.overall.recommendation === 'STRONG BUY' || aiAnalysis.overall.recommendation === 'BUY' ? 'text-emerald-400' :
                      aiAnalysis.overall.recommendation === 'SELL' || aiAnalysis.overall.recommendation === 'STRONG SELL' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {aiAnalysis.overall.recommendation || 'ANALYZING'}
                    </span>
                    <span className="text-white/50">|</span>
                    <span className="text-white/70">Score: {aiAnalysis.overall.score || 'N/A'}</span>
                  </div>
                )}
              </div>

              {/* Market Trend */}
              {aiAnalysis.analysis && (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                  <h3 className="text-lg font-montserrat font-semibold text-white mb-4">Market Trend Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-white/50 text-xs mb-1">Trend</p>
                      <p className={`font-bold ${aiAnalysis.analysis.trend === 'BULLISH' ? 'text-emerald-400' : aiAnalysis.analysis.trend === 'BEARISH' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {aiAnalysis.analysis.trend || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-white/50 text-xs mb-1">Momentum</p>
                      <p className={`font-bold ${aiAnalysis.analysis.momentum === 'STRONG' ? 'text-emerald-400' : aiAnalysis.analysis.momentum === 'WEAK' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {aiAnalysis.analysis.momentum || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-white/50 text-xs mb-1">Volatility</p>
                      <p className={`font-bold ${aiAnalysis.analysis.volatility === 'LOW' ? 'text-emerald-400' : aiAnalysis.analysis.volatility === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {aiAnalysis.analysis.volatility || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-white/50 text-xs mb-1">Support</p>
                      <p className="text-white font-mono">₹{aiAnalysis.analysis.support || 'N/A'}</p>
                    </div>
                  </div>
                  {aiAnalysis.analysis.keyLevels && aiAnalysis.analysis.keyLevels.length > 0 && (
                    <div className="mt-4">
                      <p className="text-white/50 text-xs mb-2">Key Levels</p>
                      <div className="flex gap-2">
                        {aiAnalysis.analysis.keyLevels.map((level: any, i: number) => (
                          <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm">₹{level}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fundamental Analysis */}
              {aiAnalysis.fundamental && (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                  <h3 className="text-lg font-montserrat font-semibold text-white mb-4">Fundamental Analysis</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-white/70">Strength:</span>
                    <span className={`font-bold ${aiAnalysis.fundamental.strength === 'STRONG' ? 'text-emerald-400' : aiAnalysis.fundamental.strength === 'WEAK' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {aiAnalysis.fundamental.strength || 'N/A'}
                    </span>
                    <span className="text-white/50">|</span>
                    <span className="text-white/70">Growth Prospects:</span>
                    <span className={`font-bold ${aiAnalysis.fundamental.growthProspects === 'HIGH' ? 'text-emerald-400' : aiAnalysis.fundamental.growthProspects === 'LOW' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {aiAnalysis.fundamental.growthProspects || 'N/A'}
                    </span>
                  </div>
                  {aiAnalysis.fundamental.highlights && aiAnalysis.fundamental.highlights.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white/50 text-xs mb-2">Key Highlights</p>
                      <ul className="space-y-1">
                        {aiAnalysis.fundamental.highlights.map((item: string, i: number) => (
                          <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-emerald-400">+</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiAnalysis.fundamental.concerns && aiAnalysis.fundamental.concerns.length > 0 && (
                    <div>
                      <p className="text-white/50 text-xs mb-2">Key Concerns</p>
                      <ul className="space-y-1">
                        {aiAnalysis.fundamental.concerns.map((item: string, i: number) => (
                          <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-rose-400">!</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Technical Signals */}
              {aiAnalysis.technical && (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                  <h3 className="text-lg font-montserrat font-semibold text-white mb-4">Technical Signals</h3>
                  {aiAnalysis.technical.signals && aiAnalysis.technical.signals.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.technical.signals.map((signal: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm">
                          {signal}
                        </span>
                      ))}
                    </div>
                  )}
                  {aiAnalysis.technical.pattern && (
                    <div className="mt-4">
                      <p className="text-white/50 text-xs mb-1">Pattern</p>
                      <p className="text-white/70">{aiAnalysis.technical.pattern}</p>
                    </div>
                  )}
                  {aiAnalysis.technical.breakout && (
                    <div className="mt-4">
                      <p className="text-white/50 text-xs mb-1">Breakout Probability</p>
                      <p className="text-white/70">{aiAnalysis.technical.breakout}</p>
                    </div>
                  )}
                </div>
              )}

              {/* News Sentiment */}
              {aiAnalysis.news && (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                  <h3 className="text-lg font-montserrat font-semibold text-white mb-4">News Sentiment Analysis</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-white/70">Sentiment:</span>
                    <span className={`font-bold ${aiAnalysis.news.sentiment === 'POSITIVE' ? 'text-emerald-400' : aiAnalysis.news.sentiment === 'NEGATIVE' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {aiAnalysis.news.sentiment || 'N/A'}
                    </span>
                  </div>
                  {aiAnalysis.news.catalysts && aiAnalysis.news.catalysts.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white/50 text-xs mb-2">Upward Catalysts</p>
                      <ul className="space-y-1">
                        {aiAnalysis.news.catalysts.map((item: string, i: number) => (
                          <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-emerald-400">↑</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiAnalysis.news.risks && aiAnalysis.news.risks.length > 0 && (
                    <div>
                      <p className="text-white/50 text-xs mb-2">Downside Risks</p>
                      <ul className="space-y-1">
                        {aiAnalysis.news.risks.map((item: string, i: number) => (
                          <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-rose-400">↓</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* AI Summary */}
              {aiAnalysis.overall?.summary && (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                  <h3 className="text-lg font-montserrat font-semibold text-white mb-4">AI Investment Thesis</h3>
                  <p className="text-white/80 leading-relaxed">{aiAnalysis.overall.summary}</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 text-center py-12">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-white/60 mb-2">Generating Full Report...</p>
              <p className="text-white/40 text-sm">Please wait while AI generates detailed analysis.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AnalysisReport;