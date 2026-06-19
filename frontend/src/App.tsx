import React, { useEffect } from 'react';
import { Droplets, AlertCircle, X } from 'lucide-react';
import CsvUploader from './components/CsvUploader';
import StationSelector from './components/StationSelector';
import StatsCard from './components/StatsCard';
import CalendarHeatmap from './components/CalendarHeatmap';
import DayDetailModal from './components/DayDetailModal';
import { useAppStore } from './store/useAppStore';
import { downloadSampleCsv } from './utils/api';

const App: React.FC = () => {
  const { error, setError, refreshStationsAndSelectFirst, stations } = useAppStore();

  useEffect(() => {
    refreshStationsAndSelectFirst();
  }, [refreshStationsAndSelectFirst]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Droplets className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">乡镇供水站水质监测</h1>
                <p className="text-slate-400 text-sm">浊度与 pH 异常分析系统</p>
              </div>
            </div>

            <button
              onClick={downloadSampleCsv}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
            >
              <Droplets className="w-4 h-4" />
              下载样例CSV
            </button>
          </div>
        </div>
        {stations.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-3 bg-black/20">
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <span className="text-slate-400">已导入站点:</span>
              <div className="flex flex-wrap gap-2">
                {stations.map((station) => (
                  <span
                    key={station}
                    className="px-2 py-0.5 bg-white/10 rounded-full text-xs"
                  >
                    {station}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">错误</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
          <CsvUploader />
          <StationSelector />
          <StatsCard />
        </div>

        <div className="lg:col-span-3">
          <CalendarHeatmap />
        </div>
        </div>
      </main>

      <footer className="mt-12 py-6 border-t border-slate-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
          <p>乡镇供水站水质监测系统 · 数据仅用于内部监测分析</p>
        </div>
      </footer>

      <DayDetailModal />
    </div>
  );
};

export default App;
