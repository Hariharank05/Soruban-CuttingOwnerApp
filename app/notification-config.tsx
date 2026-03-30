// app/notification-config.tsx - Push Notification Configuration
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, Switch,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';
import { useNotificationConfig } from '@/context/NotificationContext';
import type { NotificationTemplate, NotificationCampaign } from '@/types';

type TabKey = 'templates' | 'campaigns';

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  promotional: { bg: '#F3E5F5', color: '#7B1FA2' },
  order_update: { bg: '#E3F2FD', color: '#1565C0' },
  subscription_reminder: { bg: '#FFF3E0', color: '#E65100' },
  loyalty: { bg: '#FFF8E1', color: '#F57F17' },
  offer: { bg: '#E8F5E9', color: '#2E7D32' },
};

const CAMPAIGN_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  draft: { label: 'Draft', bg: '#F5F5F5', color: '#757575' },
  scheduled: { label: 'Scheduled', bg: '#E3F2FD', color: '#1565C0' },
  sent: { label: 'Sent', bg: '#E8F5E9', color: '#2E7D32' },
  cancelled: { label: 'Cancelled', bg: '#FFEBEE', color: '#C62828' },
};

const AUDIENCE_COLORS: Record<string, { bg: string; color: string }> = {
  all: { bg: '#E3F2FD', color: '#1565C0' },
  subscribers: { bg: '#E8F5E9', color: '#2E7D32' },
  inactive: { bg: '#FFF3E0', color: '#E65100' },
  loyal: { bg: '#F3E5F5', color: '#7B1FA2' },
  new: { bg: '#E0F7FA', color: '#00838F' },
};

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTypeName(type: string): string {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function NotificationConfigScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const {
    templates, campaigns, toggleTemplate, deleteTemplate,
    addTemplate, addCampaign, updateCampaignStatus,
  } = useNotificationConfig();
  const [activeTab, setActiveTab] = useState<TabKey>('templates');

  const stats = useMemo(() => {
    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => t.isActive).length;
    const totalCampaigns = campaigns.length;
    const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
    return { totalTemplates, activeTemplates, totalCampaigns, sentCampaigns };
  }, [templates, campaigns]);

  const handleAddTemplate = () => {
    const newTemplate: NotificationTemplate = {
      id: `nt_${Date.now()}`,
      type: 'promotional',
      title: 'New Promotion',
      body: 'Check out our latest offers!',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    addTemplate(newTemplate);
    Alert.alert('Success', 'New template created.');
  };

  const handleDeleteTemplate = (t: NotificationTemplate) => {
    Alert.alert('Delete Template', `Delete "${t.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTemplate(t.id) },
    ]);
  };

  const handleAddCampaign = () => {
    const newCampaign: NotificationCampaign = {
      id: `nc_${Date.now()}`,
      title: 'New Campaign',
      body: 'Exciting news for our customers!',
      type: 'promotional',
      targetAudience: 'all',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    addCampaign(newCampaign);
    Alert.alert('Success', 'Draft campaign created.');
  };

  const handleCampaignAction = (c: NotificationCampaign) => {
    const actions: any[] = [{ text: 'Cancel', style: 'cancel' }];
    if (c.status === 'draft') {
      actions.push({ text: 'Schedule', onPress: () => updateCampaignStatus(c.id, 'scheduled') });
      actions.push({ text: 'Cancel Campaign', style: 'destructive', onPress: () => updateCampaignStatus(c.id, 'cancelled') });
    }
    if (c.status === 'scheduled') {
      actions.push({ text: 'Send Now', onPress: () => updateCampaignStatus(c.id, 'sent') });
      actions.push({ text: 'Cancel Campaign', style: 'destructive', onPress: () => updateCampaignStatus(c.id, 'cancelled') });
    }
    Alert.alert('Campaign Actions', `"${c.title}" is currently ${c.status}`, actions);
  };

  const renderTemplateCard = ({ item }: { item: NotificationTemplate }) => {
    const typeCfg = TYPE_COLORS[item.type] || TYPE_COLORS.promotional;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: typeCfg.bg }]}>
            <Text style={[styles.typeBadgeText, { color: typeCfg.color }]}>{formatTypeName(item.type)}</Text>
          </View>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleTemplate(item.id)}
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
            thumbColor={item.isActive ? COLORS.primary : '#BDBDBD'}
          />
        </View>
        <Text style={styles.templateTitle}>{item.title}</Text>
        <Text style={styles.templateBody} numberOfLines={2}>{item.body}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]} onPress={() => handleDeleteTemplate(item)}>
            <Icon name="delete-outline" size={14} color="#C62828" />
            <Text style={[styles.actionBtnText, { color: '#C62828' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCampaignCard = ({ item }: { item: NotificationCampaign }) => {
    const typeCfg = TYPE_COLORS[item.type] || TYPE_COLORS.promotional;
    const statusCfg = CAMPAIGN_STATUS[item.status] || CAMPAIGN_STATUS.draft;
    const audienceCfg = AUDIENCE_COLORS[item.targetAudience] || AUDIENCE_COLORS.all;
    const openRate = item.sentCount && item.openCount
      ? Math.round((item.openCount / item.sentCount) * 100)
      : null;

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleCampaignAction(item)}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.templateTitle}>{item.title}</Text>
            <Text style={styles.templateBody} numberOfLines={1}>{item.body}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.typeBadge, { backgroundColor: typeCfg.bg }]}>
            <Text style={[styles.typeBadgeText, { color: typeCfg.color }]}>{formatTypeName(item.type)}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: audienceCfg.bg }]}>
            <Text style={[styles.typeBadgeText, { color: audienceCfg.color }]}>
              {item.targetAudience.charAt(0).toUpperCase() + item.targetAudience.slice(1)}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Icon name="calendar-clock" size={12} color={COLORS.text.muted} />
            <Text style={styles.dateText}>{formatDate(item.scheduledAt)}</Text>
          </View>
        </View>

        {item.status === 'sent' && (
          <View style={styles.sentStats}>
            <View style={styles.sentStatItem}>
              <Text style={styles.sentStatLabel}>Sent</Text>
              <Text style={styles.sentStatValue}>{item.sentCount || 0}</Text>
            </View>
            <View style={styles.sentStatItem}>
              <Text style={styles.sentStatLabel}>Opened</Text>
              <Text style={styles.sentStatValue}>{item.openCount || 0}</Text>
            </View>
            {openRate !== null && (
              <View style={styles.sentStatItem}>
                <Text style={styles.sentStatLabel}>Open Rate</Text>
                <Text style={[styles.sentStatValue, { color: COLORS.primary }]}>{openRate}%</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.empty}>
      <Icon name={activeTab === 'templates' ? 'bell-outline' : 'bullhorn-outline'} size={64} color={COLORS.text.muted} />
      <Text style={styles.emptyTitle}>No {activeTab} yet</Text>
      <Text style={styles.emptySub}>
        {activeTab === 'templates' ? 'Create notification templates to send to your customers' : 'Create campaigns to reach your customers'}
      </Text>
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="file-document-outline" size={18} color="#1565C0" />
          <Text style={[styles.statValue, { color: '#1565C0' }]}>{stats.totalTemplates}</Text>
          <Text style={styles.statLabel}>Templates</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="check-circle" size={18} color="#2E7D32" />
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{stats.activeTemplates}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="bullhorn" size={18} color="#E65100" />
          <Text style={[styles.statValue, { color: '#E65100' }]}>{stats.totalCampaigns}</Text>
          <Text style={styles.statLabel}>Campaigns</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Icon name="send-check" size={18} color="#7B1FA2" />
          <Text style={[styles.statValue, { color: '#7B1FA2' }]}>{stats.sentCampaigns}</Text>
          <Text style={styles.statLabel}>Sent</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['templates', 'campaigns'] as TabKey[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activeTab === 'templates' ? templates : campaigns}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        renderItem={activeTab === 'templates'
          ? (props) => renderTemplateCard(props as { item: NotificationTemplate })
          : (props) => renderCampaignCard(props as { item: NotificationCampaign })
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={activeTab === 'templates' ? handleAddTemplate : handleAddCampaign}
      >
        <LinearGradient colors={COLORS.gradient.primary} style={styles.fabGradient}>
          <Icon name="plus" size={26} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
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

  tabRow: { flexDirection: 'row', marginHorizontal: SPACING.base, marginTop: SPACING.md, backgroundColor: '#F5F5F5', borderRadius: RADIUS.lg, padding: 3 },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.md },
  tabActive: { backgroundColor: '#FFF', ...SHADOW.sm },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.text.muted },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },

  listContent: { padding: SPACING.base, paddingBottom: 100 },

  card: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  typeBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  typeBadgeText: { fontSize: 10, fontWeight: '800' },
  templateTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  templateBody: { fontSize: 12, color: COLORS.text.secondary, lineHeight: 18, marginTop: 4 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm, flexWrap: 'wrap' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dateText: { fontSize: 11, color: COLORS.text.muted },

  sentStats: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  sentStatItem: { alignItems: 'center' },
  sentStatLabel: { fontSize: 10, color: COLORS.text.muted, fontWeight: '600' },
  sentStatValue: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },

  cardActions: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm, marginTop: SPACING.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  fab: { position: 'absolute', bottom: SPACING.xl, right: SPACING.base, ...SHADOW.lg },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary, marginTop: SPACING.base, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
});
