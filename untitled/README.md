# BACKTEST — Professional Trading Simulation & Replay Engine

[![Phase 0: Validated](https://img.shields.io/badge/Phase-0%20Foundation-blue.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Deterministic Ordering](https://img.shields.io/badge/Event%20Ordering-Canonical%205--Tier-brightgreen.svg)](#)

**BACKTEST** is a professional-grade Windows desktop trading simulation, market replay, algorithmic backtesting, and strategy debugging platform.

The system is designed from zero to be completely independent of MetaTrader 4/5, TradingView, and Soft4FX.

---

## 1. Project Vision & Architecture

The architecture enforces strict decoupling between the **Domain Engine Core** and the **Desktop UI**:

```
[ Presentation Layer (Avalonia UI / High-FPS Skia Charting) ]
                        |
                        v (Commands & ViewModels)
[ Application Layer (Session Orchestrator / Project Manager) ]
                        |
                        v (Domain Contracts & Events)
[ Domain Core Engine (Deterministic EventQueue, Primitives, Risk, Order) ]
                        |
                        v (Interfaces)
[ Infrastructure (Parquet Columnar Storage, Polyglot IPC, Named Pipes) ]
```

### Core Tenets
- **Deterministic 5-Tier Event Ordering**: Execution order is governed strictly by `(SimulationTimestamp, EventRank, CanonicalSourceOrder, DeterministicEventKey, StableTieBreaker)`. Insertion or arrival sequence has zero impact on execution results.
- **Microsecond Financial Precision**: Custom fixed-point primitives eliminate IEEE 754 floating-point drift with explicit Round Half-Even semantics.
- **Zero Look-Ahead Bias**: Monotonic simulation clock prevents any query beyond the current virtual timestamp.
- **Polyglot Strategy API**: Language-agnostic protocol supporting in-process C# and out-of-process Python, Rust, and C++ strategies via ultra-low-latency IPC.
- **Deterministic Snapshot & Branching**: Freeze simulation state at any microsecond, persist to `.btsnap`, and branch alternative execution paths.

---

## 2. Current Development Status

- **Current Phase:** **Phase 0 — Architecture Foundation & Hardening**
- **Phase 0 Scope:**
  - Complete Product Requirements & Traceability Matrix (`docs/specifications/`)
  - 8 Architectural Decision Records (`docs/architecture/adr/`)
  - Hardened Deterministic Event Ordering Specification (`ADR-0005`)
  - Domain Model Contracts & Mathematical Precision Primitives (`core/src/`)
  - Regression & Invariant Unit Tests proving insertion-order independence (`core/tests/`)
  - Automated Documentation & Quality Gate Validator (`scripts/verify_docs.py`)
  - Active GitHub Actions CI Workflow (`.github/workflows/ci.yml`)

---

## 3. Building & Testing

### Prerequisites
- Node.js (v20+) or Bun runtime
- Python 3.10+ (for documentation integrity validation)

### Run Quality Gates & Tests
```bash
# 1. Validate Documentation and Architecture Integrity
python scripts/verify_docs.py

# 2. Run Determinism & Architecture Invariant Tests
npm test

# 3. Verify TypeScript Compilation & Type Safety
npm run lint
```

---

## 4. Phase Roadmap

- **Phase 0:** Architecture, Specifications, ADRs, Quality Gates & Deterministic Foundation. *(Completed & Hardened)*
- **Phase 1:** High-Throughput Columnar Parquet Market Data Engine & Tick Stream Aggregator.
- **Phase 2:** Advanced Execution Engine, Order Matching State Machine & Realistic Broker Simulation.
- **Phase 3:** Polyglot Strategy Host, Process Sandboxing & Low-Latency IPC.
- **Phase 4:** Tick Replay Controls, Snapshot Resumption & Visual Strategy Debugger.
- **Phase 5:** High-FPS Desktop UI (Avalonia), Dockable Terminal Workstation & TV-Inspired Charting.
- **Phase 6:** Distributed Optimization, Genetic Algorithms & Live Gateway Bridges.
