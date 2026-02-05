import { Router } from 'express';
import { store } from '../store/memory-store';
import { detectAnomalies, explainAnomaly } from '../services/anomaly-detector';

export const anomalyRoutes = Router();

anomalyRoutes.post('/detect', async (req, res, next) => {
  try {
    const expenses = Array.from(store.expenses.values());
    const flags = detectAnomalies(expenses);

    // Clear old flags and store new ones
    store.anomalyFlags = [];
    for (const flag of flags) {
      store.addAnomalyFlag(flag);
    }

    res.json({ flags });
  } catch (err) {
    next(err);
  }
});

anomalyRoutes.get('/flags', (req, res) => {
  const severity = req.query.severity as string | undefined;
  const flags = store.getAnomalyFlags(severity);
  res.json({ flags });
});

anomalyRoutes.get('/flags/:id', (req, res) => {
  const flag = store.getAnomalyFlag(req.params.id);
  if (!flag) {
    res.status(404).json({ error: 'Flag not found' });
    return;
  }
  res.json({ flag });
});

anomalyRoutes.post('/explain', async (req, res, next) => {
  try {
    const { flagId } = req.body;
    const flag = store.getAnomalyFlag(flagId);
    if (!flag) {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    const context = Array.from(store.expenses.values());
    const explanation = await explainAnomaly(flag, context);

    // Update the flag with the explanation
    flag.aiExplanation = explanation;

    res.json({ explanation });
  } catch (err) {
    next(err);
  }
});
