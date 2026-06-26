import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBillsStore } from '../../store/billsStore';
import { Colors } from '../../constants/colors';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDueDate, format, parseISO } from '../../utils/dateUtils';
import { Note, Payment } from '../../store/types';

const PAYMENT_METHODS = ['Bank Transfer', 'Debit Card', 'Credit Card', 'Cash', 'Venmo', 'Zelle', 'Check', 'Auto-Pay'];

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getBillById = useBillsStore(s => s.getBillById);
  const logPayment = useBillsStore(s => s.logPayment);
  const addNote = useBillsStore(s => s.addNote);
  const deleteNote = useBillsStore(s => s.deleteNote);
  const deleteBill = useBillsStore(s => s.deleteBill);
  const updateBill = useBillsStore(s => s.updateBill);

  const bill = getBillById(id);

  const [showPayModal, setShowPayModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payExtra, setPayExtra] = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [payNote, setPayNote] = useState('');
  const [noteText, setNoteText] = useState('');

  if (!bill) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Bill not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLogPayment = async () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Enter a valid payment amount.');
      return;
    }
    await logPayment(bill.id, {
      date: new Date().toISOString(),
      amount,
      extraAmount: payExtra ? parseFloat(payExtra) : undefined,
      paymentMethod: payMethod || undefined,
      notes: payNote || undefined,
    });
    setShowPayModal(false);
    setPayAmount('');
    setPayExtra('');
    setPayMethod('');
    setPayNote('');
    Alert.alert('Payment Logged!', `$${amount.toFixed(2)} logged for ${bill.name}.`);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote(bill.id, noteText.trim());
    setNoteText('');
    setShowNoteModal(false);
  };

  const handleDeleteBill = () => {
    Alert.alert('Delete Bill', `Are you sure you want to delete "${bill.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteBill(bill.id);
          router.back();
        }
      },
    ]);
  };

  const handleMarkPaid = () => {
    Alert.alert('Mark as Paid', `Mark "${bill.name}" as fully paid off?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Paid', onPress: async () => {
          await updateBill(bill.id, { status: 'paid', paidAt: new Date().toISOString() });
          router.back();
        }
      },
    ]);
  };

  const totalPaid = bill.paymentHistory.reduce((s, p) => s + p.amount, 0);
  const progressPct = bill.originalBalance
    ? Math.min(100, (totalPaid / bill.originalBalance) * 100)
    : 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: bill.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteBill}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <GlassCard style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={[styles.colorBadge, { backgroundColor: bill.color + '22', borderColor: bill.color + '44' }]}>
              <View style={[styles.colorDot, { backgroundColor: bill.color }]} />
              <Text style={[styles.typeBadge, { color: bill.color }]}>{bill.type.replace('-', ' ').toUpperCase()}</Text>
            </View>
            <StatusBadge status={bill.status} />
          </View>

          <Text style={styles.billName}>{bill.name}</Text>
          {bill.creditor !== bill.name && <Text style={styles.creditor}>{bill.creditor}</Text>}

          <View style={styles.amountRow}>
            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>Payment</Text>
              <Text style={styles.amountValue}>{formatCurrency(bill.currentPayment || bill.amount)}</Text>
            </View>
            {bill.balance !== undefined && (
              <View style={styles.amountBlock}>
                <Text style={styles.amountLabel}>Balance</Text>
                <Text style={styles.amountValue}>{formatCurrency(bill.balance)}</Text>
              </View>
            )}
            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>Due Date</Text>
              <Text style={[styles.amountValue, {
                color: bill.status === 'overdue' ? Colors.danger
                  : bill.status === 'due-soon' ? Colors.warning
                  : Colors.text
              }]}>
                {formatDueDate(bill.nextDueDate)}
              </Text>
            </View>
          </View>

          {bill.originalBalance && bill.originalBalance > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>Paid: {formatCurrency(totalPaid)}</Text>
                <Text style={styles.progressLabel}>{progressPct.toFixed(0)}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: bill.color }]} />
              </View>
            </View>
          )}
        </GlassCard>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { setPayAmount(String(bill.currentPayment || bill.amount)); setShowPayModal(true); }}>
            <Ionicons name="cash" size={18} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Log Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowNoteModal(true)}>
            <Ionicons name="create" size={18} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Add Note</Text>
          </TouchableOpacity>
          {bill.status !== 'paid' && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleMarkPaid}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={[styles.actionBtnText, { color: Colors.success }]}>Mark Paid</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Details */}
        <GlassCard style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Details</Text>
          <DetailRow icon="calendar-outline" label="Next Due" value={format(parseISO(bill.nextDueDate), 'MMMM d, yyyy')} />
          {bill.interestRate && <DetailRow icon="trending-up-outline" label="Interest Rate" value={`${bill.interestRate}% APR`} />}
          {bill.minimumPayment && <DetailRow icon="arrow-down-circle-outline" label="Minimum Payment" value={formatCurrency(bill.minimumPayment)} />}
          {bill.totalInstallments && <DetailRow icon="list-circle-outline" label="Total Installments" value={String(bill.totalInstallments)} />}
          {bill.remainingInstallments !== undefined && <DetailRow icon="time-outline" label="Remaining" value={`${bill.remainingInstallments} payments`} />}
          {bill.accountNumber && <DetailRow icon="card-outline" label="Account #" value={bill.accountNumber} />}
          {bill.website && <DetailRow icon="globe-outline" label="Website" value={bill.website} />}
          {bill.phone && <DetailRow icon="call-outline" label="Phone" value={bill.phone} />}
          <DetailRow icon="refresh-circle-outline" label="Auto-Pay" value={bill.autoPayEnabled ? 'Enabled' : 'Disabled'} />
          <DetailRow icon="time-outline" label="Added" value={format(new Date(bill.createdAt), 'MMM d, yyyy')} />
        </GlassCard>

        {/* Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Notes ({bill.notes.length})</Text>
            <TouchableOpacity onPress={() => setShowNoteModal(true)}>
              <Ionicons name="add-circle" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {bill.notes.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No notes yet</Text>
            </GlassCard>
          ) : (
            bill.notes.map(note => (
              <NoteRow key={note.id} note={note} onDelete={() => deleteNote(bill.id, note.id)} />
            ))
          )}
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.cardTitle}>Payment History ({bill.paymentHistory.length})</Text>
          {bill.paymentHistory.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No payments logged yet</Text>
            </GlassCard>
          ) : (
            bill.paymentHistory.map(payment => (
              <PaymentRow key={payment.id} payment={payment} color={bill.color} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Log Payment Modal */}
      <Modal visible={showPayModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Log Payment — {bill.name}</Text>

            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={payAmount}
              onChangeText={setPayAmount}
              autoFocus
            />

            <Text style={styles.fieldLabel}>Extra Payment (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={payExtra}
              onChangeText={setPayExtra}
            />

            <Text style={styles.fieldLabel}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {PAYMENT_METHODS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, payMethod === m && styles.chipActive]}
                  onPress={() => setPayMethod(m)}
                >
                  <Text style={[styles.chipText, payMethod === m && styles.chipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. On time, called to verify..."
              placeholderTextColor={Colors.textMuted}
              value={payNote}
              onChangeText={setPayNote}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPayModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleLogPayment}>
                <Text style={styles.saveText}>Log Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Note Modal */}
      <Modal visible={showNoteModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Note</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Called bank, payment arranged, extension granted..."
              placeholderTextColor={Colors.textMuted}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              autoFocus
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNoteModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddNote}>
                <Text style={styles.saveText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color={Colors.textMuted} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function NoteRow({ note, onDelete }: { note: Note; onDelete: () => void }) {
  return (
    <GlassCard style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteDate}>{format(new Date(note.createdAt), 'MMM d, yyyy · HH:mm')}</Text>
        <TouchableOpacity onPress={onDelete}>
          <Ionicons name="trash-outline" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={styles.noteText}>{note.text}</Text>
    </GlassCard>
  );
}

function PaymentRow({ payment, color }: { payment: Payment; color: string }) {
  return (
    <View style={styles.paymentRow}>
      <View style={[styles.paymentIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name="checkmark" size={14} color={color} />
      </View>
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
        {payment.extraAmount ? <Text style={styles.paymentExtra}>+{formatCurrency(payment.extraAmount)} extra</Text> : null}
        <Text style={styles.paymentDate}>{format(new Date(payment.date), 'MMM d, yyyy')}</Text>
        {payment.paymentMethod && <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>}
        {payment.notes && <Text style={styles.paymentNote}>{payment.notes}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { color: Colors.text, fontSize: 18 },
  backLink: { color: Colors.primary, fontSize: 16 },

  headerCard: { gap: 14 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  colorBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  typeBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  billName: { color: Colors.text, fontSize: 24, fontWeight: '800' },
  creditor: { color: Colors.textSecondary, fontSize: 14, marginTop: -6 },
  amountRow: { flexDirection: 'row', gap: 20 },
  amountBlock: { gap: 4 },
  amountLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  amountValue: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  progressSection: { gap: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: Colors.textMuted, fontSize: 11 },
  progressBarBg: { height: 6, backgroundColor: Colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
  },
  actionBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  detailsCard: { gap: 12 },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { flex: 1, color: Colors.textSecondary, fontSize: 13 },
  detailValue: { color: Colors.text, fontSize: 13, fontWeight: '600' },

  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  emptyCard: { alignItems: 'center', paddingVertical: 16 },
  emptyText: { color: Colors.textMuted, fontSize: 13 },

  noteCard: { gap: 6, padding: 12 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteDate: { color: Colors.textMuted, fontSize: 11 },
  noteText: { color: Colors.text, fontSize: 13, lineHeight: 20 },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  paymentIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  paymentInfo: { flex: 1, gap: 2 },
  paymentAmount: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  paymentExtra: { color: Colors.success, fontSize: 12 },
  paymentDate: { color: Colors.textMuted, fontSize: 12 },
  paymentMethod: { color: Colors.textSecondary, fontSize: 12 },
  paymentNote: { color: Colors.textSecondary, fontSize: 12, fontStyle: 'italic' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 14 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.textMuted, alignSelf: 'center', marginBottom: 8 },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  fieldLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, color: Colors.text, fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
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
