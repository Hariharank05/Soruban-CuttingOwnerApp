// app/issues-manage.tsx - Order Issue Management Screen
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useIssues } from '@/context/IssueContext';
import type { OrderIssue } from '@/types';

type FilterKey = 'all' | 'open' | 'investigating' | 'resolved' | 'closed';
type IssueType = 'wrong_item' | 'quality' | 'missing_item' | 'damaged' | 'late_delivery' | 'wrong_cut' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type IssueStatus = 'open' | 'investigating' | 'resolved' | 'closed';

const PRIORITY_CONFIG: Record<Priority, { label: string; bg: string; color: string }> = {
  low: { label: 'Low', bg: '#E3F2FD', color: '#1565C0' },
  medium: { label: 'Medium', bg: '#FFF3E0', color: '#E65100' },
  high: { label: 'High', bg: '#FFEBEE', color: '#C62828' },
  urgent: { label: 'Urgent', bg: '#FFCDD2', color: '#B71C1C' },
};

const STATUS_CONFIG: Record<IssueStatus, { label: string; bg: string; color: string }> = {
  open: { label: 'Open', bg: '#FFF3E0', color: '#E65100' },
  investigating: { label: 'Investigating', bg: '#E3F2FD', color: '#1565C0' },
  resolved: { label: 'Resolved', bg: '#E8F5E9', color: '#2E7D32' },
  closed: { label: 'Closed', bg: '#F5F5F5', color: '#757575' },
};

const TYPE_ICON_MAP: Record<IssueType, string> = {
  wrong_item: 'swap-horizontal-circle',
  quality: 'alert-circle',
  missing_item: 'package-variant-minus',
  damaged: 'package-down',
  late_delivery: 'clock-alert',
  wrong_cut: 'content-cut',
  other: 'help-circle',
};

const TYPE_LABEL_MAP: Record<IssueType, string> = {
  wrong_item: 'Wrong Item',
  quality: 'Quality Issue',
  missing_item: 'Missing Item',
  damaged: 'Damaged',
  late_delivery: 'Late Delivery',
  wrong_cut: 'Wrong Cut',
  other: 'Other',
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];


