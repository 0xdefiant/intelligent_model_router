import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { parse } from 'csv-parse/sync';
import { store } from '../store/memory-store';
import { upload } from '../middleware/upload';
import type { Expense, ExpenseCategory } from '../shared';

export const expenseRoutes = Router();

expenseRoutes.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = store.getExpenses(page, limit);
  res.json(result);
});

expenseRoutes.post('/upload', upload.single('file'), (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const csv = file.buffer.toString('utf-8');
    const records = parse(csv, { columns: true, skip_empty_lines: true });

    const expenses: Expense[] = records.map((row: any) => ({
      id: uuid(),
      date: row.date || row.Date || new Date().toISOString().split('T')[0],
      vendor: row.vendor || row.Vendor || row.merchant || row.Merchant || 'Unknown',
      amount: parseFloat(row.amount || row.Amount || '0'),
      currency: row.currency || row.Currency || 'USD',
      category: (row.category || row.Category || 'other') as ExpenseCategory,
      description: row.description || row.Description || row.memo || row.Memo || '',
      submittedBy: row.submittedBy || row.employee || row.Employee || 'Unknown',
    }));

    store.addExpenses(expenses);
    res.json({ expenses, count: expenses.length });
  } catch (err) {
    next(err);
  }
});

expenseRoutes.delete('/:id', (req, res) => {
  const deleted = store.deleteExpense(req.params.id);
  res.json({ deleted });
});
