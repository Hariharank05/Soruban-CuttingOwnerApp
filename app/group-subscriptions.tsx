import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView,
  StatusBar, Alert, Modal,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';

interface GroupMember {
  id: string;
  name: string;
  phone: string;
  plan: string;
  status: 'subscribed' | 'joined' | 'invited' | 'left';
  share: number;
}

interface Group {
  id: string;
  name: string;
  type: 'hostel' | 'pg' | 'apartment' | 'office';
  adminName: string;
  adminPhone: string;
  address: string;
  members: GroupMember[];
  plan: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  totalCost: number;
  status: 'active' | 'pending' | 'paused' | 'cancelled';
  createdDate: string;
  deliverySlot: string;
  discount: number;
}

const DEMO_GROUPS: Group[] = [
  {
    id: 'G1', name: 'Anna Nagar Girls Hostel', type: 'hostel',
    adminName: 'Priya Sharma', adminPhone: '9876543210',
    address: '42, Anna Nagar Main Road, Coimbatore',
    members: [
      { id: 'M1', name: 'Priya Sharma', phone: '9876543210', plan: 'Budget Hostel Pack', status: 'subscribed', share: 75 },
      { id: 'M2', name: 'Kavitha R', phone: '9876543211', plan: 'Glow & Beauty Pack', status: 'subscribed', share: 110 },
      { id: 'M3', name: 'Meena K', phone: '9876543212', plan: 'Budget Hostel Pack', status: 'subscribed', share: 75 },
      { id: 'M4', name: 'Deepa S', phone: '9876543213', plan: 'Student Snack Pack', status: 'joined', share: 90 },
      { id: 'M5', name: 'Lakshmi P', phone: '9876543214', plan: 'Budget Hostel Pack', status: 'subscribed', share: 75 },
      { id: 'M6', name: 'Anitha R', phone: '9876543215', plan: 'Period Care Plan', status: 'invited', share: 100 },
    ],
    plan: 'Mixed Plans', frequency: 'daily', totalCost: 425, status: 'active',
    createdDate: '2026-02-15', deliverySlot: '7:00 - 8:00 AM', discount: 10,
  },
  {
    id: 'G2', name: 'RS Puram Boys PG', type: 'pg',
    adminName: 'Ravi Kumar', adminPhone: '9876543220',
    address: '15, RS Puram, Coimbatore',
    members: [
      { id: 'M7', name: 'Ravi Kumar', phone: '9876543220', plan: 'Protein Power Plan', status: 'subscribed', share: 150 },
      { id: 'M8', name: 'Arun P', phone: '9876543221', plan: 'Protein Power Plan', status: 'subscribed', share: 150 },
      { id: 'M9', name: 'Karthik S', phone: '9876543222', plan: 'Budget Hostel Pack', status: 'subscribed', share: 75 },
      { id: 'M10', name: 'Vijay M', phone: '9876543223', plan: 'High Energy Pack', status: 'joined', share: 130 },
    ],
    plan: 'Mixed Plans', frequency: 'daily', totalCost: 505, status: 'active',
    createdDate: '2026-03-01', deliverySlot: '6:00 - 7:00 AM', discount: 0,
  },
  {
    id: 'G3', name: 'Saibaba Colony Apartment', type: 'apartment',
    adminName: 'Lakshmi S', adminPhone: '9876543230',
    address: '8, Saibaba Colony, Coimbatore',
    members: [
      { id: 'M11', name: 'Lakshmi S', phone: '9876543230', plan: 'Family Veggie Pack', status: 'subscribed', share: 200 },
      { id: 'M12', name: 'Radha K', phone: '9876543231', plan: 'Family Veggie Pack', status: 'subscribed', share: 200 },
      { id: 'M13', name: 'Sarala M', phone: '9876543232', plan: 'Diabetic Friendly Plan', status: 'subscribed', share: 120 },
    ],
    plan: 'Mixed Plans', frequency: 'daily', totalCost: 520, status: 'paused',
    createdDate: '2026-01-20', deliverySlot: '8:00 - 9:00 AM', discount: 0,
  },
];

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  hostel: { color: '#7B1FA2', bg: '#F3E5F5', icon: 'home-group' },
  pg: { color: '#1565C0', bg: '#E3F2FD', icon: 'home-city' },
  apartment: { color: '#E65100', bg: '#FFF3E0', icon: 'office-building' },
  office: { color: '#388E3C', bg: '#E8F5E9', icon: 'domain' },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  active: { color: '#388E3C', bg: '#E8F5E9' },
  pending: { color: '#1565C0', bg: '#E3F2FD' },
  paused: { color: '#E65100', bg: '#FFF3E0' },
  cancelled: { color: '#C62828', bg: '#FFEBEE' },
  subscribed: { color: '#388E3C', bg: '#E8F5E9' },
  joined: { color: '#1565C0', bg: '#E3F2FD' },
  invited: { color: '#E65100', bg: '#FFF3E0' },
  left: { color: '#616161', bg: '#F5F5F5' },
};