function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function IssuesManageScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [filter, setFilter] = useState<FilterKey>('all');
  const { issues, assignIssue, resolveIssue, updateIssueStatus } = useIssues();

  const stats = useMemo(() => ({
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    investigating: issues.filter(i => i.status === 'investigating').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  }), [issues]);

  const filteredIssues = useMemo(() => {
    if (filter === 'all') return issues;
    return issues.filter(i => i.status === filter);
  }, [issues, filter]);

  const handleAssign = (issue: OrderIssue) => {
    Alert.alert(
      'Assign Issue',
      `Assign "${issue.title}" to a team member:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Ganesh (QA)', onPress: () => assignIssue(issue.id, 'Ganesh (QA)') },
        { text: 'Suresh (Ops)', onPress: () => assignIssue(issue.id, 'Suresh (Ops)') },
      ]
    );
  };

  const handleResolve = (issue: OrderIssue) => {
    Alert.alert(
      'Resolve Issue',
      `Mark "${issue.title}" as resolved?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Resolve with Refund', onPress: () => resolveIssue(issue.id, 'Refund issued to customer wallet.', 100) },
        { text: 'Resolve with Replacement', onPress: () => resolveIssue(issue.id, 'Replacement order dispatched.') },
      ]
    );
  };

  const handleUpdateStatus = (issue: OrderIssue) => {
    Alert.alert(
      'Update Status',
      `Current: ${STATUS_CONFIG[issue.status as IssueStatus]?.label}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => updateIssueStatus(issue.id, 'open') },
        { text: 'Investigating', onPress: () => updateIssueStatus(issue.id, 'investigating') },
        { text: 'Close', onPress: () => updateIssueStatus(issue.id, 'closed') },
      ]
    );
  };

  const renderStatCards = () => (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
        <Icon name="alert-circle-outline" size={18} color="#1565C0" />
        <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
        <Icon name="alert-outline" size={18} color="#E65100" />
        <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.open}</Text>
        <Text style={styles.statLabel}>Open</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
        <Icon name="magnify" size={18} color="#1565C0" />
        <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.investigating}</Text>
        <Text style={styles.statLabel}>Investigating</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
        <Icon name="check-circle" size={18} color="#2E7D32" />
        <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats.resolved}</Text>
        <Text style={styles.statLabel}>Resolved</Text>
      </View>
    </View>
  );

  const renderIssueCard = ({ item }: { item: OrderIssue }) => {
    const priorityConfig = PRIORITY_CONFIG[item.priority as Priority] || PRIORITY_CONFIG.medium;
    const statusConfig = STATUS_CONFIG[item.status as IssueStatus] || STATUS_CONFIG.open;
    const typeIcon = TYPE_ICON_MAP[item.type as IssueType] || 'help-circle';
    const typeLabel = TYPE_LABEL_MAP[item.type as IssueType] || 'Other';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeIconWrap, { backgroundColor: priorityConfig.bg }]}>
            <Icon name={typeIcon as any} size={20} color={priorityConfig.color} />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.issueTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.orderId}>Order #{item.orderId}</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: '#F3E5F5' }]}>
            <Text style={[styles.badgeText, { color: '#7B1FA2' }]}>{typeLabel}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: priorityConfig.bg }]}>
            <Text style={[styles.badgeText, { color: priorityConfig.color }]}>{priorityConfig.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.badgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>

        <View style={styles.customerRow}>
          <Icon name="account-outline" size={14} color={COLORS.text.muted} />
          <Text style={styles.customerText}>{item.customerName}</Text>
          <Icon name="phone-outline" size={13} color={COLORS.text.muted} style={{ marginLeft: SPACING.sm }} />
          <Text style={styles.customerText}>{item.customerPhone}</Text>
        </View>

        <View style={styles.metaRow}>
          {item.assignedTo ? (
            <View style={styles.assignedRow}>
              <Icon name="account-check" size={14} color={COLORS.primary} />
              <Text style={styles.assignedText}>{item.assignedTo}</Text>
            </View>
          ) : (
            <View style={styles.assignedRow}>
              <Icon name="account-question" size={14} color={COLORS.text.muted} />
              <Text style={[styles.assignedText, { color: COLORS.text.muted }]}>Unassigned</Text>
            </View>
          )}
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        {item.resolution && (
          <View style={styles.resolutionBox}>
            <Icon name="check-decagram" size={14} color="#2E7D32" />
            <Text style={styles.resolutionText}>{item.resolution}</Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E3F2FD' }]} onPress={() => handleAssign(item)}>
            <Icon name="account-plus" size={14} color="#1565C0" />
            <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Assign</Text>
          </TouchableOpacity>
          {item.status !== 'resolved' && item.status !== 'closed' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]} onPress={() => handleResolve(item)}>
              <Icon name="check-circle" size={14} color="#2E7D32" />
              <Text style={[styles.actionBtnText, { color: '#2E7D32' }]}>Resolve</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF3E0' }]} onPress={() => handleUpdateStatus(item)}>
            <Icon name="swap-horizontal" size={14} color="#E65100" />
            <Text style={[styles.actionBtnText, { color: '#E65100' }]}>Status</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name="check-circle-outline" size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No issues found</Text>
      <Text style={styles.emptySub}>
        Order issues and complaints will appear here when customers report them
      </Text>
    </View>
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
            <Text style={styles.headerTitle}>Issue Management</Text>
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
        data={filteredIssues}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        renderItem={renderIssueCard}
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  typeIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  cardHeaderInfo: { flex: 1 },
  issueTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  orderId: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText: { fontSize: 10, fontWeight: '800' },

  descText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20, marginBottom: SPACING.sm },

  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.sm },
  customerText: { fontSize: 12, color: COLORS.text.muted },

  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  assignedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  assignedText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  dateText: { fontSize: 11, color: COLORS.text.muted },

  resolutionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.xs, backgroundColor: '#E8F5E9', borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm },
  resolutionText: { fontSize: 12, color: '#2E7D32', flex: 1, lineHeight: 18 },

  cardActions: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
