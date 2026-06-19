import type { DailySummary, AnomalySegment } from '../types';
import { isNextDay, daysBetween } from './date';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateTs(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function buildAnomalySegments(summaries: DailySummary[]): AnomalySegment[] {
  if (!summaries || summaries.length === 0) {
    return [];
  }

  const sorted = [...summaries].sort((a, b) => a.date.localeCompare(b.date));
  const anomalyMap = new Map<string, DailySummary>();
  for (const s of sorted) {
    if (s.is_anomaly) {
      anomalyMap.set(s.date, s);
    }
  }

  const anomalyDates = Array.from(anomalyMap.keys()).sort((a, b) => a.localeCompare(b));
  if (anomalyDates.length === 0) {
    return [];
  }

  const segments: AnomalySegment[] = [];
  let i = 0;

  while (i < anomalyDates.length) {
    const startDate = anomalyDates[i];
    const anomalyDatesInRun: string[] = [startDate];
    let expectedNext = parseDateTs(startDate) + MS_PER_DAY;

    let j = i + 1;
    while (j < anomalyDates.length) {
      const curr = anomalyDates[j];
      if (parseDateTs(curr) === expectedNext) {
        anomalyDatesInRun.push(curr);
        expectedNext += MS_PER_DAY;
        j++;
      } else {
        break;
      }
    }

    if (anomalyDatesInRun.length >= 2) {
      const endDate = anomalyDatesInRun[anomalyDatesInRun.length - 1];
      const duration = daysBetween(startDate, endDate);
      const ratio = anomalyDatesInRun.length / duration;

      segments.push({
        id: `seg-${startDate}-${endDate}`,
        startDate,
        endDate,
        durationDays: duration,
        anomalyDaysCount: anomalyDatesInRun.length,
        anomalyRatio: ratio,
        anomalyDates: [...anomalyDatesInRun]
      });
    }

    i = j;
  }

  segments.sort((a, b) => {
    if (b.durationDays !== a.durationDays) {
      return b.durationDays - a.durationDays;
    }
    return a.startDate.localeCompare(b.startDate);
  });

  return segments;
}

export { isNextDay };
