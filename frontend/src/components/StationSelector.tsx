import React, { useCallback } from 'react';
import { Building2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const StationSelector: React.FC = () => {
  const {
    stations,
    selectedStation,
    setSelectedStation,
    loadStationData,
    refreshStationsAndSelectFirst,
    setIsLoading,
    setError
  } = useAppStore();

  const handleStationChange = useCallback(async (stationId: string) => {
    setSelectedStation(stationId);
    if (stationId) {
      setIsLoading(true);
      try {
        await loadStationData(stationId);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载统计数据失败');
      } finally {
        setIsLoading(false);
      }
    }
  }, [setSelectedStation, loadStationData, setIsLoading, setError]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          选择站点
        </h3>
        <button
          onClick={refreshStationsAndSelectFirst}
          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="刷新站点列表"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <select
        value={selectedStation || ''}
        onChange={(e) => handleStationChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        disabled={stations.length === 0}
      >
        {stations.length === 0 ? (
          <option value="">暂无数据，请先导入CSV</option>
        ) : (
          <>
            <option value="" disabled>请选择站点</option>
            {stations.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};

export default StationSelector;
