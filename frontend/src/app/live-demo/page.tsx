'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Layers,
  Clock,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/firebase';

/* ─── Types ──────────────────────────────────────────────────── */
interface LayerResult {
  score?: number;
  verdict?: string;
  [key: string]: unknown;
}

interface Verdict {
  overall_authenticity_score: number;
  verdict: string;
  is_authentic: boolean;
  confidence: number;
  buffer_seconds: number;
  samples_processed?: number;
  layers?: Record<string, LayerResult>;
}

function getOpenSourceModel(layer: LayerResult | undefined) {
  const model = layer?.open_source_model;
  if (!model || typeof model !== 'object') return null;
  return model as {
    fake_probability?: number;
    mean_fake_probability?: number;
    peak_fake_probability?: number;
    windows_evaluated?: number;
    model_id?: string;
    engine?: string;
  };
}

/* ─── Helpers ────────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_BASE.replace(/\/$/, '').replace(/^https?/, (protocol) => protocol === 'https' ? 'wss' : 'ws') + '/api/v1/verify/stream';

function scoreColor(score: number): string {
  if (score >= 0.7) return 'var(--success)';
  if (score >= 0.45) return 'var(--warning)';
  return 'var(--error)';
}

function scoreLabel(v: Verdict): string {
  return v.verdict || (v.is_authentic ? 'Authentic' : 'Synthetic');
}

function pct(n: number) {
  return (n * 100).toFixed(1) + '%';
}

/* ─── Sub-components ─────────────────────────────────────────── */

/** Animated waveform bars shown while listening */
function PulsingWaveform({ active }: { active: boolean }) {
  const bars = [3, 5, 7, 5, 9, 6, 4, 8, 5, 3];
  return (
    <div className="ld-waveform" aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className={`ld-wave-bar ${active ? 'ld-wave-bar--active' : ''}`}
          style={{ '--delay': `${i * 0.07}s`, '--h': `${h * 3}px` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/** Score ring — circular progress indicator */
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - score);
  const color = scoreColor(score);

  return (
    <svg width={size} height={size} className="ld-score-ring">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ}
        strokeDashoffset={fill}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease' }}
      />
      {/* Centre label */}
      <text
        x="50%" y="50%"
        textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.22} fontWeight={700} fill={color}
        style={{ fontFamily: 'inherit', transition: 'fill 0.4s ease' }}
      >
        {(score * 100).toFixed(0)}%
      </text>
    </svg>
  );
}

function getLayerScore(layer: LayerResult): number | null {
  if (typeof layer.score === 'number') return layer.score;
  if (typeof layer.authenticity_score === 'number') return layer.authenticity_score;
  if (typeof layer.spoof_score === 'number') return Math.max(0, 1 - layer.spoof_score);
  if (typeof layer.similarity_score === 'number') return layer.similarity_score;
  if (typeof (layer as any).found === 'boolean') return (layer as any).found ? 0.0 : 1.0;
  return null;
}

/** Mini per-layer breakdown row */
function LayerRow({ name, layer }: { name: string; layer: LayerResult }) {
  const score = getLayerScore(layer);
  const color = score !== null ? scoreColor(score) : 'var(--text-3)';
  const isSkipped = (layer as any).status === 'skipped';
  const hasError = Boolean((layer as any).error);

  return (
    <div className="ld-layer-row">
      <span className="ld-layer-name">{name.replace(/_/g, ' ')}</span>
      {score !== null && !hasError && (
        <>
          <div className="ld-layer-bar-track">
            <motion.div
              className="ld-layer-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: pct(score) }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: color }}
            />
          </div>
          <span className="ld-layer-score" style={{ color }}>{pct(score)}</span>
        </>
      )}
      {layer.verdict && !hasError && (
        <span className="ld-layer-verdict" style={{ color: 'var(--text-2)' }}>{layer.verdict}</span>
      )}
      {isSkipped && (
        <span className="ld-layer-verdict" style={{ color: 'var(--text-3)' }}>Skipped</span>
      )}
      {hasError && (
        <span className="ld-layer-verdict" style={{ color: 'var(--warning)', fontSize: '0.75rem' }}>
          {(layer as any).error?.slice(0, 30)}…
        </span>
      )}
    </div>
  );
}

