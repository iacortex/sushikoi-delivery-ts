import type { Metric } from 'web-vitals';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (!onPerfEntry) return;
  onCLS(onPerfEntry);
  onFCP(onPerfEntry);
  onINP(onPerfEntry); // INP reemplaza a FID
  onLCP(onPerfEntry);
  onTTFB(onPerfEntry);
};

export default reportWebVitals;
