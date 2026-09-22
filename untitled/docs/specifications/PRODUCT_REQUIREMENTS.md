# BACKTEST Product Requirements Specification

**Document Version:** 1.0.0  
**Phase Target:** Phase 0 Architecture & Foundation  
**Product Vision:** A professional-grade Windows desktop trading simulation, market replay, algorithmic backtesting, and strategy debugging platform completely independent of MetaTrader, TradingView, or Soft4FX.

---

## 1. Core Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-CORE-001** | Zero-dependency domain core architecture | High | Phase 0 | None | Core library compiles with 0 references to UI, graphics, or windowing frameworks. |
| **BT-CORE-002** | Deterministic event queue with canonical tie-breaking | High | Phase 0 | BT-CORE-001 | Given any sequence of events with identical timestamps and ranks, arrival order `A → B` and `B → A` produce identical canonical execution order. |
| **BT-CORE-003** | Fixed-point financial numerical precision model | High | Phase 0 | BT-CORE-001 | Price, quantity, margin, and money values use fixed-point decimal arithmetic with explicit round-half-even rounding. No IEEE 754 float drift. |
| **BT-CORE-004** | Simulation time and multi-clock abstraction | High | Phase 0 | BT-CORE-001 | Strict separation between simulation time, market timestamp, wall-clock time, and strategy latency time. No look-ahead bias permitted. |
| **BT-CORE-005** | Immutable event auditing & telemetry pipeline | Medium | Phase 0 | BT-CORE-002 | All engine lifecycle events are published to an append-only subscriber bus with correlation IDs. |

---

## 2. Backtesting Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-TEST-001** | Tick-level and event-driven backtesting engine | High | Phase 1 | BT-CORE-002 | Processes millions of ticks sequentially with zero look-ahead bias, updating order books and execution matching. |
| **BT-TEST-002** | Multi-symbol and multi-timeframe synchronization | High | Phase 1 | BT-CORE-004 | Concurrently iterates multiple asset feeds in temporal alignment without out-of-order leakage. |
| **BT-TEST-003** | Deterministic execution reproducibility | High | Phase 0 | BT-CORE-002 | Re-running backtest with identical seed, data, and strategy yields byte-for-byte identical output. |
| **BT-TEST-004** | Look-ahead bias prevention verification | High | Phase 1 | BT-CORE-004 | Assertions trigger runtime exceptions if an indicator or strategy queries bar/tick data beyond the current simulation timestamp. |

---

## 3. Market Replay Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-REPLAY-001**| Manual market replay with play/pause/step controls | High | Phase 4 | BT-TEST-001 | User can play, pause, step forward single ticks, and step forward single bars across all open charts. |
| **BT-REPLAY-002**| Variable replay speed (0.1x to 1000x and unconstrained) | Medium | Phase 4 | BT-REPLAY-001 | Accurate pacing relative to wall-clock time with throttle controls. |
| **BT-REPLAY-003**| Historical session jump and timeline scrubbing | Medium | Phase 4 | BT-REPLAY-001 | Fast seeking to arbitrary historical timestamps with rapid state reconstruction. |
| **BT-REPLAY-004**| Soft4FX replay feature parity without MT4/MT5 dependencies | High | Phase 4 | BT-REPLAY-001 | Complete manual trade placement, risk sizing, and visual trailing directly in replay mode. |

---

## 4. Trading / Execution Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-EXEC-001** | Standard & advanced order types (Market, Limit, Stop, Stop-Limit) | High | Phase 2 | BT-CORE-003 | Full state machine supporting Created, Submitted, Accepted, PartiallyFilled, Filled, Cancelled, Rejected. |
| **BT-EXEC-002** | Risk management orders (SL, TP, Trailing Stop, Break-Even, OCO) | High | Phase 2 | BT-EXEC-001 | Automated synthetic execution of protective stops with tick-by-tick monitoring. |
| **BT-EXEC-003** | Realistic market slippage and spread widening simulation | High | Phase 2 | BT-EXEC-001 | Configurable slippage models including volatility-based, volume-based, and random normal distribution. |
| **BT-EXEC-004** | Commission, borrow fees, overnight swap/financing simulation | Medium | Phase 2 | BT-EXEC-001 | Accurate rollover debit/credit calculated according to venue session schedules. |
| **BT-EXEC-005** | Multi-currency portfolio margin and leverage calculation | High | Phase 2 | BT-CORE-003 | Real-time margin requirement calculation, margin calls, and forced liquidation triggers. |

