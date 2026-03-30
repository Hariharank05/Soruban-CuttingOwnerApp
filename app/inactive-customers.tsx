import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Linking, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import customersData from '@/data/customers';

type InactiveRange = '15' | '30' | '60' | '90';

const RANGE_TABS: { key: InactiveRange; label: string }[] = [
  { key: '15', label: '15+ days' },
  { key: '30', label: '30+ days' },
  { key: '60', label: '60+ days' },
  { key: '90', label: '90+ days' },
];

interface InactiveCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const RISK_CONFIG = {
  low: { label: 'Low Risk', color: '#FFA000', bg: '#FFF8E1', icon: 'alert-outline' },
  medium: { label: 'At Risk', color: '#E65100', bg: '#FFF3E0', icon: 'alert' },
  high: { label: 'High Risk', color: '#C62828', bg: '#FFEBEE', icon: 'alert-circle' },
  critical: { label: 'Lost', color: '#616161', bg: '#F5F5F5', icon: 'account-off' },
};

export default function InactiveCustomersScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [activeRange, setActiveRange] = useState<InactiveRange>('15');

  const inactiveCustomers = useMemo(() => {
    const now = new Date();
    const minDays = parseInt(activeRange);

    return customersData
      .map(customer => {
        const lastDate = customer.lastOrderDate;

        if (!lastDate) return null;

        const diffMs = now.getTime() - new Date(lastDate).getTime();
        const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (daysSince < minDays) return null;

        const orderCount = customer.totalOrders;
        const spent = customer.totalSpent;

        let riskLevel: InactiveCustomer['riskLevel'] = 'low';
        if (daysSince >= 90) riskLevel = 'critical';
        else if (daysSince >= 60) riskLevel = 'high';
        else if (daysSince >= 30) riskLevel = 'medium';

        return {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          totalOrders: orderCount,
          totalSpent: spent,
          lastOrderDate: lastDate,
          daysSinceLastOrder: daysSince,
          riskLevel,
        } as InactiveCustomer;
      })
      .filter(Boolean)
      .sort((a, b) => b!.daysSinceLastOrder - a!.daysSinceLastOrder) as InactiveCustomer[];
  }, [activeRange]);

  const stats = useMemo(() => {
    const now = new Date();
    const allCustomers = customersData.length;
    const inactive15 = customersData.filter(c => {
      if (!c.lastOrderDate) return true;
      return Math.floor((now.getTime() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)) >= 15;
    }).length;
    const lostRevenue = inactiveCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    return { total: allCustomers, inactive: inactiveCustomers.length, lostRevenue, showing: inactiveCustomers.length };
  }, [inactiveCustomers]);

  const handleCall = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleaned}`);
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const number = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    const message = `Hi ${name}! We miss you at Soruban. It's been a while since your last order. We have fresh stock and new dish packs waiting for you! Order now and get 10% off.`;
    Linking.openURL(`whatsapp://send?phone=${number}&text=${encodeURIComponent(message)}`);
  };

  const handleSendOffer = (customer: InactiveCustomer) => {
    Alert.alert(
      'Send Win-Back Offer',
      `Send a special discount offer to ${customer.name}?\n\nThis will send a WhatsApp message with a 10% off coupon to encourage them to order again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send via WhatsApp', onPress: () => handleWhatsApp(customer.phone, customer.name) },
      ],
    );
  };

  const formatLastOrder = (dateStr: string, days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  const renderCustomerCard = ({ item }: { item: InactiveCustomer }) => {
    const risk = RISK_CONFIG[item.riskLevel];
    return (
      <View style={[styles.card, themed.card]}>
        <View style={styles.cardTop}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: risk.bg }]}>
              <Text style={[styles.avatarText, { color: risk.color }]}>{item.name.charAt(0)}</Text>
            </View>
            <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, themed.textPrimary]}>{item.name}</Text>
            <Text style={styles.cardPhone}>{item.phone}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
            <Icon name={risk.icon as any} size={12} color={risk.color} />
            <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
          </View>
        </View>

        <View style={styles.cardMetrics}>
          <View style={styles.cardMetric}>
            <Icon name="clock-alert-outline" size={14} color="#C62828" />
            <Text style={[styles.cardMetricValue, { color: '#C62828' }]}>{formatLastOrder(item.lastOrderDate, item.daysSinceLastOrder)}</Text>
          </View>
          <View style={styles.cardMetricDivider} />
          <View style={styles.cardMetric}>
            <Icon name="cart-outline" size={14} color={COLORS.text.muted} />
            <Text style={styles.cardMetricValue}>{item.totalOrders} orders</Text>
          </View>
          <View style={styles.cardMetricDivider} />
          <View style={styles.cardMetric}>
            <Icon name="currency-inr" size={14} color="#388E3C" />
            <Text style={[styles.cardMetricValue, { color: '#388E3C' }]}>{'\u20B9'}{item.totalSpent.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]} onPress={() => handleCall(item.phone)}>
            <Icon name="phone" size={16} color="#388E3C" />
            <Text style={[styles.actionBtnText, { color: '#388E3C' }]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]} onPress={() => handleWhatsApp(item.phone, item.name)}>
            <Icon name="whatsapp" size={16} color="#25D366" />
            <Text style={[styles.actionBtnText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF3E0' }]} onPress={() => handleSendOffer(item)}>
            <Icon name="tag-heart" size={16} color="#E65100" />
            <Text style={[styles.actionBtnText, { color: '#E65100' }]}>Send Offer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Alert Banner */}
      <View style={styles.alertBanner}>
        <Icon name="account-alert" size={24} color="#C62828" />
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.alertTitle}>{stats.inactive} of {stats.total} customers inactive</Text>
          <Text style={styles.alertSub}>
            Potential revenue at risk: {'\u20B9'}{stats.lostRevenue.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Icon name="account-off" size={20} color="#C62828" />
          <Text style={[styles.statValue, { color: '#C62828' }]}>{stats.showing}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="account-check" size={20} color="#388E3C" />
          <Text style={[styles.statValue, { color: '#388E3C' }]}>{stats.total - stats.inactive}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="currency-inr" size={20} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>
            {stats.lostRevenue > 1000 ? `${(stats.lostRevenue / 1000).toFixed(1)}K` : stats.lostRevenue}
          </Text>
          <Text style={styles.statLabel}>At Risk (₹)</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, themed.textPrimary]}>
        Customers not ordered in {activeRange}+ days
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#FFCDD2', zIndex: 10 }} />

      <LinearGradient colors={['#FFCDD2', '#FFEBEE'] as const} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Inactive Customers</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Range Tabs */}
      <View style={styles.rangeTabs}>
        {RANGE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.rangeTab, activeRange === tab.key && styles.rangeTabActive]}
            onPress={() => setActiveRange(tab.key)}
          >
            <Text style={[styles.rangeTabText, activeRange === tab.key && styles.rangeTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={inactiveCustomers}
        keyExtractor={item => item.id}
        renderItem={renderCustomerCard}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="account-check" size={56} color="#388E3C" />
            <Text style={[styles.emptyTitle, themed.textPrimary]}>All customers are active!</Text>
            <Text style={styles.emptyDesc}>No customers have been inactive for {activeRange}+ days</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingTop: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },

  /* Range Tabs */
  rangeTabs: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.xs },
  rangeTab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: '#F5F5F5' },
  rangeTabActive: { backgroundColor: '#C62828' },
  rangeTabText: { fontSize: 11, fontWeight: '700', color: COLORS.text.muted },
  rangeTabTextActive: { color: '#FFF' },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  /* Alert Banner */
  alertBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFEBEE', borderRadius: RADIUS.lg, padding: SPACING.base,
    marginBottom: SPACING.md, borderLeftWidth: 4, borderLeftColor: '#C62828',
  },
  alertTitle: { fontSize: 14, fontWeight: '800', color: '#C62828' },
  alertSub: { fontSize: 12, color: '#C62828', marginTop: 2, fontWeight: '500' },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg, gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.muted },

  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: SPACING.md },

  /* Customer Card */
  card: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  avatarWrap: { position: 'relative' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  riskDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFF' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700' },
  cardPhone: { fontSize: 12, color: COLORS.text.muted, marginTop: 1 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  riskText: { fontSize: 10, fontWeight: '700' },

  /* Metrics */
  cardMetrics: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFAFA', borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardMetric: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  cardMetricValue: { fontSize: 11, fontWeight: '600', color: COLORS.text.secondary },
  cardMetricDivider: { width: 1, height: 16, backgroundColor: COLORS.divider },

  /* Actions */
  cardActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
  },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center', paddingHorizontal: SPACING.xxl },
});
