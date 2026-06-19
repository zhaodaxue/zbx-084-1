import fs from 'fs';
import csvParser from 'csv-parser';
import { getDb } from '../models/db.js';
import { WaterRecord, ImportReport } from '../types/index.js';
import { isValidDate } from '../utils/anomaly.js';

export async function importCsv(filePath: string): Promise<ImportReport> {
  const report: ImportReport = {
    total_rows: 0,
    imported_rows: 0,
    skipped_rows: 0,
    skipped_reasons: []
  };

  const records: WaterRecord[] = [];
  const skippedReasons: Map<string, number> = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath, 'utf-8')
      .pipe(csvParser({
        mapHeaders: ({ header }) => header.trim().toLowerCase()
      }))
      .on('data', (row) => {
        report.total_rows++;

        const date = String(row.date || '').trim();
        const stationId = String(row.station_id || '').trim();
        const turbidityStr = String(row.turbidity_ntu || '').trim();
        const phStr = String(row.ph || '').trim();

        if (!date || !isValidDate(date)) {
          report.skipped_rows++;
          const reason = '缺少或无效的date字段';
          skippedReasons.set(reason, (skippedReasons.get(reason) || 0) + 1);
          return;
        }

        if (!stationId) {
          report.skipped_rows++;
          const reason = '缺少station_id字段';
          skippedReasons.set(reason, (skippedReasons.get(reason) || 0) + 1);
          return;
        }

        const turbidity = parseFloat(turbidityStr);
        if (isNaN(turbidity)) {
          report.skipped_rows++;
          const reason = 'turbidity_ntu不是有效数字';
          skippedReasons.set(reason, (skippedReasons.get(reason) || 0) + 1);
          return;
        }

        const ph = parseFloat(phStr);
        if (isNaN(ph)) {
          report.skipped_rows++;
          const reason = 'ph不是有效数字';
          skippedReasons.set(reason, (skippedReasons.get(reason) || 0) + 1);
          return;
        }

        records.push({
          date,
          station_id: stationId,
          turbidity_ntu: turbidity,
          ph
        });

        report.imported_rows++;
      })
      .on('end', async () => {
        try {
          const db = await getDb();
          
          const stmt = await db.prepare(`
            INSERT INTO water_records (date, station_id, turbidity_ntu, ph)
            VALUES (?, ?, ?, ?)
          `);

          for (const record of records) {
            await stmt.run(record.date, record.station_id, record.turbidity_ntu, record.ph);
          }

          await stmt.finalize();

          report.skipped_reasons = Array.from(skippedReasons.entries()).map(
            ([reason, count]) => `${reason}: ${count}行`
          );

          fs.unlinkSync(filePath);
          resolve(report);
        } catch (err) {
          fs.unlinkSync(filePath);
          reject(err);
        }
      })
      .on('error', (err) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        reject(err);
      });
  });
}