---

## 5. Historical Data Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-DATA-001** | Columnar storage format (Parquet / Binary chunked) | High | Phase 1 | BT-CORE-001 | High-throughput sequential reads exceeding 50M ticks/sec from local storage. |
| **BT-DATA-002** | Multi-vendor CSV, JSON, and flat-file importer | High | Phase 1 | BT-DATA-001 | Streaming parsing with automatic column detection, time zone conversion, and bad tick filtering. |
| **BT-DATA-003** | Historical market data integrity & gap validation | Medium | Phase 1 | BT-DATA-002 | Automated diagnostics identifying missing intervals, inverted bid/asks, and zero-volume anomalies. |
| **BT-DATA-004** | Multi-resolution bar builder (Tick to Sec, Min, Hour, Day) | High | Phase 1 | BT-DATA-001 | Zero-latency on-the-fly bar aggregation from tick streams. |

---

## 6. Strategy Runtime Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-STRAT-001**| Language-agnostic strategy API specification | High | Phase 0 | BT-CORE-001 | Strategy communicates via versioned protocol contracts (v1.0.0) without engine internal leaks. |
| **BT-STRAT-002**| In-process native C# / .NET strategy runner | High | Phase 3 | BT-STRAT-001 | Low-latency compiled strategy execution directly inside the engine process. |
| **BT-STRAT-003**| Out-of-process IPC strategy runner (Python, Rust, C++) | High | Phase 3 | BT-STRAT-001 | Fast IPC (Shared Memory / Named Pipes / Protobuf) supporting polyglot algorithmic strategies. |
| **BT-STRAT-004**| Process sandboxing, timeout enforcement & memory caps | Medium | Phase 3 | BT-STRAT-003 | Unhandled strategy crashes or infinite loops are cleanly contained without crashing the engine. |

---

## 7. Debugging Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-DEBUG-001**| Event, signal, and decision audit logs | High | Phase 3 | BT-CORE-005 | Every strategy decision records input indicators, market prices, and generated order parameters. |
| **BT-DEBUG-002**| Step-through execution with conditional breakpoints | Medium | Phase 4 | BT-REPLAY-001 | Ability to pause simulation on custom user criteria (e.g., drawdown > 2%, specific order filled). |
| **BT-DEBUG-003**| Strategy state variable inspector | Medium | Phase 4 | BT-STRAT-001 | Real-time observation of internal strategy fields and indicators during tick replay. |

---

## 8. Reporting & Analytics Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-REP-001**  | Comprehensive performance metrics | High | Phase 3 | BT-EXEC-001 | Automated computation of Sharpe, Sortino, Calmar, Max Drawdown, Expectancy, and Profit Factor. |
| **BT-REP-002**  | High-resolution equity and drawdown curves | High | Phase 3 | BT-REP-001 | Time-series charting data exported at tick or bar resolution. |
| **BT-REP-003**  | Multi-format export engine (HTML, PDF, JSON, CSV) | Medium | Phase 3 | BT-REP-001 | Generation of self-contained interactive tear-sheets and machine-readable data sets. |

---

