// app/b2b-manage.tsx - B2B Client & Order Management for Owner
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, Modal, ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';

type ClientStatus = 'active' | 'pending' | 'trial' | 'inactive';
type PlanTier = 'starter' | 'growth' | 'enterprise';
type FilterKey = 'all' | 'active' | 'pending' | 'trial' | 'inactive';

interface B2BOrder {
  id: string;
  date: string;
  items: number;
  totalKg: number;
  amount: number;
  status: 'delivered' | 'in_transit' | 'preparing' | 'cancelled';
}

interface B2BClient {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: string;
  plan: PlanTier;
  status: ClientStatus;
  joinDate: string;
  address: string;
  dailyRequirementKg: number;
  monthlyRevenue: number;
  totalOrders: number;
  lastOrderDate: string;
  discount: number;
  paymentTerms: string;
  recentOrders: B2BOrder[];
}

const STATUS_CONFIG: Record<ClientStatus, { label: string; bg: string; color: string }> = {
  active: { label: 'Active', bg: '#E8F5E9', color: '#2E7D32' },
  pending: { label: 'Pending', bg: '#FFF3E0', color: '#E65100' },
  trial: { label: 'Trial', bg: '#E3F2FD', color: '#1565C0' },
  inactive: { label: 'Inactive', bg: '#F5F5F5', color: '#757575' },
};

const PLAN_CONFIG: Record<PlanTier, { label: string; color: string; bg: string; icon: string }> = {
  starter: { label: 'Starter', color: '#1565C0', bg: '#E3F2FD', icon: 'rocket-launch' },
  growth: { label: 'Growth', color: '#E65100', bg: '#FFF3E0', icon: 'trending-up' },
  enterprise: { label: 'Enterprise', color: '#7B1FA2', bg: '#F3E5F5', icon: 'domain' },
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'trial', label: 'Trial' },
  { key: 'inactive', label: 'Inactive' },
];

