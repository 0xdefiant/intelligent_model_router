import { AnomalySeverity, AnomalyType, type AnomalyFlag, type Expense } from '../shared';
import { v4 as uuid } from 'uuid';
import { getAvailableProvider } from '../providers';

export function detectAnomalies(expenses: Expense[]): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];

  // DUPLICATE: same vendor + similar amount within 2 days
  for (let i = 0; i < expenses.length; i++) {
    for (let j = i + 1; j < expenses.length; j++) {
      const a = expenses[i];
      const b = expenses[j];
      if (
        a.vendor.toLowerCase() === b.vendor.toLowerCase() &&
        Math.abs(a.amount - b.amount) < 0.01
      ) {
        const daysDiff = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 2) {
          flags.push({
            id: uuid(),
            expenseId: b.id,
            expense: b,
            type: AnomalyType.DUPLICATE,
            severity: AnomalySeverity.HIGH,
            confidence: 0.9,
            ruleDetails: `Duplicate of expense from ${a.date}: same vendor "${a.vendor}" and amount $${a.amount.toFixed(2)} within ${daysDiff.toFixed(0)} day(s)`,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  // ROUND_NUMBER: amounts ending in 00 over $100
  for (const exp of expenses) {
    if (exp.amount >= 100 && exp.amount % 100 === 0) {
      flags.push({
        id: uuid(),
        expenseId: exp.id,
        expense: exp,
        type: AnomalyType.ROUND_NUMBER,
        severity: AnomalySeverity.LOW,
        confidence: 0.6,
        ruleDetails: `Round number amount: $${exp.amount.toFixed(2)} — may indicate estimated or fabricated expense`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // WEEKEND_SPIKE: expenses on Saturday/Sunday
  for (const exp of expenses) {
    const day = new Date(exp.date).getDay();
    if (day === 0 || day === 6) {
      flags.push({
        id: uuid(),
        expenseId: exp.id,
        expense: exp,
        type: AnomalyType.WEEKEND_SPIKE,
        severity: AnomalySeverity.MEDIUM,
        confidence: 0.7,
        ruleDetails: `Expense submitted on ${day === 0 ? 'Sunday' : 'Saturday'} — unusual for business expenses`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // UNUSUAL_AMOUNT: amount > 3x the average for that category
  const categoryAvgs = new Map<string, { sum: number; count: number }>();
  for (const exp of expenses) {
    const entry = categoryAvgs.get(exp.category) || { sum: 0, count: 0 };
    entry.sum += exp.amount;
    entry.count++;
    categoryAvgs.set(exp.category, entry);
  }

  for (const exp of expenses) {
    const entry = categoryAvgs.get(exp.category);
    if (entry && entry.count >= 3) {
      const avg = entry.sum / entry.count;
      if (exp.amount > avg * 3) {
        flags.push({
          id: uuid(),
          expenseId: exp.id,
          expense: exp,
          type: AnomalyType.UNUSUAL_AMOUNT,
          severity: AnomalySeverity.HIGH,
          confidence: 0.85,
          ruleDetails: `Amount $${exp.amount.toFixed(2)} is ${(exp.amount / avg).toFixed(1)}x the category average of $${avg.toFixed(2)} for "${exp.category}"`,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // FREQUENCY_SPIKE: same vendor > 3 times in a week
  const vendorByWeek = new Map<string, Map<string, Expense[]>>();
  for (const exp of expenses) {
    const d = new Date(exp.date);
    const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
    const vendor = exp.vendor.toLowerCase();
    if (!vendorByWeek.has(vendor)) vendorByWeek.set(vendor, new Map());
    const weeks = vendorByWeek.get(vendor)!;
    if (!weeks.has(weekKey)) weeks.set(weekKey, []);
    weeks.get(weekKey)!.push(exp);
  }

  for (const [vendor, weeks] of vendorByWeek) {
    for (const [weekKey, exps] of weeks) {
      if (exps.length > 3) {
        for (const exp of exps.slice(3)) {
          flags.push({
            id: uuid(),
            expenseId: exp.id,
            expense: exp,
            type: AnomalyType.FREQUENCY_SPIKE,
            severity: AnomalySeverity.MEDIUM,
            confidence: 0.75,
            ruleDetails: `Vendor "${vendor}" charged ${exps.length} times in one week — possible duplicate billing`,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  // Deduplicate: one flag per expense per type
  const seen = new Set<string>();
  return flags.filter(f => {
    const key = `${f.expenseId}-${f.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function explainAnomaly(flag: AnomalyFlag, context: Expense[]): Promise<string> {
  const provider = getAvailableProvider();
  if (!provider) {
    return `This expense was flagged for ${flag.type.replace(/_/g, ' ')}: ${flag.ruleDetails}. No AI provider is available for detailed analysis.`;
  }

  try {
    const result = await provider.analyzeAnomaly(flag.expense, context);
    return result.explanation;
  } catch (err) {
    console.error('[AnomalyDetector] AI explanation failed:', err);
    return `This expense was flagged for ${flag.type.replace(/_/g, ' ')}: ${flag.ruleDetails}`;
  }
}
