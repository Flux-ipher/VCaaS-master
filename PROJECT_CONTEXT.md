# VCaaS — Project Context & Change Log

> **This file is the single source of truth for all changes made to this codebase.**
> Update it every time a file is modified. Use the rollback commands to undo any change safely.

---

## Project Identity

| Field | Value |
|---|---|
| Project | VCaaS — Voice Clone as a Service |
| Competition | AI-01 · Track 01 · AI & Machine Learning |
| Challenge | Voice-Clone Detection for Phone Scams |
| Workspace | `d:\Mobile Manipulators\VCAAS-main\VCAAS-main` |
| Git baseline | Commit `baseline: original VCaaS codebase before any modifications` |

---

## How to Use This File

- **Before any change:** add a row to the Pending Changes table with status `PLANNED`
- **After a change is made:** update status to `DONE` and fill in the rollback command
- **To rollback a single change:** run the rollback command in that row
- **To rollback everything:** `git reset --hard HEAD`
- **To see what changed:** `git diff HEAD~1` or `git log --oneline`

---

## Baseline Snapshot (before any modifications)

Captured: **2026-10-24 19:22 IST**

### Critical file sizes at baseline

| File | Bytes |
|---|---|
| `backend/app/services/antispoof.py` | 9,546 |
| `backend/app/services/prosody_service.py` | 5,966 |
| `backend/app/services/paralinguistic_service.py` | 6,940 |
| `backend/app/services/semantic_service.py` | 10,868 |
| `backend/app/services/risk_scoring.py` | 3,871 |
| `backend/app/services/stream_session.py` | 14,421 |
| `backend/app/api/v1/verify_stream.py` | 4,618 |
| `backend/app/api/v1/verify.py` | 23,672 |
| `backend/app/core/watermark.py` | 23,670 |

### Files that do NOT exist yet (to be created)

```
backend/app/services/telephone_channel.py      <- Phase 2 Module 1
backend/app/services/partial_fake_localizer.py <- Phase 2 Module 2
backend/app/services/eer_tracker.py            <- Phase 2 Module 4
backend/scripts/run_phase2_benchmark.py        <- Phase 2 Module 4
```

---

## Change Log

> Status key: `PLANNED` | `IN PROGRESS` | `DONE` | `ROLLED BACK`

---

### PHASE 1 — ACCURACY IMPROVEMENTS

#### CP1 — Layer 1 Anti-Spoof

| Field | Value |
|---|---|
| **Status** | `PLANNED` |
| **Target file** | `backend/app/services/antispoof.py` |
| **What changes** | Expand heuristic from 4 to 12 acoustic features (spectral flatness, mel-band variance, MFCC delta variance, CPP, RMS kurtosis, sub-band entropy, ZCR-RMS correlation, spectral skewness) |
| **Expected gain** | ~55% -> ~72% accuracy |
| **Rollback** | `git checkout HEAD -- backend/app/services/antispoof.py` |
| **Test** | `curl -X POST http://localhost:8000/api/v1/verify/antispoof -F "file=@test.wav"` |
| **Done at** | — |
| **Notes** | Must still return `{"spoof_score": float, "is_spoof": bool, "engine": str}` |

---

#### CP2 — Layer 3 Prosody

| Field | Value |
|---|---|
| **Status** | `PLANNED` |
| **Target file** | `backend/app/services/prosody_service.py` |
| **What changes** | Add jitter (RAP), shimmer, F0 trajectory smoothness (2nd derivative), voiced/unvoiced transition rate |
| **Expected gain** | ~60% -> ~74% accuracy |
| **Rollback** | `git checkout HEAD -- backend/app/services/prosody_service.py` |
| **Test** | `/full-analysis` -> check `layer3_prosody.authenticity_score` in [0,1] |
| **Done at** | — |
| **Notes** | Must still return `{"authenticity_score": float, "engine": str}` |

---

#### CP3 — Layer 4 Paralinguistic

| Field | Value |
|---|---|
| **Status** | `PLANNED` |
| **Target file** | `backend/app/services/paralinguistic_service.py` |
| **What changes** | Add MFCC delta-delta, HNR variance, energy-weighted spectral entropy |
| **Expected gain** | ~57% -> ~71% accuracy |
| **Rollback** | `git checkout HEAD -- backend/app/services/paralinguistic_service.py` |
| **Test** | `/full-analysis` -> check `layer4_paralinguistic` |
| **Done at** | — |
| **Notes** | Must still return `{"authenticity_score": float, "engine": str}` |

