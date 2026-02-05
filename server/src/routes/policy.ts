import { Router } from 'express';
import { store } from '../store/memory-store';
import { parsePolicy, evaluateExpenseAgainstPolicy, chatWithPolicyAgent } from '../services/policy-engine';

export const policyRoutes = Router();

policyRoutes.post('/set', async (req, res, next) => {
  try {
    const { policyText } = req.body;
    if (!policyText) {
      res.status(400).json({ error: 'policyText is required' });
      return;
    }

    store.setPolicyText(policyText);
    const parsed = await parsePolicy(policyText);
    store.setPolicyRules(parsed);

    res.json({ parsed });
  } catch (err) {
    next(err);
  }
});

policyRoutes.post('/evaluate', async (req, res, next) => {
  try {
    const { expenseId } = req.body;
    if (!expenseId) {
      res.status(400).json({ error: 'expenseId is required' });
      return;
    }

    const expense = store.expenses.get(expenseId);
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    const result = await evaluateExpenseAgainstPolicy(expense, store.policyRules, store.policyText);
    res.json({ result });
  } catch (err) {
    next(err);
  }
});

policyRoutes.post('/chat', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    const expenses = Array.from(store.expenses.values());
    const result = await chatWithPolicyAgent(message, history, expenses, store.policyRules, store.policyText);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
