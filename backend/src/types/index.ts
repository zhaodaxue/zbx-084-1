export interface WaterRecord {
  id?: number;
  date: string;
  station_id: string;
  turbidity_ntu: number;
  ph: number;
  created_at?: string;
}

export interface DailySummary {
  date: string;
  station_id: string;
  max_turbidity: number;
  max_ph_deviation: number;
  is_anomaly: boolean;
}

export interface ImportReport {
  total_rows: number;
  imported_rows: number;
  skipped_rows: number;
  skipped_reasons: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
