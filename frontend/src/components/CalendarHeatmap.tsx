import React, { useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getDailySummary, getDayDetail } from '../utils/api';
import { generateCalendarDays, getMonthName, getWeekdayNames } from '../utils/date';
import { useAppStore } from '../store/useAppStore';
import type { DailySummary } from '../types';

const CalendarHeatmap: React.FC = () => {
  const {
    selectedStation,
    currentYear,
    currentMonth,
    dailySummary,
    setCurrentYear,
    setCurrentMonth,
    setDailySummary,
    setSelectedDate,
    setDayDetail,
    setIsLoading,
    setError,
    setIsModalOpen
  } = useAppStore();

  const loadDailySummary = useCallback(async () => {
    if (!selectedStation) return;

    setIsLoading(true);
    setError(null);
    try {
      const data: DailySummary[] = await getDailySummary(
        selectedStation,
        currentYear,
        currentMonth
      );
      setDailySummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载日历数据失败');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStation, currentYear, currentMonth, setDailySummary, setIsLoading, setError]);

  useEffect(() => {
    loadDailySummary();
  }, [loadDailySummary]);

  const summaryMap = useMemo(() => {
    const map = new Map<string, {
      is_anomaly: boolean;
      max_turbidity: number;
      max_ph_deviation: number;
    }>();

    dailySummary.forEach((item) => {
      map.set(item.date, {
        is_anomaly: item.is_anomaly,
        max_turbidity: item.max_turbidity,
        max_ph_deviation: item.max_ph_deviation
      });
    });

    return map;
  }, [dailySummary]);

  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentYear, currentMonth, summaryMap);
  }, [currentYear, currentMonth, summaryMap]);

  const weekdayNames = getWeekdayNames();

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = async (date: string) => {
    if (!selectedStation) return;

    setSelectedDate(date);
    setIsLoading(true);
    try {
      const records = await getDayDetail(selectedStation, date);
      setDayDetail(records);
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载日期明细失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getDayCellStyle = (day: typeof calendarDays[0]) => {
    if (!day.isCurrentMonth) {
      return 'bg-slate-50 text-slate-300';
    }

    if (!day.hasData) {
      return 'bg-slate-100 text-slate-400';
    }

    if (day.isAnomaly) {
      return 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer transform hover:scale-105 shadow-md';
    }

    return 'bg-green-500 hover:bg-green-600 text-white cursor-pointer transform hover:scale-105 shadow-md';
  };

  const anomalyCount = useMemo(() => {
    return calendarDays.filter(
      (d) => d.isCurrentMonth && d.hasData && d.isAnomaly
    ).length;
  }, [calendarDays]);

  const normalCount = useMemo(() => {
    return calendarDays.filter(
      (d) => d.isCurrentMonth && d.hasData && !d.isAnomaly
    ).length;
  }, [calendarDays]);

  if (!selectedStation) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="text-center py-16 text-slate-500">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">请先选择站点查看日历热力图</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">
                {currentYear}年 {getMonthName(currentMonth)}
              </h2>
              <div className="flex items-center justify-center gap-4 mt-1 text-sm text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  正常 {normalCount}天
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  异常 {anomalyCount}天
                </span>
              </div>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>正常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span>异常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-200" />
              <span>无数据</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekdayNames.map((name, idx) => (
            <div
              key={name}
              className={`text-center text-sm font-medium py-2 ${
                idx === 0 || idx === 6 ? 'text-red-500' : 'text-slate-600'
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => (
            <div
              key={`${day.date}-${idx}`}
              onClick={() => day.isCurrentMonth && day.hasData && handleDayClick(day.date)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-xl
                text-sm font-medium transition-all duration-200
                ${getDayCellStyle(day)}
              `}
              title={
                day.hasData
                  ? `${day.date}\n浊度最大值: ${day.maxTurbidity?.toFixed(2)} NTU\npH偏差最大值: ${day.maxPhDeviation?.toFixed(2)}`
                  : day.date
              }
            >
              <span>{day.day}</span>
              {day.isCurrentMonth && day.hasData && (
                <span className="text-[10px] mt-0.5 opacity-80">
                  {day.maxTurbidity?.toFixed(1)}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <h4 className="text-sm font-medium text-slate-700 mb-2">判定规则</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• 浊度最大值 ＞ 1.0 NTU 记为异常</li>
            <li>• pH 与 7.0 的偏差绝对值 ＞ 0.5 记为异常</li>
            <li>• 点击单元格可查看当日原始明细</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
