import { v4 as uuid } from 'uuid';
import type { Expense, ExpenseCategory } from '../shared';
import { store } from '../store/memory-store';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

const employees = ['Alice Chen', 'Bob Martinez', 'Carol Williams', 'David Kim', 'Eva Thompson'];

export function seedExpenses() {
  const expenses: Expense[] = [
    // Normal travel
    { id: uuid(), date: daysAgo(1), vendor: 'Uber', amount: 24.50, currency: 'USD', category: 'travel', description: 'Ride to client meeting', submittedBy: 'Alice Chen' },
    { id: uuid(), date: daysAgo(2), vendor: 'Delta Airlines', amount: 342.00, currency: 'USD', category: 'travel', description: 'Flight to NYC', submittedBy: 'Bob Martinez' },
    { id: uuid(), date: daysAgo(3), vendor: 'Hilton Hotels', amount: 189.00, currency: 'USD', category: 'travel', description: 'Hotel - 1 night NYC', submittedBy: 'Bob Martinez' },
    { id: uuid(), date: daysAgo(5), vendor: 'Lyft', amount: 18.75, currency: 'USD', category: 'travel', description: 'Airport pickup', submittedBy: 'Carol Williams' },
    { id: uuid(), date: daysAgo(7), vendor: 'United Airlines', amount: 287.00, currency: 'USD', category: 'travel', description: 'Flight to Chicago', submittedBy: 'David Kim' },
    { id: uuid(), date: daysAgo(10), vendor: 'Marriott', amount: 220.00, currency: 'USD', category: 'travel', description: 'Hotel - 1 night CHI', submittedBy: 'David Kim' },

    // Normal meals
    { id: uuid(), date: daysAgo(1), vendor: 'Blue Bottle Coffee', amount: 6.50, currency: 'USD', category: 'meals', description: 'Morning coffee', submittedBy: 'Alice Chen' },
    { id: uuid(), date: daysAgo(2), vendor: 'Sweetgreen', amount: 14.25, currency: 'USD', category: 'meals', description: 'Working lunch', submittedBy: 'Carol Williams' },
    { id: uuid(), date: daysAgo(3), vendor: 'DoorDash', amount: 32.80, currency: 'USD', category: 'meals', description: 'Team lunch delivery', submittedBy: 'Eva Thompson' },
    { id: uuid(), date: daysAgo(4), vendor: 'Chipotle', amount: 12.95, currency: 'USD', category: 'meals', description: 'Lunch', submittedBy: 'Bob Martinez' },
    { id: uuid(), date: daysAgo(6), vendor: 'Starbucks', amount: 5.75, currency: 'USD', category: 'meals', description: 'Coffee meeting', submittedBy: 'David Kim' },
    { id: uuid(), date: daysAgo(8), vendor: 'Grubhub', amount: 28.40, currency: 'USD', category: 'meals', description: 'Working dinner', submittedBy: 'Alice Chen' },

    // Software
    { id: uuid(), date: daysAgo(1), vendor: 'AWS', amount: 847.32, currency: 'USD', category: 'software', description: 'Monthly cloud hosting', submittedBy: 'Eva Thompson' },
    { id: uuid(), date: daysAgo(5), vendor: 'Slack', amount: 12.50, currency: 'USD', category: 'software', description: 'Pro plan - 1 seat', submittedBy: 'Alice Chen' },
    { id: uuid(), date: daysAgo(10), vendor: 'Zoom', amount: 14.99, currency: 'USD', category: 'software', description: 'Pro meeting plan', submittedBy: 'Carol Williams' },
    { id: uuid(), date: daysAgo(12), vendor: 'Google Cloud', amount: 523.18, currency: 'USD', category: 'software', description: 'GCP monthly', submittedBy: 'Eva Thompson' },
    { id: uuid(), date: daysAgo(15), vendor: 'GitHub', amount: 44.00, currency: 'USD', category: 'software', description: 'Team plan', submittedBy: 'David Kim' },
    { id: uuid(), date: daysAgo(20), vendor: 'Figma', amount: 15.00, currency: 'USD', category: 'software', description: 'Professional plan', submittedBy: 'Carol Williams' },

    // Office supplies
    { id: uuid(), date: daysAgo(3), vendor: 'Staples', amount: 67.42, currency: 'USD', category: 'office_supplies', description: 'Printer paper and pens', submittedBy: 'Alice Chen' },
    { id: uuid(), date: daysAgo(9), vendor: 'Amazon', amount: 34.99, currency: 'USD', category: 'office_supplies', description: 'USB-C hub', submittedBy: 'Bob Martinez' },

    // Equipment
    { id: uuid(), date: daysAgo(14), vendor: 'Apple Store', amount: 1299.00, currency: 'USD', category: 'equipment', description: 'MacBook Air M3', submittedBy: 'Eva Thompson' },
    { id: uuid(), date: daysAgo(18), vendor: 'Dell', amount: 249.00, currency: 'USD', category: 'equipment', description: 'External monitor', submittedBy: 'Bob Martinez' },

    // Marketing
    { id: uuid(), date: daysAgo(4), vendor: 'Google Ads', amount: 1500.00, currency: 'USD', category: 'marketing', description: 'Monthly ad spend', submittedBy: 'Carol Williams' },
    { id: uuid(), date: daysAgo(11), vendor: 'Facebook Ads', amount: 750.00, currency: 'USD', category: 'marketing', description: 'Social campaign', submittedBy: 'Carol Williams' },

    // Professional services
    { id: uuid(), date: daysAgo(6), vendor: 'WeWork', amount: 450.00, currency: 'USD', category: 'professional_services', description: 'Coworking space rental', submittedBy: 'David Kim' },

    // === SUSPICIOUS EXPENSES ===

    // Duplicate pair (same vendor, same amount, 1 day apart)
    { id: uuid(), date: daysAgo(2), vendor: 'Uber', amount: 24.50, currency: 'USD', category: 'travel', description: 'Ride to client meeting', submittedBy: 'Alice Chen' },

    // Round numbers (suspicious)
    { id: uuid(), date: daysAgo(3), vendor: 'Office Depot', amount: 500.00, currency: 'USD', category: 'office_supplies', description: 'Office supplies restock', submittedBy: 'Bob Martinez' },
    { id: uuid(), date: daysAgo(7), vendor: 'Consulting Inc', amount: 1000.00, currency: 'USD', category: 'professional_services', description: 'Consulting fees', submittedBy: 'Eva Thompson' },
    { id: uuid(), date: daysAgo(12), vendor: 'Training Corp', amount: 2000.00, currency: 'USD', category: 'professional_services', description: 'Training session', submittedBy: 'David Kim' },

    // Weekend expenses
    { id: uuid(), date: getNextWeekendDate(1), vendor: 'Nobu', amount: 285.00, currency: 'USD', category: 'meals', description: 'Client dinner', submittedBy: 'Alice Chen' },
    { id: uuid(), date: getNextWeekendDate(2), vendor: 'Ritz-Carlton', amount: 450.00, currency: 'USD', category: 'travel', description: 'Weekend hotel', submittedBy: 'Bob Martinez' },

    // Unusually high amounts
    { id: uuid(), date: daysAgo(4), vendor: 'The Capital Grille', amount: 892.50, currency: 'USD', category: 'meals', description: 'Team dinner - 4 people', submittedBy: 'Eva Thompson' },
    { id: uuid(), date: daysAgo(9), vendor: 'Private Jet Co', amount: 4500.00, currency: 'USD', category: 'travel', description: 'Charter flight', submittedBy: 'David Kim' },

    // More normal expenses to round out
    { id: uuid(), date: daysAgo(1), vendor: 'Postmates', amount: 19.99, currency: 'USD', category: 'meals', description: 'Lunch delivery', submittedBy: 'Bob Martinez' },
    { id: uuid(), date: daysAgo(2), vendor: 'Notion', amount: 10.00, currency: 'USD', category: 'software', description: 'Team workspace', submittedBy: 'Alice Chen' },
    { id: uuid(), date: daysAgo(5), vendor: 'Uber Eats', amount: 22.30, currency: 'USD', category: 'meals', description: 'Working dinner', submittedBy: 'David Kim' },
    { id: uuid(), date: daysAgo(6), vendor: 'FedEx', amount: 35.00, currency: 'USD', category: 'office_supplies', description: 'Package shipping', submittedBy: 'Carol Williams' },
    { id: uuid(), date: daysAgo(8), vendor: 'Hertz', amount: 89.00, currency: 'USD', category: 'travel', description: 'Car rental - 1 day', submittedBy: 'Eva Thompson' },
    { id: uuid(), date: daysAgo(11), vendor: 'LinkedIn', amount: 59.99, currency: 'USD', category: 'marketing', description: 'Premium business', submittedBy: 'Alice Chen' },
    { id: uuid(), date: daysAgo(13), vendor: 'Dropbox', amount: 19.99, currency: 'USD', category: 'software', description: 'Business plan', submittedBy: 'Bob Martinez' },
    { id: uuid(), date: daysAgo(16), vendor: 'Uber', amount: 31.25, currency: 'USD', category: 'travel', description: 'Client visit', submittedBy: 'Carol Williams' },
    { id: uuid(), date: daysAgo(19), vendor: 'Panera Bread', amount: 11.50, currency: 'USD', category: 'meals', description: 'Quick lunch', submittedBy: 'David Kim' },
    { id: uuid(), date: daysAgo(21), vendor: 'Adobe', amount: 54.99, currency: 'USD', category: 'software', description: 'Creative Cloud', submittedBy: 'Eva Thompson' },
    { id: uuid(), date: daysAgo(22), vendor: 'Uber', amount: 15.00, currency: 'USD', category: 'travel', description: 'Office commute', submittedBy: 'Alice Chen' },
    { id: uuid(), date: daysAgo(25), vendor: 'Best Buy', amount: 79.99, currency: 'USD', category: 'equipment', description: 'Keyboard', submittedBy: 'Bob Martinez' },
    { id: uuid(), date: daysAgo(27), vendor: 'Vercel', amount: 20.00, currency: 'USD', category: 'software', description: 'Pro plan', submittedBy: 'Carol Williams' },
    { id: uuid(), date: daysAgo(28), vendor: 'Cava', amount: 13.75, currency: 'USD', category: 'meals', description: 'Lunch', submittedBy: 'David Kim' },
    { id: uuid(), date: daysAgo(29), vendor: 'JetBlue', amount: 198.00, currency: 'USD', category: 'travel', description: 'Flight to Boston', submittedBy: 'Eva Thompson' },
  ];

  store.addExpenses(expenses);
  console.log(`Seeded ${expenses.length} sample expenses`);
}

function getNextWeekendDate(weeksAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (weeksAgo * 7));
  // Find the nearest Saturday
  const dayOfWeek = d.getDay();
  const diff = dayOfWeek === 0 ? 1 : 6 - dayOfWeek;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}
