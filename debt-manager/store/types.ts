import { BillCategory } from '../constants/categories';

export type BillType = 'recurring' | 'installment' | 'one-time' | 'payment-plan';
export type BillStatus = 'current' | 'due-soon' | 'due-this-week' | 'overdue' | 'paid';

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  extraAmount?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface Bill {
  id: string;
  name: string;
  creditor: string;
  type: BillType;
  category: BillCategory;
  amount: number;
  dueDay?: number;
  nextDueDate: string;
  balance?: number;
  originalBalance?: number;
  totalInstallments?: number;
  remainingInstallments?: number;
  interestRate?: number;
  minimumPayment?: number;
  currentPayment?: number;
  extraPayment?: number;
  status: BillStatus;
  color: string;
  website?: string;
  phone?: string;
  accountNumber?: string;
  notes: Note[];
  paymentHistory: Payment[];
  calendarEventIds?: string[];
  autoPayEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  attachments?: string[];
}

export interface IncomeEntry {
  id: string;
  amount: number;
  source: string;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface Budget {
  id: string;
  month: string;
  incomeEntries: IncomeEntry[];
  expenses: Expense[];
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDate?: string;
  targetAmount?: number;
  currentAmount: number;
  type: 'debt-free' | 'pay-off-bill' | 'reduce-payments' | 'save-emergency' | 'custom';
  billId?: string;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AppSettings {
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  calendarSyncEnabled: boolean;
  calendarId?: string;
  reminderDays: number[];
  currency: string;
  theme: 'dark' | 'light';
  apiKey?: string;
}
