import { create } from 'zustand';
import type { DailySummary, ImportReport, StationStats, WaterRecord } from '../types';

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
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsModalOpen: (open: boolean) => void;
  resetSelection: () => void;
}

const now = new Date();

export const useAppStore = create<AppState>((set) => ({
  stations: [],
  selectedStation: null,
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth() + 1,
  dailySummary: [],
  selectedDate: null,
  dayDetail: [],
  stationStats: null,
  importReport: null,
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
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
  resetSelection: () => set({
    selectedDate: null,
    dayDetail: [],
    isModalOpen: false
  })
}));
