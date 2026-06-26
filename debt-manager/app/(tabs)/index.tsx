import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Pressable,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBillsStore } from '../../store/billsStore';
import { useBudgetStore } from '../../store/budgetStore';
import { Colors, StatusColors } from '../../constants/colors';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDueDate, getCurrentMonth, format, parseISO } from '../../utils/dateUtils';
import { getAIInsights } from '../../utils/calculations';
import { Bill } from '../../store/types';

export default function DashboardScreen() {
  const bills = useBillsStore(s => s.bills);
  const refreshStatuses = useBillsStore(s => s.refreshStatuses);
  const getTotalMonthlyPayments = useBillsStore(s => s.getTotalMonthlyPayments);
  const getTotalBalance = useBillsStore(s => s.getTotalBalance);
  const getMonthIncome = useBudgetStore(s => s.getMonthIncome);
  const getAvailableCash = useBudgetStore(s => s.getAvailableCash);

  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(useCallback(() => {
    refreshStatuses();
  }, []));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshStatuses();
    setRefreshing(false);
  }, []);

  const month = getCurrentMonth();
  const income = getMonthIncome(month);
  const totalMonthly = getTotalMonthlyPayments();
  const availableCash = getAvailableCash(month, totalMonthly);
  const totalBalance = getTotalBalance();

  const overdue = bills.filter(b => b.status === 'overdue');
  const dueToday = bills.filter(b => {
    const days = Math.abs(Date.now() - parseISO(b.nextDueDate).getTime()) / 86400000;
    return b.status !== 'paid' && days < 1;
  });
  const dueThisWeek = bills.filter(b => b.status === 'due-this-week' || b.status === 'due-soon');
  const upcomingBills = [...overdue, ...dueThisWeek]
    .sort((a, b) => parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime())
    .slice(0, 8);

  const insights = getAIInsights(bills, availableCash);
  const currentDate = format(new Date(), 'ddd, MMMM d');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/bill/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Overdue Banner */}
      {overdue.length > 0 && (
        <TouchableOpacity
          style={styles.overdueBanner}
          onPress={() => router.push('/bills')}
          activeOpacity={0.85}
        >
          <View style={styles.overdueBannerLeft}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <Text style={styles.overdueBannerText}>
              {overdue.length} overdue bill{overdue.length > 1 ? 's' : ''} — tap to view
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={Colors.danger} />
        </TouchableOpacity>
      )}

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <SummaryCard
          label="Monthly Bills"
          value={formatCurrency(totalMonthly)}
          icon="receipt-outline"
          color={Colors.primary}
        />
        <SummaryCard
          label="Available Cash"
          value={income > 0 ? formatCurrency(availableCash) : '—'}
          icon="wallet-outline"
          color={availableCash >= 0 ? Colors.success : Colors.danger}
          subtitle={income > 0 ? undefined : 'Log income to see'}
        />
        <SummaryCard
          label="Total Balance"
          value={formatCurrency(totalBalance)}
          icon="trending-down-outline"
          color={Colors.accent}
        />
        <SummaryCard
          label="Active Bills"
          value={String(bills.filter(b => b.status !== 'paid').length)}
          icon="list-outline"
          color={Colors.info}
        />
      </View>

      {/* AI Insight */}
      {insights.length > 0 && (
        <GlassCard style={styles.insightCard}>
          <LinearGradient
            colors={[Colors.primaryLight, 'transparent']}
            style={styles.insightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={16} color={Colors.primary} />
            <Text style={styles.insightTitle}>AI Insight</Text>
          </View>
          <Text style={styles.insightText}>{insights[0]}</Text>
          {insights.length > 1 && (
            <TouchableOpacity onPress={() => router.push('/assistant')}>
              <Text style={styles.insightMore}>See {insights.length - 1} more insights →</Text>
            </TouchableOpacity>
          )}
        </GlassCard>
      )}

      {/* Due This Week */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Due This Week</Text>
          <TouchableOpacity onPress={() => router.push('/bills')}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {upcomingBills.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
            <Text style={styles.emptyText}>All caught up!</Text>
            <Text style={styles.emptySubtext}>No bills due this week</Text>
          </GlassCard>
        ) : (
          <View style={styles.billsList}>
            {upcomingBills.map(bill => (
              <BillRow key={bill.id} bill={bill} />
            ))}
          </View>
        )}
      </View>

      {/* Cash Flow Bar */}
      {income > 0 && (
        <GlassCard style={styles.cashFlowCard}>
          <Text style={styles.cashFlowTitle}>Cash Flow — {format(new Date(), 'MMMM')}</Text>
          <View style={styles.cashFlowRow}>
            <View style={styles.cashFlowItem}>
              <Text style={styles.cashFlowLabel}>Income</Text>
              <Text style={[styles.cashFlowValue, { color: Colors.success }]}>{formatCurrency(income)}</Text>
            </View>
            <Ionicons name="remove" size={16} color={Colors.textMuted} />
            <View style={styles.cashFlowItem}>
              <Text style={styles.cashFlowLabel}>Bills</Text>
              <Text style={[styles.cashFlowValue, { color: Colors.danger }]}>{formatCurrency(totalMonthly)}</Text>
            </View>
            <Ionicons name="remove" size={16} color={Colors.textMuted} />
            <View style={styles.cashFlowItem}>
              <Text style={styles.cashFlowLabel}>Left Over</Text>
              <Text style={[styles.cashFlowValue, { color: availableCash >= 0 ? Colors.success : Colors.danger }]}>
                {formatCurrency(availableCash)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {
              width: `${Math.min(100, income > 0 ? (totalMonthly / income) * 100 : 0)}%`,
              backgroundColor: totalMonthly > income ? Colors.danger : Colors.primary,
            }]} />
          </View>
          <Text style={styles.cashFlowPct}>
            {income > 0 ? `${((totalMonthly / income) * 100).toFixed(0)}% of income goes to bills` : ''}
          </Text>
        </GlassCard>
      )}
    </ScrollView>
  );
}

