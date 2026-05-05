import assert from 'node:assert/strict';
import {
  analyzeMatch,
  clamp,
  kellyFraction,
  normalizedBookProbabilities,
  toProbabilityFromOdds,
} from '../src/analysisEngine.js';

assert.equal(clamp(10, 0, 5), 5);
assert.equal(clamp(-3, 0, 5), 0);
assert.equal(clamp(2, 0, 5), 2);

assert.equal(toProbabilityFromOdds(2), 0.5);
assert.equal(toProbabilityFromOdds(1), 0);

const probs = normalizedBookProbabilities({ oddsHome: 2, oddsDraw: 3, oddsAway: 4 });
assert.equal(probs.length, 3);
assert.ok(Math.abs(probs.reduce((a, b) => a + b, 0) - 1) < 1e-9);

assert.ok(kellyFraction(0.6, 2) > 0);
assert.equal(kellyFraction(0.4, 2), 0);

const result = analyzeMatch({
  homeForm: 80,
  awayForm: 65,
  homeInjuries: 1,
  awayInjuries: 2,
  oddsHome: 1.95,
  oddsDraw: 3.4,
  oddsAway: 3.8,
});

assert.ok(['Local', 'Empate', 'Visitante'].includes(result.best.key));
assert.ok(['Bajo', 'Medio', 'Alto'].includes(result.risk));
assert.ok(result.fairHome > 1);
assert.ok(result.fairDraw > 1);
assert.ok(result.fairAway > 1);
assert.ok(result.confidence >= 0 && result.confidence <= 1);
assert.ok(result.recommendedStake >= 0 && result.recommendedStake <= 1);

console.log('analysisEngine tests passed');