---

#### CP4 — Layer 5 Semantic

| Field | Value |
|---|---|
| **Status** | `PLANNED` |
| **Target file** | `backend/app/services/semantic_service.py` |
| **What changes** | Add word-confidence distribution shape check, word-duration uniformity, filler word ratio, Gaussian speech rate penalty |
| **Expected gain** | ~60% -> ~75% accuracy |
| **Rollback** | `git checkout HEAD -- backend/app/services/semantic_service.py` |
| **Test** | `/full-analysis` -> check `layer5_semantic` |
| **Done at** | — |
| **Notes** | No Whisper model upgrade — stays on tiny |

---

#### CP5 — Scoring & Weighting

| Field | Value |
|---|---|
| **Status** | `PLANNED` |
| **Target file** | `backend/app/services/risk_scoring.py` |
| **What changes** | Rebalance weights (L1=0.25, L3=0.20, L5=0.25, L6=0.20, L4=0.10), add low_confidence_flag, layer_agreement_score, tighten "Authentic" threshold 0.80->0.75 |
| **Expected gain** | Composite +3-5% |
| **Rollback** | `git checkout HEAD -- backend/app/services/risk_scoring.py` |
| **Test** | `/full-analysis` -> verify `overall_authenticity_score` in [0,1] and verdict string is valid |
| **Done at** | — |
| **Notes** | Threshold change affects frontend green/yellow/red colours — verify live demo UI |

---

### PHASE 2 — PHONE CALL EXTENSIONS

#### P2-M3 — 500ms Streaming Cadence

| Field | Value |
|---|---|
| **Status** | `DONE` |
| **Target files** | `backend/app/services/stream_session.py`, `backend/app/api/v1/verify_stream.py` |
| **What changes** | CADENCE_SECONDS 2.5->0.5, WINDOW_SECONDS 3.0->1.0, MIN_ANALYSIS_SECONDS 3.0->1.0, added `mode` ("normal" or "phone") and `sample_rate` params, integrated telephone preprocessing, added `cadence_ms=500`, `window_start_s`, `window_end_s`, `is_telephony`, and `segment_label` to verdicts |
| **Rollback** | `git checkout 1bdd8da -- backend/app/services/stream_session.py backend/app/api/v1/verify_stream.py` |
| **Test** | Open /live-demo or stream test -> verdicts arrive every ~500ms with `cadence_ms: 500` and `segment_label` |
| **Done at** | 2026-10-24 19:34 IST |
| **Notes** | Whisper (L5) still fires asynchronously on >=3.0s speech segments without blocking the 500ms fast path |

---

#### P2-M1 — Telephone Channel Preprocessor

| Field | Value |
|---|---|
| **Status** | `DONE` |
| **Target files** | `backend/app/services/telephone_channel.py` (NEW), `backend/app/api/v1/verify.py` |
| **What changes** | `TelephoneChannelPreprocessor` class: 8kHz bandwidth detection via spectral rolloff & HF energy ratio; polyphase/FFT resampling to 16kHz; Wiener/spectral noise filtering; dynamic layer weight reallocation (suppresses L6 19kHz watermark on 8kHz audio and redistributes weight); simulation of G.711 u-law, G.711 A-law, and line noise |
| **Rollback** | `git rm backend/app/services/telephone_channel.py` and `git checkout 1bdd8da -- backend/app/api/v1/verify.py` |
| **Test** | Send 8kHz WAV to `/api/v1/verify/full-analysis` -> verify `is_telephony=True` and `layer6_watermark.status == "disabled_telephony"` |
| **Done at** | 2026-10-24 19:32 IST |
| **Notes** | Imported with graceful fallback in `stream_session.py` and `verify.py` |

---

#### P2-M2 — Partial Fake Localizer

