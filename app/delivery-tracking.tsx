// app/delivery-tracking.tsx - Delivery Monitoring Screen
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import { useDeliveries } from '@/context/DeliveryContext';
import type { Order, DeliveryPerson } from '@/types';

interface TimelineStep {
  key: string;
  label: string;
  icon: string;
  time: string | null;
}

const DELIVERY_STATUSES = ['assigned', 'picked_up', 'in_transit', 'nearby', 'delivered'];

const STATUS_LABELS: Record<string, string> = {
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  nearby: 'Nearby',
  delivered: 'Delivered',
};

const STATUS_ICONS: Record<string, string> = {
  assigned: 'account-check',
  picked_up: 'package-variant',
  in_transit: 'truck-delivery',
  nearby: 'map-marker-radius',
  delivered: 'check-circle',
};

const DEMO_ORDER = {
  id: 'ORD-1042',
  customerName: 'Priya Sharma',
  customerPhone: '9876543210',
  deliveryAddress: '42, Anna Nagar 3rd Street, Chennai - 600040',
  deliverySlot: '10:00 AM - 11:00 AM',
  status: 'in_transit',
  itemCount: 3,
  totalAmount: 1850,
  createdAt: '2026-03-20T08:30:00Z',
};

const DEMO_DRIVER: DeliveryPerson | null = {
  id: 'd1',
  name: 'Karthik R',
  phone: '9876500001',
  isAvailable: true,
  activeDeliveries: 2,
  totalDeliveries: 156,
};

