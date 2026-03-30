import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView,
  StatusBar, Alert, RefreshControl, Modal,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import { useDeliveries } from '@/context/DeliveryContext';
import { Order } from '@/types';
import { useTabBar } from '@/context/TabBarContext';

export default function DeliveriesScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { orders, updateOrderStatus, assignDriver } = useOrders();
  const { deliveryPersons, assignDelivery, reassignDelivery, markDelivered } = useDeliveries();
  const { handleScroll } = useTabBar();
  const [refreshing, setRefreshing] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState<string | null>(null);
  const [isReassign, setIsReassign] = useState(false);

  const activeDeliveries = useMemo(() => {
    return orders.filter(o => o.status === 'out_for_delivery' || o.status === 'ready');
  }, [orders]);

  const outForDelivery = useMemo(() => activeDeliveries.filter(o => o.status === 'out_for_delivery'), [activeDeliveries]);
  const readyOrders = useMemo(() => activeDeliveries.filter(o => o.status === 'ready'), [activeDeliveries]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleAssignDriver = (orderId: string, reassign = false) => {
    const available = deliveryPersons?.filter(d => d.isAvailable) || [];
    if (available.length === 0) {
      Alert.alert('No Drivers Available', 'All delivery persons are currently busy.');
      return;
    }
    setAssignOrderId(orderId);
    setIsReassign(reassign);
    setAssignModalVisible(true);
  };

  const handleMarkDelivered = (orderId: string) => {
    Alert.alert(
      'Confirm Delivery',
      'Mark this order as delivered?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            markDelivered?.(orderId);
            updateOrderStatus?.(orderId, 'delivered');
          },
        },
      ]
    );
  };

  const renderDeliveryCard = (order: Order) => {
    const isOut = order.status === 'out_for_delivery';
    return (
      <View key={order.id} style={[styles.deliveryCard, themed.card]}>
        <View style={styles.deliveryTopRow}>
          <View style={styles.orderIdRow}>
            <Icon name="receipt" size={14} color={COLORS.primary} />
            <Text style={styles.orderId}>#ORD-{order.id.slice(-4)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isOut ? themed.colors.accentBg.purple : themed.colors.accentBg.green }]}>
            <View style={[styles.statusDot, { backgroundColor: isOut ? '#7B1FA2' : '#388E3C' }]} />
            <Text style={[styles.statusText, { color: isOut ? '#7B1FA2' : '#388E3C' }]}>
              {isOut ? 'Out for Delivery' : 'Ready'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Icon name="account-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>{order.customerName || 'Customer'}</Text>
        </View>

        {order.deliveryAddress && (
          <View style={styles.detailRow}>
            <Icon name="map-marker-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText} numberOfLines={2}>{order.deliveryAddress}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Icon name="moped-outline" size={16} color={COLORS.text.secondary} />
          <Text style={[styles.detailText, !order.assignedDriver && { color: '#E65100', fontStyle: 'italic' }]}>
            {order.assignedDriver || 'Unassigned'}
          </Text>
        </View>

        <View style={styles.actionRow}>
          {!order.assignedDriver && (
            <TouchableOpacity
              style={styles.assignBtn}
              onPress={() => handleAssignDriver(order.id)}
            >
              <Icon name="account-plus-outline" size={16} color="#FFF" />
              <Text style={styles.assignBtnText}>Assign Driver</Text>
            </TouchableOpacity>
          )}
          {isOut && order.assignedDriver && (
            <TouchableOpacity
              style={styles.changeDriverBtn}
              onPress={() => handleAssignDriver(order.id, true)}
            >
              <Icon name="account-switch-outline" size={16} color="#FFF" />
              <Text style={styles.changeDriverBtnText}>Change Driver</Text>
            </TouchableOpacity>
          )}
          {isOut && (
            <TouchableOpacity
              style={styles.deliveredBtn}
              onPress={() => handleMarkDelivered(order.id)}
            >
              <Icon name="check-circle-outline" size={16} color="#FFF" />
              <Text style={styles.deliveredBtnText}>Mark Delivered</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => router.push({ pathname: '/order-detail', params: { id: order.id } })}
          >
            <Text style={styles.viewBtnText}>View</Text>
            <Icon name="chevron-right" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDriverCard = ({ item: driver }: { item: any }) => {
    const isAvailable = driver.isAvailable;
    return (
      <View style={[styles.driverCard, themed.card]}>
        <View style={styles.driverRow}>
          <View style={[styles.driverAvatar, { backgroundColor: isAvailable ? themed.colors.accentBg.green : themed.colors.accentBg.red }]}>
            <Icon name="account" size={22} color={isAvailable ? '#388E3C' : '#C62828'} />
          </View>
          <View style={styles.driverInfo}>
            <View style={styles.driverNameRow}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <View style={[styles.driverStatusDot, { backgroundColor: isAvailable ? '#4CAF50' : '#E53935' }]} />
              <Text style={[styles.driverStatusText, { color: isAvailable ? '#388E3C' : '#C62828' }]}>
                {isAvailable ? 'Available' : 'Busy'}
              </Text>
            </View>
            <View style={styles.driverMeta}>
              <View style={styles.driverMetaItem}>
                <Icon name="phone-outline" size={12} color={COLORS.text.muted} />
                <Text style={styles.driverMetaText}>{driver.phone || 'N/A'}</Text>
              </View>
              <View style={styles.driverMetaItem}>
                <Icon name="package-variant" size={12} color={COLORS.text.muted} />
                <Text style={styles.driverMetaText}>{driver.activeDeliveries || 0} active</Text>
              </View>
              <View style={styles.driverMetaItem}>
                <Icon name="check-all" size={12} color={COLORS.text.muted} />
                <Text style={styles.driverMetaText}>{driver.totalDeliveries || 0} total</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#E8F5E9', zIndex: 10 }} />

      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <Text style={[styles.headerTitle, themed.textPrimary]}>Deliveries</Text>
        <Text style={[styles.headerSub, themed.textSecondary]}>Track and manage deliveries</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={[styles.quickStatCard, { backgroundColor: themed.colors.accentBg.purple }]}>
            <Icon name="truck-delivery" size={18} color="#7B1FA2" />
            <Text style={[styles.quickStatCount, { color: '#7B1FA2' }]}>{outForDelivery.length}</Text>
            <Text style={styles.quickStatLabel}>In Transit</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: themed.colors.accentBg.green }]}>
            <Icon name="package-variant" size={18} color="#388E3C" />
            <Text style={[styles.quickStatCount, { color: '#388E3C' }]}>{readyOrders.length}</Text>
            <Text style={styles.quickStatLabel}>Ready</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: themed.colors.accentBg.blue }]}>
            <Icon name="account-group" size={18} color="#1565C0" />
            <Text style={[styles.quickStatCount, { color: '#1565C0' }]}>{deliveryPersons?.filter(d => d.isAvailable).length || 0}</Text>
            <Text style={styles.quickStatLabel}>Available</Text>
          </View>
        </View>

        {/* Active Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="truck-fast-outline" size={20} color={COLORS.text.primary} />
            <Text style={[styles.sectionTitle, themed.textPrimary]}>Active Deliveries</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{activeDeliveries.length}</Text>
            </View>
          </View>

          {activeDeliveries.length === 0 ? (
            <View style={[styles.emptySection, themed.card]}>
              <Icon name="truck-outline" size={40} color={COLORS.text.muted} />
              <Text style={styles.emptySectionText}>No active deliveries</Text>
            </View>
          ) : (
            activeDeliveries.map(renderDeliveryCard)
          )}
        </View>

        {/* Delivery Persons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="account-group-outline" size={20} color={COLORS.text.primary} />
            <Text style={[styles.sectionTitle, themed.textPrimary]}>Delivery Persons</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{deliveryPersons?.length || 0}</Text>
            </View>
          </View>

          {(!deliveryPersons || deliveryPersons.length === 0) ? (
            <View style={[styles.emptySection, themed.card]}>
              <Icon name="account-plus-outline" size={40} color={COLORS.text.muted} />
              <Text style={styles.emptySectionText}>No delivery persons added</Text>
            </View>
          ) : (
            deliveryPersons.map((driver: any) => (
              <View key={driver.id}>{renderDriverCard({ item: driver })}</View>
            ))
          )}
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      {/* Assign Driver Modal */}
      <Modal
        visible={assignModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => { setAssignModalVisible(false); setIsReassign(false); }}
        >
          <View style={[styles.assignModalSheet, themed.card]} onStartShouldSetResponder={() => true}>
            <View style={styles.assignModalHandle} />
            <Text style={[styles.assignModalTitle, themed.textPrimary]}>{isReassign ? 'Change Driver' : 'Assign Driver'}</Text>
            <Text style={[styles.assignModalSub, themed.textSecondary]}>Select a delivery person</Text>
            <View style={styles.assignDriverList}>
              {(deliveryPersons?.filter(d => d.isAvailable) || []).map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={styles.assignDriverBtn}
                  onPress={async () => {
                    if (assignOrderId) {
                      if (isReassign) {
                        await reassignDelivery?.(assignOrderId, d.id);
                      } else {
                        await assignDelivery?.(assignOrderId, d.id);
                      }
                      await assignDriver?.(assignOrderId, d.name, d.phone);
                    }
                    setAssignModalVisible(false);
                    setAssignOrderId(null);
                    setIsReassign(false);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.assignDriverAvatar, { backgroundColor: themed.colors.accentBg.green }]}>
                    <Icon name="account" size={20} color="#388E3C" />
                  </View>
                  <Text style={[styles.assignDriverName, themed.textPrimary]}>{d.name}</Text>
                  <Icon name="chevron-right" size={18} color={COLORS.text.secondary} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.assignCancelBtn}
              onPress={() => { setAssignModalVisible(false); setAssignOrderId(null); setIsReassign(false); }}
              activeOpacity={0.8}
            >
              <Text style={styles.assignCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },

  /* Header */
  header: { paddingHorizontal: SPACING.base, paddingTop: (StatusBar.currentHeight || 0) + SPACING.md, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary },
  headerSub: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },

  /* Quick Stats */
  quickStats: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginTop: SPACING.md },
  quickStatCard: {
    flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', ...SHADOW.sm,
  },
  quickStatCount: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  quickStatLabel: { fontSize: 10, fontWeight: '600', color: COLORS.text.secondary, marginTop: 2 },

  /* Sections */
  section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.base },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary, flex: 1 },
  sectionBadge: {
    minWidth: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  sectionBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },

  emptySection: {
    borderRadius: RADIUS.lg, padding: SPACING.xl,
    alignItems: 'center', ...SHADOW.sm,
  },
  emptySectionText: { fontSize: 13, color: COLORS.text.muted, marginTop: SPACING.sm },

  /* Delivery Card */
  deliveryCard: {
    borderRadius: RADIUS.lg, padding: SPACING.base,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  deliveryTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderId: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  detailText: { fontSize: 13, color: COLORS.text.secondary, flex: 1, lineHeight: 18 },

  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  assignBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1565C0', borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  assignBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  changeDriverBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E65100', borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  changeDriverBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  deliveredBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  deliveredBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto',
    paddingHorizontal: 10, paddingVertical: 8,
  },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  /* Driver Card */
  driverCard: {
    borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOW.sm,
  },
  driverRow: { flexDirection: 'row', gap: SPACING.md },
  driverAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  driverInfo: { flex: 1 },
  driverNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  driverName: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  driverStatusDot: { width: 8, height: 8, borderRadius: 4 },
  driverStatusText: { fontSize: 11, fontWeight: '600' },
  driverMeta: { flexDirection: 'row', gap: SPACING.md, marginTop: 6 },
  driverMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  driverMetaText: { fontSize: 11, color: COLORS.text.muted },

  /* Assign Driver Modal */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  assignModalSheet: {
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: SPACING.xl,
    ...SHADOW.floating,
  },
  assignModalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border,
    alignSelf: 'center', marginBottom: SPACING.md,
  },
  assignModalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  assignModalSub: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: SPACING.md },
  assignDriverList: { gap: SPACING.sm },
  assignDriverBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  assignDriverAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  assignDriverName: { flex: 1, fontSize: 15, fontWeight: '700' },
  assignCancelBtn: {
    marginTop: SPACING.md, paddingVertical: 14, borderRadius: RADIUS.lg,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  assignCancelText: { fontSize: 15, fontWeight: '700', color: COLORS.text.secondary },
});
