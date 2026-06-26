import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget, IncomeEntry, Expense, AppSettings } from './types';

const BUDGET_KEY = 'debt_manager_budget';
const SETTINGS_KEY = 'debt_manager_settings';

const DEFAULT_SETTINGS: AppSettings = {
  biometricEnabled: false,
  notificationsEnabled: true,
  calendarSyncEnabled: false,
  reminderDays: [7, 3, 1],
  currency: 'USD',
  theme: 'dark',
};

interface BudgetState {
  budgets: Budget[];
  settings: AppSettings;
  isLoaded: boolean;
  load: () => Promise<void>;
  addIncomeEntry: (month: string, entry: Omit<IncomeEntry, 'id'>) => Promise<void>;
  removeIncomeEntry: (month: string, entryId: string) => Promise<void>;
  addExpense: (month: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  removeExpense: (month: string, expenseId: string) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  getMonthBudget: (month: string) => Budget | undefined;
  getMonthIncome: (month: string) => number;
  getMonthExpenses: (month: string) => number;
  getAvailableCash: (month: string, totalBillPayments: number) => number;
}

async function persistBudgets(budgets: Budget[]) {
  await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
}

async function persistSettings(settings: AppSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function ensureMonthBudget(budgets: Budget[], month: string): [Budget[], Budget] {
  let existing = budgets.find(b => b.month === month);
  if (!existing) {
    existing = {
      id: `budget_${month}`,
      month,
      incomeEntries: [],
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    return [[...budgets, existing], existing];
  }
  return [budgets, existing];
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  load: async () => {
    try {
      const [rawBudgets, rawSettings] = await Promise.all([
        AsyncStorage.getItem(BUDGET_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);
      set({
        budgets: rawBudgets ? JSON.parse(rawBudgets) : [],
        settings: rawSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) } : DEFAULT_SETTINGS,
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  addIncomeEntry: async (month, entryData) => {
    const entry: IncomeEntry = { ...entryData, id: `inc_${Date.now()}` };
    let [budgets, budget] = ensureMonthBudget(get().budgets, month);
    budgets = budgets.map(b =>
      b.month === month ? { ...b, incomeEntries: [...b.incomeEntries, entry] } : b
    );
    set({ budgets });
    await persistBudgets(budgets);
  },

  removeIncomeEntry: async (month, entryId) => {
    const budgets = get().budgets.map(b =>
      b.month === month
        ? { ...b, incomeEntries: b.incomeEntries.filter(e => e.id !== entryId) }
        : b
    );
    set({ budgets });
    await persistBudgets(budgets);
  },

  addExpense: async (month, expenseData) => {
    const expense: Expense = { ...expenseData, id: `exp_${Date.now()}` };
    let [budgets] = ensureMonthBudget(get().budgets, month);
    budgets = budgets.map(b =>
      b.month === month ? { ...b, expenses: [...b.expenses, expense] } : b
    );
    set({ budgets });
    await persistBudgets(budgets);
  },

  removeExpense: async (month, expenseId) => {
    const budgets = get().budgets.map(b =>
      b.month === month
        ? { ...b, expenses: b.expenses.filter(e => e.id !== expenseId) }
        : b
    );
    set({ budgets });
    await persistBudgets(budgets);
  },

  updateSettings: async (updates) => {
    const settings = { ...get().settings, ...updates };
    set({ settings });
    await persistSettings(settings);
  },

  getMonthBudget: (month) => get().budgets.find(b => b.month === month),

  getMonthIncome: (month) => {
    const budget = get().budgets.find(b => b.month === month);
    if (!budget) return 0;
    return budget.incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  },

  getMonthExpenses: (month) => {
    const budget = get().budgets.find(b => b.month === month);
    if (!budget) return 0;
    return budget.expenses.reduce((sum, e) => sum + e.amount, 0);
  },

  getAvailableCash: (month, totalBillPayments) => {
    const income = get().getMonthIncome(month);
    const expenses = get().getMonthExpenses(month);
    return income - expenses - totalBillPayments;
  },
}));