## 9. Optimization & Parameter Sweeps

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-OPT-001**  | Grid and random parameter search | High | Phase 5 | BT-TEST-003 | Parallelized evaluation across multiple CPU cores with deterministic result consolidation. |
| **BT-OPT-002**  | Genetic & Bayesian optimization algorithms | Medium | Phase 5 | BT-OPT-001 | Heuristic search for optimal parameter spaces with objective function customization. |
| **BT-OPT-003**  | Walk-forward testing & out-of-sample analysis | High | Phase 5 | BT-OPT-001 | Automated rolling-window optimization and validation to evaluate overfitting. |
| **BT-OPT-004**  | Monte Carlo trade permutation and stress testing | Medium | Phase 5 | BT-REP-001 | Confidence interval generation via trade reshuffling and slippage perturbation. |

---

## 10. UI & Visualization Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-UI-001**   | TradingView-inspired high-framerate charting canvas | High | Phase 5 | BT-CORE-001 | Smooth 60 FPS panning, zooming, and crosshair tracking on dense multi-year candle sets. |
| **BT-UI-002**   | Modular dockable workstation layout | High | Phase 5 | BT-UI-001 | Custom docking panels for Watchlists, Order Ticket, Positions, Strategy Logs, and Indicators. |
| **BT-UI-003**   | Interactive order execution & drag-and-drop SL/TP | High | Phase 5 | BT-EXEC-002 | Visual order lines on chart with drag modification of stop-loss and take-profit targets. |

---

## 11. Snapshot & Branching Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-SNAP-001** | Complete simulation state snapshot capture | High | Phase 0 | BT-CORE-002 | Snapshot serializes clock, event queue, accounts, positions, orders, strategy state, and seeds. |
| **BT-SNAP-002** | Snapshot restore and deterministic continuation | High | Phase 0 | BT-SNAP-001 | Restored simulation produces identical results as an uninterrupted run from the snapshot timestamp. |
| **BT-SNAP-003** | Simulation branching & "What-If" scenario forks | Medium | Phase 4 | BT-SNAP-002 | User can fork a simulation at any point, modify parameters or orders, and run parallel alternatives. |

---

## 12. Security & Sandboxing Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-SEC-001**  | Strategy file system & network access restriction | High | Phase 3 | BT-STRAT-004 | Sandboxed strategies cannot access unauthorized paths or perform external network calls. |
| **BT-SEC-002**  | Engine integrity protection against malicious DLLs | High | Phase 3 | BT-STRAT-004 | Dynamic loading verification and separate process address spaces. |

---

## 13. Performance Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-PERF-001** | Sequential tick throughput > 1,000,000 events/sec | High | Phase 1 | BT-CORE-002 | Benchmarked on modern x64 hardware with in-memory tick cache. |
| **BT-PERF-002** | Low memory footprint (< 1GB for 10M ticks in window) | Medium | Phase 1 | BT-DATA-001 | Compact memory structures avoiding individual heap allocations per tick. |
| **BT-PERF-003** | Multi-threaded backtest parallel scaling | High | Phase 5 | BT-TEST-003 | Linear scaling with CPU physical core count during batch parameter sweeps. |

---

## 14. Reliability Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-REL-001**  | Crash resilience and corrupt state recovery | High | Phase 0 | BT-SNAP-001 | Corrupted snapshot or malformed data file generates graceful error with zero data loss. |
| **BT-REL-002**  | 100% reproducible execution guarantees | High | Phase 0 | BT-CORE-002 | Zero reliance on unseeded PRNGs, wall-clock time, or indeterminate thread scheduling. |

---

## 15. Future / Optional Requirements

| ID | Description | Priority | Phase | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BT-FUT-001**  | Real-time live broker execution gateway | Low | Phase 6 | BT-EXEC-001 | Connect strategies to live execution APIs via FIX or proprietary REST/WebSocket brokers. |
| **BT-FUT-002**  | Cloud-distributed parameter optimization | Low | Phase 6 | BT-OPT-001 | Distribute Monte Carlo or genetic runs across remote compute clusters. |
| **BT-FUT-003**  | Custom indicator domain-specific language (DSL) | Low | Phase 6 | BT-STRAT-001 | High-level declarative scripting for rapid technical indicator composition. |
