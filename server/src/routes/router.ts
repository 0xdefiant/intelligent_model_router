import { Router } from 'express';
import { upload } from '../middleware/upload';
import { routeAndExecute } from '../services/model-router';

export const routerRoutes = Router();

routerRoutes.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    const taskType = req.body?.taskType;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    let text = '';
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      text = file.buffer.toString('utf-8');
    } else if (file.mimetype.startsWith('image/')) {
      // For images, we pass a description since OCR requires vision models
      text = `[Image file: ${file.originalname}, size: ${file.size} bytes. This is a receipt image that needs OCR processing.]`;
    } else {
      text = file.buffer.toString('utf-8');
    }

    const result = await routeAndExecute({
      text,
      fileName: file.originalname,
      fileSize: file.size,
      taskTypeHint: taskType || undefined,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});
