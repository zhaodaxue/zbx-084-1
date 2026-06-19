import React from 'react';
import { AlertTriangle, CalendarRange, Percent, ListX, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatDisplayDate } from '../utils/date';
import type { AnomalySegment } from '../types';

const AnomalySidebar: React.FC = () => {
  const {
    anomalySegments,
    highlightedSegmentId,
    selectedStation,
    allDailySummaries,
    setHighlightedSegment,
    jumpToMonthOfDate,
    openDayDetail,
    isLoading
  } = useAppStore();

  const handleSegmentClick = async (segment: AnomalySegment) => {
    if (!selectedStation) return;

    const isSameActive = highlightedSegmentId === segment.id;

    if (isSameActive) {
      setHighlightedSegment(null);
      return;
    }

    setHighlightedSegment(segment.id);
    await jumpToMonthOfDate(segment.startDate);
    await openDayDetail(segment.startDate);
  };

  if (!selectedStation) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col">
        <SidebarHeader />
        <EmptyState
          icon={<ListX className="w-10 h-10 opacity-30" />}
          title="请先选择站点"
          desc="选择供水站点后，自动扫描连续异常集中段"
        />
      </div>
    );
  }

  if (isLoading && anomalySegments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col">
        <SidebarHeader />
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (anomalySegments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col">
        <SidebarHeader />
        <EmptyState
          icon={<AlertTriangle className="w-10 h-10 opacity-30 text-green-500" />}
          title="暂无连续异常段"
          desc="该站点尚未出现连续 2 天及以上的异常，水质状况良好"
        />
        {allDailySummaries.length > 0 && (
          <div className="px-4 pb-4">
            <p className="text-xs text-slate-500 text-center">
              已扫描 {allDailySummaries.length} 个监测日
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col overflow-hidden">
      <SidebarHeader extra={
        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          共 {anomalySegments.length} 段
        </span>
      } />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {anomalySegments.map((seg, idx) => (
          <SegmentCard
            key={seg.id}
            segment={seg}
            index={idx + 1}
            isActive={highlightedSegmentId === seg.id}
            onClick={() => handleSegmentClick(seg)}
          />
        ))}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          规则：连续 2 天及以上异常合并为一段；段内显示异常天数占区间总天数的比例。点击段可联动日历高亮并跳转起始日月。
        </p>
      </div>
    </div>
  );
};

const SidebarHeader: React.FC<{ extra?: React.ReactNode }> = ({ extra }) => (
  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 text-white">
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 text-orange-400" />
      <h3 className="text-base font-semibold">异常集中段复盘</h3>
    </div>
    {extra}
  </div>
);

interface SegmentCardProps {
  segment: AnomalySegment;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ segment, index, isActive, onClick }) => {
  const ratioText = `${(segment.anomalyRatio * 100).toFixed(0)}%`;
  const isSevere = segment.anomalyRatio >= 0.9;
  const isMedium = segment.anomalyRatio >= 0.6;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-xl p-3 border-2 transition-all duration-200
        ${isActive
          ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-200'
          : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`
            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
            ${isSevere ? 'bg-red-500' : isMedium ? 'bg-orange-500' : 'bg-amber-500'}
          `}>
            {index}
          </span>
          <div className="flex items-center gap-1 text-slate-700">
            <CalendarRange className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{segment.durationDays} 天连续</span>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'rotate-90 text-orange-500' : 'text-slate-400'}`} />
      </div>

      <div className="space-y-1.5 pl-8">
        <p className="text-sm font-semibold text-slate-800 leading-snug">
          {formatDisplayDate(segment.startDate)}
          <span className="mx-1 text-slate-400">～</span>
          {formatDisplayDate(segment.endDate)}
        </p>

        <div className="flex items-center gap-3 text-xs">
          <div className={`flex items-center gap-1 ${isSevere ? 'text-red-600' : isMedium ? 'text-orange-600' : 'text-amber-600'}`}>
            <Percent className="w-3 h-3" />
            <span className="font-semibold">异常占比 {ratioText}</span>
          </div>
          <div className="text-slate-500">
            {segment.anomalyDaysCount}/{segment.durationDays} 天异常
          </div>
        </div>

        {isActive && (
          <div className="mt-2 pt-2 border-t border-orange-200 text-[11px] text-orange-700 font-medium flex items-center gap-1">
            <ChevronRight className="w-3 h-3 rotate-90" />
            日历已高亮 · 跳转起始日月 + 明细已打开
          </div>
        )}
      </div>
    </button>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center text-slate-500">
    <div className="mb-4 text-slate-400">{icon}</div>
    <p className="text-base font-medium text-slate-600 mb-1">{title}</p>
    <p className="text-sm text-slate-400 leading-relaxed max-w-[220px]">{desc}</p>
  </div>
);

export default AnomalySidebar;
