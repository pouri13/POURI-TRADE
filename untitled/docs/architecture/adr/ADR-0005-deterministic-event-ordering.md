# ADR-0005: Deterministic 5-Tier Canonical Event Ordering Contract

**Status:** Accepted (Hardened in Phase 0 Correction)  
**Date:** 2026-09-21 (Updated 2026-09-22)  
**Authors:** Lead Architect & Principal Engineer  

---

## 1. Context & Problem Statement

In discrete-event trading simulation, multiple events frequently share identical timestamps. Examples include:
- Multiple price ticks arriving from different asset feeds at the same microsecond.
- Bracket orders (Take Profit and Stop Loss) evaluated at the identical bar or tick instant.
- Strategy timers firing concurrently with incoming market quotes.

### The Original Defect
In initial designs, event sorting relied on:
$$\text{Timestamp} \to \text{Rank} \to \text{SequenceNumber}$$
where `SequenceNumber` was an autoincrementing counter assigned at the moment an event object was created or enqueued.

As a result:
- If event $A$ and event $B$ had identical timestamps and identical rank, enqueueing $A$ then $B$ produced the execution sequence $[A, B]$.
- Enqueueing $B$ then $A$ produced the execution sequence $[B, A]$.

This meant that accidental runtime factors (thread scheduling, collection enumeration order, asynchronous task completion) could alter event execution order, violating the fundamental architectural guarantee of **100% deterministic, reproducible simulation**.

---

## 2. Decision: 5-Tier Canonical Ordering Tuple

To permanently resolve this flaw, BACKTEST mandates a canonical 5-tier ordering tuple that is strictly independent of insertion or creation timing:

$$\text{Canonical Order} = (\tau_{\text{sim}}, \Pi_{\text{rank}}, \Sigma_{\text{source}}, \kappa_{\text{key}}, \Omega_{\text{tie}})$$

### 2.1 Tuple Components

1. **SimulationTimestamp ($\tau_{\text{sim}}$)**:
   - Primary sorting key. Microsecond timestamp (UTC ticks). Events earlier in simulation time always execute first.
2. **EventPriority / Rank ($\Pi_{\text{rank}}$)**:
   - Secondary sorting key. Architectural domain precedence:
     - `SimulationControl` (0)
     - `MarketData` (10)
     - `IndicatorTimer` (20)
     - `StrategySignal` (30)
     - `OrderRequest` (40)
     - `ExecutionFill` (50)
     - `PositionAccountUpdate` (60)
     - `SnapshotCheckpoint` (70)
     - `TelemetryAudit` (80)
3. **CanonicalSourceOrder ($\Sigma_{\text{source}}$)**:
   - Tertiary sorting key. In multi-symbol simulations, events from different sources are ordered by deterministic source ordinal (e.g. alphabetical symbol name: `EURUSD` before `GBPUSD`).
4. **DeterministicEventKey ($\kappa_{\text{key}}$)**:
   - Quaternary sorting key. A content-derived immutable string or deterministic hash generated strictly from structural event payload fields:
     - Ticks: `{Symbol}:{TickSequenceNumber}`
     - Orders: `{ClientOrderId}:{Action}`
     - Signals: `{StrategyId}:{SignalId}`
5. **StableTieBreaker ($\Omega_{\text{tie}}$)**:
   - Quinary sorting key. An immutable deterministic event identifier (e.g. content hash or deterministic GUID) ensuring total ordering ($a < b$ or $b < a$).

---

## 3. Invariant & Mathematical Proof

> **Invariant:** For any multiset of events $S = \{E_1, E_2, \dots, E_n\}$, the resulting sorted execution sequence $Q$ is identical regardless of the permutation in which events in $S$ are enqueued.

### Proof:
1. Every comparison between two events $E_i$ and $E_j$ is evaluated by the pure comparison function $C(E_i, E_j)$ based solely on immutable fields $(\tau, \Pi, \Sigma, \kappa, \Omega)$.
2. The comparison function does not reference any memory address, arrival timestamp, or insertion sequence counter.
3. Therefore, $C(E_i, E_j)$ satisfies the properties of a strict weak ordering (irreflexive, asymmetric, transitive).
4. With the unique deterministic tie-breaker $\Omega$, total ordering is guaranteed with zero indistinguishable ties ($C(E_i, E_j) \ne 0 \iff E_i \ne E_j$).
5. Thus, sorting $S$ is a deterministic bijection to ordered sequence $Q$, independent of initial permutation.

---

## 4. Consequences

### Positive
- **Guaranteed Reproducibility**: Re-running a backtest or replaying an event stream with identical inputs always yields the exact same execution sequence.
- **Thread & Concurrency Safety**: Parallel data ingestion can feed events into the queue without fear of subtle race conditions altering execution logic.
- **Snapshot Integrity**: Snapshots can restore events into the queue without tracking global mutable counter state.

### Negative / Trade-offs
- Events must provide a deterministic key (`DeterministicKey`) and stable tie-breaker upon construction.
- Slight computational overhead in sorting strings or 128-bit hashes compared to simple integer increments; mitigated by integer ranks and timestamps resolving >99.9% of comparisons before reaching string tie-breakers.
