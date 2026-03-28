import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Share, Image } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import { useProducts } from '@/context/ProductContext';

const CUT_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string; image?: string }> = {
  small_pieces: { icon: 'cube-outline', label: 'Small Pieces', color: '#E65100', bg: '#FFF3E0', image: 'https://media.istockphoto.com/id/2249938416/photo/diced-bell-peppers-in-three-colors-pizza-toppings-hd-stock-photo.webp?a=1&b=1&s=612x612&w=0&k=20&c=JPOMHkiFknVzVR1wH1Byglt-owU6KrwDti0rWT50giE=' },
  slices: { icon: 'circle-slice-4', label: 'Slices', color: '#1565C0', bg: '#E3F2FD', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp1lhK5cvi8am617xdzRjbYlPlYhcc1bVSQg&s' },
  cubes: { icon: 'cube', label: 'Cubes', color: '#388E3C', bg: '#E8F5E9', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5ezD-KS6iwuiBmghKqB8W4rvTlp1JOB6KL4TSS2YXKQ&s' },
  long_cuts: { icon: 'resize', label: 'Long Cuts', color: '#7B1FA2', bg: '#F3E5F5', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzjZO-U546wb1z9xNy9UauhZef5_PalkHyBCtpgEZ0ag&s' },
  grated: { icon: 'grain', label: 'Grated', color: '#C62828', bg: '#FFEBEE', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiCjNUcnt_Ld-3fDMGTtN1kjCSsBRSOFOCKA&s' },
};

const DEFAULT_CUT = { icon: 'knife', label: 'Unspecified', color: '#616161', bg: '#F5F5F5' };

interface CutBreakdown {
  cutType: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  image?: string;
  quantity: number;
}

interface ProductInSlot {
  productName: string;
  image?: string;
  totalQuantity: number;
  unit: string;
  cuts: CutBreakdown[];
}

interface TimeSlotGroup {
  slot: string;
  orderCount: number;
  products: ProductInSlot[];
}

type DayTab = 'today' | 'tomorrow';

function getDateLabel(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function KitchenSummaryScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { orders } = useOrders();
  const { products } = useProducts();
  const [activeDay, setActiveDay] = useState<DayTab>('today');

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  // Build a lookup map: product name -> image from products catalog
  const productImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) {
      if (p.image) map[p.name.toLowerCase()] = p.image;
    }
    return map;
  }, [products]);

  const targetDate = activeDay === 'today' ? today : tomorrow;
  const targetDateStr = targetDate.toDateString();
  const dateLabel = activeDay === 'today'
    ? `Today, ${getDateLabel(today)}`
    : `Tomorrow, ${getDateLabel(tomorrow)}`;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      return new Date(o.createdAt).toDateString() === targetDateStr;
    });
  }, [orders, targetDateStr]);

  // Group by delivery time slot, then by product within each slot
  const timeSlotGroups = useMemo(() => {
    const slotMap: Record<string, { orderIds: Set<string>; products: Record<string, { totalQty: number; unit: string; image?: string; cuts: Record<string, number> }> }> = {};

    for (const order of filteredOrders) {
      const slot = order.deliverySlot || 'Unscheduled';
      if (!slotMap[slot]) {
        slotMap[slot] = { orderIds: new Set(), products: {} };
      }
      slotMap[slot].orderIds.add(order.id);

      for (const item of order.items) {
        const name = item.name;
        if (!slotMap[slot].products[name]) {
          slotMap[slot].products[name] = {
            totalQty: 0,
            unit: item.unit || 'kg',
            image: item.image || productImageMap[name.toLowerCase()],
            cuts: {},
          };
        }
        if (!slotMap[slot].products[name].image) {
          slotMap[slot].products[name].image = item.image || productImageMap[name.toLowerCase()];
        }
        slotMap[slot].products[name].totalQty += item.quantity;
        const cut = item.cutType || 'unspecified';
        slotMap[slot].products[name].cuts[cut] = (slotMap[slot].products[name].cuts[cut] || 0) + item.quantity;
      }
    }

    const groups: TimeSlotGroup[] = Object.entries(slotMap).map(([slot, data]) => ({
      slot,
      orderCount: data.orderIds.size,
      products: Object.entries(data.products)
        .map(([productName, pData]) => ({
          productName,
          image: pData.image,
          totalQuantity: pData.totalQty,
          unit: pData.unit,
          cuts: Object.entries(pData.cuts)
            .map(([cutType, quantity]) => {
              const cfg = CUT_TYPE_CONFIG[cutType] || DEFAULT_CUT;
              return { cutType, label: cfg.label, icon: cfg.icon, color: cfg.color, bg: cfg.bg, image: cfg.image, quantity };
            })
            .sort((a, b) => b.quantity - a.quantity),
        }))
        .sort((a, b) => b.totalQuantity - a.totalQuantity),
    }));

    // Sort time slots chronologically
    groups.sort((a, b) => {
      const getHour = (s: string) => {
        const match = s.match(/(\d+)/);
        return match ? parseInt(match[1]) : 99;
      };
      return getHour(a.slot) - getHour(b.slot);
    });

    return groups;
  }, [filteredOrders]);

  const stats = useMemo(() => {
    const totalItems = filteredOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    const cutTypesSet = new Set<string>();
    for (const o of filteredOrders) {
      for (const i of o.items) {
        if (i.cutType) cutTypesSet.add(i.cutType);
      }
    }
    return { totalOrders: filteredOrders.length, totalItems, cutTypes: cutTypesSet.size };
  }, [filteredOrders]);

  const handleShare = async () => {
    const lines: string[] = [];
    for (const group of timeSlotGroups) {
      lines.push(`\n--- ${group.slot} (${group.orderCount} orders) ---`);
      for (const p of group.products) {
        const cutDetails = p.cuts.map((c) => `${c.label}: ${c.quantity}`).join(', ');
        lines.push(`${p.productName}: ${p.totalQuantity} ${p.unit} (${cutDetails})`);
      }
    }
    const dayText = activeDay === 'today' ? getDateLabel(today) : getDateLabel(tomorrow);
    const text = `Kitchen Summary - ${dayText}\nOrders: ${stats.totalOrders} | Items: ${stats.totalItems} | Cut Types: ${stats.cutTypes}\n${lines.join('\n')}`;
    try {
      await Share.share({ message: text, title: 'Kitchen Summary' });
    } catch (_) {}
  };

  const renderTimeSlotSection = ({ item }: { item: TimeSlotGroup }) => (
    <View style={styles.slotSection}>
      {/* Time Slot Header */}
      <View style={styles.slotHeader}>
        <View style={styles.slotIconWrap}>
          <Icon name="clock-outline" size={18} color="#FFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.slotTitle, themed.textPrimary]}>{item.slot}</Text>
          <Text style={styles.slotSub}>{item.orderCount} {item.orderCount === 1 ? 'order' : 'orders'}</Text>
        </View>
        <View style={styles.slotBadge}>
          <Text style={styles.slotBadgeText}>{item.products.length} items</Text>
        </View>
      </View>

      {/* Products in this slot */}
      {item.products.map((product) => (
        <View key={product.productName} style={[styles.productCard, themed.card]}>
          <View style={styles.productHeader}>
            {product.image ? (
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Icon name="food-apple-outline" size={20} color={COLORS.text.muted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.productName, themed.textPrimary]}>{product.productName}</Text>
              <Text style={[styles.productTotal, { color: COLORS.primary }]}>
                {product.totalQuantity} {product.unit} total
              </Text>
            </View>
          </View>

          <View style={styles.cutsContainer}>
            {product.cuts.map((cut) => (
              <View key={cut.cutType} style={[styles.cutRow, { borderLeftColor: cut.color }]}>
                {cut.image ? (
                  <Image
                    source={{ uri: cut.image }}
                    style={[styles.cutImage, { borderColor: cut.bg }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cutIconWrap, { backgroundColor: cut.bg }]}>
                    <Icon name={cut.icon as any} size={16} color={cut.color} />
                  </View>
                )}
                <Text style={[styles.cutLabel, themed.textPrimary]}>{cut.label}</Text>
                <Text style={[styles.cutQty, { color: cut.color }]}>
                  {cut.quantity} {product.unit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Day Tabs */}
      <View style={styles.dayTabs}>
        <TouchableOpacity
          style={[styles.dayTab, activeDay === 'today' && styles.dayTabActive]}
          onPress={() => setActiveDay('today')}
        >
          <Icon name="calendar-today" size={16} color={activeDay === 'today' ? '#FFF' : COLORS.text.muted} />
          <Text style={[styles.dayTabText, activeDay === 'today' && styles.dayTabTextActive]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dayTab, activeDay === 'tomorrow' && styles.dayTabActive]}
          onPress={() => setActiveDay('tomorrow')}
        >
          <Icon name="calendar-arrow-right" size={16} color={activeDay === 'tomorrow' ? '#FFF' : COLORS.text.muted} />
          <Text style={[styles.dayTabText, activeDay === 'tomorrow' && styles.dayTabTextActive]}>Tomorrow</Text>
        </TouchableOpacity>
      </View>

      {/* Date Display */}
      <View style={styles.dateRow}>
        <Icon name="calendar-month" size={20} color={COLORS.primary} />
        <Text style={[styles.dateText, themed.textPrimary]}>{dateLabel}</Text>
      </View>

      {/* Stats cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="clipboard-list-outline" size={22} color="#388E3C" />
          <Text style={styles.statValue}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="package-variant" size={22} color="#1565C0" />
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="knife" size={22} color="#E65100" />
          <Text style={styles.statValue}>{stats.cutTypes}</Text>
          <Text style={styles.statLabel}>Cut Types</Text>
        </View>
      </View>

      {filteredOrders.length > 0 && (
        <Text style={[styles.sectionTitle, themed.textPrimary]}>Preparation by Time Slot</Text>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="food-off" size={64} color={COLORS.text.muted} />
      <Text style={[styles.emptyTitle, themed.textPrimary]}>
        No orders for {activeDay === 'today' ? 'today' : 'tomorrow'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeDay === 'today'
          ? 'Orders will appear here when customers place them'
          : 'Tomorrow\'s orders will show up here as customers book in advance'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, themed.safeArea]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#B8E0CF" />

      {/* Header */}
      <LinearGradient colors={['#B8E0CF', '#D6EFE3']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themed.textPrimary]}>Kitchen Summary</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
          <Icon name="share-variant" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={timeSlotGroups}
        keyExtractor={(item) => item.slot}
        renderItem={renderTimeSlotSection}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
  },
  headerBtn: { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  /* Day Tabs */
  dayTabs: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base },
  dayTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs,
    paddingVertical: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: '#F5F5F5',
  },
  dayTabActive: { backgroundColor: COLORS.primary },
  dayTabText: { fontSize: 14, fontWeight: '700', color: COLORS.text.muted },
  dayTabTextActive: { color: '#FFF' },

  /* Date */
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.base },
  dateText: { fontSize: 15, fontWeight: '600' },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary },
  statLabel: { fontSize: 11, fontWeight: '500', color: COLORS.text.secondary },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.md },

  /* Time Slot Section */
  slotSection: { marginBottom: SPACING.lg },
  slotHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  slotIconWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B35',
    alignItems: 'center', justifyContent: 'center',
  },
  slotTitle: { fontSize: 15, fontWeight: '800' },
  slotSub: { fontSize: 11, color: COLORS.text.muted, marginTop: 1 },
  slotBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  slotBadgeText: { fontSize: 11, fontWeight: '700', color: '#388E3C' },

  /* Product Card */
  productCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  productHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm, gap: SPACING.sm },
  productImage: { width: 44, height: 44, borderRadius: RADIUS.md },
  productImagePlaceholder: {
    width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
  },
  productName: { fontSize: 15, fontWeight: '700' },
  productTotal: { fontSize: 13, fontWeight: '600', marginTop: 2 },

  /* Cut Rows */
  cutsContainer: { gap: SPACING.xs + 2 },
  cutRow: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, paddingLeft: SPACING.md, paddingVertical: SPACING.xs },
  cutImage: { width: 28, height: 28, borderRadius: RADIUS.sm, borderWidth: 1.5, marginRight: SPACING.sm },
  cutIconWrap: { width: 28, height: 28, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  cutLabel: { flex: 1, fontSize: 13, fontWeight: '500' },
  cutQty: { fontSize: 13, fontWeight: '700' },

  /* Empty */
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center', paddingHorizontal: SPACING.xxl },
});