function SummaryCard({ label, value, icon, color, subtitle }: {
  label: string; value: string; icon: keyof typeof Ionicons.glyphMap; color: string; subtitle?: string;
}) {
  return (
    <GlassCard style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{subtitle || label}</Text>
    </GlassCard>
  );
}

function BillRow({ bill }: { bill: Bill }) {
  return (
    <TouchableOpacity
      style={styles.billRow}
      onPress={() => router.push(`/bill/${bill.id}`)}
      activeOpacity={0.75}
    >
      <View style={[styles.billColorBar, { backgroundColor: bill.color }]} />
      <View style={styles.billRowInfo}>
        <Text style={styles.billRowName}>{bill.name}</Text>
        <Text style={[styles.billRowDue, { color: bill.status === 'overdue' ? Colors.danger : Colors.textSecondary }]}>
          {formatDueDate(bill.nextDueDate)}
        </Text>
      </View>
      <View style={styles.billRowRight}>
        <Text style={styles.billRowAmount}>{formatCurrency(bill.currentPayment || bill.amount)}</Text>
        <StatusBadge status={bill.status} small />
      </View>
    </TouchableOpacity>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32, gap: 16 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: { color: Colors.textSecondary, fontSize: 13 },
  date: { color: Colors.text, fontSize: 20, fontWeight: '700', marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.danger + '44',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  overdueBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  overdueBannerText: { color: Colors.danger, fontSize: 13, fontWeight: '600' },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    gap: 8,
    padding: 14,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  summaryLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '500' },

  insightCard: { overflow: 'hidden', gap: 8 },
  insightGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  insightTitle: { color: Colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  insightText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  insightMore: { color: Colors.primary, fontSize: 12, fontWeight: '600', marginTop: 4 },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  sectionLink: { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  emptyCard: { alignItems: 'center', gap: 8, paddingVertical: 28 },
  emptyText: { color: Colors.text, fontSize: 15, fontWeight: '600', marginTop: 4 },
  emptySubtext: { color: Colors.textMuted, fontSize: 13 },

  billsList: { gap: 8 },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: 12,
    paddingRight: 14,
    paddingVertical: 12,
  },
  billColorBar: { width: 4, height: '100%', borderRadius: 2 },
  billRowInfo: { flex: 1, gap: 2 },
  billRowName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  billRowDue: { fontSize: 12 },
  billRowRight: { alignItems: 'flex-end', gap: 4 },
  billRowAmount: { color: Colors.text, fontSize: 15, fontWeight: '700' },

  cashFlowCard: { gap: 12 },
  cashFlowTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  cashFlowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cashFlowItem: { alignItems: 'center', gap: 2 },
  cashFlowLabel: { color: Colors.textMuted, fontSize: 11 },
  cashFlowValue: { fontSize: 16, fontWeight: '700' },
  progressBarBg: { height: 6, backgroundColor: Colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  cashFlowPct: { color: Colors.textMuted, fontSize: 11, textAlign: 'center' },
});
