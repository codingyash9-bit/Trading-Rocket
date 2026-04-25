'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

// ─── Components ──────────────────────────────────────────────────────────────
const BackButton: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  if (pathname !== '/aether') return null;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push('/features')}
      className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back
    </motion.button>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface AetherAnalysis {
  systemSummary: {
    name: string;
    plausibilityScore: number;
    physicsCategory: string;
  };
  multiFacetedAnalysis: {
    schematicObservations: string;
    emFieldAnomalies: string;
    gravimetricIntegrity: string;
    powerCurveAnalysis: string;
  };
  combinedInsight: {
    mechanismOfAction: string;
    conflictDetection: string;
  };
  engineeringStrategy: {
    currentViability: string;
    materialConstraints: string;
    energyRequirements: string;
  };
  riskAnalysis: {
    hazards: string;
    catastrophicScenarios: string;
  };
  explanation: string;
}

interface UploadedImage {
  file: File;
  preview: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const FRAMEWORKS = [
  'General Relativity',
  'Quantum Field Theory',
  'String Theory',
  'Loop Quantum Gravity',
  'Electrogravitics',
  'Alcubierre / Warp Metric',
  'Fringe Physics',
  'Zero-Point Energy',
  'Anti-Gravity (Empirical)',
];

const APPLICATIONS = [
  'Micro-lift (Lab Scale)',
  'Aerospace Propulsion',
  'Deep Space Navigation',
  'Orbital Insertion',
  'Theoretical / Research Only',
];

const LOADING_STEPS = [
  'Ingesting sensor telemetry…',
  'Parsing schematic topology…',
  'Calibrating metric tensor baseline…',
  'Cross-referencing EM resonance signatures…',
  'Evaluating gravimetric conservation integrity…',
  'Analysing power-to-thrust coefficient…',
  'Running thermodynamic violation sweep…',
  'Synthesising multi-modal physics report…',
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── Score Color ──────────────────────────────────────────────────────────────
function scoreToColor(score: number): { text: string; border: string; bg: string; glow: string } {
  if (score >= 65) return {
    text: '#10b981',
    border: 'rgba(16,185,129,0.35)',
    bg: 'rgba(16,185,129,0.08)',
    glow: 'rgba(16,185,129,0.4)',
  };
  if (score >= 35) return {
    text: '#f59e0b',
    border: 'rgba(245,158,11,0.35)',
    bg: 'rgba(245,158,11,0.08)',
    glow: 'rgba(245,158,11,0.4)',
  };
  return {
    text: '#f43f5e',
    border: 'rgba(244,63,94,0.35)',
    bg: 'rgba(244,63,94,0.08)',
    glow: 'rgba(244,63,94,0.4)',
  };
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────
interface DropZoneProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ id, label, icon, accent, value, onChange }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const preview = URL.createObjectURL(file);
    onChange({ file, preview });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="relative cursor-pointer select-none"
      style={{ borderRadius: 16 }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
      />

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: `1px dashed ${dragging ? accent : value ? accent : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 16,
          background: dragging
            ? `${accent}12`
            : value
            ? `${accent}08`
            : 'rgba(255,255,255,0.025)',
          transition: 'all 0.22s ease',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          overflow: 'hidden',
          boxShadow: dragging ? `0 0 24px ${accent}30` : 'none',
        }}
      >
        {value ? (
          <div className="relative w-full h-full" style={{ minHeight: 100 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.preview}
              alt={label}
              style={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                borderRadius: 10,
                opacity: 0.92,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                borderRadius: '0 0 10px 10px',
                padding: '4px 8px',
                fontSize: 10,
                fontFamily: 'monospace',
                color: accent,
                letterSpacing: '0.04em',
              }}
            >
              ✓ {value.file.name.slice(0, 24)}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(244,63,94,0.85)',
                border: 'none',
                color: '#fff',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >×</button>
          </div>
        ) : (
          <>
            <div style={{ color: accent, marginBottom: 8, opacity: 0.75 }}>{icon}</div>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textAlign: 'center', letterSpacing: '0.03em' }}>
              {label}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 4, fontFamily: 'monospace' }}>
              DROP OR CLICK
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─── Analysis Card ────────────────────────────────────────────────────────────
interface AnalysisCardProps {
  title: string;
  icon: string;
  content: string;
  accent?: string;
  delay?: number;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, icon, content, accent = '#60a5fa', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: EASE }}
    style={{
      background: 'rgba(8,12,20,0.85)',
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 14,
      padding: '18px 20px',
      backdropFilter: 'blur(20px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.4)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Top accent line */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.08em', color: accent, fontWeight: 700, textTransform: 'uppercase' }}>
        {title}
      </span>
    </div>
    <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.65)' }}>{content}</p>
  </motion.div>
);

// ─── Loading Animation ────────────────────────────────────────────────────────
const LoadingAnimation: React.FC = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setStepIdx((i) => (i + 1) % LOADING_STEPS.length), 1800);
    const dotInterval = setInterval(() => setDots((d) => d.length >= 3 ? '' : d + '.'), 420);
    return () => { clearInterval(interval); clearInterval(dotInterval); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 40 }}>
      {/* Spinning rings */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#7c3aed',
          borderRightColor: '#7c3aed40',
          animation: 'aether-spin 1.4s linear infinite',
        }} />
        {/* Mid ring */}
        <div style={{
          position: 'absolute', inset: 14, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#06b6d4',
          borderLeftColor: '#06b6d440',
          animation: 'aether-spin-rev 1.0s linear infinite',
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute', inset: 28, borderRadius: '50%',
          border: '1.5px solid transparent',
          borderTopColor: '#3b82f6',
          animation: 'aether-spin 0.7s linear infinite',
        }} />
        {/* Core glow */}
        <div style={{
          position: 'absolute', inset: 42,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(59,130,246,0.2) 50%, transparent 100%)',
          animation: 'aether-pulse 2s ease-in-out infinite',
        }} />
      </div>

      {/* Status text */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.20em', color: 'rgba(124,58,237,0.9)', fontFamily: 'monospace', marginBottom: 10, textTransform: 'uppercase' }}>
          A.E.T.H.E.R. ANALYSIS ENGINE
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', minHeight: 24 }}
          >
            {LOADING_STEPS[stepIdx]}{dots}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div style={{ width: 320, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #3b82f6)',
          borderRadius: 2,
          animation: 'aether-progress 14s linear forwards',
        }} />
      </div>

      <style>{`
        @keyframes aether-spin { to { transform: rotate(360deg); } }
        @keyframes aether-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes aether-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes aether-progress {
          0% { width: 0%; }
          100% { width: 95%; }
        }
      `}</style>
    </div>
  );
};

// ─── Score Gauge ──────────────────────────────────────────────────────────────
const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const colors = scoreToColor(score);
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={120} height={120} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={50} cy={50} r={44} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <motion.circle
          cx={50} cy={50} r={44}
          fill="none"
          stroke={colors.text}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: EASE }}
          style={{ filter: `drop-shadow(0 0 6px ${colors.glow})` }}
        />
      </svg>
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ fontSize: 28, fontWeight: 800, color: colors.text, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-0.03em' }}
        >
          {score}
        </motion.p>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginTop: 2 }}>PLAUSIBILITY</p>
      </div>
    </div>
  );
};

// ─── Results Dashboard ────────────────────────────────────────────────────────
const ResultsDashboard: React.FC<{ analysis: AetherAnalysis; meta: { framework: string; application: string; imagesProcessed: number; timestamp: string } }> = ({ analysis, meta }) => {
  const colors = scoreToColor(analysis.systemSummary.plausibilityScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: 1100 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{
          background: 'rgba(8,12,20,0.90)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 24,
          backdropFilter: 'blur(24px)',
          boxShadow: `0 0 60px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.06)`,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          flexWrap: 'wrap',
        }}
      >
        <ScoreGauge score={analysis.systemSummary.plausibilityScore} />

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 10,
              fontFamily: 'monospace',
              letterSpacing: '0.10em',
              background: 'rgba(124,58,237,0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.25)',
              textTransform: 'uppercase',
            }}>
              A.E.T.H.E.R. REPORT
            </span>
            <span style={{
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 10,
              fontFamily: 'monospace',
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
            }}>
              {analysis.systemSummary.physicsCategory}
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.03em', marginBottom: 6 }}>
            {analysis.systemSummary.name}
          </h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Framework', val: meta.framework },
              { label: 'Application', val: meta.application },
              { label: 'Images Analysed', val: `${meta.imagesProcessed}` },
            ].map((item) => (
              <div key={item.label}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace' }}>{item.label}: </span>
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.60)', fontFamily: 'monospace' }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score label */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', fontFamily: 'monospace', textTransform: 'uppercase' }}>Physics Plausibility</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: colors.text, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-0.04em', textShadow: `0 0 20px ${colors.glow}` }}>
            {analysis.systemSummary.plausibilityScore}<span style={{ fontSize: 16, opacity: 0.5 }}>/100</span>
          </p>
        </div>
      </motion.div>

      {/* Plain language explanation */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(6,182,212,0.06) 100%)',
          border: '1px solid rgba(124,58,237,0.20)',
          borderRadius: 14,
          padding: '18px 22px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 15 }}>🔬</span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.08em', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase' }}>
            Research Director Summary
          </span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)' }}>{analysis.explanation}</p>
      </motion.div>

      {/* Multi-Faceted Analysis Grid */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'rgba(124,58,237,0.7)', textTransform: 'uppercase', marginBottom: 12 }}>
          ▸ MULTI-FACETED SENSOR ANALYSIS
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          <AnalysisCard title="Schematic Observations" icon="📐" content={analysis.multiFacetedAnalysis.schematicObservations} accent="#60a5fa" delay={0.2} />
          <AnalysisCard title="EM Field Anomalies" icon="⚡" content={analysis.multiFacetedAnalysis.emFieldAnomalies} accent="#a78bfa" delay={0.25} />
          <AnalysisCard title="Gravimetric Integrity" icon="⚖️" content={analysis.multiFacetedAnalysis.gravimetricIntegrity} accent="#34d399" delay={0.3} />
          <AnalysisCard title="Power Curve Analysis" icon="🔋" content={analysis.multiFacetedAnalysis.powerCurveAnalysis} accent="#f59e0b" delay={0.35} />
        </div>
      </div>

      {/* Combined Insight */}
      <div style={{ marginTop: 20, marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'rgba(6,182,212,0.7)', textTransform: 'uppercase', marginBottom: 12 }}>
          ▸ COMBINED PHYSICS INSIGHT
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          <AnalysisCard title="Mechanism of Action" icon="⚙️" content={analysis.combinedInsight.mechanismOfAction} accent="#06b6d4" delay={0.4} />
          <AnalysisCard
            title="Conflict Detection"
            icon="⚠️"
            content={analysis.combinedInsight.conflictDetection}
            accent={analysis.combinedInsight.conflictDetection.toLowerCase().includes('violat') ? '#f43f5e' : '#f59e0b'}
            delay={0.45}
          />
        </div>
      </div>

      {/* Engineering + Risk Row */}
      <div style={{ marginTop: 20, marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'rgba(244,63,94,0.7)', textTransform: 'uppercase', marginBottom: 12 }}>
          ▸ ENGINEERING & RISK MATRIX
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          <AnalysisCard title="Current Viability" icon="🚀" content={analysis.engineeringStrategy.currentViability} accent="#60a5fa" delay={0.5} />
          <AnalysisCard title="Material Constraints" icon="🧲" content={analysis.engineeringStrategy.materialConstraints} accent="#a78bfa" delay={0.55} />
          <AnalysisCard title="Energy Requirements" icon="☢️" content={analysis.engineeringStrategy.energyRequirements} accent="#f59e0b" delay={0.6} />
          <AnalysisCard title="Operational Hazards" icon="⚡" content={analysis.riskAnalysis.hazards} accent="#f43f5e" delay={0.65} />
          <AnalysisCard title="Catastrophic Scenarios" icon="💥" content={analysis.riskAnalysis.catastrophicScenarios} accent="#f43f5e" delay={0.7} />
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        style={{ marginTop: 28, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}
      >
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          A.E.T.H.E.R. v1.0 · Anti-gravity Experimental Theoretical &amp; Heuristic EvaluatoR
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace' }}>
          ANALYSIS COMPLETED · {new Date(meta.timestamp).toLocaleString()}
        </span>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AetherPage() {
  const [systemName, setSystemName] = useState('');
  const [theoreticalFramework, setTheoreticalFramework] = useState(FRAMEWORKS[0]);
  const [targetApplication, setTargetApplication] = useState(APPLICATIONS[0]);

  const [schematic, setSchematic] = useState<UploadedImage | null>(null);
  const [emField, setEmField] = useState<UploadedImage | null>(null);
  const [gravimetric, setGravimetric] = useState<UploadedImage | null>(null);
  const [powerCurve, setPowerCurve] = useState<UploadedImage | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AetherAnalysis | null>(null);
  const [meta, setMeta] = useState<{ framework: string; application: string; imagesProcessed: number; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!systemName.trim()) { setError('System name is required.'); return; }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append('systemName', systemName);
      fd.append('theoreticalFramework', theoreticalFramework);
      fd.append('targetApplication', targetApplication);
      if (schematic) fd.append('schematic', schematic.file);
      if (emField) fd.append('emField', emField.file);
      if (gravimetric) fd.append('gravimetric', gravimetric.file);
      if (powerCurve) fd.append('powerCurve', powerCurve.file);

      const res = await fetch('/api/aether/evaluate', { method: 'POST', body: fd });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Analysis failed');
      setResult(data.analysis);
      setMeta({
        framework: data.metadata.theoreticalFramework,
        application: data.metadata.targetApplication,
        imagesProcessed: data.metadata.imagesProcessed,
        timestamp: data.metadata.timestamp,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setMeta(null);
    setError(null);
    setSystemName('');
    setSchematic(null);
    setEmField(null);
    setGravimetric(null);
    setPowerCurve(null);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10,
    padding: '11px 14px',
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13.5,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: '0.10em',
    color: 'rgba(255,255,255,0.30)',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <BackButton />
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        style={{ marginBottom: 32 }}
      >
        {/* Glowing header badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.10))',
            border: '1px solid rgba(124,58,237,0.30)',
            boxShadow: '0 0 24px rgba(124,58,237,0.15)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 8px #7c3aed', animation: 'live-pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em', color: '#a78bfa', textTransform: 'uppercase' }}>
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        <h1 style={{
          fontSize: 36,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: 10,
          background: 'linear-gradient(135deg, #e0e7ff 0%, #a78bfa 40%, #06b6d4 80%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Project A.E.T.H.E.R.
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.06em', marginBottom: 4 }}>
          Anti-gravity Experimental Theoretical &amp; Heuristic EvaluatoR
        </p>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', maxWidth: 600, lineHeight: 1.6 }}>
          Upload schematics &amp; sensor graphs from your experimental gravity-modification device. The AI will cross-examine the data for physics violations, engineering feasibility, and theoretical coherence.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'rgba(8,12,20,0.88)',
              border: '1px solid rgba(124,58,237,0.20)',
              borderRadius: 20,
              boxShadow: '0 0 60px rgba(124,58,237,0.08)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <LoadingAnimation />
          </motion.div>
        ) : result && meta ? (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 20px', borderRadius: 10,
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  color: '#a78bfa',
                  fontSize: 13, fontFamily: 'monospace', cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                ↩ NEW ANALYSIS
              </motion.button>
            </div>
            <ResultsDashboard analysis={result} meta={meta} />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* ── Input Form Card ─────────────────────────────────────── */}
            <div style={{
              background: 'rgba(8,12,20,0.85)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              backdropFilter: 'blur(24px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            }}>
              {/* Card header bar */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(124,58,237,0.05)',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 8px #7c3aed60', display: 'inline-block' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d460', display: 'inline-block' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f660', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', marginLeft: 8, letterSpacing: '0.06em' }}>
                  DEVICE_SUBMISSION_INTERFACE.aether
                </span>
              </div>

              <div style={{ padding: '28px 28px 32px' }}>
                {/* Text inputs row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
                  <div>
                    <label style={labelStyle} htmlFor="aether-system-name">System Name</label>
                    <input
                      id="aether-system-name"
                      type="text"
                      value={systemName}
                      onChange={(e) => setSystemName(e.target.value)}
                      placeholder="e.g. Project Nautilus Mk.IV"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.50)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.10)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="aether-framework">Theoretical Framework</label>
                    <select
                      id="aether-framework"
                      value={theoreticalFramework}
                      onChange={(e) => setTheoreticalFramework(e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      {FRAMEWORKS.map((f) => <option key={f} value={f} style={{ background: '#0c1120' }}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="aether-application">Target Application</label>
                    <select
                      id="aether-application"
                      value={targetApplication}
                      onChange={(e) => setTargetApplication(e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      {APPLICATIONS.map((a) => <option key={a} value={a} style={{ background: '#0c1120' }}>{a}</option>)}
                    </select>
                  </div>
                </div>

                {/* Image upload zones */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ ...labelStyle, color: 'rgba(124,58,237,0.7)', marginBottom: 14, fontSize: 10.5 }}>
                    ▸ SENSOR DATA UPLOADS (optional — include what you have)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    <DropZone
                      id="aether-schematic"
                      label="Device Schematic / Blueprint"
                      accent="#60a5fa"
                      value={schematic}
                      onChange={setSchematic}
                      icon={
                        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />
                    <DropZone
                      id="aether-em"
                      label="EM Field Resonance Graph"
                      accent="#a78bfa"
                      value={emField}
                      onChange={setEmField}
                      icon={
                        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3" />
                        </svg>
                      }
                    />
                    <DropZone
                      id="aether-gravimetric"
                      label="Gravimetric Sensor Data"
                      accent="#34d399"
                      value={gravimetric}
                      onChange={setGravimetric}
                      icon={
                        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                      }
                    />
                    <DropZone
                      id="aether-power"
                      label="Power & Thermal Curve"
                      accent="#f59e0b"
                      value={powerCurve}
                      onChange={setPowerCurve}
                      icon={
                        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                      }
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        marginTop: 16,
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(244,63,94,0.08)',
                        border: '1px solid rgba(244,63,94,0.25)',
                        color: '#fca5a5',
                        fontSize: 13,
                        fontFamily: 'monospace',
                      }}
                    >
                      ⚠ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.button
                    id="aether-submit"
                    whileHover={{ scale: 1.025, boxShadow: '0 8px 32px rgba(124,58,237,0.35)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 10,
                      padding: '13px 32px',
                      background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #4f46e5 100%)',
                      border: '1px solid rgba(167,139,250,0.35)',
                      borderRadius: 12,
                      color: '#ede9fe',
                      fontSize: 13.5, fontWeight: 700, fontFamily: 'monospace',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.06em',
                      boxShadow: '0 4px 20px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.12)',
                      textTransform: 'uppercase',
                    }}
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.612c-1.444 0-2.414-1.798-1.414-2.798L4.6 15.3" />
                    </svg>
                    INITIATE AETHER ANALYSIS
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Info strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: 16, padding: '12px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {[
                { icon: '🔭', text: 'Alcubierre metrics evaluated' },
                { icon: '⚛️', text: 'QFT & GR cross-reference' },
                { icon: '🛡️', text: 'Conservation law audit' },
                { icon: '🤖', text: 'Gemini Vision AI powered' },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace' }}>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
