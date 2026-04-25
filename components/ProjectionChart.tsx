'use client';

/**
 * ProjectionChart — Graphical Representation Engine
 *
 * Renders a professional trading projection chart using pure SVG.
 * No external charting libraries required.
 *
 * Features:
 *  ✦ Animated line draw-on effect
 *  ✦ Shaded confidence band (upper/lower)
 *  ✦ Entry zone horizontal band
 *  ✦ Stop-loss dashed line
 *  ✦ Target 1 / Target 2 dashed lines
 *  ✦ Risk zone shaded below stop-loss
 *  ✦ Interactive crosshair + tooltip
 *  ✦ Responsive SVG with viewBox
 *  ✦ Bloomberg dark glassmorphism aesthetic
 */

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectionOutput } from '../lib/projectionEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectionChartProps {
  data: ProjectionOutput;
  stockName?: string;
  trend?: 'bullish' | 'bearish' | 'sideways';
  confidenceScore?: number;
  className?: string;
  id?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  stepIndex: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_W = 1000;
const CHART_H = 480;
const PAD = { top: 32, right: 80, bottom: 52, left: 72 };

const COLORS = {
  grid: 'rgba(255,255,255,0.05)',
  axis: 'rgba(255,255,255,0.15)',
  projection: '#06b6d4',       // cyan
  projectionGlow: '#06b6d4',
  band: 'rgba(6,182,212,0.08)',
  bandStroke: 'rgba(6,182,212,0.20)',
  entry: 'rgba(16,185,129,0.12)',
  entryStroke: '#10b981',
  stopLoss: '#f43f5e',
  target1: '#a78bfa',
  target2: '#60a5fa',
  riskZone: 'rgba(244,63,94,0.07)',
  dot: '#06b6d4',
  tooltip: 'rgba(8,14,25,0.96)',
  bullish: '#10b981',
  bearish: '#f43f5e',
  sideways: '#f59e0b',
};

