import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { handleImport, uploadMiddleware } from './controllers/import.controller.js';
import {
  handleGetStations,
  handleGetDailySummary,
  handleGetDailySummaryAll,
  handleGetDayDetail,
  handleGetStationStats,
  handleDownloadSample
} from './controllers/data.controller.js';
import { getDb, closeDb } from './models/db.js';

dotenv.config();

void fileURLToPath;
void path;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/import', uploadMiddleware, handleImport);
app.get('/api/stations', handleGetStations);
app.get('/api/daily-summary', handleGetDailySummary);
app.get('/api/daily-summary-all', handleGetDailySummaryAll);
app.get('/api/day-detail', handleGetDayDetail);
app.get('/api/station-stats', handleGetStationStats);
app.get('/api/sample.csv', handleDownloadSample);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
});

async function startServer() {
  try {
    await getDb();
    console.log('Database initialized');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`${signal} received, shutting down...`);
      server.close(async () => {
        await closeDb();
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
