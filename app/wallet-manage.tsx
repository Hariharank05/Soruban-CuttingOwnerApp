// app/wallet-manage.tsx - Customer Wallet Management
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useWallets } from '@/context/WalletContext';
import type { WalletTransaction, CustomerWallet } from '@/types';

type TabKey = 'wallets' | 'transactions';
type TxnType = 'all' | 'credit' | 'debit' | 'refund' | 'cashback' | 'topup';

const TXN_TYPE_CONFIG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  credit: { label: 'Credit', bg: '#E8F5E9', color: '#2E7D32', icon: 'arrow-down-circle' },
  debit: { label: 'Debit', bg: '#FFEBEE', color: '#C62828', icon: 'arrow-up-circle' },
  refund: { label: 'Refund', bg: '#FFF3E0', color: '#E65100', icon: 'cash-refund' },
  cashback: { label: 'Cashback', bg: '#F3E5F5', color: '#7B1FA2', icon: 'gift-outline' },
  topup: { label: 'Top Up', bg: '#E3F2FD', color: '#1565C0', icon: 'wallet-plus' },
};

const TXN_FILTER_TABS: { key: TxnType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'credit', label: 'Credit' },
  { key: 'debit', label: 'Debit' },
  { key: 'refund', label: 'Refund' },
  { key: 'cashback', label: 'Cashback' },
  { key: 'topup', label: 'Top Up' },
];


