import { Router } from 'express';
import { store } from '../store/memory-store';
import { getProviderStatuses } from '../config';

export const metricsRoutes = Router();

metricsRoutes.get('/', (_req, res) => {
  res.json({
    providers: store.getAggregatedMetrics(),
    statuses: getProviderStatuses(),
  });
});

metricsRoutes.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({ history: store.getMetricsHistory(limit) });
});
