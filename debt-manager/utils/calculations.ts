import { Bill } from '../store/types';
import { differenceInDays, parseISO } from './dateUtils';

export function getPayoffMonths(balance: number, monthlyPayment: number, annualRate: number): number {
  if (monthlyPayment <= 0) return Infinity;
  if (annualRate === 0) return Math.ceil(balance / monthlyPayment);
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyPayment <= balance * monthlyRate) return Infinity;
  return Math.ceil(-Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate));
}

export function getTotalInterest(balance: number, monthlyPayment: number, annualRate: number): number {
  if (annualRate === 0) return 0;
  const months = getPayoffMonths(balance, monthlyPayment, annualRate);
  if (!isFinite(months)) return Infinity;
  return monthlyPayment * months - balance;
}

export function getPayoffDate(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

export interface PayoffStrategy {
  name: string;
  order: Bill[];
  totalMonths: number;
  totalInterest: number;
  description: string;
}

export function avalancheOrder(bills: Bill[]): Bill[] {
  return [...bills]
    .filter(b => b.status !== 'paid')
    .sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
}

export function snowballOrder(bills: Bill[]): Bill[] {
  return [...bills]
    .filter(b => b.status !== 'paid')
    .sort((a, b) => (a.balance ?? a.amount) - (b.balance ?? b.amount));
}

export function getSmartPriorityOrder(bills: Bill[]): Bill[] {
  const today = new Date();
  return [...bills]
    .filter(b => b.status !== 'paid')
    .sort((a, b) => {
      const daysA = differenceInDays(parseISO(a.nextDueDate), today);
      const daysB = differenceInDays(parseISO(b.nextDueDate), today);
      if (daysA !== daysB) return daysA - daysB;
      const interestA = a.interestRate || 0;
      const interestB = b.interestRate || 0;
      return interestB - interestA;
    });
}

export function getAIInsights(bills: Bill[], availableCash: number): string[] {
  const insights: string[] = [];
  const activeBills = bills.filter(b => b.status !== 'paid');
  const overdue = activeBills.filter(b => b.status === 'overdue');
  const dueSoon = activeBills.filter(b => b.status === 'due-soon' || b.status === 'due-this-week');
  const highInterest = activeBills
    .filter(b => (b.interestRate || 0) > 15)
    .sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));

  if (overdue.length > 0) {
    insights.push(`You have ${overdue.length} overdue bill${overdue.length > 1 ? 's' : ''}. Pay ${overdue[0].name} first to avoid late fees.`);
  }

  if (dueSoon.length > 0 && availableCash > 0) {
    const totalDue = dueSoon.reduce((s, b) => s + (b.currentPayment || b.amount), 0);
    if (availableCash >= totalDue) {
      insights.push(`You have enough cash to cover all ${dueSoon.length} bills due this week ($${totalDue.toFixed(0)}).`);
    } else {
      const priority = getSmartPriorityOrder(dueSoon);
      insights.push(`Short on cash? Pay ${priority[0].name} first — it's due soonest.`);
    }
  }

  if (highInterest.length > 0 && availableCash > 50) {
    const top = highInterest[0];
    const extra = Math.min(availableCash * 0.3, 200);
    const baseMonths = getPayoffMonths(top.balance || top.amount, top.amount, top.interestRate || 0);
    const extraMonths = getPayoffMonths(top.balance || top.amount, top.amount + extra, top.interestRate || 0);
    if (isFinite(baseMonths) && isFinite(extraMonths)) {
      const saved = baseMonths - extraMonths;
      if (saved > 0) {
        insights.push(`Paying an extra $${extra.toFixed(0)}/mo on ${top.name} (${top.interestRate}% APR) saves you ${saved} month${saved !== 1 ? 's' : ''} of payments.`);
      }
    }
  }

  if (availableCash < 0) {
    insights.push(`Your bills exceed your logged income by $${Math.abs(availableCash).toFixed(0)}. Log any additional income or identify bills to defer.`);
  }

  if (insights.length === 0 && activeBills.length > 0) {
    const totalMonthly = activeBills.reduce((s, b) => s + (b.currentPayment || b.amount), 0);
    insights.push(`You're managing ${activeBills.length} active bills totaling $${totalMonthly.toFixed(0)}/mo. All statuses look good!`);
  }

  return insights;
}
