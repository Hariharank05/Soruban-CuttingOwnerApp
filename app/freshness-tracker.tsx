import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView,
  StatusBar, Switch, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';

type TabKey = 'alerts' | 'wastage' | 'settings';

interface FreshnessAlert {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; deliveredDate: string; bestBefore: string; daysLeft: number; category: string }[];
  status: 'pending' | 'sent' | 'read' | 'acted';
  alertType: 'reminder' | 'warning' | 'expired';
  scheduledTime?: string;
}

interface WastageRecord {
  id: string;
  date: string;
  category: string;
  itemName: string;
  quantity: string;
  reason: 'expired' | 'damaged' | 'returned' | 'quality_fail';
  cost: number;
  orderId?: string;
  customerName?: string;
}

interface FreshnessRule {
  id: string;
  category: string;
  item: string;
  shelfLifeDays: number;
  reminderDayBefore: number;
  notificationType: 'push' | 'sms' | 'both';
  enabled: boolean;
  tipMessage: string;
}

const DEMO_ALERTS: FreshnessAlert[] = [
  {
    id: 'FA1', orderId: 'ORD1001', customerName: 'Priya Sharma', customerPhone: '9876543210',
    items: [
      { name: 'Carrots (Cubed)', deliveredDate: '2026-03-15', bestBefore: '2026-03-18', daysLeft: 0, category: 'Vegetables' },
      { name: 'Beans (Sliced)', deliveredDate: '2026-03-15', bestBefore: '2026-03-18', daysLeft: 0, category: 'Vegetables' },
    ],
    status: 'pending', alertType: 'warning',
  },
  {
    id: 'FA2', orderId: 'ORD1002', customerName: 'Kavitha R', customerPhone: '9876543211',
    items: [
      { name: 'Spinach (Chopped)', deliveredDate: '2026-03-17', bestBefore: '2026-03-19', daysLeft: 1, category: 'Leafy Greens' },
    ],
    status: 'sent', alertType: 'reminder',
  },
  {
    id: 'FA3', orderId: 'ORD1003', customerName: 'Meena K', customerPhone: '9876543212',
    items: [
      { name: 'Tomatoes (Diced)', deliveredDate: '2026-03-16', bestBefore: '2026-03-19', daysLeft: 1, category: 'Vegetables' },
      { name: 'Onions (Sliced)', deliveredDate: '2026-03-16', bestBefore: '2026-03-20', daysLeft: 2, category: 'Vegetables' },
      { name: 'Capsicum (Strips)', deliveredDate: '2026-03-16', bestBefore: '2026-03-19', daysLeft: 1, category: 'Vegetables' },
    ],
    status: 'read', alertType: 'reminder',
  },
  {
    id: 'FA4', orderId: 'ORD998', customerName: 'Ravi Kumar', customerPhone: '9876543213',
    items: [
      { name: 'Mixed Fruits (Cubed)', deliveredDate: '2026-03-14', bestBefore: '2026-03-16', daysLeft: -2, category: 'Fruits' },
    ],
    status: 'sent', alertType: 'expired',
  },
  {
    id: 'FA5', orderId: 'ORD1005', customerName: 'Lakshmi S', customerPhone: '9876543214',
    items: [
      { name: 'Drumstick (Cut)', deliveredDate: '2026-03-17', bestBefore: '2026-03-21', daysLeft: 3, category: 'Vegetables' },
      { name: 'Brinjal (Sliced)', deliveredDate: '2026-03-17', bestBefore: '2026-03-20', daysLeft: 2, category: 'Vegetables' },
    ],
    status: 'pending', alertType: 'reminder', scheduledTime: '6:00 PM Today',
  },
];

const DEMO_WASTAGE: WastageRecord[] = [
  { id: 'W1', date: '2026-03-18', category: 'Vegetables', itemName: 'Spinach', quantity: '2 kg', reason: 'expired', cost: 80 },
  { id: 'W2', date: '2026-03-18', category: 'Fruits', itemName: 'Papaya (Cut)', quantity: '1.5 kg', reason: 'quality_fail', cost: 60 },
  { id: 'W3', date: '2026-03-17', category: 'Vegetables', itemName: 'Mushroom', quantity: '500 g', reason: 'damaged', cost: 120 },
  { id: 'W4', date: '2026-03-17', category: 'Leafy Greens', itemName: 'Coriander', quantity: '1 kg', reason: 'expired', cost: 40 },
  { id: 'W5', date: '2026-03-16', category: 'Vegetables', itemName: 'Broccoli (Florets)', quantity: '800 g', reason: 'returned', cost: 160, orderId: 'ORD997', customerName: 'Anitha R' },
  { id: 'W6', date: '2026-03-16', category: 'Fruits', itemName: 'Watermelon (Cubed)', quantity: '2 kg', reason: 'quality_fail', cost: 70 },
  { id: 'W7', date: '2026-03-15', category: 'Vegetables', itemName: 'Cabbage (Shredded)', quantity: '1 kg', reason: 'expired', cost: 30 },
];

