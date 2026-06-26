import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bill, Note, Payment } from './types';
import { Colors } from '../constants/colors';
import { differenceInDays, parseISO, isAfter, isBefore, addMonths, format } from '../utils/dateUtils';

const STORAGE_KEY = 'debt_manager_bills';

interface BillsState {
  bills: Bill[];
  isLoaded: boolean;
  load: () => Promise<void>;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'color' | 'notes' | 'paymentHistory'>) => Promise<Bill>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  logPayment: (billId: string, payment: Omit<Payment, 'id'>) => Promise<void>;
  addNote: (billId: string, text: string) => Promise<void>;
  deleteNote: (billId: string, noteId: string) => Promise<void>;
  refreshStatuses: () => void;
  getBillById: (id: string) => Bill | undefined;
  getOverdueBills: () => Bill[];
  getDueSoonBills: () => Bill[];
  getDueThisWeekBills: () => Bill[];
  getTotalMonthlyPayments: () => number;
  getTotalBalance: () => number;
}

function computeStatus(bill: Bill): import('./types').BillStatus {
  if (bill.status === 'paid') return 'paid';
  const today = new Date();
  const due = parseISO(bill.nextDueDate);
  const daysUntil = differenceInDays(due, today);

  if (daysUntil < 0) return 'overdue';
  if (daysUntil === 0 || daysUntil === 1) return 'due-soon';
  if (daysUntil <= 7) return 'due-this-week';
  return 'current';
}

function getNextDueDate(bill: Partial<Bill>): string {
  if (bill.type === 'one-time') return bill.nextDueDate || new Date().toISOString();
  if (bill.dueDay) {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
    if (isAfter(thisMonth, today)) return thisMonth.toISOString();
    return addMonths(thisMonth, 1).toISOString();
  }
  return bill.nextDueDate || new Date().toISOString();
}

let colorIndex = 0;
function nextColor(): string {
  const color = Colors.categoryColors[colorIndex % Colors.categoryColors.length];
  colorIndex++;
  return color;
}

async function persist(bills: Bill[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export const useBillsStore = create<BillsState>((set, get) => ({
  bills: [],
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const bills: Bill[] = JSON.parse(raw);
        const refreshed = bills.map(b => ({ ...b, status: computeStatus(b) }));
        set({ bills: refreshed, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  addBill: async (data) => {
    const newBill: Bill = {
      ...data,
      id: `bill_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      color: nextColor(),
      notes: [],
      paymentHistory: [],
      status: 'current',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newBill.status = computeStatus(newBill);
    const bills = [...get().bills, newBill];
    set({ bills });
    await persist(bills);
    return newBill;
  },

  updateBill: async (id, updates) => {
    const bills = get().bills.map(b => {
      if (b.id !== id) return b;
      const updated = { ...b, ...updates, updatedAt: new Date().toISOString() };
      updated.status = computeStatus(updated);
      return updated;
    });
    set({ bills });
    await persist(bills);
  },

  deleteBill: async (id) => {
    const bills = get().bills.filter(b => b.id !== id);
    set({ bills });
    await persist(bills);
  },

  logPayment: async (billId, paymentData) => {
    const payment: Payment = {
      ...paymentData,
      id: `pmt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
    const bills = get().bills.map(b => {
      if (b.id !== billId) return b;
      const newHistory = [payment, ...b.paymentHistory];
      const newBalance = b.balance !== undefined
        ? Math.max(0, b.balance - payment.amount)
        : b.balance;
      const remaining = b.remainingInstallments !== undefined
        ? Math.max(0, b.remainingInstallments - 1)
        : b.remainingInstallments;

      let nextDue = b.nextDueDate;
      if (b.type === 'recurring' && b.dueDay) {
        nextDue = addMonths(parseISO(b.nextDueDate), 1).toISOString();
      }

      const updated = {
        ...b,
        paymentHistory: newHistory,
        balance: newBalance,
        remainingInstallments: remaining,
        nextDueDate: nextDue,
        updatedAt: new Date().toISOString(),
      };
      updated.status = computeStatus(updated);
      return updated;
    });
    set({ bills });
    await persist(bills);
  },

  addNote: async (billId, text) => {
    const note: Note = {
      id: `note_${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };
    const bills = get().bills.map(b => {
      if (b.id !== billId) return b;
      return { ...b, notes: [note, ...b.notes], updatedAt: new Date().toISOString() };
    });
    set({ bills });
    await persist(bills);
  },

  deleteNote: async (billId, noteId) => {
    const bills = get().bills.map(b => {
      if (b.id !== billId) return b;
      return { ...b, notes: b.notes.filter(n => n.id !== noteId) };
    });
    set({ bills });
    await persist(bills);
  },

  refreshStatuses: () => {
    const bills = get().bills.map(b => ({ ...b, status: computeStatus(b) }));
    set({ bills });
  },

  getBillById: (id) => get().bills.find(b => b.id === id),

  getOverdueBills: () => get().bills.filter(b => b.status === 'overdue'),

  getDueSoonBills: () => get().bills.filter(b => b.status === 'due-soon'),

  getDueThisWeekBills: () =>
    get().bills.filter(b => b.status === 'due-this-week' || b.status === 'due-soon'),

  getTotalMonthlyPayments: () =>
    get().bills
      .filter(b => b.status !== 'paid')
      .reduce((sum, b) => sum + (b.currentPayment || b.minimumPayment || b.amount), 0),

  getTotalBalance: () =>
    get().bills
      .filter(b => b.status !== 'paid')
      .reduce((sum, b) => sum + (b.balance ?? b.amount), 0),
}));
