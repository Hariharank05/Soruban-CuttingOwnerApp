// app/subscription-calendar.tsx - Subscription Delivery Calendar
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useSubscriptions } from '@/context/SubscriptionContext';
import type { Subscription } from '@/types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_MAP: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

interface DeliveryEntry {
  subscriptionId: string;
  customerName: string;
  items: string;
  frequency: string;
  timeSlot: string;
  isPaused: boolean;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatMonthYear(year: number, month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[month]} ${year}`;
}

function generateDeliveriesForMonth(
  subscriptions: Subscription[], year: number, month: number
): Record<number, DeliveryEntry[]> {
  const map: Record<number, DeliveryEntry[]> = {};
  const daysCount = getDaysInMonth(year, month);

  subscriptions.forEach(sub => {
    const itemsSummary = sub.items.map(i => i.name).join(', ');
    const isPaused = sub.status === 'paused';

    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      let shouldDeliver = false;

      if (sub.frequency === 'daily') {
        shouldDeliver = true;
      } else if (sub.frequency === 'weekly' && sub.weeklyDay) {
        shouldDeliver = WEEKDAY_MAP[sub.weeklyDay.toLowerCase()] === dayOfWeek;
      } else if (sub.frequency === 'monthly' && sub.monthlyDates?.length) {
        shouldDeliver = sub.monthlyDates.includes(day);
      }

      if (shouldDeliver) {
        if (!map[day]) map[day] = [];
        map[day].push({
          subscriptionId: sub.id,
          customerName: sub.customerName,
          items: itemsSummary || 'Subscription items',
          frequency: sub.frequency,
          timeSlot: sub.preferredTime || '9:00 AM - 11:00 AM',
          isPaused,
        });
      }
    }
  });
  return map;
}

const FREQ_COLORS: Record<string, { bg: string; color: string }> = {
  daily: { bg: '#E8F5E9', color: '#2E7D32' },
  weekly: { bg: '#E3F2FD', color: '#1565C0' },
  monthly: { bg: '#F3E5F5', color: '#7B1FA2' },
};

export default function SubscriptionCalendarScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { subscriptions } = useSubscriptions();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const deliveryMap = useMemo(
    () => generateDeliveriesForMonth(subscriptions, currentYear, currentMonth),
    [subscriptions, currentYear, currentMonth]
  );

  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active').length;
    const paused = subscriptions.filter(s => s.status === 'paused').length;
    const todayDeliveries = deliveryMap[today.getDate()]?.filter(d => !d.isPaused).length || 0;
    const dayOfWeek = today.getDay();
    let weekCount = 0;
    for (let d = today.getDate(); d <= Math.min(today.getDate() + (6 - dayOfWeek), getDaysInMonth(currentYear, currentMonth)); d++) {
      weekCount += (deliveryMap[d]?.filter(dd => !dd.isPaused).length || 0);
    }
    return { active, todayDeliveries, paused, weekCount };
  }, [subscriptions, deliveryMap, currentYear, currentMonth]);

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
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const selectedDeliveries = selectedDay ? (deliveryMap[selectedDay] || []) : [];

  const renderDeliveryCard = ({ item }: { item: DeliveryEntry }) => {
    const freq = FREQ_COLORS[item.frequency] || FREQ_COLORS.daily;
    return (
      <View style={[styles.card, item.isPaused && { opacity: 0.6 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.avatarCircle, { backgroundColor: item.isPaused ? '#FFF3E0' : '#E8F5E9' }]}>
              <Text style={[styles.avatarText, { color: item.isPaused ? '#E65100' : '#2E7D32' }]}>
                {item.customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.customerName}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>{item.items}</Text>
            </View>
          </View>
          <View style={[styles.freqBadge, { backgroundColor: freq.bg }]}>
            <Text style={[styles.freqBadgeText, { color: freq.color }]}>{item.frequency}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.timeRow}>
            <Icon name="clock-outline" size={13} color={COLORS.text.muted} />
            <Text style={styles.timeText}>{item.timeSlot}</Text>
          </View>
          {item.isPaused && (
            <View style={[styles.freqBadge, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.freqBadgeText, { color: '#E65100' }]}>Paused</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="calendar-blank-outline" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No deliveries</Text>
      <Text style={styles.emptySub}>
        {selectedDay ? `No subscription deliveries on ${formatMonthYear(currentYear, currentMonth).split(' ')[0]} ${selectedDay}` : 'Select a day to see deliveries'}
      </Text>
    </View>
  );

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
            <Text style={styles.headerTitle}>Subscription Calendar</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="refresh" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active Subs</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="truck-delivery" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.todayDeliveries}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="pause-circle" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.paused}</Text>
          <Text style={styles.statLabel}>Paused</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="calendar-week" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{stats.weekCount}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Month Navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navArrow}>
            <Icon name="chevron-left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{formatMonthYear(currentYear, currentMonth)}</Text>
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
          {Array.from({ length: calendarCells.length / 7 }, (_, week) => (
            <View key={week} style={styles.calendarRow}>
              {calendarCells.slice(week * 7, week * 7 + 7).map((day, idx) => {
                const deliveries = day ? (deliveryMap[day] || []) : [];
                const activeCount = deliveries.filter(d => !d.isPaused).length;
                const hasPaused = deliveries.some(d => d.isPaused);
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const isSelected = day === selectedDay;

                return (
                  <TouchableOpacity
                    key={`${week}-${idx}`}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected, isToday && !isSelected && styles.dayCellToday]}
                    onPress={() => day && setSelectedDay(day)}
                    disabled={!day}
                  >
                    {day ? (
                      <>
                        <Text style={[styles.dayNumber, isSelected && { color: '#FFF' }, isToday && !isSelected && { color: COLORS.primary }]}>
                          {day}
                        </Text>
                        <View style={styles.dotRow}>
                          {activeCount > 0 && <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />}
                          {hasPaused && <View style={[styles.dot, { backgroundColor: '#FFA726' }]} />}
                          {activeCount === 0 && !hasPaused && <View style={[styles.dot, { backgroundColor: '#E0E0E0' }]} />}
                        </View>
                        {activeCount > 0 && (
                          <Text style={[styles.deliveryCount, isSelected && { color: '#FFF' }]}>{activeCount}</Text>
                        )}
                      </>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Selected Day Deliveries */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedDay ? `Deliveries on ${formatMonthYear(currentYear, currentMonth).split(' ')[0]} ${selectedDay}` : 'Select a day'}
          </Text>
          {selectedDeliveries.length > 0 && (
            <Text style={styles.sectionCount}>{selectedDeliveries.filter(d => !d.isPaused).length} active</Text>
          )}
        </View>

        {selectedDeliveries.length > 0 ? (
          selectedDeliveries.map((entry, idx) => (
            <View key={`${entry.subscriptionId}-${idx}`} style={{ paddingHorizontal: SPACING.base }}>
              {renderDeliveryCard({ item: entry })}
            </View>
          ))
        ) : (
          renderEmptyState()
        )}

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
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },

  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, gap: SPACING.lg },
  navArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary },

  calendarContainer: { marginHorizontal: SPACING.base, backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.sm, ...SHADOW.sm },
  calendarRow: { flexDirection: 'row' },
  dayHeader: { flex: 1, alignItems: 'center', paddingVertical: SPACING.xs },
  dayHeaderText: { fontSize: 11, fontWeight: '700', color: COLORS.text.muted },

  dayCell: { flex: 1, alignItems: 'center', paddingVertical: SPACING.xs, minHeight: 52, borderRadius: RADIUS.md },
  dayCellSelected: { backgroundColor: COLORS.primary },
  dayCellToday: { backgroundColor: '#E8F5E9' },
  dayNumber: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  deliveryCount: { fontSize: 9, fontWeight: '800', color: COLORS.primary, marginTop: 1 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  sectionCount: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  avatarText: { fontSize: 16, fontWeight: '800' },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  cardSub: { fontSize: 12, color: COLORS.text.muted, marginTop: 1 },
  freqBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  freqBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'capitalize' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  timeText: { fontSize: 12, color: COLORS.text.muted },

  empty: { alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.lg },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base },
  emptySub: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center', marginTop: SPACING.xs },
});
