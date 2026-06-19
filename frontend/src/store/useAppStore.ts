import { create } from 'zustand';
import type { DailySummary, ImportReport, StationStats, WaterRecord } from '../types';
import { getStations, getStationStats, getDailySummary } from '../utils/api';

interface AppState {
  stations: string[];
  selectedStation: string | null;
  currentYear: number;
  currentMonth: number;
  dailySummary: DailySummary[];
  selectedDate: string | null;
  dayDetail: WaterRecord[];
  stationStats: StationStats | null;
  importReport: ImportReport | null;
  lastImportTime: number;
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  
  setStations: (stations: string[]) => void;
  setSelectedStation: (station: string | null) => void;
  setCurrentYear: (year: number) => void;
  setCurrentMonth: (month: number) => void;
  setDailySummary: (summary: DailySummary[]) => void;
  setSelectedDate: (date: string | null) => void;
  setDayDetail: (records: WaterRecord[]) => void;
  setStationStats: (stats: StationStats | null) => void;
  setImportReport: (report: ImportReport | null) => void;
  setLastImportTime: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsModalOpen: (open: boolean) => void;
  resetSelection: () => void;
  refreshStationsAndSelectFirst: () => Promise<void>;
  loadStationData: (stationId: string) => Promise<void>;
}

const now = new Date();

export const useAppStore = create<AppState>((set, get) => ({
  stations: [],
  selectedStation: null,
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth() + 1,
  dailySummary: [],
  selectedDate: null,
  dayDetail: [],
  stationStats: null,
  importReport: null,
  lastImportTime: 0,
  isLoading: false,
  error: null,
  isModalOpen: false,
  
  setStations: (stations) => set({ stations }),
  setSelectedStation: (selectedStation) => set({ selectedStation }),
  setCurrentYear: (currentYear) => set({ currentYear }),
  setCurrentMonth: (currentMonth) => set({ currentMonth }),
  setDailySummary: (dailySummary) => set({ dailySummary }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setDayDetail: (dayDetail) => set({ dayDetail }),
  setStationStats: (stationStats) => set({ stationStats }),
  setImportReport: (importReport) => set({ importReport }),
  setLastImportTime: () => set({ lastImportTime: Date.now() }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
  resetSelection: () => set({
    selectedDate: null,
    dayDetail: [],
    isModalOpen: false
  }),

  refreshStationsAndSelectFirst: async () => {
    const { setError, setIsLoading, setSelectedStation, loadStationData } = get();
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStations();
      set({ stations: data, stationStats: null, dailySummary: [] });
      if (data.length > 0) {
        const firstStation = data[0];
        setSelectedStation(firstStation);
        await loadStationData(firstStation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载站点列表失败');
    } finally {
      setIsLoading(false);
    }
  },

  loadStationData: async (stationId: string) => {
    const { currentYear, currentMonth, setError, setIsLoading } = get();
    setIsLoading(true);
    setError(null);
    try {
      const [stats, summary] = await Promise.all([
        getStationStats(stationId),
        getDailySummary(stationId, currentYear, currentMonth)
      ]);
      set({ stationStats: stats, dailySummary: summary });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载站点数据失败');
    } finally {
      setIsLoading(false);
    }
  }
}));
