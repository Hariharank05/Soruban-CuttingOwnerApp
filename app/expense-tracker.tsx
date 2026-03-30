import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
  TextInput, Alert, Modal, ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';

type ExpenseCategory = 'purchase' | 'delivery' | 'salary' | 'rent' | 'utilities' | 'packaging' | 'maintenance' | 'other';
type TimeRange = 'today' | 'week' | 'month';

const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string; icon: string; color: string; bg: string }[] = [
  { key: 'purchase', label: 'Purchase / Stock', icon: 'cart', color: '#E65100', bg: '#FFF3E0' },
  { key: 'delivery', label: 'Delivery Cost', icon: 'truck-delivery', color: '#1565C0', bg: '#E3F2FD' },
  { key: 'salary', label: 'Staff Salary', icon: 'account-group', color: '#7B1FA2', bg: '#F3E5F5' },
  { key: 'rent', label: 'Rent', icon: 'home-city', color: '#00796B', bg: '#E0F7FA' },
  { key: 'utilities', label: 'Utilities / Bills', icon: 'lightning-bolt', color: '#FFA000', bg: '#FFF8E1' },
  { key: 'packaging', label: 'Packaging', icon: 'package-variant-closed', color: '#388E3C', bg: '#E8F5E9' },
  { key: 'maintenance', label: 'Maintenance', icon: 'wrench', color: '#546E7A', bg: '#ECEFF1' },
  { key: 'other', label: 'Other', icon: 'dots-horizontal-circle', color: '#616161', bg: '#F5F5F5' },
];

interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
}

