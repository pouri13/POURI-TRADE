# BACKTEST Quality Gates

This document defines the strict, non-negotiable Quality Gates for Phase 0 and all subsequent development phases of the **BACKTEST** platform.

A phase or milestone **cannot** be considered complete if any gate condition is unsatisfied.

---

## 1. Zero-Tolerance Core Principles

1. **Independent Core**: The engine (`Core`) must have zero dependencies on graphical presentation layers (`UI`, Windows desktop GUI, Avalonia, Web, etc.).
2. **Deterministic Event Ordering**:
   - Event processing MUST follow the canonical 5-tier ordering tuple: `(SimulationTimestamp, EventRank, CanonicalSourceOrder, DeterministicEventKey, StableTieBreaker)`.
   - Insertion or arrival order MUST NOT alter simulation execution order or numerical state.
   - Any two events with identical timestamps and identical ranks MUST resolve identically regardless of arrival sequence.
3. **No Look-Ahead Bias**:
   - The engine, indicators, and strategies must never access future market data, unreached ticks/bars, or uncommitted execution state.
4. **Explicit Financial Precision**:
   - All monetary calculations (Price, Quantity, Cash, Margin, P&L, Fees) must use fixed-precision integer math (`Decimal` / 64-bit/128-bit scaled integers) with explicit rounding modes (`HalfEven` / `Down` for accounting conservatism).
   - Floating-point (`double`, `float`) is strictly prohibited in financial balance sheets and order bookkeeping.
5. **Language-Agnostic Strategy API**:
   - The strategy interface must remain independent of any single programming language runtime.
   - IPC and state exchange use versioned, serializable schemas.
6. **No Unfinished Stubs or Mock Placeholders**:
   - Features not scheduled for the current phase must remain documented in specifications rather than implemented as deceptive stub functions pretending to work.
7. **No Dependencies on Legacy/Proprietary Terminals**:
   - Zero dependence on MetaTrader 4/5, Soft4FX, or TradingView proprietary runtimes.

---

## 2. Phase 0 Quality Gates Checklist

| ID | Gate Description | Target Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **QG-001** | **Deterministic Event Ordering** | Events with identical timestamp + identical rank execute in identical canonical order regardless of arrival order `A → B` vs `B → A`. | Automated Unit & Regression Tests (`EventQueueDeterminismTests`) | **PASSED** |
| **QG-002** | **Core / UI Independence** | Domain core library has 0 UI framework dependencies. | Static Dependency Analysis & CI Architecture Lint | **PASSED** |
| **QG-003** | **Financial Precision Contract** | Fixed-point / scaled integer decimal arithmetic with explicit rounding rules; no floating-point currency drift. | Financial Primitive Unit Tests (`PrecisionTests`) | **PASSED** |
| **QG-004** | **Snapshot Roundtrip Contract** | Simulation state can be serialized, deserialized, and continued deterministically from snapshot. | Snapshot Serialization & State Restore Tests | **PASSED** |
| **QG-005** | **Strategy API Versioning & IPC** | Strategy interface is decoupled via versioned schema (v1.0.0) with clean lifecycle state transitions. | Strategy Protocol Contract Tests | **PASSED** |
| **QG-006** | **Documentation Integrity** | Specifications, ADRs, matrices, and cross-references pass automated validation. | Automated `verify_docs.py` Script in CI | **PASSED** |
| **QG-007** | **Continuous Integration Enforcement** | CI pipeline builds on Windows and Linux runners, executes tests, and enforces documentation validation. | GitHub Actions Workflow (`ci.yml`) | **PASSED** |
| **QG-008** | **Strict Scope Boundary** | Phase 1 execution/charting/downloading features are NOT prematurely implemented or stubbed out. | Codebase Audit & Phase 0 Report | **PASSED** |

---

## 3. Future Phase Quality Gates

### Phase 1: High-Performance Data Engine & Market Storage
- Zero memory leaks during multi-gigabyte tick replay streaming.
- Microsecond timestamp precision with sub-millisecond multi-asset synchronization.
- Parquet & indexed columnar chunk validation with checksum verification.

### Phase 2: Execution Engine, Order Lifecycle & Broker Simulation
- Full order type validation (Market, Limit, Stop, Stop-Limit, OCO, Trailing Stop).
- Realistic slippage, spread widening, latency buffers, and margin call liquidation models.
- Explicit fill reconciliation testing against historical tick level tapes.

### Phase 3: Language-Agnostic Strategy Sandbox & IPC
- Process-isolated execution with memory and CPU quota enforcement.
- Cross-language protocol buffers / shared-memory transport benchmarks (< 5 microseconds round-trip).
- Strategy crash containment without engine termination.

### Phase 4: Replay Controls, Snapshot Branching & Debugging
- Step tick, step bar, variable speed (0.1x to 1000x), and backwards step capabilities.
- Branch simulation from any snapshot checkpoint with identical historical lineage.

### Phase 5: High-Performance Desktop UI & Charting
- 60+ FPS continuous tick-chart rendering under heavy event throughput.
- Full decoupling between UI dispatcher and Core engine thread.