function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function WalletManageScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [activeTab, setActiveTab] = useState<TabKey>('wallets');
  const [txnFilter, setTxnFilter] = useState<TxnType>('all');

  const { customerWallets: wallets, transactions } = useWallets();

  const totalBalance = useMemo(() => wallets.reduce((sum, w) => sum + w.balance, 0), [wallets]);
  const totalTransactions = transactions.length;
  const totalRefunds = useMemo(() => transactions.filter(t => t.type === 'refund').length, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (txnFilter === 'all') return transactions;
    return transactions.filter(t => t.type === txnFilter);
  }, [transactions, txnFilter]);

  const handleIssueRefund = (wallet: CustomerWallet) => {
    Alert.alert(
      'Issue Refund',
      `Issue a refund to ${wallet.customerName}?\n\nThis will credit the amount back to their wallet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Refund ₹100', onPress: () => Alert.alert('Success', `₹100 refunded to ${wallet.customerName}'s wallet.`) },
        { text: 'Refund ₹500', onPress: () => Alert.alert('Success', `₹500 refunded to ${wallet.customerName}'s wallet.`) },
      ]
    );
  };

  const handleAddCredit = (wallet: CustomerWallet) => {
    Alert.alert(
      'Add Credit',
      `Add promotional credit to ${wallet.customerName}'s wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add ₹100', onPress: () => Alert.alert('Success', `₹100 credit added to ${wallet.customerName}'s wallet.`) },
        { text: 'Add ₹500', onPress: () => Alert.alert('Success', `₹500 credit added to ${wallet.customerName}'s wallet.`) },
      ]
    );
  };

  const renderStatCards = () => (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
        <Icon name="wallet" size={20} color="#2E7D32" />
        <Text style={[styles.statValue, { color: '#2E7D32' }]}>{formatCurrency(totalBalance)}</Text>
        <Text style={styles.statLabel}>Total Balance</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
        <Icon name="swap-horizontal" size={20} color="#1565C0" />
        <Text style={[styles.statValue, { color: '#1565C0' }]}>{totalTransactions}</Text>
        <Text style={styles.statLabel}>Transactions</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
        <Icon name="cash-refund" size={20} color="#E65100" />
        <Text style={[styles.statValue, { color: '#E65100' }]}>{totalRefunds}</Text>
        <Text style={styles.statLabel}>Refunds</Text>
      </View>
    </View>
  );

  const renderWalletCard = ({ item }: { item: CustomerWallet }) => (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={[styles.avatarCircle, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.avatarText, { color: '#2E7D32' }]}>
            {item.customerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.customerName}</Text>
          <View style={styles.phoneRow}>
            <Icon name="phone-outline" size={13} color={COLORS.text.muted} />
            <Text style={styles.phoneText}>{item.customerPhone}</Text>
          </View>
        </View>
        <View style={styles.balanceWrap}>
          <Text style={styles.balanceAmount}>{formatCurrency(item.balance)}</Text>
          <Text style={styles.balanceLabel}>Balance</Text>
        </View>
      </View>

      <View style={styles.creditDebitRow}>
        <View style={styles.creditDebitItem}>
          <Icon name="arrow-down-circle" size={14} color="#2E7D32" />
          <Text style={[styles.creditDebitText, { color: '#2E7D32' }]}>
            {formatCurrency(item.totalCredited)} credited
          </Text>
        </View>
        <View style={styles.creditDebitItem}>
          <Icon name="arrow-up-circle" size={14} color="#C62828" />
          <Text style={[styles.creditDebitText, { color: '#C62828' }]}>
            {formatCurrency(item.totalDebited)} debited
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF3E0' }]} onPress={() => handleIssueRefund(item)}>
          <Icon name="cash-refund" size={16} color="#E65100" />
          <Text style={[styles.actionBtnText, { color: '#E65100' }]}>Issue Refund</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]} onPress={() => handleAddCredit(item)}>
          <Icon name="wallet-plus" size={16} color="#2E7D32" />
          <Text style={[styles.actionBtnText, { color: '#2E7D32' }]}>Add Credit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransactionCard = ({ item }: { item: WalletTransaction }) => {
    const config = TXN_TYPE_CONFIG[item.type] || TXN_TYPE_CONFIG.credit;
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={[styles.txnIconWrap, { backgroundColor: config.bg }]}>
            <Icon name={config.icon as any} size={20} color={config.color} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.customerName}</Text>
            <Text style={styles.txnDesc} numberOfLines={1}>{item.title}</Text>
          </View>
          <View style={styles.txnAmountWrap}>
            <Text style={[styles.txnAmount, { color: item.type === 'debit' ? '#C62828' : '#2E7D32' }]}>
              {item.type === 'debit' ? '-' : '+'}{formatCurrency(item.amount)}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
              <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
            </View>
          </View>
        </View>
        <View style={styles.txnFooter}>
          <Text style={styles.txnDate}>{formatDate(item.date)}</Text>
          <Text style={styles.txnBalanceAfter}>Balance: {formatCurrency(item.balanceAfter)}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="wallet-outline" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>
        {activeTab === 'wallets' ? 'No customer wallets' : 'No transactions found'}
      </Text>
      <Text style={styles.emptySub}>
        {activeTab === 'wallets'
          ? 'Customer wallets will appear here when they add funds'
          : 'Transactions will appear here as customers use their wallets'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Wallet Management</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {renderStatCards()}

      <View style={styles.tabRow}>
        {(['wallets', 'transactions'] as TabKey[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Icon
              name={tab === 'wallets' ? 'wallet' : 'swap-horizontal'}
              size={16}
              color={activeTab === tab ? COLORS.primary : COLORS.text.muted}
            />
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab === 'wallets' ? 'Wallets' : 'Transactions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'transactions' && (
        <View style={styles.filterRow}>
          {TXN_FILTER_TABS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.filterChip, txnFilter === item.key && styles.filterChipActive]}
              onPress={() => setTxnFilter(item.key)}
            >
              <Text style={[styles.filterChipText, txnFilter === item.key && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTab === 'wallets' ? (
        <FlatList
          data={wallets}
          keyExtractor={item => item.customerId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          renderItem={renderWalletCard}
        />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          renderItem={renderTransactionCard}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },

  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingTop: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: SPACING.xs },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted },

  tabRow: { flexDirection: 'row', marginHorizontal: SPACING.base, marginTop: SPACING.md, backgroundColor: '#F5F5F5', borderRadius: RADIUS.lg, padding: 3 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.md },
  tabBtnActive: { backgroundColor: '#FFF', ...SHADOW.sm },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.text.muted },
  tabBtnTextActive: { color: COLORS.primary, fontWeight: '700' },

  filterRow: { flexDirection: 'row' as const, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: COLORS.backgroundSoft, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  filterChipTextActive: { color: COLORS.primary },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  avatarText: { fontSize: 18, fontWeight: '800' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  phoneText: { fontSize: 12, color: COLORS.text.muted },

  balanceWrap: { alignItems: 'flex-end' },
  balanceAmount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  balanceLabel: { fontSize: 10, color: COLORS.text.muted, fontWeight: '600' },

  creditDebitRow: { flexDirection: 'row', gap: SPACING.base, marginBottom: SPACING.sm, paddingTop: SPACING.xs },
  creditDebitItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  creditDebitText: { fontSize: 11, fontWeight: '600' },

  cardActions: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  actionBtnText: { fontSize: 12, fontWeight: '700' },

  txnIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  txnDesc: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  txnAmountWrap: { alignItems: 'flex-end', gap: 4 },
  txnAmount: { fontSize: 15, fontWeight: '800' },
  typeBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  typeBadgeText: { fontSize: 9, fontWeight: '800' },
  txnFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.xs, marginTop: SPACING.xs },
  txnDate: { fontSize: 11, color: COLORS.text.muted },
  txnBalanceAfter: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
