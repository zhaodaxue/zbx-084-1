import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { importCsv, downloadSampleCsv } from '../utils/api';
import { useAppStore } from '../store/useAppStore';
import type { ImportReport } from '../types';

const CsvUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { setImportReport, setError, setLastImportTime, refreshStationsAndSelectFirst, setStationStats, setDailySummary, setSelectedStation } = useAppStore();

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('请上传CSV格式的文件');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const report: ImportReport = await importCsv(file);
      setImportReport(report);
      setStationStats(null);
      setDailySummary([]);
      setSelectedStation(null);
      setLastImportTime();
      await refreshStationsAndSelectFirst();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  }, [setError, setImportReport, setLastImportTime, refreshStationsAndSelectFirst, setStationStats, setDailySummary, setSelectedStation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          数据导入
        </h3>
        <button
          onClick={downloadSampleCsv}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <FileText className="w-4 h-4" />
          下载样例CSV
        </button>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-3">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-600">正在导入数据...</p>
            </div>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-slate-700 font-medium">
                  拖拽CSV文件到此处，或点击上传
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  支持 .csv 格式，最大 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <ImportReportDisplay />
    </div>
  );
};

const ImportReportDisplay: React.FC = () => {
  const { importReport, setImportReport } = useAppStore();

  if (!importReport) return null;

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-slate-800 flex items-center gap-2">
          {importReport.skipped_rows > 0 ? (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          导入报告
        </h4>
        <button
          onClick={() => setImportReport(null)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-3 text-sm">
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-slate-500 text-xs">总行数</p>
          <p className="text-xl font-bold text-slate-800">{importReport.total_rows}</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-slate-500 text-xs">成功导入</p>
          <p className="text-xl font-bold text-green-600">{importReport.imported_rows}</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-slate-500 text-xs">重复跳过</p>
          <p className="text-xl font-bold text-blue-600">{importReport.duplicate_rows || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-slate-500 text-xs">其他跳过</p>
          <p className="text-xl font-bold text-amber-600">{importReport.skipped_rows - (importReport.duplicate_rows || 0)}</p>
        </div>
      </div>

      {importReport.skipped_reasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2">跳过原因：</p>
          <ul className="text-xs text-slate-600 space-y-1">
            {importReport.skipped_reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-amber-500">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CsvUploader;