const DEMO_RULES: FreshnessRule[] = [
  { id: 'R1', category: 'Leafy Greens', item: 'All leafy greens', shelfLifeDays: 2, reminderDayBefore: 1, notificationType: 'push', enabled: true, tipMessage: 'Your leafy greens are best used within 2 days. Use them in a stir-fry or salad today!' },
  { id: 'R2', category: 'Vegetables', item: 'Root vegetables (cut)', shelfLifeDays: 4, reminderDayBefore: 1, notificationType: 'push', enabled: true, tipMessage: 'Your cut veggies stay fresh for 3-4 days. Perfect for today\'s curry!' },
  { id: 'R3', category: 'Vegetables', item: 'Tomatoes, Capsicum', shelfLifeDays: 3, reminderDayBefore: 1, notificationType: 'both', enabled: true, tipMessage: 'Your tomatoes and capsicum are best used within 3 days. Try a quick salsa!' },
  { id: 'R4', category: 'Fruits', item: 'Cut fruits', shelfLifeDays: 2, reminderDayBefore: 1, notificationType: 'push', enabled: true, tipMessage: 'Fresh cut fruits are best enjoyed within 2 days. Have them as a healthy snack!' },
  { id: 'R5', category: 'Fruits', item: 'Whole fruits', shelfLifeDays: 5, reminderDayBefore: 2, notificationType: 'push', enabled: false, tipMessage: 'Your fruits are at peak freshness. Enjoy them soon!' },
  { id: 'R6', category: 'Herbs', item: 'Coriander, Mint, Curry leaves', shelfLifeDays: 3, reminderDayBefore: 1, notificationType: 'push', enabled: true, tipMessage: 'Use your fresh herbs today for maximum flavor! Great in chutneys and garnishes.' },
];

const ALERT_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  reminder: { color: '#1565C0', bg: '#E3F2FD', icon: 'bell-ring' },
  warning: { color: '#E65100', bg: '#FFF3E0', icon: 'alert' },
  expired: { color: '#C62828', bg: '#FFEBEE', icon: 'alert-circle' },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  pending: { color: '#E65100', bg: '#FFF3E0' },
  sent: { color: '#1565C0', bg: '#E3F2FD' },
  read: { color: '#388E3C', bg: '#E8F5E9' },
  acted: { color: '#7B1FA2', bg: '#F3E5F5' },
};

const REASON_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  expired: { color: '#C62828', bg: '#FFEBEE', label: 'Expired' },
  damaged: { color: '#E65100', bg: '#FFF3E0', label: 'Damaged' },
  returned: { color: '#1565C0', bg: '#E3F2FD', label: 'Returned' },
  quality_fail: { color: '#7B1FA2', bg: '#F3E5F5', label: 'Quality Fail' },
};

