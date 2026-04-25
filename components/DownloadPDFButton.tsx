'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

interface ChartAnalysisData {
  stockName: string;
  symbol?: string;
  currentPrice: number;
  predictedTrend: string;
  confidence: number;
  entryRange: [number, number];
  stopLoss: number;
  target1: number;
  target2: number;
  timeframeAnalysis: {
    [key: string]: { trend: string; signal: string; support: number; resistance: number };
  };
  volatility?: { level: string; atr: number; atrPercent: number; analysis: string };
  riskRatio?: {
    riskLevel: string;
    stopLossPercent: number;
    riskScore: number;
    maxDrawdown: number;
    positionRisk: string;
    recommendation: string;
  };
  investmentStrategy: {
    recommendedEntry: number;
    stopLoss: number;
    targetPrice: number;
    riskRewardRatio: number;
    positionSize: number;
    investmentType: string;
  };
  technicalIndicators: {
    rsi: number;
    macd: string;
    movingAverages: string;
    volumeAnalysis: string;
  };
  summary: string;
  keyLevels: { strongSupport: number[]; strongResistance: number[]; pivotPoints: number[] };
}

interface DownloadPDFButtonProps {
  analysis: ChartAnalysisData;
  meta: { budget: string; investmentType: string; imagesProcessed: number; timestamp: string };
}

