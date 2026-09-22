# ADR-0002: Complete Separation of Engine Core and Presentation UI

**Status:** Accepted  
**Date:** 2026-09-21  

---

## Decision
The Core engine runs on dedicated background simulation threads or headless command-line processes. The Presentation UI communicates with Core exclusively via asynchronous state projections, commands, and immutable view model events.

## Rationale
- Rendering complex charts at 60 FPS must never block or be blocked by tick-by-tick simulation loops processing 1,000,000 events/second.
- Eliminates thread synchronization deadlocks and guarantees headless testing capability.

## Consequences
- UI changes cannot directly mutate engine data structures.
- Actions are dispatched as commands (`OrderRequestCommand`, `PlayReplayCommand`).
