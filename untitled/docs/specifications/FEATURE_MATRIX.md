# BACKTEST Feature Matrix

This matrix provides the complete roadmap of all planned capabilities for the **BACKTEST** desktop platform, their architectural ownership, dependencies, target phase, and testing strategies.

---

## 1. Charting & Visualization

| Feature | Description | Phase | Architectural Owner | Dependencies | Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Candlestick Charts** | Classic OHLC candle rendering with volume bars | Phase 5 | `Presentation.Charting` | `Core.Time`, `Data.Aggregator` | Visual regression tests + rendering benchmark |
| **OHLC Bars** | Traditional financial bar chart format | Phase 5 | `Presentation.Charting` | `Presentation.Charting` | Unit test bar coordinate math |
| **Line & Area Charts** | Continuous price line and gradient area views | Phase 5 | `Presentation.Charting` | `Presentation.Charting` | Canvas layout unit tests |
| **Heikin Ashi** | Smoothed directional candlestick calculations | Phase 5 | `Presentation.Charting` | `Data.Aggregator` | Math equality test against historical HA series |
| **Renko & Range Bars** | Price-movement based bricks independent of time | Phase 5 | `Data.Aggregator` | `Core.Time` | Event boundary & tick brick completion tests |
| **Tick Charts** | N-ticks per bar aggregation | Phase 5 | `Data.Aggregator` | `Core.EventQueue` | Tick count aggregation verification |
| **Seconds / Sub-minute** | High-frequency 1s, 5s, 15s bar aggregation | Phase 5 | `Data.Aggregator` | `Core.Time` | Second boundary alignment test |
| **Custom Timeframe** | Flexible user timeframes (e.g. 2m, 3h, 45m) | Phase 5 | `Data.Aggregator` | `Core.Time` | Non-standard interval rollover test |
| **Multi-Chart Grid** | Synchronized multi-panel chart layouts | Phase 5 | `Presentation.Workspace`| `Presentation.Charting` | Multi-view layout & event broadcast test |
| **Crosshair & Tooltip** | Coordinated crosshair across all visible charts | Phase 5 | `Presentation.Charting` | `Presentation.Workspace`| Cursor coordinate broadcast unit test |
| **Zoom & Smooth Pan** | Infinite history scrolling and adaptive scale | Phase 5 | `Presentation.Charting` | `Data.Cache` | Virtualized viewport data fetching tests |
| **Drawing Tools** | Trendlines, horizontal rays, rectangles, channels| Phase 5 | `Presentation.Drawing`  | `Presentation.Charting` | Object serialization & hit-testing tests |
| **Fibonacci Tools** | Retracements, extensions, time zones | Phase 5 | `Presentation.Drawing`  | `Presentation.Charting` | Mathematical level calculation tests |
| **Measurement Tools** | Pip, percentage, and time duration rulers | Phase 5 | `Presentation.Drawing`  | `Core.Precision` | Unit calculation & rounding tests |
| **Technical Indicators**| Built-in library (SMA, EMA, RSI, MACD, Bollinger)| Phase 4 | `Analytics.Indicators`  | `Data.Aggregator` | Analytical accuracy vs reference benchmarks |
| **Replay Cursor Marker**| Interactive visual time cursor indicating replay | Phase 4 | `Presentation.Charting` | `Core.Time` | Frame alignment with simulation clock |

---

## 2. Trading & Order Management

