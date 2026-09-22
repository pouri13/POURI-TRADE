# Contributing to BACKTEST

Thank you for your interest in contributing to **BACKTEST**.

## Architectural Non-Negotiables

All contributions must strictly adhere to the following principles:

1. **Independent Core**: The engine (`core/`) must never reference UI or presentation frameworks.
2. **Deterministic Event Ordering**: Event handling must follow the canonical 5-tier ordering tuple $(\tau, \Pi, \Sigma, \kappa, \Omega)$. Insertion order must never dictate execution order.
3. **Explicit Financial Precision**: Floating-point types (`float`, `double`, standard JS floats) are prohibited for currency balances and order accounting. Use fixed-point scaled integers or Decimal primitives with Round Half-Even.
4. **No Look-Ahead Bias**: The simulation clock is the strict upper bound of available market data.
5. **No Fake/Stub Implementations**: Do not submit mock implementations pretending to finish future phase requirements.

## Pull Request Process

1. Run the local documentation check:
   ```bash
   python scripts/verify_docs.py
   ```
2. Run test suites and verify deterministic invariants:
   ```bash
   npm test
   ```
3. Ensure no linting errors:
   ```bash
   npm run lint
   ```
4. Update relevant documentation and ADRs when introducing architectural modifications.