const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({ analysis, meta }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const getTrendColor = (trend: string) => {
    if (trend.toLowerCase().includes('bull')) return '#10b981';
    if (trend.toLowerCase().includes('bear')) return '#f43f5e';
    return '#f59e0b';
  };

  const getRiskColor = (risk: string) => {
    if (!risk) return '#f59e0b';
    if (risk.toLowerCase() === 'low') return '#10b981';
    if (risk.toLowerCase() === 'high' || risk.toLowerCase() === 'extreme') return '#f43f5e';
    return '#f59e0b';
  };

  const generatePDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const trendColor = getTrendColor(analysis.predictedTrend);
      const riskColor = getRiskColor(analysis.riskRatio?.riskLevel || '');

      // === PAGE 1: COVER ===
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setFillColor(14, 165, 233);
      pdf.rect(0, 0, 8, pageHeight, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TRADING ROCKET', margin, 50);
      pdf.setFontSize(12);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI-POWERED MARKET INTELLIGENCE', margin, 62);

      pdf.setFontSize(28);
      pdf.setTextColor(14, 165, 233);
      pdf.text('CHART ANALYSIS', margin, 100);
      pdf.setFontSize(18);
      pdf.text('REPORT', margin, 115);

      pdf.setDrawColor(14, 165, 233);
      pdf.setLineWidth(2);
      pdf.line(margin, 125, margin + 80, 125);

      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(analysis.stockName, margin, 150);

      pdf.setFontSize(12);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Investment: ${meta.investmentType} | Budget: ${meta.budget}`, margin, 165);
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 175);

      pdf.setFillColor(trendColor);
      pdf.roundedRect(margin, 200, 35, 10, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(analysis.predictedTrend, margin + 5, 207);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Confidential - For Educational Purposes Only', margin, 270);

      // === PAGE 2: EXECUTIVE SUMMARY ===
      pdf.addPage();
      y = margin;

      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      pdf.setFillColor(14, 165, 233);
      pdf.rect(0, 0, 5, 45, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TRADING ROCKET', margin, 22);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(148, 163, 184);
      pdf.text('AI-POWERED MARKET INTELLIGENCE', margin, 32);
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Executive Summary', margin, y + 30);
      y += 45;

      // Cards
      const addCard = (title: string, content: string, color = '#ffffff') => {
        pdf.setFillColor(30, 41, 59);
        pdf.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(title.toUpperCase(), margin + 5, y + 6);
        pdf.setFontSize(12);
        pdf.setTextColor(color);
        pdf.setFont('helvetica', 'bold');
        pdf.text(content, margin + 5, y + 15);
        y += 25;
      };

      addCard('Current Price', `₹${analysis.currentPrice.toLocaleString()}`);
      addCard('Trend', analysis.predictedTrend, trendColor);

      // Confidence bar
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text('CONFIDENCE SCORE', margin + 5, y + 6);
      pdf.setFillColor(51, 65, 85);
      pdf.roundedRect(margin + 5, y + 10, contentWidth - 10, 5, 2, 2, 'F');
      pdf.setFillColor(14, 165, 233);
      pdf.roundedRect(margin + 5, y + 10, (contentWidth - 10) * analysis.confidence / 100, 5, 2, 2, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${analysis.confidence}%`, margin + contentWidth - 20, y + 15);
      y += 28;

      addCard('Risk Level', analysis.riskRatio?.riskLevel || 'N/A', riskColor);

      // Summary
      pdf.setFillColor(30, 41, 59);
      pdf.roundedRect(margin, y, contentWidth, 40, 3, 3, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text('KEY INSIGHT', margin + 5, y + 6);
      pdf.setFontSize(9);
      pdf.setTextColor(200, 200, 200);
      const lines = pdf.splitTextToSize(analysis.summary.substring(0, 150), contentWidth - 10);
      pdf.text(lines.slice(0, 4), margin + 5, y + 16);
      y += 50;

      // Metrics grid
      const addMetric = (label: string, value: string, color = '#ffffff') => {
        const w = (contentWidth - 10) / 3;
        pdf.setFillColor(30, 41, 59);
        pdf.roundedRect(margin + (metrics.length % 3) * (w + 5), y + Math.floor(metrics.length / 3) * 22, w, 20, 2, 2, 'F');
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.text(label.toUpperCase(), margin + (metrics.length % 3) * (w + 5) + 5, y + Math.floor(metrics.length / 3) * 22 + 6);
        pdf.setFontSize(10);
        pdf.setTextColor(color);
        pdf.setFont('helvetica', 'bold');
        pdf.text(value, margin + (metrics.length % 3) * (w + 5) + 5, y + Math.floor(metrics.length / 3) * 22 + 15);
        metrics.push({ label, value, color });
      };

      let metrics: { label: string; value: string; color: string }[] = [];
      addMetric('Entry', `₹${analysis.entryRange[0].toLocaleString()} - ₹${analysis.entryRange[1].toLocaleString()}`, '#10b981');
      addMetric('Stop Loss', `₹${analysis.stopLoss.toLocaleString()}`, '#f43f5e');
      addMetric('Target 1', `₹${analysis.target1.toLocaleString()}`, '#0ea5e9');
      addMetric('Target 2', `₹${analysis.target2.toLocaleString()}`, '#8b5cf6');
      y += 55;

      // === PAGE 3: STRATEGY ===
      pdf.addPage();
      y = margin;

      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      pdf.setFillColor(14, 165, 233);
      pdf.rect(0, 0, 5, 45, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TRADING ROCKET', margin, 22);
      pdf.setFontSize(14);
      pdf.text('Investment Strategy', margin, y + 30);
      y += 45;

      const strategy = analysis.investmentStrategy;
      addCard('Suggested Action', analysis.predictedTrend === 'BULLISH' ? 'BUY' : analysis.predictedTrend === 'BEARISH' ? 'AVOID' : 'WAIT', trendColor);

      metrics = [];
      addMetric('Entry Price', `₹${strategy.recommendedEntry.toLocaleString()}`, '#10b981');
      addMetric('Stop Loss', `₹${strategy.stopLoss.toLocaleString()}`, '#f43f5e');
      addMetric('Target', `₹${strategy.targetPrice.toLocaleString()}`, '#0ea5e9');
      addMetric('Risk:Reward', `1:${strategy.riskRewardRatio}`, '#8b5cf6');
      addMetric('Position', strategy.positionSize > 0 ? `₹${strategy.positionSize.toLocaleString()}` : 'N/A', '#f59e0b');
      addMetric('Type', strategy.investmentType, '#ffffff');
      y += 55;

      // === PAGE 4: DISCLAIMER ===
      pdf.addPage();
      y = margin + 20;

      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setFillColor(14, 165, 233);
      pdf.rect(0, 0, 5, pageHeight, 'F');

      pdf.setFontSize(16);
      pdf.setTextColor(14, 165, 233);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IMPORTANT DISCLAIMER', margin, y);
      y += 15;
      pdf.setDrawColor(14, 165, 233);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 15;

      const disclaimers = [
        '• This report is AI-generated for educational purposes only',
        '• It does not constitute financial or investment advice',
        '• Past performance does not guarantee future results',
        '• Market investments carry inherent risks',
        '• Always conduct your own research before investing',
        '',
        'By using this report, you acknowledge the inherent risks of market investments.',
      ];

      pdf.setFontSize(10);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'normal');
      disclaimers.forEach((line) => {
        pdf.text(line, margin, y);
        y += 7;
      });

      const fileName = `ChartAnalysis_${analysis.stockName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [analysis, meta]);

  return (
    <motion.button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download PDF</span>
        </>
      )}
    </motion.button>
  );
};

export default DownloadPDFButton;