| Field | Value |
|---|---|
| **Status** | `DONE` |
| **Target files** | `backend/app/services/partial_fake_localizer.py` (NEW), `backend/app/api/v1/verify.py` (new `/localize` route) |
| **What changes** | `PartialFakeLocalizer` class + `POST /api/v1/verify/localize`. Runs fast layers (L1, L3, L4) on sliding 0.5s windows; produces per-window `REAL`/`FAKE` labels; merges adjacent segments into continuous spans; classifies clip as `CLEAN_HUMAN`, `FULL_FAKE`, or `PARTIAL_FAKE`; computes F1 at 0.5s resolution against ground-truth spans; includes `construct_partial_fake` benchmark utility |
| **Rollback** | `git rm backend/app/services/partial_fake_localizer.py` and `git checkout 1bdd8da -- backend/app/api/v1/verify.py` |
| **Test** | `curl -X POST http://localhost:8000/api/v1/verify/localize -F "file=@test.wav"` -> returns `{"segments": [...], "spans": [...], "clip_verdict": "PARTIAL_FAKE"}` |
| **Done at** | 2026-10-24 19:36 IST |
| **Notes** | Non-breaking addition: existing `/watermark` and `/full-analysis` endpoints remain fully compatible |

---

#### P2-M4 — EER Benchmark Runner

| Field | Value |
|---|---|
| **Status** | `DONE` |
| **Target files** | `backend/app/services/eer_tracker.py` (NEW), `backend/scripts/run_phase2_benchmark.py` (NEW) |
| **What changes** | `EERTracker` class with exact EER calculation (interpolated ROC curve with pure NumPy fallback), threshold calibration, and Phase 2 compliance checker (verifies worst degraded EER <= 2.5x clean EER and regression <= 2 pts). Benchmark script evaluates Clean 16kHz, 8kHz resampled, G.711 u-law, G.711 A-law, noisy phone (15dB SNR), and 0.5s partial fake localization F1 |
| **Rollback** | `git rm backend/app/services/eer_tracker.py backend/scripts/run_phase2_benchmark.py` |
| **Test** | `python backend/scripts/run_phase2_benchmark.py --samples 30` |
| **Done at** | 2026-10-24 19:37 IST |
| **Notes** | Can run synthetic end-to-end self-tests or accept pre-downloaded ASVspoof / In-the-Wild directories |

---

## Rollback Quick Reference

```powershell
# Rollback a single file to baseline
git checkout HEAD -- <relative-file-path>

# Rollback ALL changes (nuclear — loses all uncommitted work)
git reset --hard HEAD

# See exactly what changed in one file
git diff HEAD -- <relative-file-path>

# See all changed files
git status

# Undo last commit but keep file changes on disk
git reset --soft HEAD~1

# Tag the current state as a named checkpoint
git tag cp1-antispoof
git tag cp2-prosody
git tag cp3-paralinguistic
git tag cp4-semantic
git tag cp5-scoring
git tag p2-m3-streaming
git tag p2-m1-telephone
git tag p2-m2-localizer
git tag p2-m4-eer

# Jump back to any tagged checkpoint
git checkout cp1-antispoof
git checkout p2-m3-streaming
```

---

## Dependency Map

```
Safe to do in any order (each touches only one file):
  CP1, CP2, CP3, CP4

Ordered dependencies:
  CP5  -> best AFTER CP1-CP4   (weights recalibrated for improved layers)
  P2-M3 -> first Phase 2 step  (validates 500ms pipeline before adding complexity)
  P2-M1 -> after P2-M3         (plugs TelephonePreprocessor into StreamSession)
  P2-M2 -> independent         (new endpoint, can be done any time)
  P2-M4 -> last                (validates all improvements with EER measurement)
```

---

## Post-Change Testing Checklist

Run after every checkpoint before committing:

```
[ ] Backend starts without errors
    cd backend && python -m uvicorn app.main:app --reload

[ ] Health check passes
    curl http://localhost:8000/health

[ ] Full analysis returns valid JSON with all 6 layers
    curl -X POST http://localhost:8000/api/v1/verify/full-analysis -F "file=@test.wav"

[ ] overall_authenticity_score is float in [0.0, 1.0]

[ ] verdict is one of exactly these 6 strings:
      "Authentic (Human)"
      "Likely Human"
      "Unverified / Insufficient Evidence"
      "Suspicious (Likely Synthetic)"
      "Deepfake (Synthetic)"
      "Deepfake (Watermarked Synthetic)"

[ ] Live demo WebSocket connects and returns verdicts
    Open http://localhost:3001/live-demo

[ ] Commit the change with a descriptive message
    git add -A && git commit -m "cp1: expand antispoof to 12 features"
```

---

## Verified Docker Test Log (2026-10-24 20:44 IST)

Environment: `vcaas-backend:latest` Docker Container (Python 3.10 + libsndfile + ffmpeg)

