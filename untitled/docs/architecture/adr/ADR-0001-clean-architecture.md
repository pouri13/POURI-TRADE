# ADR-0001: Hexagonal Clean Architecture & Core Decoupling

**Status:** Accepted  
**Date:** 2026-09-21  

---

## Decision
The BACKTEST platform adopts Hexagonal / Clean Architecture. The Domain Core Engine is strictly insulated from external concerns (I/O, database formats, graphical UI frameworks, OS platform specifics).

## Rationale
- High-performance trading backtesting requires headless execution (cloud parameter sweeps, CI testing, batch verification).
- Presentation requirements (WPF, Avalonia, WebAssembly) will evolve, but core matching logic, financial accounting, and order execution state machines must remain immutable and reliable.

## Consequences
- No GUI libraries, window handles, or presentation classes may ever be referenced in the Core domain.
- All external dependencies are injected via interfaces (ports and adapters).
