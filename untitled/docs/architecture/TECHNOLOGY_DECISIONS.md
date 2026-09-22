# Technology Decisions: Evaluation & Trade-offs

This document details the architectural evaluation and technology selection criteria for the **BACKTEST** professional trading simulation platform.

---

## 1. Engine Core & Domain Layer

| Attribute | Decision: C# / .NET 9 LTS | Candidate: Rust | Candidate: C++20 |
| :--- | :--- | :--- | :--- |
| **Performance** | High (JIT with Tiered PGO, SIMD vectors, Spans, zero-allocation memory pools). | Extreme (Bare-metal control, zero overhead). | Extreme (Bare-metal, manual memory management). |
| **Safety & Memory** | High (Garbage collected, managed memory, safe span pointers). | Extreme (Borrow checker guarantees zero data races). | Moderate (Prone to use-after-free, memory leaks). |
| **Windows Ecosystem** | First-class native integration, rich tooling, Visual Studio diagnostics. | Good, requires toolchain setup. | First-class, legacy complexity. |
| **Ecosystem & Libraries** | Rich financial, Parquet, and UI integration ecosystem. | Growing quantitative ecosystem. | Legacy quantitative dominance. |
| **Productivity** | Very High (Clean generics, reflection, rapid iteration). | Moderate (Steep learning curve, strict borrow checker).| Moderate (Complex build systems, slow compilation). |

### Final Decision: C# / .NET 9 LTS for Engine Core
- **Pros**: Exceptional performance with modern value types (`readonly struct`, `Span<T>`, hardware intrinsics); outstanding Windows desktop support; rapid development speed; seamless language interoperability with native C/C++ via P/Invoke and Python via IPC.
- **Cons**: Managed runtime has GC pauses if memory is allocated naively. Mitigated by zero-allocation ring buffers, value types, and pooled object arrays.

---

## 2. Desktop Presentation Layer (UI)

| Attribute | Decision: Avalonia UI (.NET) | Candidate: WPF (.NET) | Candidate: Qt (C++) | Candidate: Web / Electron |
| :--- | :--- | :--- | :--- | :--- |
| **Rendering Tech** | Skia / Direct3D hardware acceleration. | Direct3D 9/11 (Legacy DirectX). | OpenGL / Vulkan / Software. | Chromium / WebGL. |
| **Performance** | 60+ FPS high-frequency tick rendering. | Good, but struggles on large multi-series data. | Extreme, but complex styling. | Poor under 500k+ data points, high RAM. |
| **Desktop Docking** | Advanced docking libraries (Avalonia.Dock). | AvalonDock. | QDockWidget. | GoldenLayout / FlexLayout. |
| **Modern Architecture** | ReactiveUI, modern XAML, cross-platform ready.| Windows-only, legacy codebase. | C++ Signals & Slots. | React / DOM overhead. |

### Final Decision: Avalonia UI (.NET)
- **Pros**: Hardware-accelerated Skia rendering engine enables TradingView-like continuous candle panning and zooming; native Windows desktop look and feel; cross-platform capability allows future macOS/Linux ports without rewriting core UI logic.
- **Cons**: Smaller component ecosystem than legacy WPF, but sufficient for high-performance trading charting.

---

## 3. Data Storage & Columnar Format

| Attribute | Decision: Apache Parquet + Custom Memory-Mapped Index | Candidate: SQLite | Candidate: Raw Flat Binary |
| :--- | :--- | :--- | :--- |
| **Compression Ratio** | 5x to 10x with Snappy/ZSTD dictionary encoding. | Low (1x - 2x). | Uncompressed or manual gzip. |
| **Columnar Scanning** | Scans only requested columns (e.g. timestamp & ask).| Row-oriented (must read whole row).| Requires manual binary serialization. |
| **Tooling & Interop** | Standard across Pandas, DuckDB, Polars, PyArrow. | Universal SQL interop. | Proprietary custom format. |
| **Streaming Speed** | 50M+ rows/sec sequential read. | ~1M rows/sec. | Very high, but custom maintenance burden. |

### Final Decision: Apache Parquet + Memory-Mapped Indices
- **Pros**: Industry-standard columnar format; extreme compression reduces multi-year tick datasets from 50GB to <5GB; enables zero-copy analytic querying.

---

## 4. Inter-Process Communication (IPC)

| Technology | Selection: Named Pipes + Shared Memory Ring Buffers | Alternative: gRPC / HTTP2 | Alternative: ZeroMQ |
| :--- | :--- | :--- | :--- |
| **Latency** | Sub-microsecond (Shared memory) / < 10µs (Named Pipes). | 500µs – 2ms (TCP stack overhead). | 20µs – 50µs. |
| **Complexity** | Low on Windows, standard OS primitives. | Requires full HTTP/2 stack & certs. | Extra C++ library dependency. |
| **Throughput** | Millions of tick updates per second. | Limited by socket serializing. | Very high. |

### Final Decision: Windows Named Pipes + Protocol Buffers
- **Pros**: Native Windows security, ultra-low latency IPC between the engine and external Python/Rust strategy sandboxes.
