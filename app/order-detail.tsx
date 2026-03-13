import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Linking, ActivityIndicator, Modal, FlatList, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useOrders } from '@/context/OrderContext';
import { useDeliveries } from '@/context/DeliveryContext';
import type { OwnerOrderStatus, OrderTimeline, CutType } from '@/types';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  pending: { color: '#E65100', bg: '#FFF3E0', icon: 'clock-outline', label: 'Pending' },
  preparing: { color: '#1565C0', bg: '#E3F2FD', icon: 'food-variant', label: 'Preparing' },
  ready: { color: '#388E3C', bg: '#E8F5E9', icon: 'check-circle-outline', label: 'Ready' },
  out_for_delivery: { color: '#7B1FA2', bg: '#F3E5F5', icon: 'truck-delivery-outline', label: 'Out for Delivery' },
  delivered: { color: '#616161', bg: '#F5F5F5', icon: 'package-variant-closed', label: 'Delivered' },
  cancelled: { color: '#C62828', bg: '#FFEBEE', icon: 'close-circle-outline', label: 'Cancelled' },
};

const CUT_TYPE_ICONS: Record<string, { icon: string; label: string; image: string; description: string }> = {
  small_pieces: { icon: 'cube-outline', label: 'Small Pieces', description: 'Finely chopped for curries & gravies', image: 'https://media.istockphoto.com/id/2249938416/photo/diced-bell-peppers-in-three-colors-pizza-toppings-hd-stock-photo.webp?a=1&b=1&s=612x612&w=0&k=20&c=JPOMHkiFknVzVR1wH1Byglt-owU6KrwDti0rWT50giE=' },
  slices: { icon: 'circle-slice-4', label: 'Slices', description: 'Even slices for stir-fry & salads', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp1lhK5cvi8am617xdzRjbYlPlYhcc1bVSQg&s' },
  cubes: { icon: 'cube', label: 'Cubes', description: 'Uniform cubes for biryani & soups', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5ezD-KS6iwuiBmghKqB8W4rvTlp1JOB6KL4TSS2YXKQ&s' },
  long_cuts: { icon: 'resize', label: 'Long Cuts', description: 'Long strips for noodles & fries', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzjZO-U546wb1z9xNy9UauhZef5_PalkHyBCtpgEZ0ag&s' },
  grated: { icon: 'grain', label: 'Grated', description: 'Finely grated for dosa batter & more', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiCjNUcnt_Ld-3fDMGTtN1kjCSsBRSOFOCKA&s' },
};

const PAYMENT_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  cod: { color: '#E65100', bg: '#FFF3E0', icon: 'cash', label: 'Cash on Delivery' },
  upi: { color: '#1565C0', bg: '#E3F2FD', icon: 'cellphone', label: 'UPI' },
  wallet: { color: '#7B1FA2', bg: '#F3E5F5', icon: 'wallet', label: 'Wallet' },
  wallet_partial: { color: '#7B1FA2', bg: '#F3E5F5', icon: 'wallet-outline', label: 'Wallet + Online' },
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrderById, updateOrderStatus, assignDriver } = useOrders();
  const { getAvailableDrivers, assignDelivery } = useDeliveries();

  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const order = useMemo(() => getOrderById(id || ''), [id, getOrderById]);
  const availableDrivers = useMemo(() => getAvailableDrivers(), [getAvailableDrivers]);

  const handleStatusUpdate = useCallback(async (newStatus: OwnerOrderStatus) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      Alert.alert('Success', `Order status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    } catch {
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  }, [order, updateOrderStatus]);

  const handleRejectOrder = useCallback(() => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => handleStatusUpdate('cancelled') },
    ]);
  }, [handleStatusUpdate]);

  const handleAssignDriver = useCallback(async (driverId: string) => {
    if (!order) return;
    const result = await assignDelivery(order.id, driverId);
    if (result.success) {
      const driver = availableDrivers.find(d => d.id === driverId);
      if (driver) {
        await assignDriver(order.id, driver.name, driver.phone);
      }
      await handleStatusUpdate('out_for_delivery');
      setDriverModalVisible(false);
    } else {
      Alert.alert('Error', result.message);
    }
  }, [order, assignDelivery, assignDriver, availableDrivers, handleStatusUpdate]);

  const handleCallCustomer = useCallback(() => {
    if (order?.customerPhone) {
      Linking.openURL(`tel:${order.customerPhone}`);
    }
  }, [order]);

  const handleCallDriver = useCallback(() => {
    if (order?.driverPhone) {
      Linking.openURL(`tel:${order.driverPhone}`);
    }
  }, [order]);

  if (!order) {
    return (
      <SafeAreaView style={[styles.safe, themed.safeArea]}>
        <View style={styles.centered}>
          <Icon name="alert-circle-outline" size={56} color={COLORS.text.muted} />
          <Text style={[styles.emptyTitle, themed.textPrimary]}>Order not found</Text>
          <TouchableOpacity style={styles.backBtnAlt} onPress={() => router.back()}>
            <Text style={styles.backBtnAltText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const paymentCfg = PAYMENT_CONFIG[order.paymentMethod] || PAYMENT_CONFIG.cod;

  return (
    <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient colors={themed.headerGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, themed.textPrimary]}>Order #{order.id}</Text>
            <Text style={[styles.headerSub, themed.textSecondary]}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Bar */}
        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, themed.textPrimary]}>Order Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadgeLg, { backgroundColor: statusCfg.bg }]}>
              <Icon name={statusCfg.icon as any} size={20} color={statusCfg.color} />
              <Text style={[styles.statusTextLg, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            </View>
            {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <View style={styles.etaChip}>
                <Icon name="timer-outline" size={14} color={COLORS.primary} />
                <Text style={styles.etaText}>ETA: {order.estimatedDelivery}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Customer Info */}
        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, themed.textPrimary]}>Customer Info</Text>
          <View style={styles.infoRow}>
            <Icon name="account" size={18} color={COLORS.primary} />
            <Text style={[styles.infoText, themed.textPrimary]}>{order.customerName}</Text>
          </View>
          <TouchableOpacity style={styles.infoRow} onPress={handleCallCustomer}>
            <Icon name="phone" size={18} color={COLORS.primary} />
            <Text style={[styles.infoText, themed.textPrimary]}>{order.customerPhone}</Text>
            <View style={styles.callBtn}>
              <Icon name="phone-outline" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={18} color={COLORS.primary} />
            <Text style={[styles.infoText, themed.textSecondary, { flex: 1 }]}>{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, themed.textPrimary]}>Delivery Info</Text>
          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={18} color={COLORS.accent} />
            <Text style={[styles.infoLabel, themed.textSecondary]}>Time Slot:</Text>
            <Text style={[styles.infoValue, themed.textPrimary]}>{order.deliverySlot}</Text>
          </View>
          {order.estimatedDelivery && (
            <View style={styles.infoRow}>
              <Icon name="timer-sand" size={18} color={COLORS.accent} />
              <Text style={[styles.infoLabel, themed.textSecondary]}>Estimated:</Text>
              <Text style={[styles.infoValue, themed.textPrimary]}>{order.estimatedDelivery}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Icon name="truck-delivery" size={18} color={COLORS.accent} />
            <Text style={[styles.infoLabel, themed.textSecondary]}>Driver:</Text>
            {order.assignedDriver ? (
              <TouchableOpacity style={styles.driverChip} onPress={handleCallDriver}>
                <Text style={styles.driverName}>{order.assignedDriver}</Text>
                <Icon name="phone-outline" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.infoValue, { color: COLORS.text.muted }]}>Not assigned</Text>
            )}
          </View>
        </View>

        {/* Cutting Instructions */}
        <View style={[styles.card, themed.card]}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="content-cut" size={20} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, themed.textPrimary, { marginBottom: 0, marginLeft: 8 }]}>
              Cutting Instructions
            </Text>
          </View>
          {order.items.map((item, idx) => {
            const cutInfo = item.cutType ? CUT_TYPE_ICONS[item.cutType] : null;
            return (
              <View key={item.id || idx} style={[styles.cuttingItem, idx < order.items.length - 1 && styles.cuttingItemBorder]}>
                <View style={styles.cuttingItemHeader}>
                  <View style={styles.productIcon}>
                    <Icon name="food-apple-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.productName, themed.textPrimary]}>{item.name}</Text>
                    <Text style={[styles.productQty, themed.textSecondary]}>
                      Qty: {item.quantity} x {item.unit} {item.selectedWeight ? `(${item.selectedWeight}g)` : ''}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>{'\u20B9'}{item.price * item.quantity}</Text>
                </View>

                {cutInfo && (
                  <View style={styles.cutTypeRow}>
                    <View style={styles.cutTypeCard}>
                      <Image source={{ uri: cutInfo.image }} style={styles.cutTypeImage} resizeMode="cover" />
                      <View style={styles.cutTypeInfo}>
                        <View style={styles.cutTypeBadge}>
                          <Icon name={cutInfo.icon as any} size={14} color={COLORS.primary} />
                          <Text style={styles.cutTypeText}>{cutInfo.label}</Text>
                        </View>
                        <Text style={styles.cutTypeDesc}>{cutInfo.description}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {item.specialInstructions && (
                  <View style={styles.specialBox}>
                    <Icon name="alert-circle-outline" size={16} color="#E65100" />
                    <Text style={styles.specialText}>{item.specialInstructions}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, themed.textPrimary]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, themed.textSecondary]}>Subtotal</Text>
            <Text style={[styles.summaryValue, themed.textPrimary]}>{'\u20B9'}{order.subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, themed.textSecondary]}>Cutting Charges</Text>
            <Text style={[styles.summaryValue, themed.textPrimary]}>{'\u20B9'}{order.cuttingCharges}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, themed.textSecondary]}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, themed.textPrimary]}>{'\u20B9'}{order.deliveryFee}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: COLORS.status.success }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: COLORS.status.success }]}>-{'\u20B9'}{order.discount}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, themed.textPrimary]}>Total</Text>
            <Text style={styles.totalValue}>{'\u20B9'}{order.total}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, themed.textPrimary]}>Payment</Text>
          <View style={styles.paymentRow}>
            <View style={[styles.paymentBadge, { backgroundColor: paymentCfg.bg }]}>
              <Icon name={paymentCfg.icon as any} size={18} color={paymentCfg.color} />
              <Text style={[styles.paymentText, { color: paymentCfg.color }]}>{paymentCfg.label}</Text>
            </View>
            <Text style={[styles.paymentAmount, themed.textPrimary]}>{'\u20B9'}{order.total}</Text>
          </View>
          {order.walletAmountUsed && order.walletAmountUsed > 0 && (
            <View style={styles.walletInfo}>
              <Icon name="wallet" size={16} color="#7B1FA2" />
              <Text style={styles.walletText}>Wallet used: {'\u20B9'}{order.walletAmountUsed}</Text>
            </View>
          )}
        </View>

        {/* Order Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <View style={[styles.card, themed.card]}>
            <Text style={[styles.sectionTitle, themed.textPrimary]}>Order Timeline</Text>
            {order.timeline.map((event: OrderTimeline, idx: number) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  <View style={[styles.timelineDot, { backgroundColor: event.completed ? COLORS.primary : COLORS.border }]} />
                  {idx < order.timeline!.length - 1 && (
                    <View style={[styles.timelineConnector, { backgroundColor: event.completed ? COLORS.primaryLight : COLORS.border }]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={[styles.timelineStatus, themed.textPrimary, !event.completed && { color: COLORS.text.muted }]}>
                      {event.status}
                    </Text>
                    <Text style={[styles.timelineTime, themed.textMuted]}>{event.time}</Text>
                  </View>
                  <Text style={[styles.timelineDesc, themed.textSecondary]}>{event.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <View style={styles.actionsContainer}>
            {order.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnPrimary]}
                  onPress={() => handleStatusUpdate('preparing')}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? <ActivityIndicator color="#FFF" size="small" /> : (
                    <>
                      <Icon name="check" size={20} color="#FFF" />
                      <Text style={styles.actionBtnPrimaryText}>Accept Order</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleRejectOrder}>
                  <Icon name="close" size={20} color={COLORS.status.error} />
                  <Text style={styles.actionBtnDangerText}>Reject Order</Text>
                </TouchableOpacity>
              </>
            )}
            {order.status === 'preparing' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => handleStatusUpdate('ready')}
                disabled={updatingStatus}
              >
                {updatingStatus ? <ActivityIndicator color="#FFF" size="small" /> : (
                  <>
                    <Icon name="check-circle" size={20} color="#FFF" />
                    <Text style={styles.actionBtnPrimaryText}>Mark Ready</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {order.status === 'ready' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => setDriverModalVisible(true)}
                disabled={updatingStatus}
              >
                <Icon name="truck-delivery" size={20} color="#FFF" />
                <Text style={styles.actionBtnPrimaryText}>Assign Driver & Dispatch</Text>
              </TouchableOpacity>
            )}
            {order.status === 'out_for_delivery' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => handleStatusUpdate('delivered')}
                disabled={updatingStatus}
              >
                {updatingStatus ? <ActivityIndicator color="#FFF" size="small" /> : (
                  <>
                    <Icon name="package-variant-closed-check" size={20} color="#FFF" />
                    <Text style={styles.actionBtnPrimaryText}>Mark Delivered</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Driver Selection Modal */}
      <Modal visible={driverModalVisible} transparent animationType="slide" onRequestClose={() => setDriverModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themed.card]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, themed.textPrimary]}>Assign Driver</Text>
              <TouchableOpacity onPress={() => setDriverModalVisible(false)}>
                <Icon name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
            {availableDrivers.length === 0 ? (
              <View style={styles.centered}>
                <Icon name="account-off-outline" size={48} color={COLORS.text.muted} />
                <Text style={[styles.emptyTitle, themed.textSecondary]}>No drivers available</Text>
              </View>
            ) : (
              <FlatList
                data={availableDrivers}
                keyExtractor={d => d.id}
                renderItem={({ item: driver }) => (
                  <TouchableOpacity style={[styles.driverCard, themed.card]} onPress={() => handleAssignDriver(driver.id)}>
                    <View style={styles.driverAvatar}>
                      <Icon name="account" size={24} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.driverCardName, themed.textPrimary]}>{driver.name}</Text>
                      <Text style={[styles.driverCardInfo, themed.textSecondary]}>
                        {driver.phone} | Active: {driver.activeDeliveries} | Total: {driver.totalDeliveries}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={COLORS.text.muted} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingTop: SPACING.sm },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },

  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 2 },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },

  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadgeLg: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full },
  statusTextLg: { fontSize: 14, fontWeight: '700' },
  etaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.backgroundSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full },
  etaText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.sm },
  infoText: { fontSize: 14, fontWeight: '500' },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600' },
  callBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },

  driverChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.backgroundSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  driverName: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // Cutting Instructions
  cuttingItem: { paddingVertical: SPACING.md },
  cuttingItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  cuttingItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  productIcon: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.backgroundSoft, justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 15, fontWeight: '700' },
  productQty: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  cutTypeRow: { marginTop: 8, marginLeft: 50 },
  cutTypeCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.backgroundSoft, borderRadius: RADIUS.md, padding: SPACING.sm, alignSelf: 'flex-start' },
  cutTypeImage: { width: 48, height: 48, borderRadius: RADIUS.sm },
  cutTypeInfo: { flex: 1 },
  cutTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cutTypeText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  cutTypeDesc: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2 },
  specialBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8, marginLeft: 50, backgroundColor: '#FFF8E1', padding: SPACING.sm, borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: '#FFA726' },
  specialText: { fontSize: 12, color: '#E65100', fontWeight: '500', flex: 1 },

  // Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.md, marginTop: SPACING.xs, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  // Payment
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full },
  paymentText: { fontSize: 13, fontWeight: '700' },
  paymentAmount: { fontSize: 16, fontWeight: '800' },
  walletInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  walletText: { fontSize: 13, fontWeight: '600', color: '#7B1FA2' },

  // Timeline
  timelineItem: { flexDirection: 'row', minHeight: 56 },
  timelineLine: { width: 24, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineConnector: { width: 2, flex: 1, marginVertical: 4 },
  timelineContent: { flex: 1, marginLeft: 10, paddingBottom: SPACING.md },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timelineStatus: { fontSize: 14, fontWeight: '700' },
  timelineTime: { fontSize: 12 },
  timelineDesc: { fontSize: 12, marginTop: 2 },

  // Actions
  actionsContainer: { gap: SPACING.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: RADIUS.lg },
  actionBtnPrimary: { backgroundColor: COLORS.primary },
  actionBtnPrimaryText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  actionBtnDanger: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.status.error },
  actionBtnDangerText: { fontSize: 16, fontWeight: '700', color: COLORS.status.error },

  backBtnAlt: { marginTop: SPACING.base, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary },
  backBtnAltText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: SPACING.md },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.base, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.base },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  driverCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  driverAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.backgroundSoft, justifyContent: 'center', alignItems: 'center' },
  driverCardName: { fontSize: 15, fontWeight: '700' },
  driverCardInfo: { fontSize: 12, marginTop: 2 },
});
