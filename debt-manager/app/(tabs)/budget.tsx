import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetStore } from '../../store/budgetStore';
import { useBillsStore } from '../../store/billsStore';
import { Colors } from '../../constants/colors';
import { GlassCard } from '../../components/ui/GlassCard';
import { formatCurrency, getCurrentMonth, formatMonthLabel, format } from '../../utils/dateUtils';
import { IncomeEntry } from '../../store/types';

const INCOME_SOURCES = ['Client Payment', 'Job', 'Cash', 'Venmo/Zelle', 'Invoice', 'Side Hustle', 'Rental', 'Other'];

export default function BudgetScreen() {
  const month = getCurrentMonth();
  const budget = useBudgetStore(s => s.getMonthBudget(month));
  const income = useBudgetStore(s => s.getMonthIncome(month));
  const addIncomeEntry = useBudgetStore(s => s.addIncomeEntry);
  const removeIncomeEntry = useBudgetStore(s => s.removeIncomeEntry);
  const getTotalMonthlyPayments = useBillsStore(s => s.getTotalMonthlyPayments);

  const totalBills = getTotalMonthlyPayments();
  const available = income - totalBills;

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeNote, setIncomeNote] = useState('');

  const handleAddIncome = async () => {
    const amount = parseFloat(incomeAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    await addIncomeEntry(month, {
      amount,
      source: incomeSource || 'Income',
      date: new Date().toISOString(),
      notes: incomeNote || undefined,
    });
    setShowAddIncome(false);
    setIncomeAmount('');
    setIncomeSource('');
    setIncomeNote('');
  };

  const handleRemoveIncome = (id: string) => {
    Alert.alert('Remove Income?', 'This will remove this income entry.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeIncomeEntry(month, id) },
    ]);
  };

  const pct = income > 0 ? (totalBills / income) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.monthLabel}>{formatMonthLabel(month)}</Text>

      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <GlassCard style={styles.summaryCard}>
          <View style={[styles.cardIcon, { backgroundColor: Colors.successLight }]}>
            <Ionicons name="arrow-down-circle" size={20} color={Colors.success} />
          </View>
          <Text style={styles.cardValue}>{formatCurrency(income)}</Text>
          <Text style={styles.cardLabel}>Total Income</Text>
        </GlassCard>
        <GlassCard style={styles.summaryCard}>
          <View style={[styles.cardIcon, { backgroundColor: Colors.dangerLight }]}>
            <Ionicons name="arrow-up-circle" size={20} color={Colors.danger} />
          </View>
          <Text style={styles.cardValue}>{formatCurrency(totalBills)}</Text>
          <Text style={styles.cardLabel}>Total Bills</Text>
        </GlassCard>
      </View>

      {/* Available Cash */}
      <GlassCard style={styles.availableCard}>
        <View style={styles.availableTop}>
          <Text style={styles.availableLabel}>Available After Bills</Text>
          <Text style={[styles.availableAmount, { color: available >= 0 ? Colors.success : Colors.danger }]}>
            {formatCurrency(available)}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, {
            width: `${Math.min(100, pct)}%`,
            backgroundColor: pct > 90 ? Colors.danger : pct > 70 ? Colors.warning : Colors.primary,
          }]} />
        </View>
        <Text style={styles.pctText}>
          {income > 0
            ? `${pct.toFixed(0)}% of income goes to bills`
            : 'Log income to see your cash flow'}
        </Text>
        {available > 0 && income > 0 && (
          <View style={styles.insightBox}>
            <Ionicons name="sparkles" size={14} color={Colors.primary} />
            <Text style={styles.insightText}>
              You have {formatCurrency(available)} free this month. Consider putting extra toward overdue bills first.
            </Text>
          </View>
        )}
      </GlassCard>

      {/* Income Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Income This Month</Text>
          <TouchableOpacity style={styles.addEntryBtn} onPress={() => setShowAddIncome(true)}>
            <Ionicons name="add" size={16} color={Colors.primary} />
            <Text style={styles.addEntryText}>Add</Text>
          </TouchableOpacity>
        </View>

        {(!budget || budget.incomeEntries.length === 0) ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="cash-outline" size={28} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No income logged yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add" to log money that came in this month</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAddIncome(true)}>
              <Text style={styles.emptyAddText}>Log Income</Text>
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <View style={styles.entriesList}>
            {budget.incomeEntries.map(entry => (
              <IncomeRow
                key={entry.id}
                entry={entry}
                onDelete={() => handleRemoveIncome(entry.id)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Bills Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bills Breakdown</Text>
        <GlassCard style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total Monthly Bills</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(totalBills)}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.breakdownNote}>
            This is automatically calculated from your active bills. Manage them in the Bills tab.
          </Text>
        </GlassCard>
      </View>

      {/* Add Income Modal */}
      <Modal visible={showAddIncome} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Log Income</Text>

            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={incomeAmount}
              onChangeText={setIncomeAmount}
              autoFocus
            />

            <Text style={styles.fieldLabel}>Source</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {INCOME_SOURCES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, incomeSource === s && styles.chipActive]}
                  onPress={() => setIncomeSource(s)}
                >
                  <Text style={[styles.chipText, incomeSource === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Or type a custom source..."
              placeholderTextColor={Colors.textMuted}
              value={incomeSource}
              onChangeText={setIncomeSource}
            />

            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Client job, deposit, etc."
              placeholderTextColor={Colors.textMuted}
              value={incomeNote}
              onChangeText={setIncomeNote}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddIncome(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddIncome}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

function IncomeRow({ entry, onDelete }: { entry: IncomeEntry; onDelete: () => void }) {
  return (
    <View style={styles.incomeRow}>
      <View style={[styles.incomeIcon, { backgroundColor: Colors.successLight }]}>
        <Ionicons name="cash" size={16} color={Colors.success} />
      </View>
      <View style={styles.incomeInfo}>
        <Text style={styles.incomeSource}>{entry.source}</Text>
        <Text style={styles.incomeDate}>{format(new Date(entry.date), 'MMM d')}</Text>
        {entry.notes && <Text style={styles.incomeNote}>{entry.notes}</Text>}
      </View>
      <Text style={styles.incomeAmount}>{formatCurrency(entry.amount)}</Text>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={15} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  monthLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },

  cardRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, gap: 10, padding: 14 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardValue: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  cardLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '500' },

  availableCard: { gap: 12 },
  availableTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availableLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  availableAmount: { fontSize: 22, fontWeight: '700' },
  progressBarBg: { height: 6, backgroundColor: Colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  pctText: { color: Colors.textMuted, fontSize: 12 },
  insightBox: { flexDirection: 'row', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: 10, padding: 10, alignItems: 'flex-start' },
  insightText: { flex: 1, color: Colors.text, fontSize: 12, lineHeight: 18 },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  addEntryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addEntryText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  emptyCard: { alignItems: 'center', gap: 8, paddingVertical: 28 },
  emptyText: { color: Colors.text, fontSize: 15, fontWeight: '600', marginTop: 4 },
  emptySubtext: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  emptyAddBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, marginTop: 4 },
  emptyAddText: { color: Colors.text, fontWeight: '700', fontSize: 14 },

  entriesList: { gap: 8 },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 12,
  },
  incomeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  incomeInfo: { flex: 1, gap: 2 },
  incomeSource: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  incomeDate: { color: Colors.textMuted, fontSize: 12 },
  incomeNote: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  incomeAmount: { color: Colors.success, fontSize: 16, fontWeight: '700' },
  deleteBtn: { padding: 4 },

  breakdownCard: { gap: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownLabel: { color: Colors.textSecondary, fontSize: 14 },
  breakdownValue: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.border },
  breakdownNote: { color: Colors.textMuted, fontSize: 12, lineHeight: 18 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.textMuted, alignSelf: 'center', marginBottom: 8 },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  fieldLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipScroll: { flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.card, alignItems: 'center' },
  cancelText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { color: Colors.text, fontWeight: '700', fontSize: 15 },
});
