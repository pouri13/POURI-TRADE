/**
 * @license
 * SPDX-License-Identifier: MIT
 * BACKTEST Phase 0 - Regression & Determinism Tests
 * 
 * Specifically tests the critical invariant:
 * Same logical event set + different insertion order = identical canonical execution order.
 */

import {
  DeterministicEventQueue,
  EventRank,
  ISimulationEvent,
  Price,
  Quantity,
  Money,
} from '../src/domain.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runEventQueueRegressionTests(): void {
  console.log('[*] Running EventQueue_same_timestamp_same_rank_is_insertion_order_independent regression test...');

  const timestamp = 1700000000000000n; // Microsecond timestamp
  const rank = EventRank.MarketData; // Same rank
  const sourceOrdinal = 0; // Same source

  // Event A: EURUSD Tick
  const eventA: ISimulationEvent = {
    timestampMicros: timestamp,
    rank: rank,
    sourceOrdinal: sourceOrdinal,
    deterministicKey: 'TICK:EURUSD:000100',
    tieBreaker: 'uuid-a1',
    payload: { symbol: 'EURUSD', price: '1.085000' },
  };

  // Event B: GBPUSD Tick (different key, but exact same timestamp & rank)
  const eventB: ISimulationEvent = {
    timestampMicros: timestamp,
    rank: rank,
    sourceOrdinal: sourceOrdinal,
    deterministicKey: 'TICK:GBPUSD:000100',
    tieBreaker: 'uuid-b2',
    payload: { symbol: 'GBPUSD', price: '1.272000' },
  };

  // Run 1: Insert A -> B
  const queue1 = new DeterministicEventQueue();
  queue1.enqueue(eventA);
  queue1.enqueue(eventB);
  const out1 = [queue1.dequeue()!, queue1.dequeue()!];

  // Run 2: Insert B -> A
  const queue2 = new DeterministicEventQueue();
  queue2.enqueue(eventB);
  queue2.enqueue(eventA);
  const out2 = [queue2.dequeue()!, queue2.dequeue()!];

  // Invariant verification: Both queues must dequeue in exact same canonical order
  assert(out1[0].deterministicKey === out2[0].deterministicKey, 'First dequeued event key must match regardless of insertion order');
  assert(out1[1].deterministicKey === out2[1].deterministicKey, 'Second dequeued event key must match regardless of insertion order');
  assert(out1[0].deterministicKey === 'TICK:EURUSD:000100', 'Canonical order must place EURUSD before GBPUSD lexicographically');
  assert(out1[1].deterministicKey === 'TICK:GBPUSD:000100', 'Canonical order must place GBPUSD after EURUSD');

  console.log('  [PASS] EventQueue_same_timestamp_same_rank_is_insertion_order_independent passed.');
}

function runMultiEventPermutationTests(): void {
  console.log('[*] Running Multi-Event Randomized Permutation Invariant Test...');

  const events: ISimulationEvent[] = [
    {
      timestampMicros: 1000n,
      rank: EventRank.MarketData,
      sourceOrdinal: 1,
      deterministicKey: 'TICK:USDJPY:1',
      tieBreaker: 'tb-1',
    },
    {
      timestampMicros: 1000n,
      rank: EventRank.MarketData,
      sourceOrdinal: 0,
      deterministicKey: 'TICK:AUDUSD:1',
      tieBreaker: 'tb-2',
    },
    {
      timestampMicros: 1000n,
      rank: EventRank.StrategySignal,
      sourceOrdinal: 0,
      deterministicKey: 'SIGNAL:STRAT1:1',
      tieBreaker: 'tb-3',
    },
    {
      timestampMicros: 500n,
      rank: EventRank.SimulationControl,
      sourceOrdinal: 0,
      deterministicKey: 'CTRL:START',
      tieBreaker: 'tb-0',
    },
    {
      timestampMicros: 1000n,
      rank: EventRank.MarketData,
      sourceOrdinal: 0,
      deterministicKey: 'TICK:AUDUSD:2',
      tieBreaker: 'tb-4',
    },
  ];

  // Collect canonical baseline
  const baselineQueue = new DeterministicEventQueue();
  baselineQueue.enqueueAll(events);
  const baselineOrder = baselineQueue.toArray().map((e) => e.deterministicKey);

  // Test across multiple shuffled permutations
  for (let iteration = 0; iteration < 20; iteration++) {
    const shuffled = [...events].sort(() => Math.random() - 0.5);
    const testQueue = new DeterministicEventQueue();
    testQueue.enqueueAll(shuffled);
    const testOrder = testQueue.toArray().map((e) => e.deterministicKey);

    assert(
      JSON.stringify(baselineOrder) === JSON.stringify(testOrder),
      `Permutation iteration ${iteration} must match canonical baseline order`
    );
  }

  console.log('  [PASS] Multi-Event Permutation Invariant Test passed across all iterations.');
}

function runFinancialPrecisionTests(): void {
  console.log('[*] Running Financial Precision Tests...');

  const p1 = Price.fromDecimalString('1.085025');
  const p2 = Price.fromDecimalString('1.085025');
  assert(p1.equals(p2), 'Prices with identical string representations must be strictly equal');
  assert(p1.toString() === '1.085025', 'Price toString must preserve 6 decimal scale');

  const q = Quantity.fromDecimalString('0.1500');
  assert(q.toString() === '0.1500', 'Quantity toString must preserve 4 decimal scale');

  const m = Money.fromDecimalString('100000.5000');
  assert(m.toString() === '100000.5000', 'Money toString must preserve 4 decimal scale');

  console.log('  [PASS] Financial Precision Tests passed.');
}

export function runAllTests(): void {
  console.log('=== BACKTEST Phase 0 Test Suite Execution ===');
  runEventQueueRegressionTests();
  runMultiEventPermutationTests();
  runFinancialPrecisionTests();
  console.log('[SUCCESS] All Phase 0 Architecture and Determinism Tests PASSED.');
}

// Auto-run if executed directly
runAllTests();
