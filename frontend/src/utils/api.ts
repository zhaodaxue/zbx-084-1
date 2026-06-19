import type {
  WaterRecord,
  DailySummary,
  ImportReport,
  StationStats,
  ApiResponse
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  const data: ApiResponse<T> = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || `请求失败: ${response.status}`);
  }
  
  return data.data as T;
}

export async function importCsv(file: File): Promise<ImportReport> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    body: formData
  });
  
  return handleResponse<ImportReport>(response);
}

export async function getStations(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/stations`);
  return handleResponse<string[]>(response);
}

export async function getDailySummary(
  stationId: string,
  year: number,
  month: number
): Promise<DailySummary[]> {
  const params = new URLSearchParams({
    station_id: stationId,
    year: year.toString(),
    month: month.toString()
  });
  
  const response = await fetch(`${API_BASE}/daily-summary?${params}`);
  return handleResponse<DailySummary[]>(response);
}

export async function getDailySummaryAll(stationId: string): Promise<DailySummary[]> {
  const params = new URLSearchParams({
    station_id: stationId
  });
  
  const response = await fetch(`${API_BASE}/daily-summary-all?${params}`);
  return handleResponse<DailySummary[]>(response);
}

export async function getDayDetail(
  stationId: string,
  date: string
): Promise<WaterRecord[]> {
  const params = new URLSearchParams({
    station_id: stationId,
    date
  });
  
  const response = await fetch(`${API_BASE}/day-detail?${params}`);
  return handleResponse<WaterRecord[]>(response);
}

export async function getStationStats(stationId: string): Promise<StationStats> {
  const params = new URLSearchParams({
    station_id: stationId
  });
  
  const response = await fetch(`${API_BASE}/station-stats?${params}`);
  return handleResponse<StationStats>(response);
}

export function downloadSampleCsv(): void {
  window.open(`${API_BASE}/sample.csv`, '_blank');
}