const DEMO_TIMELINE: TimelineStep[] = [
  { key: 'assigned', label: 'Assigned', icon: 'account-check', time: '09:45 AM' },
  { key: 'picked_up', label: 'Picked Up', icon: 'package-variant', time: '10:05 AM' },
  { key: 'in_transit', label: 'In Transit', icon: 'truck-delivery', time: '10:12 AM' },
  { key: 'nearby', label: 'Nearby', icon: 'map-marker-radius', time: null },
  { key: 'delivered', label: 'Delivered', icon: 'check-circle', time: null },
];

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function DeliveryTrackingScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { id } = useLocalSearchParams<{ id: string }>();

  const order = DEMO_ORDER;
  const driver = DEMO_DRIVER;
  const timeline = DEMO_TIMELINE;

  const currentStatusIndex = useMemo(() => {
    return DELIVERY_STATUSES.indexOf(order.status);
  }, [order.status]);

  const estimatedArrival = '10:35 AM';

  const handleMarkDelivered = () => {
    Alert.alert(
      'Mark as Delivered',
      `Confirm that Order #${order.id} has been delivered to ${order.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Delivery', onPress: () => Alert.alert('Success', 'Order marked as delivered!') },
      ]
    );
  };

  const handleCallDriver = () => {
    if (!driver) return;
    Alert.alert(
      'Call Driver',
      `Call ${driver.name} at ${driver.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling', `Dialing ${driver.phone}...`) },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="truck-remove-outline" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No driver assigned</Text>
      <Text style={styles.emptySub}>
        A delivery driver has not been assigned to this order yet. Please assign one from the order details page.
      </Text>
      <TouchableOpacity style={styles.backToOrderBtn} onPress={() => router.back()}>
        <Icon name="arrow-left" size={16} color="#FFF" />
        <Text style={styles.backToOrderBtnText}>Back to Order</Text>
      </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Delivery Tracking</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {!driver ? (
        renderEmptyState()
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Order Info Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Icon name="package-variant-closed" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Order Details</Text>
            </View>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Order ID</Text>
                <Text style={styles.infoValue}>#{order.id}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Customer</Text>
                <Text style={styles.infoValue}>{order.customerName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Items</Text>
                <Text style={styles.infoValue}>{order.itemCount} items</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Amount</Text>
                <Text style={[styles.infoValue, { color: COLORS.primary }]}>{formatCurrency(order.totalAmount)}</Text>
              </View>
            </View>
            <View style={styles.addressRow}>
              <Icon name="map-marker" size={16} color={COLORS.text.muted} />
              <Text style={styles.addressText}>{order.deliveryAddress}</Text>
            </View>
            <View style={styles.slotRow}>
              <Icon name="clock-outline" size={16} color={COLORS.text.muted} />
              <Text style={styles.slotText}>Slot: {order.deliverySlot}</Text>
            </View>
          </View>

          {/* Driver Info Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Icon name="motorbike" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Driver</Text>
            </View>
            <View style={styles.driverRow}>
              <View style={[styles.driverAvatar, { backgroundColor: '#E8F5E9' }]}>
                <Text style={styles.driverAvatarText}>{driver.name.charAt(0)}</Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <View style={styles.driverMeta}>
                  <Icon name="phone" size={12} color={COLORS.text.muted} />
                  <Text style={styles.driverMetaText}>{driver.phone}</Text>
                </View>
                <View style={styles.driverMeta}>
                  <Icon name="truck-delivery" size={12} color={COLORS.text.muted} />
                  <Text style={styles.driverMetaText}>{driver.totalDeliveries} total</Text>
                  <Text style={styles.driverMetaDot}>  </Text>
                  <Icon name="package-variant" size={12} color={COLORS.text.muted} />
                  <Text style={styles.driverMetaText}>{driver.activeDeliveries} active</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
                <Icon name="phone" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Estimated Arrival */}
          <View style={[styles.card, styles.arrivalCard]}>
            <Icon name="clock-fast" size={24} color={COLORS.primary} />
            <View style={styles.arrivalInfo}>
              <Text style={styles.arrivalLabel}>Estimated Arrival</Text>
              <Text style={styles.arrivalTime}>{estimatedArrival}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.statusPillText, { color: '#2E7D32' }]}>
                {STATUS_LABELS[order.status] || order.status}
              </Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Icon name="timeline-clock" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Delivery Timeline</Text>
            </View>

            {timeline.map((step, index) => {
              const stepIndex = DELIVERY_STATUSES.indexOf(step.key);
              const isCompleted = stepIndex <= currentStatusIndex;
              const isCurrent = stepIndex === currentStatusIndex;
              const isLast = index === timeline.length - 1;

              return (
                <View key={step.key} style={styles.timelineStep}>
                  {/* Line + Dot */}
                  <View style={styles.timelineDotCol}>
                    <View style={[
                      styles.timelineDot,
                      isCompleted && styles.timelineDotCompleted,
                      isCurrent && styles.timelineDotCurrent,
                    ]}>
                      <Icon
                        name={step.icon as any}
                        size={14}
                        color={isCompleted ? '#FFF' : COLORS.text.muted}
                      />
                    </View>
                    {!isLast && (
                      <View style={[
                        styles.timelineLine,
                        isCompleted && stepIndex < currentStatusIndex && styles.timelineLineCompleted,
                      ]} />
                    )}
                  </View>

                  {/* Label + Time */}
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelCompleted,
                      isCurrent && styles.timelineLabelCurrent,
                    ]}>
                      {step.label}
                    </Text>
                    {step.time ? (
                      <Text style={styles.timelineTime}>{step.time}</Text>
                    ) : (
                      <Text style={[styles.timelineTime, { color: COLORS.text.muted }]}>Pending</Text>
                    )}
                  </View>

                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Actions */}
          {order.status !== 'delivered' && (
            <View style={styles.actionsSection}>
              <TouchableOpacity style={styles.deliveredBtn} onPress={handleMarkDelivered}>
                <Icon name="check-circle" size={20} color="#FFF" />
                <Text style={styles.deliveredBtnText}>Mark as Delivered</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callDriverBtn} onPress={handleCallDriver}>
                <Icon name="phone" size={20} color={COLORS.primary} />
                <Text style={styles.callDriverBtnText}>Call Driver</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
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

  scrollContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  infoItem: { width: '47%' as any },
  infoLabel: { fontSize: 11, color: COLORS.text.muted, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },

  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs, paddingTop: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.divider },
  addressText: { fontSize: 13, color: COLORS.text.secondary, flex: 1, lineHeight: 20 },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  slotText: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },

  driverRow: { flexDirection: 'row', alignItems: 'center' },
  driverAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  driverAvatarText: { fontSize: 18, fontWeight: '800', color: '#2E7D32' },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: 2 },
  driverMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  driverMetaText: { fontSize: 12, color: COLORS.text.muted },
  driverMetaDot: { fontSize: 10, color: COLORS.text.muted },

  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  arrivalCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  arrivalInfo: { flex: 1 },
  arrivalLabel: { fontSize: 12, color: COLORS.text.muted, fontWeight: '600' },
  arrivalTime: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary },
  statusPill: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full },
  statusPillText: { fontSize: 12, fontWeight: '700' },

  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 56 },
  timelineDotCol: { alignItems: 'center', width: 32 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center' },
  timelineDotCompleted: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timelineDotCurrent: { backgroundColor: COLORS.primary, borderColor: '#81C784', borderWidth: 3 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E0E0E0', minHeight: 24 },
  timelineLineCompleted: { backgroundColor: COLORS.primary },
  timelineContent: { flex: 1, paddingLeft: SPACING.md, paddingBottom: SPACING.md },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text.muted },
  timelineLabelCompleted: { color: COLORS.text.primary },
  timelineLabelCurrent: { color: COLORS.primary, fontWeight: '700' },
  timelineTime: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },
  currentBadge: { backgroundColor: COLORS.backgroundSoft, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  currentBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.primary },

  actionsSection: { gap: SPACING.sm, marginTop: SPACING.sm },
  deliveredBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.base, borderRadius: RADIUS.lg, ...SHADOW.md },
  deliveredBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  callDriverBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: '#FFF', paddingVertical: SPACING.base, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.primary },
  callDriverBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center', marginBottom: SPACING.lg },
  backToOrderBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.full },
  backToOrderBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
