import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, SectionList,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBillsStore } from '../../store/billsStore';
import { Colors, StatusColors } from '../../constants/colors';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BillsPieChart } from '../../components/charts/BillsPieChart';
import { formatCurrency, formatDueDate, parseISO } from '../../utils/dateUtils';
import { Bill, BillStatus } from '../../store/types';

type FilterStatus = 'all' | BillStatus;

const FILTER_TABS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'due-soon', label: 'Due Soon' },
  { id: 'due-this-week', label: 'This Week' },
  { id: 'current', label: 'Current' },
  { id: 'paid', label: 'Paid' },
];

export default function BillsScreen() {
  const bills = useBillsStore(s => s.bills);
  const refreshStatuses = useBillsStore(s => s.refreshStatuses);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [showChart, setShowChart] = useState(true);

  useFocusEffect(useCallback(() => { refreshStatuses(); }, []));

  const filtered = bills
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => search === '' || b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.creditor.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime());

  const sections = [
    { title: 'Overdue', data: filtered.filter(b => b.status === 'overdue') },
    { title: 'Due Soon', data: filtered.filter(b => b.status === 'due-soon') },
    { title: 'Due This Week', data: filtered.filter(b => b.status === 'due-this-week') },
    { title: 'Current', data: filtered.filter(b => b.status === 'current') },
    { title: 'Paid', data: filtered.filter(b => b.status === 'paid') },
  ].filter(s => s.data.length > 0);

  const flatMode = filter !== 'all' || search !== '';

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bills..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/bill/add')}
        >
          <Ionicons name="add" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.filterTab, filter === tab.id && styles.filterTabActive]}
            onPress={() => setFilter(tab.id)}
          >
            <Text style={[styles.filterTabText, filter === tab.id && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
            {tab.id !== 'all' && (
              <View style={[
                styles.filterBadge,
                { backgroundColor: filter === tab.id ? Colors.primary : Colors.surfaceAlt }
              ]}>
                <Text style={styles.filterBadgeText}>
                  {bills.filter(b => b.status === tab.id).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pie Chart (only on "all" tab) */}
        {filter === 'all' && search === '' && (
          <GlassCard style={styles.chartCard}>
            <TouchableOpacity
              style={styles.chartToggle}
              onPress={() => setShowChart(v => !v)}
            >
              <Text style={styles.chartTitle}>Bill Breakdown</Text>
              <Ionicons
                name={showChart ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
            {showChart && (
              <BillsPieChart
                bills={bills}
                onSlicePress={bill => router.push(`/bill/${bill.id}`)}
              />
            )}
          </GlassCard>
        )}

        {/* Bills List */}
        {bills.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No bills yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first bill</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => router.push('/bill/add')}>
              <Text style={styles.emptyAddText}>Add Bill</Text>
            </TouchableOpacity>
          </View>
        ) : flatMode ? (
          <View style={styles.billsList}>
            {filtered.map(bill => <BillCard key={bill.id} bill={bill} />)}
            {filtered.length === 0 && (
              <Text style={styles.noResults}>No bills match your filter</Text>
            )}
          </View>
        ) : (
          <View style={styles.billsList}>
            {sections.map(section => (
              <View key={section.title}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, {
                    backgroundColor: section.title === 'Overdue' ? Colors.danger
                      : section.title === 'Due Soon' ? Colors.warning
                      : section.title === 'Due This Week' ? Colors.warning
                      : section.title === 'Paid' ? Colors.textMuted
                      : Colors.success
                  }]} />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionCount}>({section.data.length})</Text>
                </View>
                {section.data.map(bill => <BillCard key={bill.id} bill={bill} />)}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  return (
    <TouchableOpacity
      style={styles.billCard}
      onPress={() => router.push(`/bill/${bill.id}`)}
      activeOpacity={0.75}
    >
      <View style={[styles.colorAccent, { backgroundColor: bill.color }]} />
      <View style={styles.billInfo}>
        <View style={styles.billTop}>
          <Text style={styles.billName}>{bill.name}</Text>
          <Text style={styles.billAmount}>{formatCurrency(bill.currentPayment || bill.amount)}</Text>
        </View>
        <View style={styles.billBottom}>
          <Text style={[styles.billDue, {
            color: bill.status === 'overdue' ? Colors.danger
              : bill.status === 'due-soon' ? Colors.warning
              : Colors.textSecondary
          }]}>
            {formatDueDate(bill.nextDueDate)}
          </Text>
          <StatusBadge status={bill.status} small />
        </View>
        {bill.balance !== undefined && (
          <View style={styles.balanceRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, {
                width: `${bill.originalBalance ? Math.max(0, Math.min(100, ((bill.originalBalance - bill.balance) / bill.originalBalance) * 100)) : 0}%`,
                backgroundColor: bill.color,
              }]} />
            </View>
            <Text style={styles.balanceText}>Balance: {formatCurrency(bill.balance)}</Text>
          </View>
        )}
        {bill.type === 'installment' && bill.remainingInstallments !== undefined && (
          <Text style={styles.installmentText}>
            {bill.remainingInstallments} payment{bill.remainingInstallments !== 1 ? 's' : ''} remaining
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14 },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  filterTabActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filterTabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  filterTabTextActive: { color: Colors.primary, fontWeight: '700' },
  filterBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
  filterBadgeText: { color: Colors.text, fontSize: 10, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 32 },

  chartCard: { gap: 16 },
  chartToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },

  billsList: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCount: { color: Colors.textMuted, fontSize: 12 },

  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  colorAccent: { width: 4, alignSelf: 'stretch' },
  billInfo: { flex: 1, padding: 14, gap: 6 },
  billTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  billAmount: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  billBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billDue: { fontSize: 12 },
  balanceRow: { gap: 4 },
  progressBarBg: { height: 3, backgroundColor: Colors.surfaceAlt, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: 3, borderRadius: 2 },
  balanceText: { color: Colors.textMuted, fontSize: 11 },
  installmentText: { color: Colors.textMuted, fontSize: 11 },
  chevron: { marginRight: 12 },

  emptyState: { alignItems: 'center', gap: 10, paddingTop: 60 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySubtext: { color: Colors.textMuted, fontSize: 14 },
  emptyAddBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyAddText: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  noResults: { color: Colors.textMuted, textAlign: 'center', paddingTop: 40, fontSize: 14 },
});
