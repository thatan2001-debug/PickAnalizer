export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function toProbabilityFromOdds(decimalOdds) {
  if (!Number.isFinite(decimalOdds) || decimalOdds <= 1) return 0;
  return 1 / decimalOdds;
}

export function normalizedBookProbabilities(odds) {
  const raw = [
    toProbabilityFromOdds(odds.oddsHome),
    toProbabilityFromOdds(odds.oddsDraw),
    toProbabilityFromOdds(odds.oddsAway),
  ];
  const total = raw.reduce((acc, v) => acc + v, 0) || 1;
  return raw.map((v) => v / total);
}

export function kellyFraction(probability, odds) {
  const b = odds - 1;
  if (b <= 0) return 0;
  const q = 1 - probability;
  return clamp((b * probability - q) / b, 0, 1);
}

export function analyzeMatch(data) {
  const homeStrength = data.homeForm - data.homeInjuries * 7 + 5;
  const awayStrength = data.awayForm - data.awayInjuries * 7;
  const formGap = Math.abs(data.homeForm - data.awayForm);

  const strengthTotal = Math.max(1, homeStrength + awayStrength);
  const pHomeModel = clamp(homeStrength / strengthTotal, 0.05, 0.85);
  const pAwayModel = clamp(awayStrength / strengthTotal, 0.05, 0.85);
  const pDrawModel = clamp(1 - pHomeModel - pAwayModel, 0.1, 0.35);

  const fairHome = 1 / pHomeModel;
  const fairDraw = 1 / pDrawModel;
  const fairAway = 1 / pAwayModel;

  const [bookHome, bookDraw, bookAway] = normalizedBookProbabilities(data);

  const values = [
    { key: 'Local', edge: ((data.oddsHome - fairHome) / fairHome) * 100, prob: pHomeModel, odds: data.oddsHome, book: bookHome },
    { key: 'Empate', edge: ((data.oddsDraw - fairDraw) / fairDraw) * 100, prob: pDrawModel, odds: data.oddsDraw, book: bookDraw },
    { key: 'Visitante', edge: ((data.oddsAway - fairAway) / fairAway) * 100, prob: pAwayModel, odds: data.oddsAway, book: bookAway },
  ].sort((a, b) => b.edge - a.edge);

  const best = values[0];
  const risk = best.prob >= 0.55 ? 'Bajo' : best.prob >= 0.42 ? 'Medio' : 'Alto';
  const riskClass = risk === 'Bajo' ? 'low' : risk === 'Medio' ? 'medium' : 'high';
  const confidence = clamp((best.prob - best.book + formGap / 200), 0, 1);
  const recommendedStake = kellyFraction(best.prob, best.odds) * 0.5; // half-kelly

  return {
    best,
    risk,
    riskClass,
    confidence,
    recommendedStake,
    fairHome,
    fairDraw,
    fairAway,
  };
}
