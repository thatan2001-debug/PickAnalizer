export function calculateKellyStake(bankroll, probability, odds) {
  const b = odds - 1;
  const q = 1 - probability;
  const kelly = (b * probability - q) / b;
  const fractionalKelly = Math.max(0, kelly * 0.25); // Quarter Kelly for safety
  return +(bankroll * fractionalKelly).toFixed(2);
}

export function calculateFlatStake(flatAmount) {
  return flatAmount;
}

export function calculatePercentageStake(bankroll, percentage) {
  return +((bankroll * percentage) / 100).toFixed(2);
}

export function calculatePotentialProfit(stake, odds) {
  return +((stake * odds) - stake).toFixed(2);
}

export function calculateROI(records) {
  const resolved = records.filter(r => r.result === 'won' || r.result === 'lost');
  if (!resolved.length) return 0;
  const totalStaked = resolved.reduce((sum, r) => sum + (r.stake || 0), 0);
  const totalProfit = resolved.reduce((sum, r) => sum + (r.profit_loss || 0), 0);
  return totalStaked > 0 ? +((totalProfit / totalStaked) * 100).toFixed(1) : 0;
}

export function calculateWinRate(records) {
  const resolved = records.filter(r => r.result === 'won' || r.result === 'lost');
  if (!resolved.length) return 0;
  const won = resolved.filter(r => r.result === 'won').length;
  return +((won / resolved.length) * 100).toFixed(1);
}

export function getFormColor(char) {
  if (char === 'W') return 'bg-primary text-primary-foreground';
  if (char === 'D') return 'bg-accent text-accent-foreground';
  return 'bg-destructive text-destructive-foreground';
}

export function impliedProbability(odds) {
  return +(1 / odds * 100).toFixed(1);
}

export function hasValue(ourProb, odds) {
  const implied = 1 / odds;
  return ourProb / 100 > implied;
}
