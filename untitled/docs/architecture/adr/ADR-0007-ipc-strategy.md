# ADR-0007: Inter-Process Communication (IPC) Strategy for Polyglot Runners

**Status:** Accepted  
**Date:** 2026-09-21  

---

## Decision
For external language strategies (Python, Rust, C++, Java), BACKTEST implements IPC using Windows Named Pipes (Linux Unix Domain Sockets) and ring-buffer shared memory, transferring serialized Protocol Buffer messages.

## Rationale
- Named Pipes provide low-latency local streaming on Windows desktop environments with built-in OS access control and flow regulation.
- Shared memory ring buffers enable zero-copy market tick streaming for high-frequency strategies.

## Consequences
- Requires IPC gateway abstraction in Phase 3.
- Strategy development kits (SDKs) will be generated from protobuf definitions.
