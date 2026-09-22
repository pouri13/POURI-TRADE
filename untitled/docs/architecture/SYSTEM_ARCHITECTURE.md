# BACKTEST System Architecture

**Document Version:** 1.0.0  
**Phase Target:** Phase 0 Architecture Foundation

---

## 1. Core Architectural Principle: UI Decoupling

The cardinal rule of the BACKTEST architecture is:

> **THE CORE MUST NOT DEPEND ON THE UI.**

```
+-------------------------------------------------------------+
|                     Presentation Layer                      |
| (Windows Desktop GUI / Avalonia / Charting / Docking Panels)|
+-------------------------------------------------------------+
                              |
                              v  (Commands & ViewModels)
+-------------------------------------------------------------+
|                     Application Layer                       |
|  (Orchestration, Project Management, Replay Controller)     |
+-------------------------------------------------------------+
                              |
                              v  (Domain Contracts & Interfaces)
+-------------------------------------------------------------+
|                     Domain / Core Engine                    |
| (EventQueue, TimeModel, Primitives, Order, Account, Risk)   |
+-------------------------------------------------------------+
                              |
                              v  (Storage & System Interfaces)
+-------------------------------------------------------------+
|                    Infrastructure Layer                     |
|  (Parquet Storage, IPC Sockets, OS Clocks, File System)     |
+-------------------------------------------------------------+
```

1. **Presentation Layer (UI)**: Responsible purely for rendering charts, drawing tools, order tickets, log tables, and dispatching user intent. It listens to state projections and immutable view models. It contains **zero** simulation or financial calculation logic.
2. **Application Layer**: Coordinates long-running sessions, multi-run batch jobs, project file loading, and bridges engine events to presentation dispatchers.
3. **Domain / Core Engine**: The authoritative, self-contained heart of the system. Implements the discrete-event simulation loop, financial precision mathematics, order lifecycle state machines, position bookkeeping, and deterministic event ordering. Can be executed headlessly as a console application, unit test suite, or Linux server process.
4. **Infrastructure Layer**: Concrete implementations of I/O, columnar storage read/write, named pipes, process sandboxing, and platform-specific performance optimizations.

---

## 2. Deterministic Event-Driven Architecture

### 2.1 The Deterministic Ordering Problem
In discrete-event market simulation, multiple events frequently occur at the identical simulation timestamp (e.g. multi-symbol tick updates, synthetic limit triggers, indicator evaluation timers, order cancel requests).

If event processing priority relies on memory insertion order or collection iteration order, different execution runs or concurrent feeds could interleave events differently, destroying reproducibility.

### 2.2 Canonical 5-Tier Ordering Contract
BACKTEST enforces an absolute, deterministic ordering tuple for every event:

$$\text{Canonical Order} = (\tau_{\text{sim}}, \Pi_{\text{rank}}, \Sigma_{\text{source}}, \kappa_{\text{key}}, \Omega_{\text{tie}})$$

1. **$\tau_{\text{sim}}$ (Simulation Timestamp)**: Microsecond-precision UTC timestamp representing when the event occurred in simulated market time.
2. **$\Pi_{\text{rank}}$ (Event Priority / Rank)**: Architectural execution priority enum ensuring proper operational sequencing within the same time instant:
   - Rank 0: `SimulationControl` (Start, Pause, Resume, Abort)
   - Rank 10: `MarketData` (MarketTick, MarketBar, DepthUpdate)
   - Rank 20: `IndicatorTimer` (Time-based aggregation/evaluation)
   - Rank 30: `StrategySignal` (Strategy analysis output)
   - Rank 40: `OrderRequest` (New order, cancel, modify requests)
   - Rank 50: `ExecutionFill` (Broker matching and fill allocation)
   - Rank 60: `PositionAccountUpdate` (P&L mark-to-market and margin calculations)
   - Rank 70: `SnapshotCheckpoint` (Simulation state checkpoint capture)
   - Rank 80: `TelemetryAudit` (Post-execution logging and statistics)
3. **$\Sigma_{\text{source}}$ (Canonical Source Order)**: Predefined deterministic ordinal assigned to event sources (e.g., Symbol alphabetical order: `EURUSD` before `GBPUSD`, Primary venue before Secondary venue).
4. **$\kappa_{\text{key}}$ (Deterministic Event Key)**: An immutable, content-derived string/hash composed of structural event data (e.g. `Tick:{Symbol}:{SeqIndex}` or `Order:{ClientOrderId}`).
5. **$\Omega_{\text{tie}}$ (Stable Tie-Breaker)**: Deterministic unique ordinal or UUID string comparison ensuring strict total ordering ($a < b$ or $b < a$) with zero nondeterministic ties.

