# ADR-0006: Fixed-Point Integer Primitives for Financial Precision

**Status:** Accepted  
**Date:** 2026-09-21  

---

## Decision
All financial calculations (prices, quantities, cash balances, P&L, commissions, and margin liabilities) use fixed-point arithmetic (`Decimal` / 64-bit micro-unit integer representation with 6 decimal places for price and 4 decimal places for volume/currency). Floating-point `double` or `float` are forbidden.

## Rationale
- Standard IEEE 754 floating-point operations introduce subtle truncation and representation errors ($0.1 + 0.2 \ne 0.3$), compounding across millions of simulated ticks.
- Financial regulatory standards and realistic broker matching require exact cent and sub-pip accounting.

## Consequences
- Requires custom primitive types `Price`, `Quantity`, `Money` with explicit division rounding rules (Round Half-Even).
