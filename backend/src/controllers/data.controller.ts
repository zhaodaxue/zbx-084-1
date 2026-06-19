import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getStations, getDailySummary, getDailySummaryAll, getDayDetail, getStationStats } from '../services/data.service.js';
import { ApiResponse, DailySummary, WaterRecord } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handleGetStations(_req: Request, res: Response<ApiResponse<string[]>>): Promise<void> {
  try {
    const stations = await getStations();
    res.json({
      success: true,
      data: stations
    });
  } catch (err) {
    console.error('Get stations error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '获取站点列表失败'
    });
  }
}

export async function handleGetDailySummary(req: Request, res: Response<ApiResponse<DailySummary[]>>): Promise<void> {
  try {
    const { station_id, year, month } = req.query;

    if (!station_id || typeof station_id !== 'string') {
      res.status(400).json({
        success: false,
        error: '缺少station_id参数'
      });
      return;
    }

    const yearNum = parseInt(year as string, 10);
    const monthNum = parseInt(month as string, 10);

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      res.status(400).json({
        success: false,
        error: '无效的year参数'
      });
      return;
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      res.status(400).json({
        success: false,
        error: '无效的month参数'
      });
      return;
    }

    const summary = await getDailySummary(station_id, yearNum, monthNum);
    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error('Get daily summary error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '获取日汇总数据失败'
    });
  }
}

export async function handleGetDailySummaryAll(req: Request, res: Response<ApiResponse<DailySummary[]>>): Promise<void> {
  try {
    const { station_id } = req.query;

    if (!station_id || typeof station_id !== 'string') {
      res.status(400).json({
        success: false,
        error: '缺少station_id参数'
      });
      return;
    }

    const summary = await getDailySummaryAll(station_id);
    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error('Get daily summary all error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '获取全部日汇总数据失败'
    });
  }
}

export async function handleGetDayDetail(req: Request, res: Response<ApiResponse<WaterRecord[]>>): Promise<void> {
  try {
    const { station_id, date } = req.query;

    if (!station_id || typeof station_id !== 'string') {
      res.status(400).json({
        success: false,
        error: '缺少station_id参数'
      });
      return;
    }

    if (!date || typeof date !== 'string') {
      res.status(400).json({
        success: false,
        error: '缺少date参数'
      });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      res.status(400).json({
        success: false,
        error: 'date参数格式错误，应为YYYY-MM-DD'
      });
      return;
    }

    const records = await getDayDetail(station_id, date);
    res.json({
      success: true,
      data: records
    });
  } catch (err) {
    console.error('Get day detail error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '获取日期明细失败'
    });
  }
}

export async function handleGetStationStats(req: Request, res: Response<ApiResponse<{
  total_days: number;
  anomaly_days: number;
  normal_days: number;
  total_records: number;
}>>): Promise<void> {
  try {
    const { station_id } = req.query;

    if (!station_id || typeof station_id !== 'string') {
      res.status(400).json({
        success: false,
        error: '缺少station_id参数'
      });
      return;
    }

    const stats = await getStationStats(station_id);
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('Get station stats error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '获取统计数据失败'
    });
  }
}

export async function handleDownloadSample(_req: Request, res: Response): Promise<void> {
  try {
    const samplePath = path.join(__dirname, '../../../sample-data/sample.csv');
    
    if (!fs.existsSync(samplePath)) {
      res.status(404).json({
        success: false,
        error: '样例文件不存在'
      });
      return;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sample.csv"');
    
    const fileStream = fs.createReadStream(samplePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Download sample error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '下载样例文件失败'
    });
  }
}