const SAMPLE_CLIENTS: B2BClient[] = [
  {
    id: 'b2b_1', businessName: 'Hotel Annapoorna', contactPerson: 'Rajesh Kumar', phone: '9876543201', email: 'rajesh@annapoorna.com', businessType: 'Restaurant', plan: 'growth', status: 'active', joinDate: '2025-11-15', address: 'RS Puram, Coimbatore', dailyRequirementKg: 80, monthlyRevenue: 145000, totalOrders: 124, lastOrderDate: '2026-03-26', discount: 30, paymentTerms: 'Monthly',
    recentOrders: [
      { id: 'bo_1', date: '2026-03-26', items: 12, totalKg: 85, amount: 4250, status: 'delivered' },
      { id: 'bo_2', date: '2026-03-25', items: 10, totalKg: 78, amount: 3900, status: 'delivered' },
      { id: 'bo_3', date: '2026-03-24', items: 14, totalKg: 92, amount: 4600, status: 'delivered' },
    ],
  },
  {
    id: 'b2b_2', businessName: 'FreshBowl Cloud Kitchen', contactPerson: 'Priya Menon', phone: '9876543202', email: 'priya@freshbowl.in', businessType: 'Cloud Kitchen', plan: 'growth', status: 'active', joinDate: '2025-12-01', address: 'Gandhipuram, Coimbatore', dailyRequirementKg: 45, monthlyRevenue: 82000, totalOrders: 87, lastOrderDate: '2026-03-26', discount: 30, paymentTerms: 'Monthly',
    recentOrders: [
      { id: 'bo_4', date: '2026-03-26', items: 8, totalKg: 42, amount: 2100, status: 'in_transit' },
      { id: 'bo_5', date: '2026-03-25', items: 9, totalKg: 48, amount: 2400, status: 'delivered' },
    ],
  },
  {
    id: 'b2b_3', businessName: 'Sai Hostel Mess', contactPerson: 'Venkatesh R', phone: '9876543203', email: 'saimess@gmail.com', businessType: 'Hostel', plan: 'starter', status: 'active', joinDate: '2026-01-10', address: 'Peelamedu, Coimbatore', dailyRequirementKg: 120, monthlyRevenue: 98000, totalOrders: 65, lastOrderDate: '2026-03-26', discount: 20, paymentTerms: 'Weekly',
    recentOrders: [
      { id: 'bo_6', date: '2026-03-26', items: 6, totalKg: 125, amount: 5000, status: 'preparing' },
      { id: 'bo_7', date: '2026-03-25', items: 7, totalKg: 118, amount: 4720, status: 'delivered' },
    ],
  },
  {
    id: 'b2b_4', businessName: 'Spice Route Caterers', contactPerson: 'Anand Shankar', phone: '9876543204', email: 'anand@spiceroute.com', businessType: 'Caterer', plan: 'enterprise', status: 'active', joinDate: '2025-10-20', address: 'Saibaba Colony, Coimbatore', dailyRequirementKg: 200, monthlyRevenue: 320000, totalOrders: 156, lastOrderDate: '2026-03-25', discount: 35, paymentTerms: 'Net-30',
    recentOrders: [
      { id: 'bo_8', date: '2026-03-25', items: 22, totalKg: 210, amount: 8400, status: 'delivered' },
      { id: 'bo_9', date: '2026-03-24', items: 18, totalKg: 185, amount: 7400, status: 'delivered' },
    ],
  },
  {
    id: 'b2b_5', businessName: 'Green Leaf Canteen', contactPerson: 'Meera Devi', phone: '9876543205', email: 'greenleaf@mail.com', businessType: 'Canteen', plan: 'starter', status: 'trial', joinDate: '2026-03-15', address: 'Singanallur, Coimbatore', dailyRequirementKg: 30, monthlyRevenue: 0, totalOrders: 8, lastOrderDate: '2026-03-24', discount: 20, paymentTerms: 'Prepaid',
    recentOrders: [
      { id: 'bo_10', date: '2026-03-24', items: 5, totalKg: 28, amount: 1120, status: 'delivered' },
    ],
  },
  {
    id: 'b2b_6', businessName: 'Royal Kitchen Hotel', contactPerson: 'Suresh Babu', phone: '9876543206', email: 'suresh@royalkitchen.com', businessType: 'Hotel', plan: 'growth', status: 'pending', joinDate: '2026-03-20', address: 'Race Course, Coimbatore', dailyRequirementKg: 60, monthlyRevenue: 0, totalOrders: 0, lastOrderDate: '', discount: 0, paymentTerms: 'TBD',
    recentOrders: [],
  },
  {
    id: 'b2b_7', businessName: 'Bites & Beyond', contactPerson: 'Kavitha S', phone: '9876543207', email: 'kavitha@bites.in', businessType: 'Cloud Kitchen', plan: 'starter', status: 'inactive', joinDate: '2025-09-10', address: 'Ukkadam, Coimbatore', dailyRequirementKg: 25, monthlyRevenue: 0, totalOrders: 32, lastOrderDate: '2026-02-18', discount: 20, paymentTerms: 'Weekly',
    recentOrders: [],
  },
];

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export default function B2BManageScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedClient, setSelectedClient] = useState<B2BClient | null>(null);

  const stats = useMemo(() => {
    const total = SAMPLE_CLIENTS.length;
    const active = SAMPLE_CLIENTS.filter(c => c.status === 'active').length;
    const pending = SAMPLE_CLIENTS.filter(c => c.status === 'pending').length;
    const monthlyRevenue = SAMPLE_CLIENTS.reduce((sum, c) => sum + c.monthlyRevenue, 0);
    const totalDailyKg = SAMPLE_CLIENTS.filter(c => c.status === 'active').reduce((sum, c) => sum + c.dailyRequirementKg, 0);
    return { total, active, pending, monthlyRevenue, totalDailyKg };
  }, []);

  const filteredClients = useMemo(() => {
    if (filter === 'all') return SAMPLE_CLIENTS;
    return SAMPLE_CLIENTS.filter(c => c.status === filter);
  }, [filter]);

  const handleClientAction = (client: B2BClient, action: string) => {
    switch (action) {
      case 'activate':
        Alert.alert('Activate Client', `Activate ${client.businessName}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Activate', onPress: () => Alert.alert('Success', `${client.businessName} has been activated.`) },
        ]);
        break;
      case 'invoice':
        Alert.alert('Generate Invoice', `Generate monthly invoice for ${client.businessName}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Generate', onPress: () => Alert.alert('Success', 'Invoice generated and sent via email.') },
        ]);
        break;
      case 'pause':
        Alert.alert('Pause Account', `Pause B2B account for ${client.businessName}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Pause', style: 'destructive', onPress: () => Alert.alert('Done', 'Account paused. No new orders will be accepted.') },
        ]);
        break;
    }
  };

  const renderStatCards = () => (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
        <Icon name="store" size={18} color="#1565C0" />
        <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total Clients</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
        <Icon name="check-circle" size={18} color="#2E7D32" />
        <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats.active}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
        <Icon name="currency-inr" size={18} color="#E65100" />
        <Text style={[styles.statValue, { color: '#E65100' }]}>{formatCurrency(stats.monthlyRevenue)}</Text>
        <Text style={styles.statLabel}>Monthly Rev</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
        <Icon name="weight-kilogram" size={18} color="#7B1FA2" />
        <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{stats.totalDailyKg}</Text>
        <Text style={styles.statLabel}>Daily kg</Text>
      </View>
    </View>
  );

  const renderClientCard = ({ item }: { item: B2BClient }) => {
    const statusCfg = STATUS_CONFIG[item.status];
    const planCfg = PLAN_CONFIG[item.plan];
    return (
      <TouchableOpacity
        style={[styles.card, themed.card]}
        activeOpacity={0.75}
        onPress={() => setSelectedClient(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.avatarCircle, { backgroundColor: planCfg.bg }]}>
              <Text style={[styles.avatarText, { color: planCfg.color }]}>{item.businessName.charAt(0)}</Text>
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={[styles.cardName, themed.textPrimary]}>{item.businessName}</Text>
              <Text style={styles.cardType}>{item.businessType} · {item.contactPerson}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <View style={styles.cardMetrics}>
          <View style={styles.metric}>
            <Icon name={planCfg.icon as any} size={14} color={planCfg.color} />
            <Text style={[styles.metricText, { color: planCfg.color }]}>{planCfg.label}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Icon name="weight-kilogram" size={14} color={COLORS.text.muted} />
            <Text style={styles.metricText}>{item.dailyRequirementKg} kg/day</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Icon name="percent" size={14} color="#2E7D32" />
            <Text style={[styles.metricText, { color: '#2E7D32' }]}>{item.discount}% off</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerStat}>
            <Text style={styles.footerStatLabel}>Orders</Text>
            <Text style={[styles.footerStatValue, themed.textPrimary]}>{item.totalOrders}</Text>
          </View>
          <View style={styles.footerStat}>
            <Text style={styles.footerStatLabel}>Revenue/mo</Text>
            <Text style={[styles.footerStatValue, themed.textPrimary]}>{formatCurrency(item.monthlyRevenue)}</Text>
          </View>
          <View style={styles.footerStat}>
            <Text style={styles.footerStatLabel}>Last Order</Text>
            <Text style={[styles.footerStatValue, themed.textPrimary]}>{formatDate(item.lastOrderDate)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ORDER_STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
    delivered: { color: '#2E7D32', icon: 'check-circle' },
    in_transit: { color: '#1565C0', icon: 'truck-delivery' },
    preparing: { color: '#E65100', icon: 'food-variant' },
    cancelled: { color: '#C62828', icon: 'close-circle' },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>B2B Management</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {renderStatCards()}

      <View style={styles.filterRow}>
        {FILTER_TABS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterChipText, filter === item.key && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Icon name="store-off" size={64} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No clients found</Text>
            <Text style={styles.emptySub}>B2B clients will appear here when businesses register</Text>
          </View>
        )}
        renderItem={renderClientCard}
      />

      {/* ── Client Detail Modal ── */}
      <Modal visible={!!selectedClient} animationType="slide" presentationStyle="pageSheet">
        {selectedClient && (
          <SafeAreaView style={[styles.modalSafe, themed.safeArea]} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, themed.textPrimary]} numberOfLines={1}>{selectedClient.businessName}</Text>
              <TouchableOpacity onPress={() => setSelectedClient(null)} style={styles.modalClose}>
                <Icon name="close" size={22} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Status + Plan Badge */}
              <View style={styles.detailBadgeRow}>
                <View style={[styles.detailBadge, { backgroundColor: STATUS_CONFIG[selectedClient.status].bg }]}>
                  <Text style={[styles.detailBadgeText, { color: STATUS_CONFIG[selectedClient.status].color }]}>
                    {STATUS_CONFIG[selectedClient.status].label}
                  </Text>
                </View>
                <View style={[styles.detailBadge, { backgroundColor: PLAN_CONFIG[selectedClient.plan].bg }]}>
                  <Icon name={PLAN_CONFIG[selectedClient.plan].icon as any} size={14} color={PLAN_CONFIG[selectedClient.plan].color} />
                  <Text style={[styles.detailBadgeText, { color: PLAN_CONFIG[selectedClient.plan].color }]}>
                    {PLAN_CONFIG[selectedClient.plan].label} Plan
                  </Text>
                </View>
              </View>

              {/* Contact Info */}
              <View style={[styles.detailSection, themed.card]}>
                <Text style={[styles.detailSectionTitle, themed.textPrimary]}>Business Details</Text>
                {[
                  { icon: 'account', value: selectedClient.contactPerson },
                  { icon: 'phone', value: selectedClient.phone },
                  { icon: 'email', value: selectedClient.email },
                  { icon: 'map-marker', value: selectedClient.address },
                  { icon: 'store', value: selectedClient.businessType },
                  { icon: 'calendar', value: `Joined ${formatDate(selectedClient.joinDate)}` },
                ].map((row) => (
                  <View key={row.icon} style={styles.detailRow}>
                    <Icon name={row.icon as any} size={16} color={COLORS.text.muted} />
                    <Text style={styles.detailRowText}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {/* Key Metrics */}
              <View style={[styles.detailSection, themed.card]}>
                <Text style={[styles.detailSectionTitle, themed.textPrimary]}>Key Metrics</Text>
                <View style={styles.detailMetricsGrid}>
                  {[
                    { label: 'Daily Volume', value: `${selectedClient.dailyRequirementKg} kg`, color: '#7B1FA2' },
                    { label: 'Monthly Revenue', value: formatCurrency(selectedClient.monthlyRevenue), color: '#E65100' },
                    { label: 'Total Orders', value: `${selectedClient.totalOrders}`, color: '#1565C0' },
                    { label: 'Discount', value: `${selectedClient.discount}%`, color: '#2E7D32' },
                    { label: 'Payment Terms', value: selectedClient.paymentTerms, color: '#546E7A' },
                    { label: 'Last Order', value: formatDate(selectedClient.lastOrderDate), color: '#C62828' },
                  ].map((m) => (
                    <View key={m.label} style={styles.detailMetric}>
                      <Text style={styles.detailMetricLabel}>{m.label}</Text>
                      <Text style={[styles.detailMetricValue, { color: m.color }]}>{m.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Recent Orders */}
              {selectedClient.recentOrders.length > 0 && (
                <View style={[styles.detailSection, themed.card]}>
                  <Text style={[styles.detailSectionTitle, themed.textPrimary]}>Recent Orders</Text>
                  {selectedClient.recentOrders.map((order) => {
                    const os = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.delivered;
                    return (
                      <View key={order.id} style={styles.orderRow}>
                        <View style={styles.orderLeft}>
                          <Icon name={os.icon as any} size={16} color={os.color} />
                          <View>
                            <Text style={[styles.orderDate, themed.textPrimary]}>{formatDate(order.date)}</Text>
                            <Text style={styles.orderMeta}>{order.items} items · {order.totalKg} kg</Text>
                          </View>
                        </View>
                        <View style={styles.orderRight}>
                          <Text style={[styles.orderAmount, themed.textPrimary]}>{'\u20B9'}{order.amount.toLocaleString('en-IN')}</Text>
                          <Text style={[styles.orderStatus, { color: os.color }]}>
                            {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Actions */}
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.detailActionBtn, { backgroundColor: '#E3F2FD' }]}
                  onPress={() => handleClientAction(selectedClient, 'invoice')}
                >
                  <Icon name="file-document-outline" size={18} color="#1565C0" />
                  <Text style={[styles.detailActionText, { color: '#1565C0' }]}>Invoice</Text>
                </TouchableOpacity>
                {selectedClient.status === 'pending' ? (
                  <TouchableOpacity
                    style={[styles.detailActionBtn, { backgroundColor: '#E8F5E9' }]}
                    onPress={() => handleClientAction(selectedClient, 'activate')}
                  >
                    <Icon name="check-circle-outline" size={18} color="#2E7D32" />
                    <Text style={[styles.detailActionText, { color: '#2E7D32' }]}>Activate</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.detailActionBtn, { backgroundColor: '#FFEBEE' }]}
                    onPress={() => handleClientAction(selectedClient, 'pause')}
                  >
                    <Icon name="pause-circle-outline" size={18} color="#C62828" />
                    <Text style={[styles.detailActionText, { color: '#C62828' }]}>Pause</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        )}
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

  /* Stats */
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingTop: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 8, fontWeight: '600', color: COLORS.text.muted, textAlign: 'center' },

  /* Filters */
  filterRow: { flexDirection: 'row' as const, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: COLORS.backgroundSoft, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  filterChipTextActive: { color: COLORS.primary },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  /* Client Card */
  card: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  avatarText: { fontSize: 18, fontWeight: '800' },
  cardHeaderInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700' },
  cardType: { fontSize: 11, color: COLORS.text.muted, marginTop: 1 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: 10, fontWeight: '800' },

  cardMetrics: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  metric: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' },
  metricText: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary },
  metricDivider: { width: 1, height: 16, backgroundColor: COLORS.divider },

  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm },
  footerStat: { flex: 1, alignItems: 'center' },
  footerStatLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },
  footerStatValue: { fontSize: 13, fontWeight: '800', marginTop: 2 },

  /* Empty */
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },

  /* Modal */
  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  modalTitle: { fontSize: 18, fontWeight: '800', flex: 1, marginRight: SPACING.md },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  modalScroll: { flex: 1, paddingHorizontal: SPACING.lg },

  /* Detail Badges */
  detailBadgeRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md, flexWrap: 'wrap' },
  detailBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full },
  detailBadgeText: { fontSize: 12, fontWeight: '700' },

  /* Detail Sections */
  detailSection: { borderRadius: RADIUS.lg, padding: SPACING.base, marginTop: SPACING.md, ...SHADOW.sm },
  detailSectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: SPACING.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs + 2 },
  detailRowText: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '500' },

  /* Detail Metrics */
  detailMetricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  detailMetric: { width: '47%', backgroundColor: '#FAFAFA', borderRadius: RADIUS.md, padding: SPACING.md },
  detailMetricLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted },
  detailMetricValue: { fontSize: 16, fontWeight: '800', marginTop: 4 },

  /* Recent Orders */
  orderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  orderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  orderDate: { fontSize: 13, fontWeight: '600' },
  orderMeta: { fontSize: 10, color: COLORS.text.muted, marginTop: 1 },
  orderRight: { alignItems: 'flex-end' },
  orderAmount: { fontSize: 14, fontWeight: '800' },
  orderStatus: { fontSize: 10, fontWeight: '700', marginTop: 1 },

  /* Detail Actions */
  detailActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  detailActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  detailActionText: { fontSize: 13, fontWeight: '700' },
});
