export interface Expense {
  id: string;
  date: string;
  vendor: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  submittedBy: string;
  receiptUrl?: string;
  lineItems?: LineItem[];
  metadata?: Record<string, unknown>;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type ExpenseCategory =
  | 'travel'
  | 'meals'
  | 'software'
  | 'office_supplies'
  | 'equipment'
  | 'marketing'
  | 'professional_services'
  | 'utilities'
  | 'other';
