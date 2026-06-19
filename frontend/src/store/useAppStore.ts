import { create } from 'zustand';
import type { DailySummary, ImportReport, StationStats, WaterRecord, AnomalySegment } from '../types';
import { getStations, getStationStats, getDailySummary, getDailySummaryAll, getDayDetail } from '../utils/api';
import { buildAnomalySegments } from '../utils/anomalySegments';
import { parseDate } from '../utils/date';

interface AppState {
  stations: string[];
  selectedStation: string | null;
  currentYear: number;
  currentMonth: number;
  dailySummary: DailySummary[];
  allDailySummaries: DailySummary[];
  anomalySegments: AnomalySegment[];
  highlightedSegmentId: string | null;
  highlightedDates: Set<string>;
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
  refreshCurrentMonthDaily: () => Promise<void>;
  setHighlightedSegment: (segmentId: string | null) => void;
  jumpToMonthOfDate: (dateStr: string) => Promise<void>;
  openDayDetail: (date: string) => Promise<void>;
}

const now = new Date();

function findLatestMonthWithData(summaries: DailySummary[]): { year: number; month: number } | null {
  if (!summaries || summaries.length === 0) return null;
  const sorted = [...summaries].sort((a, b) => b.date.localeCompare(a.date));
  const latest = parseDate(sorted[0].date);
  return { year: latest.getFullYear(), month: latest.getMonth() + 1 };
}

export const useAppStore = create<AppState>((set, get) => ({
  stations: [],
  selectedStation: null,
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth() + 1,
  dailySummary: [],
  allDailySummaries: [],
  anomalySegments: [],
  highlightedSegmentId: null,
  highlightedDates: new Set(),
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

  setHighlightedSegment: (segmentId) => {
    if (!segmentId) {
      set({ highlightedSegmentId: null, highlightedDates: new Set() });
      return;
    }
    const { anomalySegments } = get();
    const seg = anomalySegments.find((s) => s.id === segmentId);
    if (!seg) return;
    set({
      highlightedSegmentId: segmentId,
      highlightedDates: new Set(seg.anomalyDates)
    });
  },

  jumpToMonthOfDate: async (dateStr) => {
    const d = parseDate(dateStr);
    const targetYear = d.getFullYear();
    const targetMonth = d.getMonth() + 1;
    set({ currentYear: targetYear, currentMonth: targetMonth });
    await get().refreshCurrentMonthDaily();
  },

  openDayDetail: async (date) => {
    const { selectedStation } = get();
    if (!selectedStation) return;
    set({ selectedDate: date, isLoading: true });
    try {
      const records = await getDayDetail(selectedStation, date);
      set({ dayDetail: records, isModalOpen: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '加载日期明细失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshCurrentMonthDaily: async () => {
    const { selectedStation, currentYear, currentMonth, setError, setIsLoading } = get();
    if (!selectedStation) return;
    setIsLoading(true);
    setError(null);
    try {
      const summary = await getDailySummary(selectedStation, currentYear, currentMonth);
      set({ dailySummary: summary });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载日历数据失败');
    } finally {
      setIsLoading(false);
    }
  },

  refreshStationsAndSelectFirst: async () => {
    const { setError, setIsLoading, loadStationData } = get();
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStations();
      set({
        stations: data,
        stationStats: null,
        dailySummary: [],
        allDailySummaries: [],
        anomalySegments: [],
        highlightedSegmentId: null,
        highlightedDates: new Set()
      });
      if (data.length > 0) {
        const firstStation = data[0];
        set({ selectedStation: firstStation });
        await loadStationData(firstStation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载站点列表失败');
    } finally {
      setIsLoading(false);
    }
  },

  loadStationData: async (stationId) => {
    const { currentYear, currentMonth, setError, setIsLoading, setHighlightedSegment } = get();
    setIsLoading(true);
    setError(null);
    try {
      const [stats, allSummary, monthSummary] = await Promise.all([
        getStationStats(stationId),
        getDailySummaryAll(stationId),
        getDailySummary(stationId, currentYear, currentMonth)
      ]);

      const segments = buildAnomalySegments(allSummary);
      
      const target = findLatestMonthWithData(allSummary);
      let finalDailySummary = monthSummary;

      if (target && (target.year !== currentYear || target.month !== currentMonth)) {
        const freshMonthly = await getDailySummary(stationId, target.year, target.month);
        set({ currentYear: target.year, currentMonth: target.month });
        finalDailySummary = freshMonthly;
      }

      setHighlightedSegment(null);
      set({
        stationStats: stats,
        allDailySummaries: allSummary,
        anomalySegments: segments,
        dailySummary: finalDailySummary
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载站点数据失败');
    } finally {
      setIsLoading(false);
    }
  }
}));
