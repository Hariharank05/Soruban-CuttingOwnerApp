// app/order-calendar.tsx - Order History Calendar
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import type { Order } from '@/types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pending', bg: '#FFF3E0', color: '#E65100' },
  preparing: { label: 'Preparing', bg: '#E3F2FD', color: '#1565C0' },
  ready: { label: 'Ready', bg: '#E0F7FA', color: '#00838F' },
  out_for_delivery: { label: 'Out', bg: '#F3E5F5', color: '#7B1FA2' },
  delivered: { label: 'Delivered', bg: '#E8F5E9', color: '#2E7D32' },
  cancelled: { label: 'Cancelled', bg: '#FFEBEE', color: '#C62828' },
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(n: number): string {
  return `\u20B9${n.toLocaleString('en-IN')}`;
}

function getHeatColor(count: number): string {
  if (count === 0) return '#F5F5F5';
  if (count <= 2) return '#C8E6C9';
  if (count <= 5) return '#66BB6A';
  return '#2E7D32';
}

export default function OrderCalendarScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { orders } = useOrders();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const ordersByDay = useMemo(() => {
    const map: Record<number, Order[]> = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(o);
      }
    });
    return map;
  }, [orders, currentYear, currentMonth]);

  const stats = useMemo(() => {
    let totalOrders = 0;
    let totalRevenue = 0;
    let peakDay = 0;
    let peakCount = 0;
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    let daysWithOrders = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOrders = ordersByDay[d] || [];
      totalOrders += dayOrders.length;
      totalRevenue += dayOrders.reduce((s, o) => s + o.total, 0);
      if (dayOrders.length > peakCount) { peakCount = dayOrders.length; peakDay = d; }
      if (dayOrders.length > 0) daysWithOrders += 1;
    }
    const avgDaily = daysWithOrders > 0 ? (totalOrders / daysWithOrders).toFixed(1) : '0';
    return { totalOrders, totalRevenue, avgDaily, peakDay };
  }, [ordersByDay, currentYear, currentMonth]);

  const navigateMonth = (dir: number) => {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCurrentMonth(m);
    setCurrentYear(y);
    setSelectedDay(null);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedOrders = selectedDay ? (ordersByDay[selectedDay] || []) : [];
  const selectedRevenue = selectedOrders.reduce((s, o) => s + o.total, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Calendar</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="receipt" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="currency-inr" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{formatCurrency(stats.totalRevenue)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="chart-line" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.avgDaily}</Text>
          <Text style={styles.statLabel}>Avg/Day</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="trophy" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{stats.peakDay || '-'}</Text>
          <Text style={styles.statLabel}>Peak Day</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Month Navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navArrow}>
            <Icon name="chevron-left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navArrow}>
            <Icon name="chevron-right" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarRow}>
            {DAYS_OF_WEEK.map(d => (
              <View key={d} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{d}</Text>
              </View>
            ))}
          </View>
          {Array.from({ length: cells.length / 7 }, (_, week) => (
            <View key={week} style={styles.calendarRow}>
              {cells.slice(week * 7, week * 7 + 7).map((day, idx) => {
                const count = day ? (ordersByDay[day]?.length || 0) : 0;
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const isSelected = day === selectedDay;
                const heatColor = day ? getHeatColor(count) : 'transparent';

                return (
                  <TouchableOpacity
                    key={`${week}-${idx}`}
                    style={[styles.dayCell, { backgroundColor: isSelected ? COLORS.primary : heatColor }, isToday && !isSelected && styles.dayCellToday]}
                    onPress={() => day && setSelectedDay(day)}
                    disabled={!day}
                  >
                    {day ? (
                      <>
                        <Text style={[styles.dayNumber, isSelected && { color: '#FFF' }, count > 5 && !isSelected && { color: '#FFF' }]}>
                          {day}
                        </Text>
                        {count > 0 && (
                          <Text style={[styles.dayCount, isSelected && { color: '#FFF' }, count > 5 && !isSelected && { color: '#FFF' }]}>
                            {count}
                          </Text>
                        )}
                      </>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Selected Day Info */}
        {selectedDay && (
          <View style={styles.selectedDayInfo}>
            <Text style={styles.selectedDayTitle}>
              {MONTHS[currentMonth]} {selectedDay} - {selectedOrders.length} orders
            </Text>
            {selectedOrders.length > 0 && (
              <Text style={styles.selectedDayRevenue}>Revenue: {formatCurrency(selectedRevenue)}</Text>
            )}
          </View>
        )}

        {/* Order Cards */}
        {selectedOrders.length > 0 ? (
          selectedOrders.map(order => {
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderCustomer}>{order.customerName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                  </View>
                </View>
                <View style={styles.orderFooter}>
                  <View style={styles.orderMeta}>
                    <Icon name="clock-outline" size={13} color={COLORS.text.muted} />
                    <Text style={styles.orderMetaText}>{formatTime(order.createdAt)}</Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Icon name="package-variant" size={13} color={COLORS.text.muted} />
                    <Text style={styles.orderMetaText}>{order.items.length} items</Text>
                  </View>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                </View>
              </View>
            );
          })
        ) : selectedDay ? (
          <View style={styles.empty}>
            <Icon name="calendar-blank-outline" size={64} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No orders</Text>
            <Text style={styles.emptySub}>No orders placed on {MONTHS[currentMonth]} {selectedDay}</Text>
          </View>
        ) : null}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
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
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 14, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },

  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, gap: SPACING.lg },
  navArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary },

  calendarContainer: { marginHorizontal: SPACING.base, backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.sm, ...SHADOW.sm },
  calendarRow: { flexDirection: 'row' },
  dayHeader: { flex: 1, alignItems: 'center', paddingVertical: SPACING.xs },
  dayHeaderText: { fontSize: 11, fontWeight: '700', color: COLORS.text.muted },

  dayCell: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: RADIUS.md, margin: 1 },
  dayCellToday: { borderWidth: 2, borderColor: COLORS.primary },
  dayNumber: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  dayCount: { fontSize: 9, fontWeight: '800', color: COLORS.primary, marginTop: 1 },

  selectedDayInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  selectedDayTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  selectedDayRevenue: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  orderCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginHorizontal: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  orderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  orderId: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  orderCustomer: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, marginTop: 2 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: 10, fontWeight: '800' },
  orderFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  orderMetaText: { fontSize: 11, color: COLORS.text.muted },
  orderTotal: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },

  empty: { alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.lg },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base },
  emptySub: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center', marginTop: SPACING.xs },
});
