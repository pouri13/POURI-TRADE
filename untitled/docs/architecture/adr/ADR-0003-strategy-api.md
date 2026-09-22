# ADR-0003: Language-Agnostic Strategy Protocol and Host Sandboxing

**Status:** Accepted  
**Date:** 2026-09-21  

---

## Decision
The Strategy API is explicitly language-agnostic, defined via structured message contracts (Protobuf / JSON schema v1.0.0). Strategies may run in-process (.NET native) or out-of-process in isolated child sandboxes (Python, Rust, C++, Java) connected via ultra-low-latency IPC (shared memory / local sockets).

## Rationale
- Quants and algorithmic traders build strategies in diverse languages (Python for ML, C++ or Rust for ultra-low latency, C# for .NET desktop workflows).
- An unhandled exception or memory leak in a strategy script must never crash the main simulation engine.

## Consequences
- Engine communicates via message gateways rather than direct pointer calls.
- High-performance IPC must be optimized in Phase 3.
