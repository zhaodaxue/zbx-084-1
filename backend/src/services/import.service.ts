import fs from 'fs';
import csvParser from 'csv-parser';
import { getDb } from '../models/db.js';
import { WaterRecord, ImportReport } from '../types/index.js';
import { isValidDate } from '../utils/anomaly.js';

export async function importCsv(filePath: string): Promise<ImportReport> {
  const report: ImportReport = {
    total_rows: 0,
    imported_rows: 0,
    duplicate_rows: 0,
    skipped_rows: 0,
    skipped_reasons: []
  };

  const records: WaterRecord[] = [];
  const skippedReasons: Map<string, number> = new Map();
  const seenKeys: Set<string> = new Set();

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

        const dedupKey = `${date}|${stationId}|${turbidity.toFixed(6)}|${ph.toFixed(6)}`;
        if (seenKeys.has(dedupKey)) {
          report.duplicate_rows++;
          const reason = '与CSV内其他行重复';
          skippedReasons.set(reason, (skippedReasons.get(reason) || 0) + 1);
          return;
        }
        seenKeys.add(dedupKey);

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

          let dbDuplicateCount = 0;
          let actualImportCount = 0;

          const checkStmt = await db.prepare(`
            SELECT COUNT(*) as cnt FROM water_records
            WHERE date = ? AND station_id = ? 
              AND ABS(turbidity_ntu - ?) < 0.000001 
              AND ABS(ph - ?) < 0.000001
          `);

          const insertStmt = await db.prepare(`
            INSERT INTO water_records (date, station_id, turbidity_ntu, ph)
            VALUES (?, ?, ?, ?)
          `);

          for (const record of records) {
            const result = await checkStmt.get(
              record.date,
              record.station_id,
              record.turbidity_ntu,
              record.ph
            ) as { cnt: number };

            if (result && result.cnt > 0) {
              dbDuplicateCount++;
            } else {
              await insertStmt.run(record.date, record.station_id, record.turbidity_ntu, record.ph);
              actualImportCount++;
            }
          }

          await checkStmt.finalize();
          await insertStmt.finalize();

          report.duplicate_rows += dbDuplicateCount;
          report.imported_rows = actualImportCount;
          report.skipped_rows += dbDuplicateCount;

          if (dbDuplicateCount > 0) {
            skippedReasons.set('与数据库已有记录重复', dbDuplicateCount);
          }

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