const SAMPLE_EXPENSES: Expense[] = [
  { id: 'exp_1', category: 'purchase', amount: 12500, description: 'Morning vegetable purchase from mandi', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'exp_2', category: 'delivery', amount: 800, description: 'Petrol for delivery bikes', date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'exp_3', category: 'packaging', amount: 450, description: 'Bags and containers', date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 'exp_4', category: 'salary', amount: 15000, description: 'Weekly salary - 3 staff', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'exp_5', category: 'purchase', amount: 8200, description: 'Fruits bulk purchase', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'exp_6', category: 'utilities', amount: 2500, description: 'Electricity bill', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'exp_7', category: 'delivery', amount: 600, description: 'Delivery boy lunch allowance', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'exp_8', category: 'purchase', amount: 9800, description: 'Vegetable stock refill', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'exp_9', category: 'maintenance', amount: 1200, description: 'Knife sharpening service', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'exp_10', category: 'rent', amount: 25000, description: 'Monthly shop rent', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ExpenseTrackerScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { orders } = useOrders();
  const [expenses, setExpenses] = useState<Expense[]>(SAMPLE_EXPENSES);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add expense form state
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('purchase');
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Filter expenses by time range
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.date);
      if (timeRange === 'today') return d.toDateString() === now.toDateString();
      if (timeRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, timeRange]);

  // Revenue from orders in same time range
  const revenue = useMemo(() => {
    const now = new Date();
    const delivered = orders.filter(o => {
      if (o.status !== 'delivered') return false;
      const d = new Date(o.createdAt);
      if (timeRange === 'today') return d.toDateString() === now.toDateString();
      if (timeRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return delivered.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders, timeRange]);

  const totalExpenses = useMemo(() => filteredExpenses.reduce((s, e) => s + e.amount, 0), [filteredExpenses]);
  const profit = revenue - totalExpenses;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of filteredExpenses) {
      map[e.category] = (map[e.category] || 0) + e.amount;
    }
    return EXPENSE_CATEGORIES
      .filter(c => map[c.key])
      .map(c => ({ ...c, amount: map[c.key] || 0, percent: totalExpenses > 0 ? Math.round((map[c.key] / totalExpenses) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, totalExpenses]);

  const handleAddExpense = useCallback(() => {
    const amount = parseFloat(newAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!newDescription.trim()) {
      Alert.alert('Description Required', 'Please add a short description.');
      return;
    }
    const expense: Expense = {
      id: `exp_${Date.now()}`,
      category: newCategory,
      amount,
      description: newDescription.trim(),
      date: new Date().toISOString(),
    };
    setExpenses(prev => [expense, ...prev]);
    setNewAmount('');
    setNewDescription('');
    setNewCategory('purchase');
    setShowAddModal(false);
  }, [newAmount, newDescription, newCategory]);

  const handleDeleteExpense = useCallback((id: string) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setExpenses(prev => prev.filter(e => e.id !== id)) },
    ]);
  }, []);

  const renderExpenseCard = ({ item }: { item: Expense }) => {
    const catConfig = EXPENSE_CATEGORIES.find(c => c.key === item.category) || EXPENSE_CATEGORIES[7];
    return (
      <View style={[styles.expenseCard, themed.card]}>
        <View style={[styles.expenseIcon, { backgroundColor: catConfig.bg }]}>
          <Icon name={catConfig.icon as any} size={20} color={catConfig.color} />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={[styles.expenseName, themed.textPrimary]}>{item.description}</Text>
          <View style={styles.expenseMeta}>
            <View style={[styles.categoryPill, { backgroundColor: catConfig.bg }]}>
              <Text style={[styles.categoryPillText, { color: catConfig.color }]}>{catConfig.label}</Text>
            </View>
            <Text style={styles.expenseDate}>{formatDate(item.date)} · {formatTime(item.date)}</Text>
          </View>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>{'\u20B9'}{item.amount.toLocaleString('en-IN')}</Text>
          <TouchableOpacity onPress={() => handleDeleteExpense(item.id)} style={styles.deleteBtn}>
            <Icon name="delete-outline" size={16} color="#C62828" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Profit/Loss Card */}
      <View style={[styles.profitCard, { backgroundColor: profit >= 0 ? '#E8F5E9' : '#FFEBEE' }]}>
        <View style={styles.profitRow}>
          <View style={styles.profitCol}>
            <Text style={styles.profitLabel}>Revenue</Text>
            <Text style={[styles.profitValue, { color: '#388E3C' }]}>{'\u20B9'}{revenue.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.profitDivider} />
          <View style={styles.profitCol}>
            <Text style={styles.profitLabel}>Expenses</Text>
            <Text style={[styles.profitValue, { color: '#C62828' }]}>{'\u20B9'}{totalExpenses.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.profitDivider} />
          <View style={styles.profitCol}>
            <Text style={styles.profitLabel}>{profit >= 0 ? 'Profit' : 'Loss'}</Text>
            <Text style={[styles.profitValue, { color: profit >= 0 ? '#388E3C' : '#C62828' }]}>
              {profit >= 0 ? '+' : ''}{'\u20B9'}{Math.abs(profit).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        <View style={[styles.profitBar]}>
          <View style={[styles.profitBarFill, {
            width: `${revenue > 0 ? Math.min((totalExpenses / revenue) * 100, 100) : 0}%`,
            backgroundColor: profit >= 0 ? '#66BB6A' : '#EF5350',
          }]} />
        </View>
        <Text style={styles.profitHint}>
          {profit >= 0
            ? `Expenses are ${revenue > 0 ? Math.round((totalExpenses / revenue) * 100) : 0}% of revenue`
            : 'Expenses exceed revenue — reduce costs or increase orders'}
        </Text>
      </View>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <View style={[styles.breakdownCard, themed.card]}>
          <Text style={[styles.breakdownTitle, themed.textPrimary]}>Expense Breakdown</Text>
          {categoryBreakdown.map((cat) => (
            <View key={cat.key} style={styles.breakdownRow}>
              <View style={[styles.breakdownIcon, { backgroundColor: cat.bg }]}>
                <Icon name={cat.icon as any} size={16} color={cat.color} />
              </View>
              <Text style={[styles.breakdownLabel, themed.textPrimary]} numberOfLines={1}>{cat.label}</Text>
              <View style={styles.breakdownBarTrack}>
                <View style={[styles.breakdownBarFill, { width: `${cat.percent}%`, backgroundColor: cat.color }]} />
              </View>
              <Text style={styles.breakdownAmount}>{'\u20B9'}{cat.amount.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.listHeaderRow}>
        <Text style={[styles.listTitle, themed.textPrimary]}>Recent Expenses</Text>
        <Text style={styles.listCount}>{filteredExpenses.length} entries</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Expense Tracker</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
              <Icon name="plus" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Time Range */}
      <View style={styles.timeTabs}>
        {([
          { key: 'today' as TimeRange, label: 'Today' },
          { key: 'week' as TimeRange, label: 'This Week' },
          { key: 'month' as TimeRange, label: 'This Month' },
        ]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.timeTab, timeRange === tab.key && styles.timeTabActive]}
            onPress={() => setTimeRange(tab.key)}
          >
            <Text style={[styles.timeTabText, timeRange === tab.key && styles.timeTabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={item => item.id}
        renderItem={renderExpenseCard}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="cash-register" size={56} color={COLORS.text.muted} />
            <Text style={[styles.emptyTitle, themed.textPrimary]}>No expenses recorded</Text>
            <Text style={styles.emptyDesc}>Tap + to log your first expense</Text>
          </View>
        }
      />

      {/* Add Expense Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalSafe, themed.safeArea]} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, themed.textPrimary]}>Add Expense</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalClose}>
              <Icon name="close" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.formLabel}>Category *</Text>
            <View style={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.categoryChip, newCategory === cat.key && { backgroundColor: cat.bg, borderColor: cat.color }]}
                  onPress={() => setNewCategory(cat.key)}
                >
                  <Icon name={cat.icon as any} size={18} color={newCategory === cat.key ? cat.color : COLORS.text.muted} />
                  <Text style={[styles.categoryChipText, newCategory === cat.key && { color: cat.color }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Amount (₹) *</Text>
            <TextInput
              style={[styles.input, themed.inputBg]}
              value={newAmount}
              onChangeText={setNewAmount}
              placeholder="e.g. 5000"
              placeholderTextColor={COLORS.text.muted}
              keyboardType="numeric"
            />

            <Text style={styles.formLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.inputMulti, themed.inputBg]}
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="e.g. Morning vegetable purchase from mandi"
              placeholderTextColor={COLORS.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddExpense} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Icon name="check" size={20} color="#FFF" />
                <Text style={styles.submitBtnText}>Add Expense</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  /* Time Tabs */
  timeTabs: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.xs },
  timeTab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: '#F5F5F5' },
  timeTabActive: { backgroundColor: COLORS.primary },
  timeTabText: { fontSize: 12, fontWeight: '700', color: COLORS.text.muted },
  timeTabTextActive: { color: '#FFF' },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  /* Profit Card */
  profitCard: { borderRadius: RADIUS.xl, padding: SPACING.base, marginBottom: SPACING.md },
  profitRow: { flexDirection: 'row', alignItems: 'center' },
  profitCol: { flex: 1, alignItems: 'center' },
  profitLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text.muted },
  profitValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  profitDivider: { width: 1, height: 36, backgroundColor: 'rgba(0,0,0,0.1)' },
  profitBar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.06)', marginTop: SPACING.md, overflow: 'hidden' },
  profitBarFill: { height: 8, borderRadius: 4 },
  profitHint: { fontSize: 11, color: COLORS.text.muted, textAlign: 'center', marginTop: SPACING.xs, fontWeight: '500' },

  /* Breakdown */
  breakdownCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  breakdownTitle: { fontSize: 15, fontWeight: '800', marginBottom: SPACING.md },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  breakdownIcon: { width: 30, height: 30, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  breakdownLabel: { fontSize: 12, fontWeight: '600', width: 80 },
  breakdownBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#F0F0F0', overflow: 'hidden' },
  breakdownBarFill: { height: 8, borderRadius: 4 },
  breakdownAmount: { fontSize: 12, fontWeight: '800', color: COLORS.text.primary, width: 70, textAlign: 'right' },

  /* List Header */
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  listTitle: { fontSize: 15, fontWeight: '800' },
  listCount: { fontSize: 12, color: COLORS.text.muted, fontWeight: '600' },

  /* Expense Card */
  expenseCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, ...SHADOW.sm },
  expenseIcon: { width: 42, height: 42, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  expenseInfo: { flex: 1 },
  expenseName: { fontSize: 13, fontWeight: '600' },
  expenseMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  categoryPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  categoryPillText: { fontSize: 9, fontWeight: '700' },
  expenseDate: { fontSize: 10, color: COLORS.text.muted },
  expenseRight: { alignItems: 'flex-end', gap: 6 },
  expenseAmount: { fontSize: 15, fontWeight: '800', color: '#C62828' },
  deleteBtn: { padding: 4 },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, color: COLORS.text.muted },

  /* Modal */
  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  modalScroll: { flex: 1, paddingHorizontal: SPACING.lg },

  formLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#FAFAFA',
  },
  categoryChipText: { fontSize: 11, fontWeight: '600', color: COLORS.text.muted },

  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontSize: 15, color: COLORS.text.primary,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },

  submitBtn: { borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.xl },
  submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: 16 },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
});
