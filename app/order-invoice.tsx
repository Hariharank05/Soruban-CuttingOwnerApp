// app/order-invoice.tsx - Order Invoice View Screen
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
import type { Order } from '@/types';

const PAYMENT_CONFIG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  cod: { label: 'Cash on Delivery', bg: '#FFF3E0', color: '#E65100', icon: 'cash' },
  upi: { label: 'UPI', bg: '#E3F2FD', color: '#1565C0', icon: 'cellphone' },
  wallet: { label: 'Wallet', bg: '#F3E5F5', color: '#7B1FA2', icon: 'wallet' },
  wallet_partial: { label: 'Wallet + Online', bg: '#F3E5F5', color: '#7B1FA2', icon: 'wallet-outline' },
  online: { label: 'Online', bg: '#E3F2FD', color: '#1565C0', icon: 'credit-card' },
};

interface InvoiceItem {
  name: string;
  qty: number;
  cutType: string;
  pricePerUnit: number;
  total: number;
}

const DEMO_ORDER = {
  id: 'ORD-1042',
  customerName: 'Priya Sharma',
  customerPhone: '9876543210',
  deliveryAddress: '42, Anna Nagar 3rd Street, Chennai - 600040',
  createdAt: '2026-03-20T14:30:00Z',
  items: [
    { name: 'Chicken Breast (Boneless)', qty: 2, cutType: 'Small Pieces', pricePerUnit: 280, total: 560 },
    { name: 'Mutton Leg Pieces', qty: 1, cutType: 'Cubes', pricePerUnit: 750, total: 750 },
    { name: 'Prawns Large (Cleaned)', qty: 1, cutType: 'Whole', pricePerUnit: 620, total: 620 },
  ] as InvoiceItem[],
  subtotal: 1930,
  cuttingCharges: 40,
  deliveryFee: 30,
  discount: 100,
  couponCode: 'FRESH50',
  couponDiscount: 50,
  grandTotal: 1850,
  paymentMethod: 'upi',
  status: 'delivered',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function OrderInvoiceScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { id } = useLocalSearchParams<{ id: string }>();

  const order = DEMO_ORDER;
  const invoiceNumber = `INV-${order.id}`;
  const paymentConfig = PAYMENT_CONFIG[order.paymentMethod] || PAYMENT_CONFIG.cod;

  const handleShare = () => {
    Alert.alert(
      'Share Invoice',
      `Share invoice ${invoiceNumber} via:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'WhatsApp', onPress: () => Alert.alert('Shared', `Invoice sent via WhatsApp to ${order.customerPhone}`) },
        { text: 'Email', onPress: () => Alert.alert('Shared', 'Invoice sent via email') },
        { text: 'Download PDF', onPress: () => Alert.alert('Downloaded', 'Invoice PDF saved to downloads') },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="file-document-outline" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>Invoice not found</Text>
      <Text style={styles.emptySub}>
        The order invoice could not be loaded. Please try again later.
      </Text>
    </View>
  );

  if (!order) return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {renderEmptyState()}
    </SafeAreaView>
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
            <Text style={styles.headerTitle}>Invoice</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Icon name="share-variant" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Invoice Card */}
        <View style={styles.invoiceCard}>
          {/* Invoice Header */}
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={styles.invoiceLabel}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            </View>
            <View style={styles.invoiceDateWrap}>
              <Text style={styles.invoiceDateLabel}>Date</Text>
              <Text style={styles.invoiceDate}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Customer Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <View style={styles.customerDetail}>
              <Icon name="account" size={16} color={COLORS.text.secondary} />
              <Text style={styles.customerDetailText}>{order.customerName}</Text>
            </View>
            <View style={styles.customerDetail}>
              <Icon name="phone" size={16} color={COLORS.text.secondary} />
              <Text style={styles.customerDetailText}>{order.customerPhone}</Text>
            </View>
            <View style={styles.customerDetail}>
              <Icon name="map-marker" size={16} color={COLORS.text.secondary} />
              <Text style={styles.customerDetailText}>{order.deliveryAddress}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Items Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.5, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Cut</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'right' }]}>Price</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'right' }]}>Total</Text>
            </View>

            {order.items.map((item, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'center' }]}>{item.qty}</Text>
                <Text style={[styles.tableCellSmall, { flex: 1, textAlign: 'center' }]}>{item.cutType}</Text>
                <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right' }]}>{formatCurrency(item.pricePerUnit)}</Text>
                <Text style={[styles.tableCellBold, { flex: 0.8, textAlign: 'right' }]}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Summary */}
          <View style={styles.section}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cutting Charges</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.cuttingCharges)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.deliveryFee)}</Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#2E7D32' }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>-{formatCurrency(order.discount)}</Text>
              </View>
            )}
            {order.couponCode && (
              <View style={styles.summaryRow}>
                <View style={styles.couponRow}>
                  <Text style={[styles.summaryLabel, { color: '#7B1FA2' }]}>Coupon</Text>
                  <View style={styles.couponBadge}>
                    <Text style={styles.couponBadgeText}>{order.couponCode}</Text>
                  </View>
                </View>
                <Text style={[styles.summaryValue, { color: '#7B1FA2' }]}>-{formatCurrency(order.couponDiscount)}</Text>
              </View>
            )}

            <View style={[styles.divider, { marginVertical: SPACING.sm }]} />

            <View style={styles.summaryRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(order.grandTotal)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={[styles.paymentBadge, { backgroundColor: paymentConfig.bg }]}>
              <Icon name={paymentConfig.icon as any} size={18} color={paymentConfig.color} />
              <Text style={[styles.paymentBadgeText, { color: paymentConfig.color }]}>{paymentConfig.label}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.invoiceFooter}>
            <Icon name="store" size={20} color={COLORS.primary} />
            <Text style={styles.shopName}>Chopify</Text>
            <Text style={styles.thankYou}>Thank you for your order!</Text>
          </View>
        </View>
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
  shareBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },

  scrollContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  invoiceCard: { backgroundColor: '#FFF', borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOW.md },

  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  invoiceLabel: { fontSize: 24, fontWeight: '800', color: COLORS.primary, letterSpacing: 2 },
  invoiceNumber: { fontSize: 13, color: COLORS.text.muted, marginTop: 4, fontWeight: '600' },
  invoiceDateWrap: { alignItems: 'flex-end' },
  invoiceDateLabel: { fontSize: 11, color: COLORS.text.muted, fontWeight: '600' },
  invoiceDate: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary, marginTop: 2 },

  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.md },

  section: { marginBottom: SPACING.xs },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: COLORS.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },

  customerDetail: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  customerDetailText: { fontSize: 14, color: COLORS.text.secondary, flex: 1, lineHeight: 20 },

  tableHeader: { flexDirection: 'row', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  tableHeaderText: { fontSize: 10, fontWeight: '800', color: COLORS.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: SPACING.sm, alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#FAFBFC' },
  tableCell: { fontSize: 12, color: COLORS.text.secondary },
  tableCellSmall: { fontSize: 10, color: COLORS.text.muted },
  tableCellBold: { fontSize: 12, fontWeight: '700', color: COLORS.text.primary },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  summaryLabel: { fontSize: 13, color: COLORS.text.secondary },
  summaryValue: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  couponBadge: { backgroundColor: '#F3E5F5', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  couponBadgeText: { fontSize: 10, fontWeight: '800', color: '#7B1FA2' },
  grandTotalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary },
  grandTotalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },

  paymentBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  paymentBadgeText: { fontSize: 13, fontWeight: '700' },

  invoiceFooter: { alignItems: 'center', paddingTop: SPACING.md, gap: SPACING.xs },
  shopName: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  thankYou: { fontSize: 13, color: COLORS.text.muted, fontStyle: 'italic' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