| Feature | Description | Phase | Architectural Owner | Dependencies | Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Market Orders** | Immediate fill at best prevailing bid/ask | Phase 2 | `Execution.Broker` | `Core.EventQueue`, `Execution.Order` | Simulated spread matching test |
| **Limit Orders** | Passive orders filled when price reaches level | Phase 2 | `Execution.Broker` | `Execution.Order` | Queue priority and touch vs fill tests |
| **Stop Orders** | Triggered orders activating on market breach | Phase 2 | `Execution.Broker` | `Execution.Order` | Gap through stop slippage test |
| **Stop-Limit Orders** | Triggered stop creating a limit order | Phase 2 | `Execution.Broker` | `Execution.Order` | Trigger event + limit fill scenario tests |
| **Stop Loss / Take Profit**| Automatic bracket orders tied to parent position| Phase 2 | `Execution.Broker` | `Execution.Order` | Simultaneous touch & cancellation test |
| **Trailing Stop** | Dynamic stop loss tracking favorable price moves | Phase 2 | `Execution.Broker` | `Execution.Order` | Tick ratchet behavior unit tests |
| **Break-Even Function** | Auto-adjust stop loss to entry price + fee offset| Phase 2 | `Execution.Broker` | `Execution.Order` | Break-even threshold trigger test |
| **Partial Close** | Reduce position quantity and realize partial P&L | Phase 2 | `Execution.Position` | `Core.Precision` | Partial quantity accounting & P&L test |
| **Order Modification** | Update limit price, quantity, or protective stops| Phase 2 | `Execution.Broker` | `Execution.Order` | State machine transition validation |
| **Order Cancellation** | Safely cancel pending unfulfilled orders | Phase 2 | `Execution.Broker` | `Execution.Order` | Cancellation race & rejection tests |
| **OCO (One-Cancels-Other)**| Linked order pair where one fill cancels other | Phase 2 | `Execution.Broker` | `Execution.Order` | Atomic cancellation verification |
| **Risk-Based Sizing** | Auto-calculate lots based on % account equity | Phase 2 | `Execution.Risk` | `Core.Precision` | Account risk boundary unit tests |
| **Margin & Leverage** | Multi-asset margin requirement calculations | Phase 2 | `Execution.Account` | `Core.Precision` | Maintenance margin breach liquidation test |
| **Commission & Fees** | Fixed, per-lot, per-share, and % fee modeling | Phase 2 | `Execution.Broker` | `Core.Precision` | Comprehensive fee deduction tests |
| **Spread Simulation** | Fixed, historical recorded, or dynamic spreads | Phase 2 | `Execution.Broker` | `MarketData.Feed` | Bid/Ask spread widening tests |
| **Swap / Financing** | Overnight rollover interest debits and credits | Phase 2 | `Execution.Broker` | `Core.Time` | Wednesday 3-day swap rollover tests |
| **Slippage Modeling** | Configurable tick slippage & market impact | Phase 2 | `Execution.Broker` | `Execution.Order` | Monte Carlo slippage distribution tests |
| **Latency Simulation** | Execution pipeline delay between signal and fill | Phase 2 | `Execution.Broker` | `Core.EventQueue` | Clock offset & queue scheduling tests |
| **Partial Fills** | Splitting large volume orders across ticks | Phase 2 | `Execution.Broker` | `MarketData.Feed` | Available tick volume consumption tests |

---

## 3. Market Replay Engine

| Feature | Description | Phase | Architectural Owner | Dependencies | Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Play / Pause / Resume**| Master simulation control loop | Phase 4 | `Replay.Controller` | `Core.Clock`, `Core.EventQueue` | Controller state machine unit tests |
| **Step Single Tick** | Advance simulation exactly one market tick | Phase 4 | `Replay.Controller` | `Core.EventQueue` | Deterministic tick step inspection tests |
| **Step Single Bar** | Advance simulation to next closed bar boundary | Phase 4 | `Replay.Controller` | `Data.Aggregator` | Timeframe alignment step tests |
| **Forward / Rewind** | Fast forward jump and historical state restore | Phase 4 | `Replay.Controller` | `Snapshot.Engine` | State restore equality tests |
| **Variable Speed Pacing**| 0.1x to 1000x relative to real-time wall clock | Phase 4 | `Replay.Controller` | `Core.Clock` | Timer throttling accuracy benchmarks |
| **Trading Session Filter**| Restrict replay to specific market sessions (NY, LDN)| Phase 4 | `Replay.Controller` | `Core.Time` | Session boundary skip verification |
| **Save & Restore Sim** | Full state persistence of an ongoing replay run | Phase 0 | `Snapshot.Engine` | `Core.Snapshot` | Roundtrip snapshot serialization tests |

---

## 4. Backtesting Engine

| Feature | Description | Phase | Architectural Owner | Dependencies | Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tick-Based Engine** | Ultra-precise tick-by-tick event execution | Phase 1 | `Core.Engine` | `Core.EventQueue` | Invariant sequence execution tests |
| **Bar-Based Engine** | High-speed coarse backtesting on OHLC bars | Phase 1 | `Core.Engine` | `Data.Aggregator` | High-speed batch benchmark tests |
| **Multi-Symbol Co-Replay**| Coordinated tick processing across correlated pairs| Phase 1 | `Core.Engine` | `Core.EventQueue` | Interleaved timestamp sequencing tests |
| **Multi-Timeframe Feeds**| Simultaneous access to higher timeframe data | Phase 1 | `Data.Aggregator` | `Core.Time` | Anti-look-ahead bar close boundary tests|
| **Portfolio Backtesting**| Combined capital allocation across multiple systems| Phase 2 | `Execution.Portfolio`| `Execution.Account` | Combined equity curve aggregation tests |
| **Deterministic Engine** | Byte-identical results on repeated runs | Phase 0 | `Core.EventQueue` | `Core.Time` | Multi-run hash identity verification |
| **Look-Ahead Prevention**| Hard guard against future data access | Phase 1 | `Core.Engine` | `Core.Time` | Deliberate look-ahead violation tests |

---

## 5. Strategy Runtime & Polyglot API

