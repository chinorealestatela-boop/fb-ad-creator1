import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useBillsStore } from '../../store/billsStore';
import { useBudgetStore } from '../../store/budgetStore';
import { Colors } from '../../constants/colors';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, getCurrentMonth, formatMonthLabel, format, parseISO } from '../../utils/dateUtils';

export default function ReportsScreen() {
  const bills = useBillsStore(s => s.bills);
  const getTotalMonthlyPayments = useBillsStore(s => s.getTotalMonthlyPayments);
  const getTotalBalance = useBillsStore(s => s.getTotalBalance);
  const getMonthIncome = useBudgetStore(s => s.getMonthIncome);
  const getAvailableCash = useBudgetStore(s => s.getAvailableCash);
  const [generating, setGenerating] = useState(false);

  const month = getCurrentMonth();
  const income = getMonthIncome(month);
  const totalMonthly = getTotalMonthlyPayments();
  const available = getAvailableCash(month, totalMonthly);
  const totalBalance = getTotalBalance();

  const activeBills = bills.filter(b => b.status !== 'paid');
  const overdueBills = bills.filter(b => b.status === 'overdue');
  const paidBills = bills.filter(b => b.status === 'paid');

  const totalPaidAllTime = bills
    .flatMap(b => b.paymentHistory)
    .reduce((s, p) => s + p.amount, 0);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const now = new Date();
      const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, Arial, sans-serif; color: #1a1a2e; padding: 40px; }
  .header { background: linear-gradient(135deg, #6C63FF, #4a42cc); color: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; }
  .header h1 { font-size: 28px; font-weight: 800; }
  .header p { opacity: 0.8; margin-top: 6px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
  .card { background: #f8f9fa; border-radius: 12px; padding: 20px; border-left: 4px solid #6C63FF; }
  .card.danger { border-left-color: #E74C3C; }
  .card.success { border-left-color: #2ECC71; }
  .card.warning { border-left-color: #F39C12; }
  .card label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666; letter-spacing: 0.5px; }
  .card .value { font-size: 26px; font-weight: 800; margin-top: 6px; color: #1a1a2e; }
  h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #1a1a2e; border-bottom: 2px solid #eee; padding-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  th { background: #f0efff; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6C63FF; }
  td { padding: 12px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
  .badge.overdue { background: #fdf0ee; color: #E74C3C; }
  .badge.current { background: #eefdf4; color: #2ECC71; }
  .badge.due-soon { background: #fef9ec; color: #F39C12; }
  .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; }
</style>
</head>
<body>
<div class="header">
  <h1>Financial Report</h1>
  <p>Generated ${format(now, 'MMMM d, yyyy')} · ${formatMonthLabel(month)}</p>
</div>

<div class="grid">
  <div class="card">
    <label>Monthly Income</label>
    <div class="value">${formatCurrency(income)}</div>
  </div>
  <div class="card danger">
    <label>Monthly Bills</label>
    <div class="value">${formatCurrency(totalMonthly)}</div>
  </div>
  <div class="card success">
    <label>Available Cash</label>
    <div class="value">${formatCurrency(available)}</div>
  </div>
  <div class="card warning">
    <label>Total Balance Owed</label>
    <div class="value">${formatCurrency(totalBalance)}</div>
  </div>
</div>

<h2>Active Bills (${activeBills.length})</h2>
<table>
  <thead>
    <tr>
      <th>Bill</th>
      <th>Amount</th>
      <th>Due Date</th>
      <th>Status</th>
      <th>Balance</th>
    </tr>
  </thead>
  <tbody>
    ${activeBills.map(b => `
    <tr>
      <td><strong>${b.name}</strong><br><small style="color:#999">${b.creditor || ''}</small></td>
      <td>${formatCurrency(b.currentPayment || b.amount)}</td>
      <td>${format(parseISO(b.nextDueDate), 'MMM d, yyyy')}</td>
      <td><span class="badge ${b.status}">${b.status.replace('-', ' ').toUpperCase()}</span></td>
      <td>${b.balance !== undefined ? formatCurrency(b.balance) : '—'}</td>
    </tr>`).join('')}
  </tbody>
</table>

${overdueBills.length > 0 ? `
<h2 style="color:#E74C3C">Overdue Bills (${overdueBills.length})</h2>
<table>
  <thead><tr><th>Bill</th><th>Amount</th><th>Days Overdue</th></tr></thead>
  <tbody>
    ${overdueBills.map(b => {
      const days = Math.floor((Date.now() - parseISO(b.nextDueDate).getTime()) / 86400000);
      return `<tr><td><strong>${b.name}</strong></td><td>${formatCurrency(b.amount)}</td><td style="color:#E74C3C">${days} day${days !== 1 ? 's' : ''}</td></tr>`;
    }).join('')}
  </tbody>
</table>` : ''}

${totalPaidAllTime > 0 ? `
<h2>Payment Summary</h2>
<table>
  <thead><tr><th>Bill</th><th>Payments Made</th><th>Total Paid</th></tr></thead>
  <tbody>
    ${bills.filter(b => b.paymentHistory.length > 0).map(b => {
      const paid = b.paymentHistory.reduce((s, p) => s + p.amount, 0);
      return `<tr><td>${b.name}</td><td>${b.paymentHistory.length}</td><td>${formatCurrency(paid)}</td></tr>`;
    }).join('')}
  </tbody>
</table>` : ''}

<div class="footer">
  Generated by DebtManager App · ${format(now, 'MMMM d, yyyy HH:mm')}
</div>
</body>
</html>`;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Financial Report' });
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.monthLabel}>{formatMonthLabel(month)}</Text>

      {/* Summary */}
      <View style={styles.grid}>
        <StatCard label="Active Bills" value={String(activeBills.length)} color={Colors.primary} icon="list" />
        <StatCard label="Overdue" value={String(overdueBills.length)} color={Colors.danger} icon="alert-circle" />
        <StatCard label="Paid Off" value={String(paidBills.length)} color={Colors.success} icon="checkmark-circle" />
        <StatCard label="Total Paid" value={formatCurrency(totalPaidAllTime)} color={Colors.info} icon="cash" />
      </View>

      {/* Cash Flow */}
      <GlassCard style={styles.cashFlowCard}>
        <Text style={styles.sectionTitle}>Cash Flow</Text>
        <View style={styles.flowRow}>
          <FlowItem label="Income" amount={income} color={Colors.success} />
          <Ionicons name="remove" size={18} color={Colors.textMuted} />
          <FlowItem label="Bills" amount={totalMonthly} color={Colors.danger} />
          <Ionicons name="arrow-forward" size={18} color={Colors.textMuted} />
          <FlowItem label="Left Over" amount={available} color={available >= 0 ? Colors.success : Colors.danger} />
        </View>
        {income > 0 && (
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {
              width: `${Math.min(100, (totalMonthly / income) * 100)}%`,
              backgroundColor: totalMonthly > income ? Colors.danger : Colors.primary,
            }]} />
          </View>
        )}
      </GlassCard>

      {/* Bill Status Breakdown */}
      <GlassCard style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Bill Status</Text>
        {(['overdue', 'due-soon', 'due-this-week', 'current', 'paid'] as const).map(status => {
          const count = bills.filter(b => b.status === status).length;
          if (count === 0) return null;
          return (
            <View key={status} style={styles.statusRow}>
              <StatusBadge status={status} small />
              <Text style={styles.statusCount}>{count} bill{count !== 1 ? 's' : ''}</Text>
            </View>
          );
        })}
      </GlassCard>

      {/* Recent Payments */}
      {totalPaidAllTime > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          {bills
            .flatMap(b => b.paymentHistory.map(p => ({ ...p, billName: b.name, billColor: b.color })))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map(p => (
              <View key={p.id} style={styles.paymentRow}>
                <View style={[styles.paymentDot, { backgroundColor: p.billColor }]} />
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentBill}>{p.billName}</Text>
                  <Text style={styles.paymentDate}>{format(new Date(p.date), 'MMM d, yyyy')}</Text>
                </View>
                <Text style={styles.paymentAmount}>{formatCurrency(p.amount)}</Text>
              </View>
            ))}
        </View>
      )}

      {/* Export Button */}
      <TouchableOpacity
        style={styles.exportBtn}
        onPress={generatePDF}
        disabled={generating}
        activeOpacity={0.8}
      >
        {generating ? (
          <ActivityIndicator color={Colors.text} />
        ) : (
          <>
            <Ionicons name="document-text" size={20} color={Colors.text} />
            <Text style={styles.exportText}>Export PDF Report</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <GlassCard style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  );
}

function FlowItem({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <View style={styles.flowItem}>
      <Text style={styles.flowLabel}>{label}</Text>
      <Text style={[styles.flowAmount, { color }]}>{formatCurrency(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  monthLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flex: 1, minWidth: '45%', gap: 8, padding: 14 },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: 11 },

  cashFlowCard: { gap: 14 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  flowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flowItem: { alignItems: 'center', gap: 4 },
  flowLabel: { color: Colors.textMuted, fontSize: 11 },
  flowAmount: { fontSize: 14, fontWeight: '700' },
  progressBarBg: { height: 5, backgroundColor: Colors.surfaceAlt, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  progressBarFill: { height: 5, borderRadius: 3 },

  statusCard: { gap: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusCount: { color: Colors.textSecondary, fontSize: 13 },

  section: { gap: 10 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 12,
  },
  paymentDot: { width: 10, height: 10, borderRadius: 5 },
  paymentInfo: { flex: 1, gap: 2 },
  paymentBill: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  paymentDate: { color: Colors.textMuted, fontSize: 12 },
  paymentAmount: { color: Colors.success, fontSize: 15, fontWeight: '700' },

  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  exportText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