export default function FreshnessTrackerScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [activeTab, setActiveTab] = useState<TabKey>('alerts');
  const [alerts] = useState(DEMO_ALERTS);
  const [wastage] = useState(DEMO_WASTAGE);
  const [rules, setRules] = useState(DEMO_RULES);

  const stats = useMemo(() => ({
    pendingAlerts: alerts.filter(a => a.status === 'pending').length,
    sentToday: alerts.filter(a => a.status === 'sent').length,
    expiringItems: alerts.reduce((sum, a) => sum + a.items.filter(i => i.daysLeft <= 1).length, 0),
    todayWastage: wastage.filter(w => w.date === '2026-03-18').reduce((sum, w) => sum + w.cost, 0),
    weekWastage: wastage.reduce((sum, w) => sum + w.cost, 0),
    activeRules: rules.filter(r => r.enabled).length,
  }), [alerts, wastage, rules]);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const renderAlert = ({ item }: { item: FreshnessAlert }) => {
    const ac = ALERT_CONFIG[item.alertType];
    const ss = STATUS_CONFIG[item.status];
    return (
      <View style={[styles.alertCard, themed.card]}>
        <View style={styles.alertHeader}>
          <View style={[styles.alertIcon, { backgroundColor: ac.bg }]}>
            <Icon name={ac.icon as any} size={20} color={ac.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.cardRow}>
              <Text style={[styles.alertTitle, themed.textPrimary]}>{item.customerName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
                <Text style={[styles.statusText, { color: ss.color }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.alertSub}>Order #{item.orderId} · {item.items.length} item{item.items.length > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {item.items.map((itm, i) => {
          const daysColor = itm.daysLeft <= 0 ? '#C62828' : itm.daysLeft <= 1 ? '#E65100' : '#388E3C';
          const daysBg = itm.daysLeft <= 0 ? '#FFEBEE' : itm.daysLeft <= 1 ? '#FFF3E0' : '#E8F5E9';
          return (
            <View key={i} style={styles.itemRow}>
              <Icon name="food-apple" size={14} color={COLORS.text.muted} />
              <Text style={[styles.itemName, themed.textPrimary]}>{itm.name}</Text>
              <View style={[styles.daysBadge, { backgroundColor: daysBg }]}>
                <Text style={[styles.daysText, { color: daysColor }]}>
                  {itm.daysLeft < 0 ? `${Math.abs(itm.daysLeft)}d expired` : itm.daysLeft === 0 ? 'Use today' : `${itm.daysLeft}d left`}
                </Text>
              </View>
            </View>
          );
        })}

        {item.scheduledTime && (
          <View style={styles.scheduledRow}>
            <Icon name="clock-outline" size={12} color={COLORS.text.muted} />
            <Text style={styles.scheduledText}>Scheduled: {item.scheduledTime}</Text>
          </View>
        )}

        {item.status === 'pending' && (
          <View style={styles.alertActions}>
            <TouchableOpacity
              style={[styles.alertBtn, { backgroundColor: '#E3F2FD' }]}
              onPress={() => Alert.alert('Send Alert', `Send freshness reminder to ${item.customerName}?`)}
            >
              <Icon name="send" size={14} color="#1565C0" />
              <Text style={[styles.alertBtnText, { color: '#1565C0' }]}>Send Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.alertBtn, { backgroundColor: '#F5F5F5' }]}
              onPress={() => Alert.alert('Skip', 'Skip this alert?')}
            >
              <Icon name="close" size={14} color="#616161" />
              <Text style={[styles.alertBtnText, { color: '#616161' }]}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderWastage = ({ item }: { item: WastageRecord }) => {
    const rc = REASON_CONFIG[item.reason];
    return (
      <View style={[styles.wastageCard, themed.card]}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.wastageName, themed.textPrimary]}>{item.itemName}</Text>
            <View style={styles.wastageMeta}>
              <Text style={styles.wastageMetaText}>{item.category}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.wastageMetaText}>{item.quantity}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.wastageMetaText}>{item.date}</Text>
            </View>
            {item.customerName && (
              <Text style={styles.wastageCustomer}>Customer: {item.customerName} (#{item.orderId})</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.wastageCost, { color: '#C62828' }]}>-{'\u20B9'}{item.cost}</Text>
            <View style={[styles.reasonBadge, { backgroundColor: rc.bg }]}>
              <Text style={[styles.reasonText, { color: rc.color }]}>{rc.label}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRule = ({ item }: { item: FreshnessRule }) => (
    <View style={[styles.ruleCard, themed.card]}>
      <View style={{ flex: 1 }}>
        <View style={styles.cardRow}>
          <Text style={[styles.ruleName, themed.textPrimary]}>{item.item}</Text>
          <Switch
            value={item.enabled}
            onValueChange={() => toggleRule(item.id)}
            trackColor={{ false: '#E0E0E0', true: '#81C784' }}
            thumbColor={item.enabled ? COLORS.primary : '#BDBDBD'}
          />
        </View>
        <Text style={styles.ruleCategory}>{item.category}</Text>
        <View style={styles.ruleMeta}>
          <View style={styles.ruleChip}>
            <Icon name="clock" size={11} color="#1565C0" />
            <Text style={styles.ruleChipText}>{item.shelfLifeDays}d shelf life</Text>
          </View>
          <View style={styles.ruleChip}>
            <Icon name="bell" size={11} color="#E65100" />
            <Text style={styles.ruleChipText}>{item.reminderDayBefore}d before</Text>
          </View>
          <View style={styles.ruleChip}>
            <Icon name={item.notificationType === 'push' ? 'cellphone' : item.notificationType === 'sms' ? 'message' : 'bell-ring'} size={11} color="#7B1FA2" />
            <Text style={styles.ruleChipText}>{item.notificationType}</Text>
          </View>
        </View>
        <Text style={styles.ruleTip} numberOfLines={2}>{item.tipMessage}</Text>
      </View>
    </View>
  );

  const TABS: { key: TabKey; label: string; icon: string; badge?: number }[] = [
    { key: 'alerts', label: 'Alerts', icon: 'bell-ring', badge: stats.pendingAlerts },
    { key: 'wastage', label: 'Wastage', icon: 'delete-circle' },
    { key: 'settings', label: 'Rules', icon: 'cog' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'alerts':
        return <FlatList data={alerts} keyExtractor={i => i.id} renderItem={renderAlert} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />;
      case 'wastage':
        return (
          <View style={{ flex: 1 }}>
            {/* Wastage Summary */}
            <View style={styles.wastageSummary}>
              <View style={[styles.wastageSumCard, { backgroundColor: '#FFEBEE' }]}>
                <Text style={[styles.wastageSumValue, { color: '#C62828' }]}>{'\u20B9'}{stats.todayWastage}</Text>
                <Text style={styles.wastageSumLabel}>Today's Loss</Text>
              </View>
              <View style={[styles.wastageSumCard, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[styles.wastageSumValue, { color: '#E65100' }]}>{'\u20B9'}{stats.weekWastage}</Text>
                <Text style={styles.wastageSumLabel}>This Week</Text>
              </View>
            </View>
            <FlatList data={wastage} keyExtractor={i => i.id} renderItem={renderWastage} contentContainerStyle={[styles.listContent, { paddingTop: 0 }]} showsVerticalScrollIndicator={false} />
          </View>
        );
      case 'settings':
        return <FlatList data={rules} keyExtractor={i => i.id} renderItem={renderRule} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={['#00796B', '#009688']} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Freshness & Wastage</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => Alert.alert('Bulk Send', 'Send all pending freshness alerts now?', [{ text: 'Cancel' }, { text: 'Send All', onPress: () => {} }])}>
              <Icon name="send-check" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContainer}>
          <View style={styles.statChip}>
            <Icon name="bell-alert" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.pendingAlerts}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="send" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.sentToday}</Text>
            <Text style={styles.statLabel}>Sent Today</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="alert" size={16} color="#FFB74D" />
            <Text style={styles.statValue}>{stats.expiringItems}</Text>
            <Text style={styles.statLabel}>Expiring</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: 'rgba(255,82,82,0.3)' }]}>
            <Icon name="currency-inr" size={16} color="#FFF" />
            <Text style={styles.statValue}>{'\u20B9'}{stats.todayWastage}</Text>
            <Text style={styles.statLabel}>Today Loss</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="cog" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.activeRules}</Text>
            <Text style={styles.statLabel}>Active Rules</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: themed.colors.card }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon name={tab.icon as any} size={16} color={activeTab === tab.key ? '#00796B' : COLORS.text.muted} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            {tab.badge && tab.badge > 0 ? (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingBottom: SPACING.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingTop: SPACING.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  statsScroll: { marginTop: SPACING.md },
  statsContainer: { paddingHorizontal: SPACING.base, gap: SPACING.sm },
  statChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignItems: 'center', minWidth: 80 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#FFF', marginTop: 2 },
  statLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: SPACING.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#00796B' },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  tabTextActive: { color: '#00796B', fontWeight: '700' },
  tabBadge: { backgroundColor: '#C62828', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  tabBadgeText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
  listContent: { padding: SPACING.base, paddingBottom: 40 },
  alertCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  alertHeader: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
  alertIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  alertSub: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  statusText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, paddingLeft: 52 },
  itemName: { flex: 1, fontSize: 12, fontWeight: '600' },
  daysBadge: { borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  daysText: { fontSize: 10, fontWeight: '700' },
  scheduledRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm, paddingLeft: 52 },
  scheduledText: { fontSize: 11, color: COLORS.text.muted },
  alertActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md, paddingLeft: 52 },
  alertBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: RADIUS.md, paddingVertical: SPACING.sm },
  alertBtnText: { fontSize: 12, fontWeight: '700' },
  wastageSummary: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.base, paddingTop: SPACING.base },
  wastageSumCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  wastageSumValue: { fontSize: 20, fontWeight: '800' },
  wastageSumLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },
  wastageCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  wastageName: { fontSize: 14, fontWeight: '700' },
  wastageMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  wastageMetaText: { fontSize: 11, color: COLORS.text.muted },
  metaDot: { fontSize: 11, color: COLORS.text.muted },
  wastageCustomer: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2 },
  wastageCost: { fontSize: 16, fontWeight: '800' },
  reasonBadge: { borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  reasonText: { fontSize: 9, fontWeight: '700' },
  ruleCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  ruleName: { fontSize: 14, fontWeight: '700', flex: 1 },
  ruleCategory: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2 },
  ruleMeta: { flexDirection: 'row', gap: 6, marginTop: SPACING.sm },
  ruleChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F5F5F5', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 4 },
  ruleChipText: { fontSize: 10, fontWeight: '600', color: COLORS.text.secondary },
  ruleTip: { fontSize: 11, color: COLORS.text.muted, marginTop: SPACING.sm, fontStyle: 'italic' },
});