/** Timeline tick mark */
function TimelineTick({ verdict }: { verdict: Verdict }) {
  const color = scoreColor(verdict.overall_authenticity_score);
  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="ld-tick"
      style={{ background: color }}
      title={`${scoreLabel(verdict)} · ${pct(verdict.overall_authenticity_score)}`}
    />
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function LiveDemoPage() {
  const [listening, setListening] = useState(false);
  const [wsState, setWsState] = useState<'idle' | 'connecting' | 'open' | 'closed'>('idle');
  const [latest, setLatest] = useState<Verdict | null>(null);
  const [history, setHistory] = useState<Verdict[]>([]);
  const [layersOpen, setLayersOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef       = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const sourceRef   = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletRef  = useRef<AudioWorkletNode | null>(null);
  const sinkRef     = useRef<GainNode | null>(null);

  /* Clean up on unmount */
  useEffect(() => () => { teardown(); }, []);

  const teardown = useCallback(() => {
    wsRef.current?.close();
    sourceRef.current?.disconnect();
    workletRef.current?.disconnect();
    sinkRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    wsRef.current       = null;
    streamRef.current   = null;
    audioCtxRef.current = null;
    sourceRef.current   = null;
    workletRef.current  = null;
    sinkRef.current     = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      /* 1. Grab the mic */
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      /* 2. Set up AudioContext + Worklet */
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      await audioCtx.audioWorklet.addModule('/pcm-processor.js');
      await audioCtx.resume();

      const source  = audioCtx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioCtx, 'pcm-processor');
      const sink = audioCtx.createGain();
      sink.gain.value = 0;
      sourceRef.current = source;
      workletRef.current = worklet;
      sinkRef.current = sink;

      /* 3. Open WebSocket */
      setWsState('connecting');
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError('Sign in with Firebase to use the live stream.');
        setListening(false);
        setWsState('closed');
        return;
      }

      const token = await currentUser.getIdToken();
      if (!token) {
        setError('Your Firebase session is missing an ID token. Please sign in again.');
        setListening(false);
        setWsState('closed');
        return;
      }

      const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen  = () => setWsState('open');
      ws.onclose = () => {
        setWsState('closed');
        setListening(false);
        teardown();
      };
      ws.onerror = () => {
        setError('WebSocket connection failed — is the backend running?');
        setListening(false);
        setWsState('closed');
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data) as unknown;
          const data = raw as Verdict & { error?: string };
          if (data.error) {
            setError(data.error);
            return;
          }
          setLatest(data);
          setHistory(prev => [...prev.slice(-49), data]);
        } catch {
          // ignore malformed frames
        }
      };

      /* 4. Pipe mic → worklet → WebSocket */
      worklet.port.onmessage = (event) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      source.connect(worklet);
      worklet.connect(sink);
      sink.connect(audioCtx.destination);

      setListening(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Could not start: ${msg}`);
      teardown();
    }
  }, [teardown]);

  const stop = useCallback(() => {
    teardown();
    setListening(false);
    setWsState('idle');
  }, [teardown]);

  const reset = useCallback(() => {
    stop();
    setLatest(null);
    setHistory([]);
    setError(null);
  }, [stop]);

  /* ── Verdict colours / labels ─────────────────── */
  const mainColor    = latest ? scoreColor(latest.overall_authenticity_score) : 'var(--text-3)';
  const verdictLabel = latest ? scoreLabel(latest) : null;

  return (
    <>
      {/* Page styles injected inline — scoped to ld- class prefix */}
      <style>{ldStyles}</style>

      <div className="ld-root">
        {/* ── Header ─────────────────────────────── */}
        <header className="ld-header">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="ld-header-inner"
          >
            <div className="ld-badge">
              <Radio size={12} />
              Live Demo
            </div>
            <h1 className="ld-title">Real-Time Voice Authentication</h1>
            <p className="ld-subtitle">
              Speak into your microphone. The 6-layer detection engine evaluates authenticity live
              — every analysis window returns a verdict.
            </p>
          </motion.div>
        </header>

        {/* ── Main grid ──────────────────────────── */}
        <div className="ld-grid">

          {/* ── Left: Control panel ──────────────── */}
          <motion.section
            className="ld-card ld-control"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            <div className="ld-card-label">
              <Mic size={13} />
              Microphone Input
            </div>

            {/* Big action button */}
            <button
              id="ld-btn-toggle"
              className={`ld-main-btn ${listening ? 'ld-main-btn--stop' : ''}`}
              onClick={listening ? stop : start}
            >
              <span className="ld-btn-icon">
                {listening
                  ? <MicOff size={26} />
                  : <Mic size={26} />
                }
              </span>
              <span className="ld-btn-label">
                {listening ? 'Stop Listening' : 'Start Listening'}
              </span>
              {listening && <span className="ld-btn-pulse" />}
            </button>

            {/* Waveform visualiser */}
            <PulsingWaveform active={listening} />

            {/* Status row */}
            <div className="ld-status-row">
              <span className={`ld-status-dot ${
                wsState === 'open' ? 'ld-status-dot--green'
                : wsState === 'connecting' ? 'ld-status-dot--yellow'
                : 'ld-status-dot--gray'
              }`} />
              <span className="ld-status-text">
                {wsState === 'open'       ? 'Stream connected'
                : wsState === 'connecting' ? 'Connecting…'
                : wsState === 'closed'     ? 'Disconnected'
                :                           'Idle — click Start'}
              </span>
              {wsState === 'open'
                ? <Wifi size={13} style={{ color: 'var(--success)', marginLeft: 'auto' }} />
                : <WifiOff size={13} style={{ color: 'var(--text-3)', marginLeft: 'auto' }} />
              }
            </div>

            {/* Reset */}
            {(latest || error) && (
              <button id="ld-btn-reset" className="ld-ghost-btn" onClick={reset}>
                Clear results
              </button>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ld-error"
                >
                  <ShieldAlert size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tips */}
            <div className="ld-tips">
              <p className="ld-tip">💡 Speak naturally — silence produces no verdict (by design).</p>
              <p className="ld-tip">🎙️ For best results, allow mic permission and speak within 30 cm.</p>
              <p className="ld-tip">🤖 Play a synthetic clip near the mic to see the verdict shift.</p>
            </div>
          </motion.section>

          {/* ── Right: Verdict panel ─────────────── */}
          <motion.section
            className="ld-card ld-verdict-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
          >
            <div className="ld-card-label">
              <Activity size={13} />
              Latest Verdict
            </div>

            <AnimatePresence mode="wait">
              {!latest ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ld-verdict-empty"
                >
                  <div className="ld-verdict-empty-ring" />
                  <span>Waiting for audio…</span>
                </motion.div>
              ) : (
                <motion.div
                  key={latest.overall_authenticity_score}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className="ld-verdict-content"
                >
                  {/* Score ring */}
                  <div className="ld-ring-wrap">
                    <ScoreRing score={latest.overall_authenticity_score} size={130} />
                    <div className="ld-ring-label" style={{ color: mainColor }}>
                      {latest.is_authentic
                        ? <ShieldCheck size={16} />
                        : <ShieldAlert size={16} />
                      }
                      {verdictLabel}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="ld-stats-grid">
                    <div className="ld-stat">
                      <span className="ld-stat-label"><BarChart2 size={12} /> Confidence</span>
                      <span className="ld-stat-value" style={{ color: 'var(--text-1)' }}>
                        {pct(latest.confidence)}
                      </span>
                    </div>
                    <div className="ld-stat">
                      <span className="ld-stat-label"><Clock size={12} /> Analyzed</span>
                      <span className="ld-stat-value" style={{ color: 'var(--text-1)' }}>
                        {latest.buffer_seconds.toFixed(1)}s
                      </span>
                    </div>
                    {latest.samples_processed != null && (
                      <div className="ld-stat">
                        <span className="ld-stat-label"><Activity size={12} /> Samples</span>
                        <span className="ld-stat-value" style={{ color: 'var(--text-1)' }}>
                          {latest.samples_processed.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const model = getOpenSourceModel(latest.layers?.layer1_antispoof);
                    if (!model) return null;
                    const fakeProbability = typeof model.fake_probability === 'number'
                      ? model.fake_probability
                      : null;
                    const modelColor = fakeProbability !== null && fakeProbability >= 0.5
                      ? 'var(--error)'
                      : 'var(--success)';
                    return (
                      <div className="ld-model-result">
                        <div className="ld-model-result-heading">
                          <span>Open-source AI detector</span>
                          <strong style={{ color: modelColor }}>
                            {fakeProbability !== null ? `${(fakeProbability * 100).toFixed(1)}% fake` : 'Unavailable'}
                          </strong>
                        </div>
                        <div className="ld-model-result-meta">
                          {model.windows_evaluated ?? 0} one-second window{model.windows_evaluated === 1 ? '' : 's'}
                          {model.model_id ? ` · ${model.model_id}` : ''}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Layers accordion */}
                  {latest.layers && Object.keys(latest.layers).length > 0 && (
                    <div className="ld-layers">
                      <button
                        className="ld-layers-toggle"
                        onClick={() => setLayersOpen(o => !o)}
                        aria-expanded={layersOpen}
                      >
                        <Layers size={13} />
                        Per-layer breakdown
                        {layersOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      <AnimatePresence>
                        {layersOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="ld-layers-body">
                              {Object.entries(latest.layers).map(([k, v]) => (
                                <LayerRow key={k} name={k} layer={v} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>

        {/* ── Timeline ──────────────────────────── */}
        <motion.section
          className="ld-card ld-timeline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
        >
          <div className="ld-card-label">
            <Activity size={13} />
            Detection Timeline
            {history.length > 0 && (
              <span className="ld-timeline-count">{history.length} window{history.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="ld-timeline-track">
            {history.length === 0 ? (
              <span className="ld-timeline-empty">Timeline will populate as verdicts arrive…</span>
            ) : (
              history.map((h, i) => <TimelineTick key={i} verdict={h} />)
            )}
          </div>

          <div className="ld-timeline-legend">
            <span className="ld-legend-item">
              <span className="ld-legend-dot" style={{ background: 'var(--success)' }} />
              Authentic (&ge; 70%)
            </span>
            <span className="ld-legend-item">
              <span className="ld-legend-dot" style={{ background: 'var(--warning)' }} />
              Suspicious (45&ndash;70%)
            </span>
            <span className="ld-legend-item">
              <span className="ld-legend-dot" style={{ background: 'var(--error)' }} />
              Synthetic (&lt; 45%)
            </span>
          </div>
        </motion.section>
      </div>
    </>
  );
}

/* ─── Scoped CSS ────────────────────────────────────────────── */
const ldStyles = `
/* ── Root layout ─────────────────────────────────────────────── */
.ld-root {
  min-height: 100vh;
  background: var(--bg);
  padding: 48px 24px 80px;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Header ──────────────────────────────────────────────────── */
.ld-header { text-align: center; margin-bottom: 48px; }
.ld-header-inner { display: inline-flex; flex-direction: column; align-items: center; gap: 16px; }

.ld-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(232,54,93,0.12); border: 1px solid rgba(232,54,93,0.28);
  color: var(--accent); border-radius: 999px;
  padding: 4px 12px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
}

.ld-title {
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 800; letter-spacing: -0.03em;
  color: var(--text-1); line-height: 1.15;
  background: linear-gradient(135deg, #ededed 40%, rgba(232,54,93,0.9));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.ld-subtitle {
  font-size: 15px; color: var(--text-2); max-width: 560px; line-height: 1.65;
}

/* ── Grid ────────────────────────────────────────────────────── */
.ld-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
@media (max-width: 720px) { .ld-grid { grid-template-columns: 1fr; } }

/* ── Card ────────────────────────────────────────────────────── */
.ld-card {
  background: var(--surface-1);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-xl);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ld-card-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--text-3);
}

/* ── Control panel ───────────────────────────────────────────── */
.ld-control { gap: 16px; }

.ld-main-btn {
  position: relative;
  width: 100%; padding: 18px 24px;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 15px; font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  transition: background 0.2s, border-color 0.2s, transform 0.12s;
  overflow: hidden;
}
.ld-main-btn:hover { background: var(--surface-3); border-color: var(--border-strong); transform: translateY(-1px); }
.ld-main-btn:active { transform: translateY(0); }

.ld-main-btn--stop {
  background: rgba(232,54,93,0.1);
  border-color: rgba(232,54,93,0.35);
  color: var(--accent);
}
.ld-main-btn--stop:hover { background: rgba(232,54,93,0.15); }

.ld-btn-icon { display: flex; align-items: center; }
.ld-btn-label { flex: 1; }

.ld-btn-pulse {
  position: absolute; inset: 0; border-radius: inherit;
  background: rgba(232,54,93,0.08);
  animation: ldPulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ldPulse {
  0%, 100% { opacity: 0; }
  50%        { opacity: 1; }
}

/* ── Waveform ────────────────────────────────────────────────── */
.ld-waveform {
  display: flex; align-items: center; justify-content: center;
  gap: 4px; height: 36px;
}

.ld-wave-bar {
  display: inline-block;
  width: 4px;
  border-radius: 999px;
  background: var(--border-strong);
  height: 4px;
  transition: background 0.3s;
}

.ld-wave-bar--active {
  background: var(--accent);
  height: var(--h, 12px);
  animation: ldWave 1.1s ease-in-out infinite alternate;
  animation-delay: var(--delay, 0s);
}

@keyframes ldWave {
  from { transform: scaleY(0.3); opacity: 0.6; }
  to   { transform: scaleY(1);   opacity: 1;   }
}

/* ── Status row ──────────────────────────────────────────────── */
.ld-status-row {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: var(--surface-2); border-radius: var(--radius-md);
  font-size: 12px; color: var(--text-2);
}

.ld-status-dot {
  width: 7px; height: 7px; border-radius: 999px; flex-shrink: 0;
}
.ld-status-dot--green  { background: var(--success); box-shadow: 0 0 6px var(--success); }
.ld-status-dot--yellow { background: var(--warning); box-shadow: 0 0 6px var(--warning); animation: ldBlink 1s ease infinite; }
.ld-status-dot--gray   { background: var(--text-3); }

@keyframes ldBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

.ld-status-text { flex: 1; }

/* ── Ghost button ────────────────────────────────────────────── */
.ld-ghost-btn {
  background: transparent; border: 1px solid var(--border-mid);
  border-radius: var(--radius-md); padding: 8px 16px;
  color: var(--text-2); font-size: 12px; cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  align-self: flex-start;
}
.ld-ghost-btn:hover { border-color: var(--border-strong); color: var(--text-1); }

/* ── Error ───────────────────────────────────────────────────── */
.ld-error {
  display: flex; align-items: flex-start; gap: 8px;
  background: rgba(239,68,68,0.09); border: 1px solid rgba(239,68,68,0.25);
  border-radius: var(--radius-md); padding: 12px 14px;
  color: var(--error); font-size: 13px; line-height: 1.5;
}

/* ── Tips ────────────────────────────────────────────────────── */
.ld-tips { display: flex; flex-direction: column; gap: 6px; }
.ld-tip  { font-size: 12px; color: var(--text-3); line-height: 1.55; }

/* ── Verdict panel ───────────────────────────────────────────── */
.ld-verdict-panel { min-height: 340px; }

.ld-verdict-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; color: var(--text-3); font-size: 13px;
}

.ld-verdict-empty-ring {
  width: 80px; height: 80px; border-radius: 999px;
  border: 6px solid var(--border-mid);
  opacity: 0.5;
  animation: ldSpin 3s linear infinite;
}
@keyframes ldSpin { to { transform: rotate(360deg); } }

.ld-verdict-content {
  display: flex; flex-direction: column; gap: 20px;
}

/* Score ring */
.ld-ring-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}

