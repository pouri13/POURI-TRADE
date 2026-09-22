# BACKTEST Testing Strategy & Quality Assurance

This document defines the comprehensive testing methodology, verification layers, and determinism proofs for the **BACKTEST** platform.

---

## 1. Testing Pyramid & Architectural Verification

```
                 / \
                /   \     End-to-End Simulation & UI Golden Tests (Phase 5)
               /-----\
              /       \    Contract & Polyglot IPC Tests (Phase 3)
             /---------\
            /           \   Determinism & Invariant Tests (Phase 0+)
           /-------------\
          /               \  Financial Precision & Domain Math Tests (Phase 0+)
         /-----------------\
        /                   \ Unit & Architectural Boundary Tests (Phase 0+)
       /---------------------\
```

---

## 2. Determinism Testing: The Core Invariant

The fundamental testing mandate of BACKTEST is that **given the identical logical event set and initial state, the simulation must produce identical results regardless of event arrival/insertion order**.

### 2.1 The Two-Event Order Invariance Test
Given two events $E_A$ and $E_B$ such that:
- $\tau_A == \tau_B$ (Identical simulation timestamp)
- $\Pi_A == \Pi_B$ (Identical architectural priority rank)
- $\kappa_A < \kappa_B$ (Different deterministic keys, e.g. `Tick:EURUSD:1` vs `Tick:GBPUSD:1`)

The test asserts:
1. Enqueue sequence $[E_A, E_B]$ produces dequeued sequence $[E_A, E_B]$.
2. Enqueue sequence $[E_B, E_A]$ produces dequeued sequence $[E_A, E_B]$.
3. Resulting simulation state and balance sheet outputs are byte-identical.

### 2.2 Randomized Permutation Stress Testing
A property-based test generates $N$ events ($N \in [10, 1000]$) with randomized collisions in timestamps and ranks.
The test shuffles the insertion order across 50 iterations:
$$\forall \text{ permutation } P \in \text{Permutations}(S): \text{ExecutionOrder}(P) \equiv \text{CanonicalOrder}(S)$$

---

## 3. Financial Precision Testing

To protect against floating-point corruption:
1. **Pip & Sub-Pip Integrity**: Multi-currency conversion tests must verify down to $10^{-6}$ currency units without IEEE 754 drift.
2. **Round Half-Even Tests**: Rounding edge cases (e.g. $2.5 \to 2$, $3.5 \to 4$) verified against standard financial accounting definitions.
3. **Compound Fee & Margin Calculation**: Hundred-thousand transaction chains asserting total portfolio cash balance matches closed P&L minus exact commissions.

---

## 4. Architectural Boundary Enforcement

Automated architectural unit tests verify:
1. **Core Independence**: Uses static reflection/assembly inspection to verify `Core` references **zero** UI libraries (`Avalonia`, `WPF`, `System.Drawing`, `Windows.Forms`).
2. **Strategy Decoupling**: Verifies strategies only communicate through `IStrategy` protocol interfaces, with zero internal engine state mutation.
3. **No MetaTrader / Soft4FX / Proprietary References**: Static code scanners fail if foreign proprietary signatures are detected.

---

## 5. Documentation & CI Verification

The CI pipeline runs automated verification scripts (`scripts/verify_docs.py`) to ensure:
- All referenced documents exist with valid internal links.
- All ADRs are formatted and indexed.
- Feature matrices, requirements, and test suites are aligned.
- CI pipeline triggers on all pull requests and branch pushes on both Windows and Linux runners.
