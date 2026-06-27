import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBillsStore } from '../../store/billsStore';
import { Colors } from '../../constants/colors';
import { CATEGORIES, BillCategory } from '../../constants/categories';
import { BillType } from '../../store/types';

const BILL_TYPES: { id: BillType; label: string; description: string }[] = [
  { id: 'recurring', label: 'Recurring', description: 'Resets every month (Netflix, phone bill)' },
  { id: 'installment', label: 'Installment', description: 'X payments (Klarna, BNPL)' },
  { id: 'one-time', label: 'One-Time', description: 'Single payment, then done' },
  { id: 'payment-plan', label: 'Payment Plan', description: 'Multiple installments (IRS, medical)' },
];

export default function AddBillScreen() {
  const addBill = useBillsStore(s => s.addBill);
  const addNote = useBillsStore(s => s.addNote);

  const [name, setName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [type, setType] = useState<BillType>('recurring');
  const [category, setCategory] = useState<BillCategory>('other');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [specificDate, setSpecificDate] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [remainingInstallments, setRemainingInstallments] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a bill name.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    let nextDueDate: string;
    if (type === 'one-time' && specificDate) {
      nextDueDate = new Date(specificDate).toISOString();
    } else if (dueDay) {
      const day = parseInt(dueDay);
      const today = new Date();
      const due = new Date(today.getFullYear(), today.getMonth(), day);
      if (due <= today) due.setMonth(due.getMonth() + 1);
      nextDueDate = due.toISOString();
    } else {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextDueDate = nextMonth.toISOString();
    }

    const parsedBalance = balance ? parseFloat(balance) : undefined;
    const parsedTotal = totalInstallments ? parseInt(totalInstallments) : undefined;
    const parsedRemaining = remainingInstallments ? parseInt(remainingInstallments) : parsedTotal;

    const newBill = await addBill({
      name: name.trim(),
      creditor: creditor.trim() || name.trim(),
      type,
      category,
      amount: parsedAmount,
      dueDay: dueDay ? parseInt(dueDay) : undefined,
      nextDueDate,
      balance: parsedBalance,
      originalBalance: parsedBalance,
      totalInstallments: parsedTotal,
      remainingInstallments: parsedRemaining,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      minimumPayment: minimumPayment ? parseFloat(minimumPayment) : undefined,
      currentPayment: parsedAmount,
      website: website.trim() || undefined,
      phone: phone.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      autoPayEnabled,
    });

    if (notes.trim()) {
      await addNote(newBill.id, notes.trim());
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Bill Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bill Type</Text>
          <View style={styles.typeGrid}>
            {BILL_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeCard, type === t.id && styles.typeCardActive]}
                onPress={() => setType(t.id)}
              >
                <Text style={[styles.typeName, type === t.id && styles.typeNameActive]}>{t.label}</Text>
                <Text style={styles.typeDesc}>{t.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Basic Info</Text>
          <View style={styles.fieldGroup}>
            <Field label="Bill Name *" placeholder="e.g. Netflix" value={name} onChangeText={setName} />
            <Field label="Creditor / Company" placeholder="e.g. Netflix Inc." value={creditor} onChangeText={setCreditor} />
            <Field
              label="Amount *"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              prefix="$"
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={14}
                    color={category === cat.id ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={[styles.categoryText, category === cat.id && styles.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Due Date</Text>
          <View style={styles.fieldGroup}>
            {type !== 'one-time' ? (
              <Field
                label="Day of Month (1–31)"
                placeholder="e.g. 15"
                value={dueDay}
                onChangeText={setDueDay}
                keyboardType="number-pad"
              />
            ) : (
              <Field
                label="Due Date (YYYY-MM-DD)"
                placeholder="2025-07-04"
                value={specificDate}
                onChangeText={setSpecificDate}
              />
            )}
          </View>
        </View>

        {/* Installment Details */}
        {(type === 'installment' || type === 'payment-plan') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Installment Details</Text>
            <View style={styles.fieldGroup}>
              <Field
                label="Total Installments"
                placeholder="e.g. 12"
                value={totalInstallments}
                onChangeText={setTotalInstallments}
                keyboardType="number-pad"
              />
              <Field
                label="Remaining Installments"
                placeholder="e.g. 8"
                value={remainingInstallments}
                onChangeText={setRemainingInstallments}
                keyboardType="number-pad"
              />
              <Field
                label="Remaining Balance"
                placeholder="0.00"
                value={balance}
                onChangeText={setBalance}
                keyboardType="decimal-pad"
                prefix="$"
              />
            </View>
          </View>
        )}

        {/* Loan / Credit Card Details */}
        {(type === 'payment-plan' || category === 'credit-card' || category === 'loan') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Loan Details</Text>
            <View style={styles.fieldGroup}>
              <Field
                label="Interest Rate (APR)"
                placeholder="e.g. 24.99"
                value={interestRate}
                onChangeText={setInterestRate}
                keyboardType="decimal-pad"
                suffix="%"
              />
              <Field
                label="Minimum Payment"
                placeholder="0.00"
                value={minimumPayment}
                onChangeText={setMinimumPayment}
                keyboardType="decimal-pad"
                prefix="$"
              />
              {!balance && (
                <Field
                  label="Current Balance"
                  placeholder="0.00"
                  value={balance}
                  onChangeText={setBalance}
                  keyboardType="decimal-pad"
                  prefix="$"
                />
              )}
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Contact Info (optional)</Text>
          <View style={styles.fieldGroup}>
            <Field label="Website" placeholder="https://" value={website} onChangeText={setWebsite} keyboardType="url" />
            <Field label="Phone" placeholder="(555) 000-0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label="Account Number" placeholder="Last 4 digits or full" value={accountNumber} onChangeText={setAccountNumber} />
          </View>
        </View>

        {/* Auto Pay */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Auto-Pay Enabled</Text>
              <Text style={styles.toggleSubtext}>This bill is set up on auto-pay</Text>
            </View>
            <Switch
              value={autoPayEnabled}
              onValueChange={setAutoPayEnabled}
              trackColor={{ false: Colors.surfaceAlt, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any additional notes..."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.text} />
          <Text style={styles.saveBtnText}>Save Bill</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label, placeholder, value, onChangeText, keyboardType, prefix, suffix,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        {prefix && <Text style={styles.inputAddon}>{prefix}</Text>}
        <TextInput
          style={[styles.input, prefix && styles.inputWithPrefix, suffix && styles.inputWithSuffix]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
        />
        {suffix && <Text style={styles.inputAddon}>{suffix}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 24, paddingBottom: 40 },

  section: { gap: 12 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },

  typeGrid: { gap: 8 },
  typeCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 4,
  },
  typeCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeName: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  typeNameActive: { color: Colors.primary },
  typeDesc: { color: Colors.textMuted, fontSize: 12 },

  fieldGroup: { gap: 12 },
  field: { gap: 6 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputWithPrefix: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  inputWithSuffix: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  inputAddon: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Colors.textSecondary,
    fontSize: 15,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  categoryRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  categoryText: { color: Colors.textSecondary, fontSize: 13 },
  categoryTextActive: { color: Colors.primary, fontWeight: '600' },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  toggleLabel: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  toggleSubtext: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },

  textArea: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 100,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveBtnText: { color: Colors.text, fontSize: 17, fontWeight: '700' },
});