.ld-score-ring { display: block; }

.ld-ring-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; letter-spacing: 0.01em;
}

/* Stats */
.ld-stats-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}

.ld-stat {
  display: flex; flex-direction: column; gap: 4px;
  background: var(--surface-2); border-radius: var(--radius-md); padding: 12px;
}

.ld-stat-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--text-3);
}

.ld-stat-value { font-size: 18px; font-weight: 700; }

/* Layers */
.ld-layers { display: flex; flex-direction: column; gap: 0; }

.ld-layers-toggle {
  display: flex; align-items: center; gap: 7px;
  background: transparent; border: 1px solid var(--border-mid);
  border-radius: var(--radius-md); padding: 9px 14px;
  color: var(--text-2); font-size: 12px; cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  width: 100%;
}
.ld-layers-toggle:hover { border-color: var(--border-strong); color: var(--text-1); }

.ld-layers-body {
  border: 1px solid var(--border-mid); border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  overflow: hidden;
}

.ld-layer-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.ld-layer-row:last-child { border-bottom: none; }

.ld-layer-name {
  width: 130px; flex-shrink: 0; color: var(--text-2); text-transform: capitalize;
}

.ld-layer-bar-track {
  flex: 1; height: 4px; background: var(--surface-3); border-radius: 999px; overflow: hidden;
}