### 1. Benchmark Execution (`run_phase2_benchmark.py`)
```
==============================================================================
                 VCaaS PHASE 2 BENCHMARK REPORT (DOCKER)
==============================================================================
Condition                  | EER (%)    | Threshold  | AUC-ROC 
------------------------------------------------------------------------------
Clean (16kHz Studio)       | 0.00     % | 0.608      | 1.000   
8kHz Resampled             | 0.00     % | 0.648      | 1.000   
G.711 u-law (PSTN)         | 30.00    % | 0.683      | 0.910   
G.711 A-law (VoIP)         | 20.00    % | 0.594      | 0.820   
Noisy Phone (15dB SNR)     | 0.00     % | 0.558      | 1.000   
------------------------------------------------------------------------------
```

### 2. Live API Endpoint Verification
- `GET http://localhost:8000/health` -> `{"status":"healthy","services":{"database":"healthy","tts":"healthy"}}`
- `POST http://localhost:8000/api/v1/verify/localize` (Full Fake test) -> Returned `clip_verdict: "FULL_FAKE"`, `fake_ratio: 1.0`
- `POST http://localhost:8000/api/v1/verify/localize` (Spliced Partial Fake test) -> Returned `clip_verdict: "PARTIAL_FAKE"`, localized 0.0s-0.5s as `REAL` (score 0.61) and 0.5s-2.0s as `FAKE` (score 0.27-0.47)

### 3. 100 Partial Fakes Benchmark Suite (`generate_and_eval_100_fakes.py`)
```
==============================================================================
      100 PARTIAL FAKES BENCHMARK REPORT (0.5s RESOLUTION)
==============================================================================
Total Clips Generated & Tested:      100
Total 0.5s Frames Evaluated:         794
Telephony-Degraded Clips (8kHz/G711): 33 / 100
Clean Studio Clips (16kHz):          67 / 100
------------------------------------------------------------------------------
True Positives  (Fake correctly caught):  234
True Negatives  (Human preserved):       302
False Positives (Human flagged as fake): 236
False Negatives (Fake missed):           22
------------------------------------------------------------------------------
Precision:                           49.79%
Recall:                              91.41%
Segment-Level F1 Score:              64.46% (F1 = 0.6446)
Frame-Level Accuracy:                67.51%
Clip-Level 'PARTIAL_FAKE' Detection: 98.00%
==============================================================================
```
- **Dataset Artifacts Location**: `backend/data/partial_fakes_100/` (`partial_fake_001.wav` through `partial_fake_100.wav`)
- **Ground Truth Manifest**: `backend/data/partial_fakes_100/manifest.json` (1,702 lines, complete frame-by-frame splice metadata)
- **Key Outcome**: 98% clip-level diagnosis accuracy and 91.41% recall of synthetic spliced frames at 500ms resolution.

---

### VALIDATION AND UI RESULT SURFACING — 2026-10-24

| File | Change | Status |
|---|---|---|
| `backend/app/main.py` | Registered the existing voice-training router at `/api/v1/training` so its documented endpoints are reachable. | DONE |
| `frontend/src/app/security/page.tsx` | Added complete per-layer JSON output and a complete analysis-response viewer so nested detector results, weights, metadata, and telephony fields are not discarded by the UI. | DONE |

Validation:
- `npm --prefix frontend run type-check` passed.
- `npm --prefix frontend run build` passed.
- Backend Python tests could not run in this environment because Python/Pytest is unavailable.
- Go gateway tests passed with `go test ./...`.

---

### FRONTEND ENVIRONMENT CONFIGURATION — 2026-10-25

Configured `frontend/.env.local` and `frontend/.env` with Firebase web credentials and API URL from Vercel deployment:
- `NEXT_PUBLIC_API_URL`: `https://vcaas.onrender.com` (toggleable to `http://localhost:8000` for local dev)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: `voice-clone-platform`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: `voice-clone-platform.firebasestorage.app`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: `492840920749`
- `NEXT_PUBLIC_FIREBASE_APP_ID`: `1:492840920749:web:27916572eb4e0d2b74c824`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: `G-0Y5CS2ZMTX`
- `NEXT_PUBLIC_FIREBASE_API_KEY`: `AIzaSyD0IMlZnUAjBwP-KStrtrnaTZKLtGiC7kI`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: `voice-clone-platform.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`: `https://voice-clone-platform-default-rtdb.asia-southeast1.firebasedatabase.app`


