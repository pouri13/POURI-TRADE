# ADR-0008: Deterministic Snapshot Checkpoint & Branching Architecture

**Status:** Accepted  
**Date:** 2026-09-21  

---

## Decision
Simulation state is capturable at any microsecond as an immutable, serialized snapshot (`.btsnap` format) containing complete engine state: simulation timestamp, PRNG seed, event queue contents with canonical sort keys, open orders, positions, account balances, and strategy internal states.

## Rationale
- Enables users to save simulations, pause long-running multi-day tests, inspect historical positions, and fork alternative "what-if" trading branches.
- Facilitates instant post-mortem debugging by rewinding to the exact tick prior to an anomaly.

## Consequences
- All engine components must implement snapshot serialization interfaces.
- Event queue restoration must preserve the exact canonical 5-tier ordering tuple.