.ld-layer-bar-fill { height: 100%; border-radius: 999px; }

.ld-layer-score { width: 44px; text-align: right; font-weight: 600; flex-shrink: 0; }
.ld-layer-verdict { color: var(--text-3); font-size: 11px; flex-shrink: 0; }

/* ── Timeline ────────────────────────────────────────────────── */
.ld-timeline { gap: 16px; }

.ld-timeline-track {
  display: flex; align-items: flex-end; gap: 3px;
  height: 48px; background: var(--surface-2);
  border-radius: var(--radius-md); padding: 8px 12px; overflow-x: auto;
}

.ld-timeline-empty {
  width: 100%; text-align: center; font-size: 12px; color: var(--text-3);
  align-self: center;
}

.ld-tick {
  flex-shrink: 0; width: 12px; min-width: 12px; height: 100%;
  border-radius: 3px; cursor: default;
  transition: filter 0.2s;
}
.ld-tick:hover { filter: brightness(1.3); }

.ld-timeline-count {
  margin-left: auto; font-size: 11px; color: var(--text-3);
  font-weight: 400; text-transform: none; letter-spacing: 0;
}

.ld-timeline-legend {
  display: flex; gap: 20px; flex-wrap: wrap;
}

.ld-legend-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--text-3);
}

.ld-legend-dot { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; }
`;
