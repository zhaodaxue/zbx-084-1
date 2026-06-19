import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { importCsv } from '../services/import.service.js';
import { ApiResponse, ImportReport } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/csv' ||
        path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('只允许上传CSV文件'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export const uploadMiddleware = upload.single('file');

export async function handleImport(req: Request, res: Response<ApiResponse<ImportReport>>): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: '请上传CSV文件'
      });
      return;
    }

    const report = await importCsv(req.file.path);
    
    res.json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '导入失败'
    });
  }
}
