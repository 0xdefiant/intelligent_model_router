import express from 'express';
import cors from 'cors';
import path from 'path';
import { config, getProviderStatuses } from './config';
import { errorHandler } from './middleware/error-handler';
import { routerRoutes } from './routes/router';
import { anomalyRoutes } from './routes/anomaly';
import { policyRoutes } from './routes/policy';
import { expenseRoutes } from './routes/expenses';
import { metricsRoutes } from './routes/metrics';
import { seedExpenses } from './services/seed';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth endpoint
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (password === config.appPassword) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false, error: 'Invalid password' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  const statuses = getProviderStatuses();
  res.json({
    status: 'ok',
    providers: statuses,
    availableProviders: statuses.filter(s => s.available).map(s => s.provider),
  });
});

// Routes
app.use('/api/route', routerRoutes);
app.use('/api/anomaly', anomalyRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/metrics', metricsRoutes);

// Serve React frontend in production
const clientDist = path.resolve(import.meta.dir, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

// Seed data on startup
seedExpenses();

app.listen(config.port, () => {
  const statuses = getProviderStatuses();
  const available = statuses.filter(s => s.available);
  console.log(`Server running on port ${config.port}`);
  console.log(`Available AI providers: ${available.map(s => s.provider).join(', ') || 'none'}`);
  const missing = statuses.filter(s => !s.available);
  if (missing.length) {
    console.log(`Missing API keys: ${missing.map(s => s.reason).join(', ')}`);
  }
});
