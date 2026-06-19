import React from 'react';
import { X, AlertTriangle, CheckCircle, Droplets, Beaker } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatDisplayDate } from '../utils/date';
import type { WaterRecord } from '../types';

const DayDetailModal: React.FC = () => {
  const {
    isModalOpen,
    selectedDate,
    selectedStation,
    dayDetail,
    isLoading,
    setIsModalOpen,
    resetSelection
  } = useAppStore();

  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      resetSelection();
    }, 200);
  };

  if (!isModalOpen) return null;

  const isAnomalyDay = dayDetail.some((record) => {
    const phDeviation = Math.abs(record.ph - 7.0);
    return record.turbidity_ntu > 1.0 || phDeviation > 0.5;
  });

  const maxTurbidity = Math.max(...dayDetail.map((r) => r.turbidity_ntu), 0);
  const maxPhDeviation = Math.max(...dayDetail.map((r) => Math.abs(r.ph - 7.0)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <div
          className={`px-6 py-4 ${
            isAnomalyDay
              ? 'bg-gradient-to-r from-orange-500 to-amber-500'
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAnomalyDay ? (
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedDate ? formatDisplayDate(selectedDate) : ''}
                </h3>
                <p className="text-white/80 text-sm">
                  站点: {selectedStation} · {isAnomalyDay ? '异常日' : '正常日'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                <Droplets className="w-4 h-4" />
                浊度最大值
              </div>
              <p className={`text-2xl font-bold ${
                maxTurbidity > 1.0 ? 'text-orange-600' : 'text-slate-800'
              }`}>
                {maxTurbidity.toFixed(2)}
                <span className="text-sm font-normal text-slate-500 ml-1">NTU</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">阈值: 1.0 NTU</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                <Beaker className="w-4 h-4" />
                pH 偏差最大值
              </div>
              <p className={`text-2xl font-bold ${
                maxPhDeviation > 0.5 ? 'text-orange-600' : 'text-slate-800'
              }`}>
                {maxPhDeviation.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">阈值: 0.5 (偏离7.0)</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                <CheckCircle className="w-4 h-4" />
                记录条数
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {dayDetail.length}
                <span className="text-sm font-normal text-slate-500 ml-1">条</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">原始记录明细</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dayDetail.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Droplets className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>当日无数据记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-medium text-slate-600">序号</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">站点</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">浊度 (NTU)</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">pH</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">pH偏差</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">状态</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">导入时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dayDetail.map((record: WaterRecord, idx: number) => {
                    const phDeviation = Math.abs(record.ph - 7.0);
                    const isRecordAnomaly = record.turbidity_ntu > 1.0 || phDeviation > 0.5;

                    return (
                      <tr
                        key={record.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isRecordAnomaly ? 'bg-orange-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                        <td className="px-4 py-3 text-slate-800 font-medium">
                          {record.station_id}
                        </td>
                        <td className={`px-4 py-3 font-mono ${
                          record.turbidity_ntu > 1.0 ? 'text-orange-600 font-semibold' : 'text-slate-700'
                        }`}>
                          {record.turbidity_ntu.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {record.ph.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 font-mono ${
                          phDeviation > 0.5 ? 'text-orange-600 font-semibold' : 'text-slate-700'
                        }`}>
                          {phDeviation.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {isRecordAnomaly ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              异常
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              <CheckCircle className="w-3 h-3" />
                              正常
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(record.created_at).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DayDetailModal;
