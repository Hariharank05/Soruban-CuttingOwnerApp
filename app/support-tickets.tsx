// app/support-tickets.tsx - Customer Support Ticket Management
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useSupport } from '@/context/SupportContext';
import type { SupportTicket, TicketMessage } from '@/types';

type FilterKey = 'all' | 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  open: { label: 'Open', bg: '#E8F5E9', color: '#2E7D32' },
  in_progress: { label: 'In Progress', bg: '#E3F2FD', color: '#1565C0' },
  waiting_customer: { label: 'Waiting', bg: '#FFF3E0', color: '#E65100' },
  resolved: { label: 'Resolved', bg: '#F3E5F5', color: '#7B1FA2' },
  closed: { label: 'Closed', bg: '#F5F5F5', color: '#757575' },
};

const CATEGORY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  order: { label: 'Order', bg: '#E3F2FD', color: '#1565C0' },
  delivery: { label: 'Delivery', bg: '#F3E5F5', color: '#7B1FA2' },
  payment: { label: 'Payment', bg: '#E8F5E9', color: '#2E7D32' },
  subscription: { label: 'Subscription', bg: '#FFF3E0', color: '#E65100' },
  product: { label: 'Product', bg: '#E0F7FA', color: '#00838F' },
  app: { label: 'App', bg: '#FFEBEE', color: '#C62828' },
  other: { label: 'Other', bg: '#F5F5F5', color: '#757575' },
};

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  low: { label: 'Low', bg: '#E3F2FD', color: '#1565C0' },
  medium: { label: 'Medium', bg: '#FFF3E0', color: '#E65100' },
  high: { label: 'High', bg: '#FFEBEE', color: '#C62828' },
  urgent: { label: 'Urgent', bg: '#FFCDD2', color: '#B71C1C' },
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'waiting_customer', label: 'Waiting' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function SupportTicketsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const { tickets, updateTicketStatus, addMessage, assignTicket } = useSupport();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    return { total, open, inProgress, resolved };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (filter === 'all') return tickets;
    return tickets.filter(t => t.status === filter);
  }, [tickets, filter]);

  const handleReply = (ticket: SupportTicket) => {
    Alert.alert('Reply to Ticket', `Send a reply to ${ticket.customerName}:`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Acknowledge', onPress: () => {
        addMessage(ticket.id, 'We have received your query and are looking into it. Thank you for your patience.');
        Alert.alert('Sent', 'Reply sent successfully.');
      }},
      { text: 'Resolved', onPress: () => {
        addMessage(ticket.id, 'Your issue has been resolved. Please let us know if you need further assistance.');
        updateTicketStatus(ticket.id, 'resolved');
        Alert.alert('Sent', 'Reply sent and ticket resolved.');
      }},
    ]);
  };

  const handleStatusUpdate = (ticket: SupportTicket) => {
    Alert.alert('Update Status', `Current: ${STATUS_CONFIG[ticket.status]?.label || ticket.status}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'In Progress', onPress: () => updateTicketStatus(ticket.id, 'in_progress') },
      { text: 'Waiting', onPress: () => updateTicketStatus(ticket.id, 'waiting_customer') },
      { text: 'Resolved', onPress: () => updateTicketStatus(ticket.id, 'resolved') },
      { text: 'Closed', onPress: () => updateTicketStatus(ticket.id, 'closed') },
    ]);
  };

  const handleAssign = (ticket: SupportTicket) => {
    Alert.alert('Assign Ticket', 'Assign this ticket to:', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Self', onPress: () => assignTicket(ticket.id, 'Owner') },
      { text: 'Support Team', onPress: () => assignTicket(ticket.id, 'Support Team') },
    ]);
  };

  const renderMessageBubble = (msg: TicketMessage) => {
    const isCustomer = msg.sender === 'customer';
    const isSystem = msg.sender === 'system';
    return (
      <View
        key={msg.id}
        style={[
          styles.bubble,
          isCustomer && styles.bubbleCustomer,
          !isCustomer && !isSystem && styles.bubbleOwner,
          isSystem && styles.bubbleSystem,
        ]}
      >
        <Text style={[
          styles.bubbleText,
          !isCustomer && !isSystem && { color: '#FFF' },
          isSystem && { fontStyle: 'italic', textAlign: 'center' },
        ]}>
          {msg.message}
        </Text>
        <Text style={[
          styles.bubbleTime,
          !isCustomer && !isSystem && { color: 'rgba(255,255,255,0.7)' },
        ]}>
          {timeAgo(msg.timestamp)}
        </Text>
      </View>
    );
  };

  const renderTicketCard = ({ item }: { item: SupportTicket }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
    const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
    const priCfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.low;
    const isExpanded = expandedId === item.id;
    const lastMsg = item.messages.length > 0 ? item.messages[item.messages.length - 1] : null;

    return (
      <View style={[styles.card, item.priority === 'urgent' && styles.cardUrgent]}>
        <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : item.id)} activeOpacity={0.7}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ticketSubject}>{item.subject}</Text>
              <Text style={styles.ticketCustomer}>{item.customerName} - {item.customerPhone}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.badgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
              </View>
              <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: catCfg.bg }]}>
              <Text style={[styles.badgeText, { color: catCfg.color }]}>{catCfg.label}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: priCfg.bg }]}>
              {item.priority === 'urgent' && <Icon name="alert-circle" size={10} color={priCfg.color} />}
              <Text style={[styles.badgeText, { color: priCfg.color }]}>{priCfg.label}</Text>
            </View>
            {item.orderId && (
              <View style={[styles.badge, { backgroundColor: '#F5F5F5' }]}>
                <Icon name="receipt" size={10} color="#757575" />
                <Text style={[styles.badgeText, { color: '#757575' }]}>{item.orderId}</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="message-text" size={10} color="#1565C0" />
              <Text style={[styles.badgeText, { color: '#1565C0' }]}>{item.messages.length}</Text>
            </View>
          </View>

          {lastMsg && !isExpanded && (
            <Text style={styles.previewText} numberOfLines={2}>
              {lastMsg.sender === 'customer' ? lastMsg.sender : 'You'}: {lastMsg.message}
            </Text>
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.threadSection}>
            <View style={styles.threadDivider} />
            <ScrollView style={styles.threadScroll} nestedScrollEnabled>
              {item.messages.map(renderMessageBubble)}
            </ScrollView>
            <View style={styles.cardActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]} onPress={() => handleReply(item)}>
                <Icon name="reply" size={14} color="#2E7D32" />
                <Text style={[styles.actionBtnText, { color: '#2E7D32' }]}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E3F2FD' }]} onPress={() => handleStatusUpdate(item)}>
                <Icon name="swap-horizontal" size={14} color="#1565C0" />
                <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Status</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3E5F5' }]} onPress={() => handleAssign(item)}>
                <Icon name="account-arrow-right" size={14} color="#7B1FA2" />
                <Text style={[styles.actionBtnText, { color: '#7B1FA2' }]}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="headset" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No tickets found</Text>
      <Text style={styles.emptySub}>Customer support tickets will appear here</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      <LinearGradient colors={['#B8E0CF', '#D6EFE3'] as const} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support Tickets</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="ticket-outline" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="alert-circle-outline" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats.open}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="progress-wrench" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="check-circle" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

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
        data={filteredTickets}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        renderItem={renderTicketCard}
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

  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingTop: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', color: COLORS.text.muted },

  filterRow: { flexDirection: 'row' as const, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: COLORS.backgroundSoft, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.muted },
  filterChipTextActive: { color: COLORS.primary },

  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardUrgent: { borderLeftWidth: 3, borderLeftColor: '#B71C1C' },
  cardHeader: { flexDirection: 'row', marginBottom: SPACING.sm },
  ticketSubject: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary },
  ticketCustomer: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  timeText: { fontSize: 10, color: COLORS.text.muted },

  badgeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText: { fontSize: 10, fontWeight: '800' },

  previewText: { fontSize: 12, color: COLORS.text.secondary, lineHeight: 18, marginTop: SPACING.xs },

  threadSection: { marginTop: SPACING.sm },
  threadDivider: { height: 1, backgroundColor: COLORS.divider, marginBottom: SPACING.sm },
  threadScroll: { maxHeight: 240 },

  bubble: { maxWidth: '80%', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  bubbleCustomer: { alignSelf: 'flex-start', backgroundColor: '#F5F5F5' },
  bubbleOwner: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  bubbleSystem: { alignSelf: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: COLORS.divider },
  bubbleText: { fontSize: 13, color: COLORS.text.primary, lineHeight: 19 },
  bubbleTime: { fontSize: 10, color: COLORS.text.muted, marginTop: 4, textAlign: 'right' },

  cardActions: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm, marginTop: SPACING.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  empty: { alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