### 2.3 Mathematical Proof of Insertion-Order Independence
Let $E_1$ and $E_2$ be two events with identical simulation timestamp ($\tau_1 = \tau_2$) and identical rank ($\Pi_1 = \Pi_2$).
If $\kappa_1 \ne \kappa_2$:
- The comparator evaluates: $\tau_1 == \tau_2 \to \Pi_1 == \Pi_2 \to \Sigma_1 == \Sigma_2 \to \text{Compare}(\kappa_1, \kappa_2)$.
- Since string comparison $\text{Compare}(\kappa_1, \kappa_2)$ is a total order depending strictly on the deterministic keys, event $E_1$ and $E_2$ sort into the exact same relative order whether inserted as $[E_1, E_2]$ or $[E_2, E_1]$.
- Therefore, the event execution sequence is **strictly invariant** to insertion order.

---

## 3. High-Precision Financial Model

Floating-point data types (`float`, `double`) are strictly prohibited for financial calculations due to binary representation errors (e.g., $0.1 + 0.2 \ne 0.3$).

BACKTEST implements a fixed-point numerical representation:

### 3.1 Primitives
- **Price**: 64-bit integer representing units of $10^{-6}$ (micro-units, 6 decimal places). Supports assets with small fractionations (crypto, forex pip fractions) and large index prices up to $\$9,223,372,036,854.775807$.
- **Quantity**: 64-bit integer representing units of $10^{-4}$ (fractional lots down to 0.0001).
- **Money / Currency**: 128-bit integer representing monetary balances in units of $10^{-4}$ (cents / hundredths of a pip), preventing overflow across high-frequency compounding portfolios.

### 3.2 Rounding Rules
- Accounting conversions default to **Round Half-Even** (Banker's rounding) to minimize statistical bias over millions of transactions.
- Execution slippage and margin checks apply **Conservative Directional Rounding** (e.g., Round Up for margin liabilities, Round Down for equity credits).

---

## 4. Multi-Clock Simulation Time Model

The engine manages four distinct time domains:

```
[ Market Time (UTC) ] ---> Historical data recorded timestamps
           |
           v
[ Simulation Clock ]   ---> Discrete monotonic virtual time advancing on events
           |
           v
[ Latency Buffer ]     ---> Simulated network / processing delays (T_sim + Delta_latency)
           |
           v
[ Wall-Clock Time ]    ---> Physical system time (only used for UI replay pacing throttle)
```

1. **Anti-Lookahead Boundary**: The Simulation Clock $\tau_{\text{sim}}$ represents the absolute current horizon. Any query to market history for $\tau > \tau_{\text{sim}}$ throws a fatal `LookaheadViolationException`.
2. **UTC Normalization**: All market data, bar aggregation, and session rollovers are normalized to UTC. Local daylight saving time (DST) shifts are converted using venue-specific trading calendar definitions.

---

## 5. Language-Agnostic Strategy Protocol (v1.0.0)

Strategies interact with the engine exclusively via message-based contracts:

```
+-----------------------------------+
|          Strategy Host            |
| (In-process C# or External Subp.) |
+-----------------------------------+
       |                      ^
Order  |                      | MarketTick / Bar / Fill
Command|                      | Events
       v                      |
+-----------------------------------+
|      Core Strategy Gateway        |
|    (Validates and Schedules)      |
+-----------------------------------+
       |
       v
[ Engine Event Queue ]
```

- **Stateless Communication**: Strategies never maintain direct references to Core internal order books or account pointers.
- **Protocol Schema**: Messages are serialized using compact, versioned schemas (Protobuf / JSON).
- **Lifecycle States**: `Created` $\to$ `Initialized` $\to$ `Started` $\to$ `Running` $\to$ `Stopping` $\to$ `Terminated`.

---

## 6. Snapshot & Resumption Architecture

Every simulation can capture a self-contained, immutable snapshot:

- **Simulation Checkpoint State**:
  - Exact simulation timestamp $\tau_{\text{sim}}$
  - PRNG seed and internal step counter
  - Open orders, order history, active positions, cash balance, and margin utilization
  - Unprocessed event queue contents with canonical sort keys
  - Strategy private parameter state
  - Market data stream pointers
- **Operations**:
  - `SaveSnapshot(filepath)`: Serializes entire execution graph.
  - `RestoreSnapshot(filepath)`: Re-instantiates identical engine state.
  - `BranchSimulation(snapshot, newParams)`: Forks a simulation from historical checkpoint to evaluate alternative trading decisions.
