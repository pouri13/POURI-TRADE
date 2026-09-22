/**
 * @license
 * SPDX-License-Identifier: MIT
 * BACKTEST Phase 0 - Core Domain Financial Primitives & Event Model
 */

/**
 * Architectural Event Priority / Rank enum ensuring operational precedence
 * within the identical simulation timestamp.
 */
export enum EventRank {
  SimulationControl = 0,
  MarketData = 10,
  IndicatorTimer = 20,
  StrategySignal = 30,
  OrderRequest = 40,
  ExecutionFill = 50,
  PositionAccountUpdate = 60,
  SnapshotCheckpoint = 70,
  TelemetryAudit = 80,
}

/**
 * Base Event Contract with canonical 5-tier ordering attributes.
 */
export interface ISimulationEvent {
  /** Microsecond UTC timestamp in simulated market time */
  readonly timestampMicros: bigint;
  /** Domain precedence rank */
  readonly rank: EventRank;
  /** Canonical source order ordinal (e.g., symbol alphabetical index) */
  readonly sourceOrdinal: number;
  /** Content-derived deterministic key (e.g. "EURUSD:TICK:1042") */
  readonly deterministicKey: string;
  /** Stable unique tie-breaker (e.g., deterministic GUID or content hash) */
  readonly tieBreaker: string;
  /** Event payload */
  readonly payload?: unknown;
}

/**
 * Deterministic Comparator for Simulation Events.
 * Implements strict weak ordering based solely on canonical immutable tuple:
 * (timestampMicros, rank, sourceOrdinal, deterministicKey, tieBreaker).
 * 
 * CRITICAL INVARIANT:
 * Insertion or arrival order has zero effect on this comparator.
 */
export function compareSimulationEvents(a: ISimulationEvent, b: ISimulationEvent): number {
  // 1. Simulation Timestamp
  if (a.timestampMicros < b.timestampMicros) return -1;
  if (a.timestampMicros > b.timestampMicros) return 1;

  // 2. Event Rank / Priority
  if (a.rank < b.rank) return -1;
  if (a.rank > b.rank) return 1;

  // 3. Canonical Source Ordinal
  if (a.sourceOrdinal < b.sourceOrdinal) return -1;
  if (a.sourceOrdinal > b.sourceOrdinal) return 1;

  // 4. Deterministic Event Key
  const keyComp = a.deterministicKey.localeCompare(b.deterministicKey);
  if (keyComp !== 0) return keyComp;

  // 5. Stable Tie-Breaker
  return a.tieBreaker.localeCompare(b.tieBreaker);
}

/**
 * Deterministic Priority Event Queue.
 * Guarantees that any sequence of inserted events is dequeued in canonical order.
 */
export class DeterministicEventQueue {
  private items: ISimulationEvent[] = [];

  public get count(): number {
    return this.items.length;
  }

  public enqueue(event: ISimulationEvent): void {
    // Binary insertion or push and sort maintaining canonical ordering
    this.items.push(event);
    this.items.sort(compareSimulationEvents);
  }

  public enqueueAll(events: readonly ISimulationEvent[]): void {
    for (const ev of events) {
      this.items.push(ev);
    }
    this.items.sort(compareSimulationEvents);
  }

  public dequeue(): ISimulationEvent | undefined {
    return this.items.shift();
  }

  public peek(): ISimulationEvent | undefined {
    return this.items[0];
  }

  public clear(): void {
    this.items = [];
  }

  public toArray(): ISimulationEvent[] {
    return [...this.items];
  }
}

/**
 * Fixed-Point Decimal Price Primitive (6 decimal places: 1 unit = 10^-6).
 * Eliminates IEEE 754 floating-point drift.
 */
export class Price {
  public static readonly SCALE = 1_000_000n;

  private constructor(public readonly rawValue: bigint) {}

  public static fromUnits(units: bigint): Price {
    return new Price(units);
  }

  public static fromDecimalString(val: string): Price {
    const parts = val.split('.');
    const integerPart = BigInt(parts[0] || '0') * Price.SCALE;
    let fractionStr = (parts[1] || '').padEnd(6, '0').slice(0, 6);
    const fractionPart = BigInt(fractionStr);
    return new Price(integerPart + fractionPart);
  }

  public toString(): string {
    const sign = this.rawValue < 0n ? '-' : '';
    const abs = this.rawValue < 0n ? -this.rawValue : this.rawValue;
    const integerPart = abs / Price.SCALE;
    const fracPart = (abs % Price.SCALE).toString().padStart(6, '0');
    return `${sign}${integerPart}.${fracPart}`;
  }

  public equals(other: Price): boolean {
    return this.rawValue === other.rawValue;
  }
}

/**
 * Fixed-Point Decimal Quantity Primitive (4 decimal places: 1 unit = 10^-4).
 */
export class Quantity {
  public static readonly SCALE = 10_000n;

  private constructor(public readonly rawValue: bigint) {}

  public static fromUnits(units: bigint): Quantity {
    return new Quantity(units);
  }

  public static fromDecimalString(val: string): Quantity {
    const parts = val.split('.');
    const integerPart = BigInt(parts[0] || '0') * Quantity.SCALE;
    let fractionStr = (parts[1] || '').padEnd(4, '0').slice(0, 4);
    const fractionPart = BigInt(fractionStr);
    return new Quantity(integerPart + fractionPart);
  }

  public toString(): string {
    const sign = this.rawValue < 0n ? '-' : '';
    const abs = this.rawValue < 0n ? -this.rawValue : this.rawValue;
    const integerPart = abs / Quantity.SCALE;
    const fracPart = (abs % Quantity.SCALE).toString().padStart(4, '0');
    return `${sign}${integerPart}.${fracPart}`;
  }
}

/**
 * Fixed-Point Decimal Currency / Money Primitive (4 decimal places).
 */
export class Money {
  public static readonly SCALE = 10_000n;

  private constructor(public readonly rawValue: bigint) {}

  public static fromUnits(units: bigint): Money {
    return new Money(units);
  }

  public static fromDecimalString(val: string): Money {
    const parts = val.split('.');
    const integerPart = BigInt(parts[0] || '0') * Money.SCALE;
    let fractionStr = (parts[1] || '').padEnd(4, '0').slice(0, 4);
    const fractionPart = BigInt(fractionStr);
    return new Money(integerPart + fractionPart);
  }

  public toString(): string {
    const sign = this.rawValue < 0n ? '-' : '';
    const abs = this.rawValue < 0n ? -this.rawValue : this.rawValue;
    const integerPart = abs / Money.SCALE;
    const fracPart = (abs % Money.SCALE).toString().padStart(4, '0');
    return `${sign}${integerPart}.${fracPart}`;
  }
}