| Feature | Description | Phase | Architectural Owner | Dependencies | Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Language-Agnostic API**| Versioned protocol contract for strategy communication| Phase 0 | `Strategy.Contract` | `Core.Primitives` | Schema serialization & validation tests |
| **C# In-Process Host** | Compiled high-performance .NET strategy execution | Phase 3 | `Strategy.Host.Net` | `Strategy.Contract` | In-process throughput benchmark tests |
| **Python IPC Host** | Process-isolated Python strategy runtime | Phase 3 | `Strategy.Host.IPC` | `Strategy.Contract` | Cross-process protocol roundtrip tests |
| **Rust / C++ IPC Host** | Native binary strategy execution via shared memory | Phase 3 | `Strategy.Host.IPC` | `Strategy.Contract` | Microsecond latency IPC stress tests |
| **Sandbox & Isolation** | Memory limits, CPU throttling, crash containment | Phase 3 | `Strategy.Sandbox` | `Strategy.Host` | Deliberate crash & leak containment tests |
| **Parameter Reflection** | Dynamic schema discovery of strategy tunable inputs| Phase 0 | `Strategy.Contract` | None | JSON schema parameter extraction tests |

---

## 6. Debugging & State Inspection

| Feature | Description | Phase | Architectural Owner | Dependencies | Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Event & Tick Log** | Comprehensive event audit trail | Phase 0 | `Core.Telemetry` | `Core.EventQueue` | Log output completeness tests |
| **Decision Audit Log** | Detailed log of why orders were placed or canceled| Phase 3 | `Strategy.Host` | `Core.Telemetry` | Structured decision payload validation |
| **Variable Inspector** | Real-time introspection of strategy variables | Phase 4 | `Strategy.Host` | `Presentation.Debug`| Memory snapshot inspection tests |
| **Conditional Breakpoint**| Pause simulation when custom logic condition triggers| Phase 4 | `Core.Engine` | `Strategy.Host` | Breakpoint trigger accuracy tests |
| **Scenario Branching** | Branch new simulation run from any snapshot point | Phase 4 | `Snapshot.Engine` | `Core.Engine` | Lineage tree integrity & divergence tests|

---

## 7. Historical Data Management

| Feature | Description | Phase | Architectural Owner | Dependencies | Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Columnar Parquet Store**| Compressed high-throughput storage for tick & bar data| Phase 1 | `Data.Storage` | None | Read/write throughput & compression benchmarks|
| **Multi-Format Importer**| Import CSV, JSON, binary tick data from brokers | Phase 1 | `Data.Import` | `Data.Storage` | Fuzz testing on malformed CSV files |
| **Data Normalization** | Convert heterogeneous broker formats to standard ticks| Phase 1 | `Data.Import` | `Core.Primitives` | Precision preservation & time zone tests|
| **Data Integrity Check** | Automated detection of gaps, spikes, inverted spreads | Phase 1 | `Data.Diagnostics`| `Data.Storage` | Synthetic anomaly detection verification|

---

## 8. Analytics & Reporting

| Feature | Description | Phase | Architectural Owner | Dependencies | Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Performance Statistics**| Sharpe, Sortino, Calmar, Max DD, Win %, Profit Factor| Phase 3 | `Analytics.Metrics` | `Execution.Account` | Standard reference dataset verification |
| **Drawdown Analytics** | Underwater curves, recovery duration, max drawdown | Phase 3 | `Analytics.Metrics` | `Execution.Account` | Edge case zero-trade & ruin tests |
| **Trade Distribution** | Distribution histograms of returns, holding duration | Phase 3 | `Analytics.Metrics` | `Execution.Position`| Statistical distribution correctness tests |
| **Export Formats** | Export tear-sheets to PDF, HTML, JSON, CSV | Phase 3 | `Analytics.Export` | `Analytics.Metrics` | File format parser validation |

---

## 9. Optimization & Parameter Sweeps

| Feature | Description | Phase | Architectural Owner | Dependencies | Test Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Parallel Grid Search** | Exhaustive multi-core parameter matrix evaluation | Phase 5 | `Optimization.Grid` | `Core.Engine` | Multi-core scaling & deterministic sorting |
| **Genetic Optimization**| Adaptive parameter search using evolutionary algorithms| Phase 5 | `Optimization.GA` | `Optimization.Grid` | Convergence tests on known test functions |
| **Walk-Forward Analysis**| Rolling out-of-sample window optimization | Phase 5 | `Optimization.WFA` | `Optimization.Grid` | Window alignment & overfitting score tests|
| **Monte Carlo Engine** | Trade reshuffling and parameter perturbation analysis | Phase 5 | `Optimization.MC` | `Analytics.Metrics` | Randomness seed stability & bounds tests |
