import { CLP_FORMATTER } from './constants';

export const formatCLP = (value: number): string => CLP_FORMATTER.format(value);

export const formatKm = (m: number): string => `${(m / 1000).toFixed(1)} km`;

export const formatDur = (s: number): string => {
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
};
