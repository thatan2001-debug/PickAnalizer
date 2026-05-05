import assert from 'node:assert/strict';
import { analyzeMatch, clamp } from '../src/analysisEngine.js';

assert.equal(clamp(10, 0, 5), 5);
assert.equal(clamp(-3, 0, 5), 0);
assert.equal(clamp(2, 0, 5), 2);

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

console.log('analysisEngine tests passed');
