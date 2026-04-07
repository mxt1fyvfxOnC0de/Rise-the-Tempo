const clamp = (value, min = 1, max = 99) => Math.max(min, Math.min(max, Math.round(value)));

export const calculatePace = (fiveKmSeconds) => clamp((1800 - fiveKmSeconds) / 10 + 50);

export const calculateShooting = (hundredMeterSeconds) => clamp((20 - hundredMeterSeconds) * 7 + 45);

export const calculatePhysical = (pushUpsPerSet) => clamp(pushUpsPerSet * 1.8 + 20);

export const deriveStatsFromInputs = ({ fiveKmSeconds, hundredMeterSeconds, pushUpsPerSet }) => {
  const pace = calculatePace(Number(fiveKmSeconds) || 1800);
  const shooting = calculateShooting(Number(hundredMeterSeconds) || 16);
  const physical = calculatePhysical(Number(pushUpsPerSet) || 20);

  const passing = clamp((pace * 0.35 + shooting * 0.4 + physical * 0.25));
  const dribbling = clamp((pace * 0.5 + shooting * 0.35 + 12));
  const defense = clamp((physical * 0.65 + passing * 0.2 + 8));

  return {
    pace,
    shooting,
    passing,
    dribbling,
    defense,
    physical
  };
};

export const getTier = (overall) => {
  if (overall >= 90) return 'Special';
  if (overall >= 78) return 'Gold';
  if (overall >= 63) return 'Silver';
  return 'Bronze';
};

export const calculateOverall = (stats) => {
  const values = Object.values(stats);
  return clamp(values.reduce((sum, value) => sum + value, 0) / values.length);
};

export const calculateIntensityScore = (memberCards) => {
  if (!memberCards.length) return 0;
  return Math.round(
    memberCards.reduce((acc, card) => acc + card.overall + card.weeklyGain * 1.4, 0) / memberCards.length
  );
};
