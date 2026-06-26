import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBillsStore } from '../../store/billsStore';
import { useBudgetStore } from '../../store/budgetStore';
import { Colors } from '../../constants/colors';
import { GlassCard } from '../../components/ui/GlassCard';
import { getAIInsights } from '../../utils/calculations';
import { formatCurrency, getCurrentMonth } from '../../utils/dateUtils';
import { AIMessage } from '../../store/types';

const QUICK_PROMPTS = [
  'Which bills should I pay first?',
  'How can I save money this month?',
  'What\'s my highest priority debt?',
  'Am I on track financially?',
  'How do I avoid late fees?',
];

function buildContext(bills: any[], income: number, totalBills: number, available: number): string {
  const active = bills.filter((b: any) => b.status !== 'paid');
  const overdue = active.filter((b: any) => b.status === 'overdue');
  const dueThisWeek = active.filter((b: any) => b.status === 'due-this-week' || b.status === 'due-soon');

  return `USER'S FINANCIAL CONTEXT:
- Monthly income logged: $${income.toFixed(2)}
- Total monthly bill payments: $${totalBills.toFixed(2)}
- Available cash after bills: $${available.toFixed(2)}
- Active bills: ${active.length}
- Overdue bills: ${overdue.length} (${overdue.map((b: any) => b.name).join(', ') || 'none'})
- Due this week: ${dueThisWeek.length} (${dueThisWeek.map((b: any) => `${b.name} $${b.amount}`).join(', ') || 'none'})
- All active bills: ${active.map((b: any) => `${b.name}: $${b.amount}/mo, due ${b.nextDueDate.slice(0, 10)}, status: ${b.status}${b.interestRate ? `, ${b.interestRate}% APR` : ''}`).join(' | ')}`;
}

export default function AssistantScreen() {
  const bills = useBillsStore(s => s.bills);
  const getTotalMonthlyPayments = useBillsStore(s => s.getTotalMonthlyPayments);
  const getMonthIncome = useBudgetStore(s => s.getMonthIncome);
  const getAvailableCash = useBudgetStore(s => s.getAvailableCash);

  const month = getCurrentMonth();
  const income = getMonthIncome(month);
  const totalBills = getTotalMonthlyPayments();
  const available = getAvailableCash(month, totalBills);

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const insights = getAIInsights(bills, available);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const context = buildContext(bills, income, totalBills, available);
      const history = [...messages, userMsg].map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: `You are a personal financial assistant inside a bill management app. Be concise, practical, and empathetic. Use plain English. Focus on actionable advice.

${context}

Always refer to specific bills and amounts from the user's data. Be encouraging but honest.`,
          messages: history,
        }),
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const assistantText = data.content?.[0]?.text || 'I had trouble processing that. Please try again.';

      const assistantMsg: AIMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: assistantText,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: AIMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: 'I couldn\'t connect right now. Check your internet connection and API key in settings. In the meantime: ' + (insights[0] || 'Keep tracking your bills — you\'re doing great!'),
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, bills, income, totalBills, available, loading, insights]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Proactive Insights */}
        {messages.length === 0 && (
          <View style={styles.welcomeArea}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>AI Financial Assistant</Text>
            <Text style={styles.welcomeSubtitle}>
              I know your bills and cash flow. Ask me anything.
            </Text>

            {insights.length > 0 && (
              <View style={styles.insightsSection}>
                <Text style={styles.insightsLabel}>Proactive Insights</Text>
                {insights.map((insight, i) => (
                  <GlassCard key={i} style={styles.insightCard}>
                    <View style={styles.insightRow}>
                      <View style={[styles.insightDot, { backgroundColor: i === 0 ? Colors.danger : Colors.primary }]} />
                      <Text style={styles.insightText}>{insight}</Text>
                    </View>
                  </GlassCard>
                ))}
              </View>
            )}

            <Text style={styles.quickLabel}>Quick Questions</Text>
            <View style={styles.quickGrid}>
              {QUICK_PROMPTS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={styles.quickChip}
                  onPress={() => sendMessage(p)}
                >
                  <Text style={styles.quickChipText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Messages */}
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}
          >
            {msg.role === 'assistant' && (
              <View style={styles.assistantIcon}>
                <Ionicons name="sparkles" size={12} color={Colors.primary} />
              </View>
            )}
            <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userContent : styles.assistantContent]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={[styles.bubble, styles.assistantBubble]}>
            <View style={styles.assistantIcon}>
              <Ionicons name="sparkles" size={12} color={Colors.primary} />
            </View>
            <View style={styles.assistantContent}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputArea}>
        {messages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            {QUICK_PROMPTS.slice(0, 3).map(p => (
              <TouchableOpacity key={p} style={styles.quickChipSmall} onPress={() => sendMessage(p)}>
                <Text style={styles.quickChipSmallText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your finances..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 16 },

  welcomeArea: { alignItems: 'center', gap: 16, paddingTop: 20 },
  aiAvatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  welcomeTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  welcomeSubtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },

  insightsSection: { width: '100%', gap: 8 },
  insightsLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  insightCard: { padding: 12 },
  insightRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  insightText: { flex: 1, color: Colors.text, fontSize: 13, lineHeight: 20 },

  quickLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', alignSelf: 'flex-start' },
  quickGrid: { width: '100%', gap: 8 },
  quickChip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  quickChipText: { color: Colors.textSecondary, fontSize: 13 },

  bubble: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  userBubble: { justifyContent: 'flex-end' },
  assistantBubble: { justifyContent: 'flex-start' },
  assistantIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubbleContent: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userContent: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  assistantContent: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  bubbleText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff' },

  inputArea: { borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface, paddingBottom: 8 },
  quickScroll: { paddingHorizontal: 12, paddingTop: 8, flexGrow: 0 },
  quickChipSmall: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  quickChipSmallText: { color: Colors.textSecondary, fontSize: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
