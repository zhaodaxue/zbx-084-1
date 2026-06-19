import React from 'react';
import { Activity, Droplets, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const StatsCard: React.FC = () => {
  const { stationStats, selectedStation, isLoading } = useAppStore();

  if (!selectedStation) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-600" />
          数据统计
        </h3>
        <div className="text-center py-8 text-slate-500">
          <Droplets className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>请先选择站点</p>
        </div>
      </div>
    );
  }

  if (isLoading && !stationStats) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-600" />
          数据统计
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stationStats) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-600" />
          数据统计
        </h3>
        <div className="text-center py-8 text-slate-500">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>暂无统计数据</p>
        </div>
      </div>
    );
  }

  const anomalyRate = stationStats.total_days > 0
    ? ((stationStats.anomaly_days / stationStats.total_days) * 100).toFixed(1)
    : '0';

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        数据统计
        <span className="text-sm font-normal text-slate-500">({selectedStation})</span>
      </h3>

      <div className="space-y-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-slate-600">监测天数</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{stationStats.total_days}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm text-slate-600">异常天数</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">{stationStats.anomaly_days}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-slate-600">正常天数</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{stationStats.normal_days}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">异常率</span>
            <span className="text-xl font-bold text-slate-800">{anomalyRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${anomalyRate}%`,
                backgroundColor: parseFloat(anomalyRate) > 20 ? '#f97316' : '#22c55e'
              }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 text-center pt-2">
          共 {stationStats.total_records} 条原始记录
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
