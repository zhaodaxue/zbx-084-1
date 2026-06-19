import { getDb } from '../models/db.js';
import { WaterRecord, DailySummary } from '../types/index.js';
import { calculatePhDeviation, isAnomaly } from '../utils/anomaly.js';

export async function getStations(): Promise<string[]> {
  const db = await getDb();
  const result = await db.all<{ station_id: string }[]>(`
    SELECT DISTINCT station_id 
    FROM water_records 
    ORDER BY station_id
  `);
  return result.map(r => r.station_id);
}

export async function getDailySummary(
  stationId: string,
  year: number,
  month: number
): Promise<DailySummary[]> {
  const db = await getDb();
  
  const monthStr = String(month).padStart(2, '0');
  const datePrefix = `${year}-${monthStr}`;

  const rows = await db.all<{
    date: string;
    station_id: string;
    max_turbidity: number;
    min_ph: number;
    max_ph: number;
  }[]>(`
    SELECT 
      date,
      station_id,
      MAX(turbidity_ntu) as max_turbidity,
      MIN(ph) as min_ph,
      MAX(ph) as max_ph
    FROM water_records
    WHERE station_id = ? AND date LIKE ?
    GROUP BY date, station_id
    ORDER BY date
  `, stationId, `${datePrefix}%`);

  return rows.map(row => {
    const minDeviation = calculatePhDeviation(row.min_ph);
    const maxDeviation = calculatePhDeviation(row.max_ph);
    const maxPhDeviation = Math.max(minDeviation, maxDeviation);

    return {
      date: row.date,
      station_id: row.station_id,
      max_turbidity: row.max_turbidity,
      max_ph_deviation: maxPhDeviation,
      is_anomaly: isAnomaly(row.max_turbidity, maxPhDeviation)
    };
  });
}

export async function getDayDetail(
  stationId: string,
  date: string
): Promise<WaterRecord[]> {
  const db = await getDb();
  
  const rows = await db.all<WaterRecord[]>(`
    SELECT id, date, station_id, turbidity_ntu, ph, created_at
    FROM water_records
    WHERE station_id = ? AND date = ?
    ORDER BY id
  `, stationId, date);

  return rows;
}

export async function getStationStats(stationId: string): Promise<{
  total_days: number;
  anomaly_days: number;
  normal_days: number;
  total_records: number;
}> {
  const db = await getDb();
  
  const dailyData = await db.all<{
    date: string;
    max_turbidity: number;
    min_ph: number;
    max_ph: number;
  }[]>(`
    SELECT 
      date,
      MAX(turbidity_ntu) as max_turbidity,
      MIN(ph) as min_ph,
      MAX(ph) as max_ph
    FROM water_records
    WHERE station_id = ?
    GROUP BY date
  `, stationId);

  const totalRecordsResult = await db.get<{ count: number }>(`
    SELECT COUNT(*) as count FROM water_records WHERE station_id = ?
  `, stationId);

  let anomalyDays = 0;
  for (const row of dailyData) {
    const minDeviation = calculatePhDeviation(row.min_ph);
    const maxDeviation = calculatePhDeviation(row.max_ph);
    const maxPhDeviation = Math.max(minDeviation, maxDeviation);
    
    if (isAnomaly(row.max_turbidity, maxPhDeviation)) {
      anomalyDays++;
    }
  }

  return {
    total_days: dailyData.length,
    anomaly_days: anomalyDays,
    normal_days: dailyData.length - anomalyDays,
    total_records: totalRecordsResult?.count || 0
  };
}
