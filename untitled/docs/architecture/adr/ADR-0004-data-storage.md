# ADR-0004: Columnar Parquet & Memory-Mapped Storage for Market Data

**Status:** Accepted  
**Date:** 2026-09-21  

---

## Decision
Historical tick and bar data will be stored using compressed columnar Parquet files alongside custom memory-mapped index caches.

## Rationale
- Columnar storage achieves 5x–10x compression ratios over raw CSV or uncompressed binary files.
- Sequential scanning speed over specific fields (timestamps, bid, ask, volume) dramatically exceeds relational databases like SQLite or row-oriented files.

## Consequences
- Requires Parquet encoding/decoding pipeline in Phase 1.
- Immediate CSV import is transformed to standardized Parquet datasets.