export default function GroupSubscriptionsScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [groups] = useState(DEMO_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const stats = useMemo(() => ({
    totalGroups: groups.length,
    activeGroups: groups.filter(g => g.status === 'active').length,
    totalMembers: groups.reduce((sum, g) => sum + g.members.length, 0),
    subscribedMembers: groups.reduce((sum, g) => sum + g.members.filter(m => m.status === 'subscribed').length, 0),
    dailyRevenue: groups.filter(g => g.status === 'active').reduce((sum, g) => sum + g.totalCost, 0),
    monthlyRevenue: groups.filter(g => g.status === 'active').reduce((sum, g) => sum + g.totalCost * 30, 0),
  }), [groups]);

  const renderGroup = ({ item }: { item: Group }) => {
    const tc = TYPE_CONFIG[item.type];
    const sc = STATUS_CONFIG[item.status];
    const subscribedCount = item.members.filter(m => m.status === 'subscribed').length;
    return (
      <TouchableOpacity
        style={[styles.groupCard, themed.card]}
        activeOpacity={0.7}
        onPress={() => setSelectedGroup(item)}
      >
        <View style={styles.groupHeader}>
          <View style={[styles.typeIcon, { backgroundColor: tc.bg }]}>
            <Icon name={tc.icon as any} size={24} color={tc.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.cardRow}>
              <Text style={[styles.groupName, themed.textPrimary]}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.statusText, { color: sc.color }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.groupType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)} · Admin: {item.adminName}</Text>
          </View>
        </View>

        <View style={styles.groupStats}>
          <View style={styles.groupStat}>
            <Icon name="account-group" size={14} color={COLORS.text.muted} />
            <Text style={styles.groupStatText}>{subscribedCount}/{item.members.length} members</Text>
          </View>
          <View style={styles.groupStat}>
            <Icon name="currency-inr" size={14} color={COLORS.primary} />
            <Text style={[styles.groupStatText, { color: COLORS.primary, fontWeight: '700' }]}>{item.totalCost}/day</Text>
          </View>
          <View style={styles.groupStat}>
            <Icon name="clock-outline" size={14} color={COLORS.text.muted} />
            <Text style={styles.groupStatText}>{item.deliverySlot}</Text>
          </View>
        </View>

        {item.discount > 0 && (
          <View style={styles.discountBanner}>
            <Icon name="sale" size={14} color="#E65100" />
            <Text style={styles.discountText}>{item.discount}% group discount applied</Text>
          </View>
        )}

        <View style={styles.groupAddress}>
          <Icon name="map-marker" size={14} color={COLORS.text.muted} />
          <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
        </View>

        <View style={styles.memberAvatars}>
          {item.members.slice(0, 5).map((m, i) => (
            <View key={m.id} style={[styles.memberAvatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }]}>
              <Text style={styles.avatarText}>{m.name.charAt(0)}</Text>
            </View>
          ))}
          {item.members.length > 5 && (
            <View style={[styles.memberAvatar, { marginLeft: -8, backgroundColor: COLORS.primary }]}>
              <Text style={[styles.avatarText, { color: '#FFF' }]}>+{item.members.length - 5}</Text>
            </View>
          )}
          <Icon name="chevron-right" size={18} color={COLORS.text.muted} style={{ marginLeft: 'auto' }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      {/* Header */}
      <LinearGradient colors={['#7B1FA2', '#9C27B0']} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Group Subscriptions</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContainer}>
          <View style={styles.statChip}>
            <Icon name="account-group" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.totalGroups}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="check-circle" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.activeGroups}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="account-multiple" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.subscribedMembers}/{stats.totalMembers}</Text>
            <Text style={styles.statLabel}>Subscribed</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="currency-inr" size={16} color="#FFF" />
            <Text style={styles.statValue}>{'\u20B9'}{stats.dailyRevenue}</Text>
            <Text style={styles.statLabel}>Daily Rev</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="chart-line" size={16} color="#FFF" />
            <Text style={styles.statValue}>{(stats.monthlyRevenue / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Monthly Rev</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Groups List */}
      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Group Detail Modal */}
      <Modal visible={!!selectedGroup} animationType="slide" presentationStyle="pageSheet">
        {selectedGroup && (
          <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top']}>
            <View style={[styles.modalHeader, { backgroundColor: themed.colors.card }]}>
              <TouchableOpacity onPress={() => setSelectedGroup(null)}>
                <Icon name="close" size={24} color={themed.colors.text.primary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, themed.textPrimary]}>{selectedGroup.name}</Text>
              <TouchableOpacity onPress={() => Alert.alert('Pause Group', 'Pause all deliveries for this group?', [{ text: 'Cancel' }, { text: 'Pause', onPress: () => setSelectedGroup(null) }])}>
                <Icon name="pause-circle" size={24} color="#E65100" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.listContent}>
              {/* Group Info */}
              <View style={[styles.infoCard, themed.card]}>
                <Text style={[styles.infoTitle, themed.textPrimary]}>Group Details</Text>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Type</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedGroup.type}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Admin</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedGroup.adminName} ({selectedGroup.adminPhone})</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Address</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedGroup.address}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Delivery Slot</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedGroup.deliverySlot}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Total Cost</Text><Text style={[styles.infoValue, { color: COLORS.primary, fontWeight: '800' }]}>{'\u20B9'}{selectedGroup.totalCost}/day</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Created</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedGroup.createdDate}</Text></View>
                {selectedGroup.discount > 0 && (
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Group Discount</Text><Text style={[styles.infoValue, { color: '#E65100', fontWeight: '700' }]}>{selectedGroup.discount}%</Text></View>
                )}
              </View>

              {/* Members */}
              <Text style={[styles.sectionTitle, themed.textPrimary]}>Members ({selectedGroup.members.length})</Text>
              {selectedGroup.members.map(member => {
                const ms = STATUS_CONFIG[member.status];
                return (
                  <View key={member.id} style={[styles.memberCard, themed.card]}>
                    <View style={styles.memberAvatarLg}>
                      <Text style={styles.memberAvatarLgText}>{member.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.cardRow}>
                        <Text style={[styles.memberName, themed.textPrimary]}>{member.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: ms.bg }]}>
                          <Text style={[styles.statusText, { color: ms.color }]}>{member.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.memberPhone}>{member.phone}</Text>
                      <View style={styles.cardRow}>
                        <Text style={styles.memberPlan}>{member.plan}</Text>
                        <Text style={[styles.memberShare, { color: COLORS.primary }]}>{'\u20B9'}{member.share}/day</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingBottom: SPACING.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingTop: SPACING.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  statsScroll: { marginTop: SPACING.md },
  statsContainer: { paddingHorizontal: SPACING.base, gap: SPACING.sm },
  statChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignItems: 'center', minWidth: 80 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#FFF', marginTop: 2 },
  statLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  listContent: { padding: SPACING.base, paddingBottom: 40 },
  groupCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  groupHeader: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
  typeIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  groupName: { fontSize: 15, fontWeight: '800', flex: 1, marginRight: 8 },
  groupType: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  statusText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  groupStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, flexWrap: 'wrap', gap: 4 },
  groupStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  groupStatText: { fontSize: 11, color: COLORS.text.secondary },
  discountBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF3E0', borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 4, marginTop: SPACING.sm },
  discountText: { fontSize: 11, fontWeight: '600', color: '#E65100' },
  groupAddress: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  addressText: { fontSize: 11, color: COLORS.text.muted, flex: 1 },
  memberAvatars: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
  memberAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  avatarText: { fontSize: 11, fontWeight: '700', color: '#1565C0' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  infoCard: { borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOW.sm },
  infoTitle: { fontSize: 15, fontWeight: '800', marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 12, color: COLORS.text.muted },
  infoValue: { fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  memberAvatarLg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  memberAvatarLgText: { fontSize: 16, fontWeight: '700', color: '#1565C0' },
  memberName: { fontSize: 13, fontWeight: '700' },
  memberPhone: { fontSize: 11, color: COLORS.text.muted, marginTop: 1 },
  memberPlan: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2 },
  memberShare: { fontSize: 12, fontWeight: '700' },
});