type Trend = 'bullish' | 'bearish' | 'sideways';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(p: number): string {
  return '₹' + p.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function polylinePath(points: [number, number][]): string {
  if (points.length === 0) return '';
  return (
    `M ${points[0][0]},${points[0][1]}` +
    points
      .slice(1)
      .map(([x, y]) => ` L ${x},${y}`)
      .join('')
  );
}

/** Smooth cubic bezier path through points */
function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return polylinePath(points);
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev[0] + (curr[0] - prev[0]) / 3;
    const cp1y = prev[1];
    const cp2x = curr[0] - (curr[0] - prev[0]) / 3;
    const cp2y = curr[1];
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr[0]},${curr[1]}`;
  }
  return d;
}

/** Closed area path (line + baseline) */
function areaPath(
  top: [number, number][],
  bottom: [number, number][]
): string {
  const forward = smoothPath(top);
  const backward = [...bottom]
    .reverse()
    .map(([x, y]) => `L ${x},${y}`)
    .join(' ');
  return `${forward} ${backward} Z`;
}

// ─── Scale ────────────────────────────────────────────────────────────────────

function buildScale(data: ProjectionOutput) {
  const allPrices = [
    ...data.projection,
    ...data.upperBound,
    ...data.lowerBound,
    data.stopLoss,
    data.targets[0],
    data.targets[1],
    data.entryZone[0],
    data.entryZone[1],
  ];

  const rawMin = Math.min(...allPrices);
  const rawMax = Math.max(...allPrices);
  const pad = (rawMax - rawMin) * 0.10;
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;

  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;
  const n = data.projection.length;

  const toX = (i: number) => PAD.left + (i / (n - 1)) * plotW;
  const toY = (price: number) =>
    PAD.top + ((yMax - price) / (yMax - yMin)) * plotH;

  // Y-axis ticks: 6 evenly-spaced nice numbers
  const step = (yMax - yMin) / 6;
  const ticks: number[] = [];
  for (let i = 0; i <= 6; i++) {
    ticks.push(Math.round(yMin + step * i));
  }

  return { toX, toY, yMin, yMax, ticks, plotW, plotH, n };
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const LegendItem: React.FC<{
  color: string;
  label: string;
  dashed?: boolean;
  band?: boolean;
}> = ({ color, label, dashed, band }) => (
  <div className="flex items-center gap-2">
    {band ? (
      <div
        className="w-6 h-3 rounded-sm opacity-70"
        style={{ background: color, border: `1px solid ${color}` }}
      />
    ) : (
      <svg width={24} height={10}>
        <line
          x1={0}
          y1={5}
          x2={24}
          y2={5}
          stroke={color}
          strokeWidth={2}
          strokeDasharray={dashed ? '4 3' : undefined}
        />
      </svg>
    )}
    <span className="text-xs font-mono text-slate-400">{label}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProjectionChart: React.FC<ProjectionChartProps> = ({
  data,
  stockName = 'Stock',
  trend = 'bullish',
  confidenceScore = 70,
  className = '',
  id,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    stepIndex: 0,
  });
  const [drawn, setDrawn] = useState(false);

  // Trigger animation
  useEffect(() => {
    const timer = setTimeout(() => setDrawn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scale = useMemo(() => buildScale(data), [data]);
  const { toX, toY } = scale;

  // Pre-compute screen points
  const projPoints = useMemo<[number, number][]>(
    () => data.projection.map((p, i) => [toX(i), toY(p)]),
    [data.projection, toX, toY]
  );
  const upperPoints = useMemo<[number, number][]>(
    () => data.upperBound.map((p, i) => [toX(i), toY(p)]),
    [data.upperBound, toX, toY]
  );
  const lowerPoints = useMemo<[number, number][]>(
    () => data.lowerBound.map((p, i) => [toX(i), toY(p)]),
    [data.lowerBound, toX, toY]
  );

  // Derived paths
  const projPath = useMemo(() => smoothPath(projPoints), [projPoints]);
  const bandAreaPath = useMemo(
    () => areaPath(upperPoints, lowerPoints),
    [upperPoints, lowerPoints]
  );

  // Glow duplicate (slightly thicker, lower opacity)
  const glowPath = projPath;

  const trendColor =
    trend === 'bullish'
      ? COLORS.bullish
      : trend === 'bearish'
      ? COLORS.bearish
      : COLORS.sideways;

  const trendLabel =
    trend === 'bullish' ? '▲ BULLISH' : trend === 'bearish' ? '▼ BEARISH' : '↔ SIDEWAYS';

  // ── Interaction ─────────────────────────────────────────────────────────────

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * CHART_W;
      const svgY = ((e.clientY - rect.top) / rect.height) * CHART_H;
      const plotW = CHART_W - PAD.left - PAD.right;

      const rawI = ((svgX - PAD.left) / plotW) * (data.projection.length - 1);
      const stepIndex = Math.max(0, Math.min(data.projection.length - 1, Math.round(rawI)));

      setTooltip({
        visible: rawI >= 0 && rawI <= data.projection.length - 1,
        x: projPoints[stepIndex][0],
        y: projPoints[stepIndex][1],
        stepIndex,
      });
    },
    [data.projection.length, projPoints]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((s) => ({ ...s, visible: false }));
  }, []);

  // ── Horizontal line helper ─────────────────────────────────────────────────

  const HLine = ({
    price,
    color,
    dashed,
    label,
    labelAnchor = 'end',
  }: {
    price: number;
    color: string;
    dashed?: boolean;
    label: string;
    labelAnchor?: 'start' | 'end';
  }) => {
    const y = toY(price);
    const x1 = PAD.left;
    const x2 = CHART_W - PAD.right;
    return (
      <g>
        <line
          x1={x1}
          y1={y}
          x2={x2}
          y2={y}
          stroke={color}
          strokeWidth={1.2}
          strokeDasharray={dashed ? '6 4' : undefined}
          opacity={0.85}
        />
        {/* Label tag on the right */}
        <rect
          x={x2 + 4}
          y={y - 9}
          width={72}
          height={18}
          rx={3}
          fill={color + '22'}
          stroke={color + '55'}
          strokeWidth={0.8}
        />
        <text
          x={x2 + 40}
          y={y + 4}
          textAnchor="middle"
          fill={color}
          fontSize={9}
          fontFamily="monospace"
          letterSpacing="0.05em"
        >
          {label}
        </text>
      </g>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const entryY1 = toY(data.entryZone[1]);
  const entryY2 = toY(data.entryZone[0]);
  const stopY = toY(data.stopLoss);
  const chartBottom = CHART_H - PAD.bottom;

  return (
    <div className={`relative w-full select-none ${className}`} id={id}>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ background: trendColor, boxShadow: `0 0 8px ${trendColor}` }}
          />
          <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            {stockName} · AI PRICE PROJECTION
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
            style={{
              background: trendColor + '20',
              color: trendColor,
              border: `1px solid ${trendColor}40`,
            }}
          >
            {trendLabel}
          </span>
        </div>

        {/* Confidence pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">CONFIDENCE</span>
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx={16} cy={16} r={12} stroke="rgba(255,255,255,0.06)" strokeWidth={3} fill="none" />
              <motion.circle
                cx={16}
                cy={16}
                r={12}
                stroke={
                  confidenceScore >= 70 ? COLORS.bullish : confidenceScore >= 40 ? COLORS.sideways : COLORS.bearish
                }
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 12}
                initial={{ strokeDashoffset: 2 * Math.PI * 12 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 12 * (1 - confidenceScore / 100),
                }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold"
              style={{
                color:
                  confidenceScore >= 70 ? COLORS.bullish : confidenceScore >= 40 ? COLORS.sideways : COLORS.bearish,
              }}
            >
              {confidenceScore}
            </span>
          </div>
        </div>
      </div>

      {/* ── Chart Canvas ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(6,10,20,0.92)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(6,182,212,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full"
          style={{ display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Projection line gradient */}
            <linearGradient id="proj-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor={trendColor} />
              <stop offset="100%" stopColor={trend === 'bullish' ? '#10b981' : trend === 'bearish' ? '#f43f5e' : '#f59e0b'} />
            </linearGradient>

            {/* Confidence band fill */}
            <linearGradient id="band-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
            </linearGradient>

            {/* Risk zone fill */}
            <linearGradient id="risk-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.03} />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip path for animation */}
            <clipPath id="proj-clip">
              <motion.rect
                x={PAD.left}
                y={0}
                height={CHART_H}
                initial={{ width: 0 }}
                animate={{ width: drawn ? CHART_W - PAD.left : 0 }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              />
            </clipPath>
          </defs>

          {/* ── Grid Lines ── */}
          {scale.ticks.map((tick) => {
            const y = toY(tick);
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={CHART_W - PAD.right}
                  y2={y}
                  stroke={COLORS.grid}
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.25)"
                  fontSize={10}
                  fontFamily="monospace"
                >
                  {tick.toLocaleString('en-IN')}
                </text>
              </g>
            );
          })}

          {/* ── X-Axis Labels (every 5th step) ── */}
          {data.labels.map((lbl, i) => {
            if (i % 5 !== 0 && i !== data.labels.length - 1) return null;
            return (
              <text
                key={i}
                x={toX(i)}
                y={CHART_H - PAD.bottom + 18}
                textAnchor="middle"
                fill="rgba(255,255,255,0.22)"
                fontSize={9}
                fontFamily="monospace"
              >
                {lbl}
              </text>
            );
          })}

          {/* ── Risk Zone (below stop-loss) ── */}
          <rect
            x={PAD.left}
            y={stopY}
            width={CHART_W - PAD.left - PAD.right}
            height={chartBottom - stopY}
            fill="url(#risk-grad)"
          />

          {/* Risk label */}
          <text
            x={PAD.left + 8}
            y={stopY + 14}
            fill="rgba(244,63,94,0.5)"
            fontSize={9}
            fontFamily="monospace"
            letterSpacing="0.1em"
          >
            RISK ZONE
          </text>

          {/* ── Entry Zone Band ── */}
          <rect
            x={PAD.left}
            y={entryY1}
            width={CHART_W - PAD.left - PAD.right}
            height={entryY2 - entryY1}
            fill={COLORS.entry}
          />
          <text
            x={PAD.left + 8}
            y={entryY1 + 13}
            fill="rgba(16,185,129,0.55)"
            fontSize={9}
            fontFamily="monospace"
            letterSpacing="0.1em"
          >
            ENTRY ZONE
          </text>

          {/* ── Confidence Band ── */}
          <path d={bandAreaPath} fill="url(#band-grad)" />
          {/* Band border lines (clipped) */}
          <g clipPath="url(#proj-clip)">
            <path
              d={smoothPath(upperPoints)}
              fill="none"
              stroke={COLORS.bandStroke}
              strokeWidth={0.8}
              strokeDasharray="3 3"
            />
            <path
              d={smoothPath(lowerPoints)}
              fill="none"
              stroke={COLORS.bandStroke}
              strokeWidth={0.8}
              strokeDasharray="3 3"
            />
          </g>

          {/* ── Horizontal Levels ── */}
          <HLine
            price={data.stopLoss}
            color={COLORS.stopLoss}
            dashed
            label={`SL ${formatPrice(data.stopLoss)}`}
          />
          <HLine
            price={data.targets[0]}
            color={COLORS.target1}
            dashed
            label={`T1 ${formatPrice(data.targets[0])}`}
          />
          <HLine
            price={data.targets[1]}
            color={COLORS.target2}
            dashed
            label={`T2 ${formatPrice(data.targets[1])}`}
          />

          {/* ── Projection Glow (thick blur) ── */}
          <g clipPath="url(#proj-clip)">
            <path
              d={glowPath}
              fill="none"
              stroke={COLORS.projectionGlow}
              strokeWidth={8}
              opacity={0.08}
              filter="url(#glow)"
            />
          </g>

          {/* ── Projection Line (sharp) ── */}
          <g clipPath="url(#proj-clip)">
            <path
              d={projPath}
              fill="none"
              stroke="url(#proj-grad)"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* ── Axes ── */}
          <line
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={CHART_H - PAD.bottom}
            stroke={COLORS.axis}
            strokeWidth={1}
          />
          <line
            x1={PAD.left}
            y1={CHART_H - PAD.bottom}
            x2={CHART_W - PAD.right}
            y2={CHART_H - PAD.bottom}
            stroke={COLORS.axis}
            strokeWidth={1}
          />

          {/* ── Crosshair + Dot ── */}
          <AnimatePresence>
            {tooltip.visible && (
              <>
                {/* Vertical crosshair */}
                <motion.line
                  key="vert"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  x1={tooltip.x}
                  y1={PAD.top}
                  x2={tooltip.x}
                  y2={CHART_H - PAD.bottom}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                />
                {/* Horizontal crosshair */}
                <motion.line
                  key="horiz"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  x1={PAD.left}
                  y1={tooltip.y}
                  x2={CHART_W - PAD.right}
                  y2={tooltip.y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                />
                {/* Dot */}
                <motion.circle
                  key="dot"
                  initial={{ r: 0 }}
                  animate={{ r: 5 }}
                  exit={{ r: 0 }}
                  transition={{ duration: 0.12 }}
                  cx={tooltip.x}
                  cy={tooltip.y}
                  fill={COLORS.dot}
                  stroke="rgba(6,182,212,0.3)"
                  strokeWidth={6}
                />
              </>
            )}
          </AnimatePresence>
        </svg>

        {/* ── Floating Tooltip ── */}
        <AnimatePresence>
          {tooltip.visible && (
            <motion.div
              key="tooltip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="pointer-events-none absolute z-20"
              style={{
                left: `${(tooltip.x / CHART_W) * 100}%`,
                top: `${(tooltip.y / CHART_H) * 100}%`,
                transform:
                  tooltip.stepIndex > data.projection.length * 0.7
                    ? 'translate(-110%, -130%)'
                    : 'translate(12px, -130%)',
              }}
            >
              <div
                className="rounded-xl px-3 py-2.5 min-w-[160px]"
                style={{
                  background: COLORS.tooltip,
                  border: '1px solid rgba(6,182,212,0.25)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <p className="text-[10px] font-mono text-slate-500 mb-1.5 tracking-wider">
                  {data.labels[tooltip.stepIndex]}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between gap-4">
                    <span className="text-[11px] font-mono text-slate-400">Projection</span>
                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      {formatPrice(data.projection[tooltip.stepIndex])}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[11px] font-mono text-slate-500">Upper</span>
                    <span className="text-[11px] font-mono text-slate-300">
                      {formatPrice(data.upperBound[tooltip.stepIndex])}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[11px] font-mono text-slate-500">Lower</span>
                    <span className="text-[11px] font-mono text-slate-300">
                      {formatPrice(data.lowerBound[tooltip.stepIndex])}
                    </span>
                  </div>
                  <div className="border-t border-white/5 pt-1 mt-1 flex justify-between gap-4">
                    <span className="text-[11px] font-mono text-slate-500">Band width</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatPrice(
                        data.upperBound[tooltip.stepIndex] - data.lowerBound[tooltip.stepIndex]
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 px-1">
        <LegendItem color={COLORS.projection} label="Projection" />
        <LegendItem color="rgba(6,182,212,0.4)" label="Confidence Band" band />
        <LegendItem color={COLORS.entryStroke} label="Entry Zone" band />
        <LegendItem color={COLORS.stopLoss} label="Stop Loss" dashed />
        <LegendItem color={COLORS.target1} label="Target 1" dashed />
        <LegendItem color={COLORS.target2} label="Target 2" dashed />
        <LegendItem color={COLORS.bearish} label="Risk Zone" band />
      </div>

      {/* ── Stats Bar ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4"
      >
        {[
          {
            label: 'Entry Zone',
            value: `${formatPrice(data.entryZone[0])} – ${formatPrice(data.entryZone[1])}`,
            color: COLORS.entryStroke,
          },
          {
            label: 'Stop Loss',
            value: formatPrice(data.stopLoss),
            color: COLORS.stopLoss,
          },
          {
            label: 'Target 1',
            value: formatPrice(data.targets[0]),
            color: COLORS.target1,
          },
          {
            label: 'Target 2',
            value: formatPrice(data.targets[1]),
            color: COLORS.target2,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl px-4 py-3"
            style={{
              background: item.color + '0D',
              border: `1px solid ${item.color}25`,
            }}
          >
            <p className="text-[10px] font-mono text-slate-500 tracking-wider mb-1">
              {item.label.toUpperCase()}
            </p>
            <p className="text-sm font-mono font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectionChart;
