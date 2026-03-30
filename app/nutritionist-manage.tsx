import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView,
  StatusBar, Modal, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/src/utils/theme';
import { useThemedStyles } from '@/src/utils/useThemedStyles';

type TabKey = 'consultations' | 'meal_plans' | 'reports' | 'nutritionists';

interface Consultation {
  id: string;
  customerName: string;
  customerPhone: string;
  nutritionistName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  type: 'chat' | 'video' | 'in_person';
  topic: string;
  notes?: string;
  rating?: number;
}

interface MealPlan {
  id: string;
  customerName: string;
  planName: string;
  category: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'draft' | 'expired' | 'paused';
  dailyCost: number;
  itemsCount: number;
  nutritionistName: string;
}

interface HealthReport {
  id: string;
  customerName: string;
  month: string;
  score: number;
  ordersAnalyzed: number;
  generatedDate: string;
  status: 'generated' | 'reviewed' | 'sent';
  highlights: string[];
}

interface Nutritionist {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  rating: number;
  consultations: number;
  status: 'active' | 'inactive';
  phone: string;
  availability: string;
}

const DEMO_CONSULTATIONS: Consultation[] = [
  { id: 'C1', customerName: 'Priya Sharma', customerPhone: '9876543210', nutritionistName: 'Dr. Priya Sharma', date: '2026-03-18', time: '10:00 AM', status: 'scheduled', type: 'chat', topic: 'Weight loss diet plan' },
  { id: 'C2', customerName: 'Kavitha R', customerPhone: '9876543211', nutritionistName: 'Dr. Priya Sharma', date: '2026-03-18', time: '11:30 AM', status: 'in_progress', type: 'video', topic: 'Pregnancy nutrition' },
  { id: 'C3', customerName: 'Meena K', customerPhone: '9876543212', nutritionistName: 'Dr. Anitha Raj', date: '2026-03-17', time: '2:00 PM', status: 'completed', type: 'chat', topic: 'Diabetic-friendly meals', rating: 5 },
  { id: 'C4', customerName: 'Ravi Kumar', customerPhone: '9876543213', nutritionistName: 'Dr. Anitha Raj', date: '2026-03-17', time: '4:00 PM', status: 'completed', type: 'in_person', topic: 'Gym diet plan', rating: 4 },
  { id: 'C5', customerName: 'Lakshmi S', customerPhone: '9876543214', nutritionistName: 'Dr. Priya Sharma', date: '2026-03-16', time: '9:00 AM', status: 'cancelled', type: 'chat', topic: 'Skin care diet' },
  { id: 'C6', customerName: 'Arun P', customerPhone: '9876543215', nutritionistName: 'Dr. Priya Sharma', date: '2026-03-19', time: '10:00 AM', status: 'scheduled', type: 'video', topic: 'Heart-healthy diet' },
];

const DEMO_MEAL_PLANS: MealPlan[] = [
  { id: 'MP1', customerName: 'Priya Sharma', planName: 'Protein Power Plan', category: 'Gym & Fitness', startDate: '2026-03-01', endDate: '2026-03-31', status: 'active', dailyCost: 150, itemsCount: 8, nutritionistName: 'Dr. Priya Sharma' },
  { id: 'MP2', customerName: 'Kavitha R', planName: 'Pregnancy Care Plan', category: "Women's Health", startDate: '2026-03-05', endDate: '2026-04-05', status: 'active', dailyCost: 180, itemsCount: 10, nutritionistName: 'Dr. Anitha Raj' },
  { id: 'MP3', customerName: 'Meena K', planName: 'Diabetic Friendly Plan', category: 'Health & Medical', startDate: '2026-02-15', endDate: '2026-03-15', status: 'expired', dailyCost: 120, itemsCount: 6, nutritionistName: 'Dr. Anitha Raj' },
  { id: 'MP4', customerName: 'Ravi Kumar', planName: 'Lean & Fit Plan', category: 'Gym & Fitness', startDate: '2026-03-10', endDate: '2026-04-10', status: 'active', dailyCost: 140, itemsCount: 7, nutritionistName: 'Dr. Priya Sharma' },
  { id: 'MP5', customerName: 'Lakshmi S', planName: 'Glow & Beauty Pack', category: 'Beauty & Skin', startDate: '2026-03-01', endDate: '2026-03-31', status: 'paused', dailyCost: 110, itemsCount: 5, nutritionistName: 'Dr. Priya Sharma' },
];

const DEMO_REPORTS: HealthReport[] = [
  { id: 'HR1', customerName: 'Priya Sharma', month: 'February 2026', score: 85, ordersAnalyzed: 28, generatedDate: '2026-03-01', status: 'sent', highlights: ['High protein intake', 'Good vegetable variety', 'Low sugar consumption'] },
  { id: 'HR2', customerName: 'Kavitha R', month: 'February 2026', score: 72, ordersAnalyzed: 22, generatedDate: '2026-03-01', status: 'reviewed', highlights: ['Needs more iron-rich foods', 'Good fruit intake', 'Low calcium'] },
  { id: 'HR3', customerName: 'Meena K', month: 'February 2026', score: 90, ordersAnalyzed: 30, generatedDate: '2026-03-01', status: 'generated', highlights: ['Excellent fiber intake', 'Balanced diet', 'Great variety'] },
  { id: 'HR4', customerName: 'Ravi Kumar', month: 'February 2026', score: 68, ordersAnalyzed: 18, generatedDate: '2026-03-01', status: 'sent', highlights: ['Need more veggies', 'High protein ok', 'Low fruit intake'] },
];

const DEMO_NUTRITIONISTS: Nutritionist[] = [
  { id: 'N1', name: 'Dr. Priya Sharma', qualification: 'M.Sc Nutrition, PGDDN', specialization: 'Weight Management, Sports Nutrition', rating: 4.9, consultations: 248, status: 'active', phone: '9876500001', availability: 'Mon-Sat, 9 AM - 6 PM' },
  { id: 'N2', name: 'Dr. Anitha Raj', qualification: 'M.Sc Clinical Nutrition', specialization: 'Diabetic Care, Pregnancy Nutrition', rating: 4.8, consultations: 186, status: 'active', phone: '9876500002', availability: 'Mon-Fri, 10 AM - 5 PM' },
  { id: 'N3', name: 'Dr. Deepa Mohan', qualification: 'B.Sc Nutrition & Dietetics', specialization: 'Skin & Beauty Nutrition', rating: 4.7, consultations: 92, status: 'inactive', phone: '9876500003', availability: 'Tue-Sat, 11 AM - 7 PM' },
];

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'consultations', label: 'Consultations', icon: 'chat-processing' },
  { key: 'meal_plans', label: 'Meal Plans', icon: 'food-variant' },
  { key: 'reports', label: 'Reports', icon: 'chart-line' },
  { key: 'nutritionists', label: 'Team', icon: 'doctor' },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  scheduled: { color: '#1565C0', bg: '#E3F2FD', icon: 'clock-outline' },
  in_progress: { color: '#E65100', bg: '#FFF3E0', icon: 'chat-processing' },
  completed: { color: '#388E3C', bg: '#E8F5E9', icon: 'check-circle' },
  cancelled: { color: '#C62828', bg: '#FFEBEE', icon: 'close-circle' },
  active: { color: '#388E3C', bg: '#E8F5E9', icon: 'check-circle' },
  draft: { color: '#616161', bg: '#F5F5F5', icon: 'pencil' },
  expired: { color: '#C62828', bg: '#FFEBEE', icon: 'clock-alert' },
  paused: { color: '#E65100', bg: '#FFF3E0', icon: 'pause-circle' },
  generated: { color: '#1565C0', bg: '#E3F2FD', icon: 'file-document' },
  reviewed: { color: '#7B1FA2', bg: '#F3E5F5', icon: 'eye-check' },
  sent: { color: '#388E3C', bg: '#E8F5E9', icon: 'send-check' },
  inactive: { color: '#616161', bg: '#F5F5F5', icon: 'account-off' },
};

export default function NutritionistManageScreen() {
  const router = useRouter();
  const themed = useThemedStyles();
  const [activeTab, setActiveTab] = useState<TabKey>('consultations');
  const [consultations] = useState(DEMO_CONSULTATIONS);
  const [mealPlans] = useState(DEMO_MEAL_PLANS);
  const [reports] = useState(DEMO_REPORTS);
  const [nutritionists] = useState(DEMO_NUTRITIONISTS);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);
  const [selectedNutritionist, setSelectedNutritionist] = useState<Nutritionist | null>(null);

  const stats = useMemo(() => ({
    todayConsultations: consultations.filter(c => c.date === '2026-03-18').length,
    activePlans: mealPlans.filter(p => p.status === 'active').length,
    pendingReports: reports.filter(r => r.status === 'generated').length,
    activeNutritionists: nutritionists.filter(n => n.status === 'active').length,
    monthlyRevenue: mealPlans.filter(p => p.status === 'active').reduce((sum, p) => sum + p.dailyCost * 30, 0),
    avgRating: nutritionists.reduce((sum, n) => sum + n.rating, 0) / nutritionists.length,
  }), [consultations, mealPlans, reports, nutritionists]);

  const renderConsultation = ({ item }: { item: Consultation }) => {
    const sc = STATUS_CONFIG[item.status];
    const typeIcon = item.type === 'chat' ? 'chat' : item.type === 'video' ? 'video' : 'account';
    return (
      <TouchableOpacity style={[styles.listCard, themed.card]} activeOpacity={0.7} onPress={() => setSelectedConsultation(item)}>
        <View style={[styles.listCardIcon, { backgroundColor: sc.bg }]}>
          <Icon name={typeIcon as any} size={22} color={sc.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardRow}>
            <Text style={[styles.cardTitle, themed.textPrimary]}>{item.customerName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Icon name={sc.icon as any} size={10} color={sc.color} />
              <Text style={[styles.statusText, { color: sc.color }]}>{item.status.replace('_', ' ')}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>{item.topic}</Text>
          <View style={styles.cardMeta}>
            <Icon name="calendar" size={12} color={COLORS.text.muted} />
            <Text style={styles.metaText}>{item.date} at {item.time}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Icon name="doctor" size={12} color={COLORS.text.muted} />
            <Text style={styles.metaText}>{item.nutritionistName}</Text>
          </View>
          {item.rating && (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <Icon key={s} name={s <= item.rating! ? 'star' : 'star-outline'} size={12} color="#FFD700" />
              ))}
            </View>
          )}
        </View>
        <Icon name="chevron-right" size={18} color={COLORS.text.muted} />
      </TouchableOpacity>
    );
  };

  const renderMealPlan = ({ item }: { item: MealPlan }) => {
    const sc = STATUS_CONFIG[item.status];
    return (
      <TouchableOpacity style={[styles.listCard, themed.card]} activeOpacity={0.7} onPress={() => setSelectedMealPlan(item)}>
        <View style={[styles.listCardIcon, { backgroundColor: sc.bg }]}>
          <Icon name="food-variant" size={22} color={sc.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardRow}>
            <Text style={[styles.cardTitle, themed.textPrimary]}>{item.customerName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.statusText, { color: sc.color }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={[styles.cardSubtitle, { color: COLORS.primary, fontWeight: '600' }]}>{item.planName}</Text>
          <View style={styles.cardMeta}>
            <Icon name="tag" size={12} color={COLORS.text.muted} />
            <Text style={styles.metaText}>{item.category}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{item.itemsCount} items</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={[styles.metaText, { color: COLORS.primary, fontWeight: '700' }]}>{'\u20B9'}{item.dailyCost}/day</Text>
          </View>
          <View style={styles.cardMeta}>
            <Icon name="calendar-range" size={12} color={COLORS.text.muted} />
            <Text style={styles.metaText}>{item.startDate} → {item.endDate}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={18} color={COLORS.text.muted} />
      </TouchableOpacity>
    );
  };

  const renderReport = ({ item }: { item: HealthReport }) => {
    const sc = STATUS_CONFIG[item.status];
    const scoreColor = item.score >= 80 ? '#388E3C' : item.score >= 60 ? '#E65100' : '#C62828';
    return (
      <TouchableOpacity style={[styles.listCard, themed.card]} activeOpacity={0.7} onPress={() => setSelectedReport(item)}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{item.score}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardRow}>
            <Text style={[styles.cardTitle, themed.textPrimary]}>{item.customerName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Icon name={sc.icon as any} size={10} color={sc.color} />
              <Text style={[styles.statusText, { color: sc.color }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>{item.month} · {item.ordersAnalyzed} orders analyzed</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {item.highlights.map((h, i) => (
              <View key={i} style={styles.highlightChip}>
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: item.status === 'generated' ? '#E3F2FD' : item.status === 'reviewed' ? '#F3E5F5' : '#E8F5E9' }]}
          onPress={() => Alert.alert('Send Report', `Send health report to ${item.customerName}?`, [{ text: 'Cancel' }, { text: 'Send', onPress: () => {} }])}
        >
          <Icon name={item.status === 'sent' ? 'eye' : 'send'} size={16} color={item.status === 'sent' ? '#388E3C' : '#1565C0'} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderNutritionist = ({ item }: { item: Nutritionist }) => {
    const sc = STATUS_CONFIG[item.status];
    return (
      <TouchableOpacity style={[styles.listCard, themed.card]} activeOpacity={0.7} onPress={() => setSelectedNutritionist(item)}>
        <View style={[styles.listCardIcon, { backgroundColor: sc.bg }]}>
          <Icon name="doctor" size={22} color={sc.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardRow}>
            <Text style={[styles.cardTitle, themed.textPrimary]}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.statusText, { color: sc.color }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>{item.qualification}</Text>
          <Text style={[styles.metaText, { marginTop: 2 }]}>{item.specialization}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.ratingRow}>
              <Icon name="star" size={12} color="#FFD700" />
              <Text style={[styles.metaText, { fontWeight: '700' }]}>{item.rating}</Text>
            </View>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{item.consultations} consultations</Text>
            <Text style={styles.metaDot}>·</Text>
            <Icon name="clock-outline" size={12} color={COLORS.text.muted} />
            <Text style={styles.metaText}>{item.availability}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={18} color={COLORS.text.muted} />
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'consultations':
        return <FlatList data={consultations} keyExtractor={i => i.id} renderItem={renderConsultation} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />;
      case 'meal_plans':
        return <FlatList data={mealPlans} keyExtractor={i => i.id} renderItem={renderMealPlan} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />;
      case 'reports':
        return <FlatList data={reports} keyExtractor={i => i.id} renderItem={renderReport} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />;
      case 'nutritionists':
        return <FlatList data={nutritionists} keyExtractor={i => i.id} renderItem={renderNutritionist} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight || 0, backgroundColor: '#B8E0CF', zIndex: 10 }} />

      {/* Header */}
      <LinearGradient colors={['#1565C0', '#1976D2']} style={styles.header}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Icon name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nutritionist Management</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContainer}>
          <View style={styles.statChip}>
            <Icon name="calendar-today" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.todayConsultations}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="food-variant" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.activePlans}</Text>
            <Text style={styles.statLabel}>Active Plans</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="file-alert" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.pendingReports}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="currency-inr" size={16} color="#FFF" />
            <Text style={styles.statValue}>{stats.monthlyRevenue > 1000 ? `${(stats.monthlyRevenue / 1000).toFixed(0)}K` : stats.monthlyRevenue}</Text>
            <Text style={styles.statLabel}>Monthly Rev</Text>
          </View>
          <View style={styles.statChip}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.statValue}>{stats.avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: themed.colors.card }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon name={tab.icon as any} size={16} color={activeTab === tab.key ? '#1565C0' : COLORS.text.muted} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* Consultation Detail Modal */}
      <Modal visible={!!selectedConsultation} animationType="slide" presentationStyle="pageSheet">
        {selectedConsultation && (() => {
          const sc = STATUS_CONFIG[selectedConsultation.status];
          const typeIcon = selectedConsultation.type === 'chat' ? 'chat' : selectedConsultation.type === 'video' ? 'video' : 'account';
          const typeLabel = selectedConsultation.type === 'chat' ? 'Chat' : selectedConsultation.type === 'video' ? 'Video Call' : 'In Person';
          return (
            <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top']}>
              <View style={[styles.modalHeader, { backgroundColor: themed.colors.card }]}>
                <TouchableOpacity onPress={() => setSelectedConsultation(null)}>
                  <Icon name="close" size={24} color={themed.colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, themed.textPrimary]}>Consultation Details</Text>
                <View style={{ width: 24 }} />
              </View>
              <ScrollView contentContainerStyle={styles.modalContent}>
                {/* Customer Info */}
                <View style={[styles.detailHeader, themed.card]}>
                  <View style={[styles.detailIconLg, { backgroundColor: sc.bg }]}>
                    <Icon name={typeIcon as any} size={28} color={sc.color} />
                  </View>
                  <Text style={[styles.detailName, themed.textPrimary]}>{selectedConsultation.customerName}</Text>
                  <Text style={styles.detailSub}>{selectedConsultation.topic}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg, marginTop: SPACING.sm }]}>
                    <Icon name={sc.icon as any} size={12} color={sc.color} />
                    <Text style={[styles.statusText, { color: sc.color }]}>{selectedConsultation.status.replace('_', ' ')}</Text>
                  </View>
                  {selectedConsultation.rating && (
                    <View style={[styles.ratingRow, { marginTop: SPACING.sm }]}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Icon key={s} name={s <= selectedConsultation.rating! ? 'star' : 'star-outline'} size={18} color="#FFD700" />
                      ))}
                    </View>
                  )}
                </View>

                {/* Details Card */}
                <View style={[styles.infoCard, themed.card]}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Type</Text><Text style={[styles.infoValue, themed.textPrimary]}>{typeLabel}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Date</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedConsultation.date}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Time</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedConsultation.time}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Nutritionist</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedConsultation.nutritionistName}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedConsultation.customerPhone}</Text></View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  {selectedConsultation.status === 'scheduled' && (
                    <>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E3F2FD' }]} onPress={() => Alert.alert('Start', 'Start this consultation now?')}>
                        <Icon name="play-circle" size={18} color="#1565C0" />
                        <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Start</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FFF3E0' }]} onPress={() => Alert.alert('Reschedule', 'Reschedule this consultation?')}>
                        <Icon name="calendar-clock" size={18} color="#E65100" />
                        <Text style={[styles.actionBtnText, { color: '#E65100' }]}>Reschedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FFEBEE' }]} onPress={() => Alert.alert('Cancel', 'Cancel this consultation?', [{ text: 'No' }, { text: 'Yes', onPress: () => setSelectedConsultation(null) }])}>
                        <Icon name="close-circle" size={18} color="#C62828" />
                        <Text style={[styles.actionBtnText, { color: '#C62828' }]}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedConsultation.status === 'in_progress' && (
                    <>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]} onPress={() => Alert.alert('Complete', 'Mark this consultation as completed?')}>
                        <Icon name="check-circle" size={18} color="#388E3C" />
                        <Text style={[styles.actionBtnText, { color: '#388E3C' }]}>Complete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E3F2FD' }]} onPress={() => Alert.alert('Notes', 'Add consultation notes')}>
                        <Icon name="note-edit" size={18} color="#1565C0" />
                        <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Add Notes</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedConsultation.status === 'completed' && (
                    <>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E3F2FD' }]} onPress={() => Alert.alert('Report', 'Generate health report from this consultation?')}>
                        <Icon name="file-chart" size={18} color="#1565C0" />
                        <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Report</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]} onPress={() => Alert.alert('Follow-up', 'Schedule a follow-up consultation?')}>
                        <Icon name="calendar-plus" size={18} color="#388E3C" />
                        <Text style={[styles.actionBtnText, { color: '#388E3C' }]}>Follow-up</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
          );
        })()}
      </Modal>

      {/* Meal Plan Detail Modal */}
      <Modal visible={!!selectedMealPlan} animationType="slide" presentationStyle="pageSheet">
        {selectedMealPlan && (() => {
          const sc = STATUS_CONFIG[selectedMealPlan.status];
          return (
            <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top']}>
              <View style={[styles.modalHeader, { backgroundColor: themed.colors.card }]}>
                <TouchableOpacity onPress={() => setSelectedMealPlan(null)}>
                  <Icon name="close" size={24} color={themed.colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, themed.textPrimary]}>Meal Plan Details</Text>
                <View style={{ width: 24 }} />
              </View>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={[styles.detailHeader, themed.card]}>
                  <View style={[styles.detailIconLg, { backgroundColor: sc.bg }]}>
                    <Icon name="food-variant" size={28} color={sc.color} />
                  </View>
                  <Text style={[styles.detailName, themed.textPrimary]}>{selectedMealPlan.planName}</Text>
                  <Text style={styles.detailSub}>{selectedMealPlan.customerName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg, marginTop: SPACING.sm }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{selectedMealPlan.status}</Text>
                  </View>
                </View>

                <View style={[styles.infoCard, themed.card]}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Category</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedMealPlan.category}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Items</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedMealPlan.itemsCount} items</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Daily Cost</Text><Text style={[styles.infoValue, { color: COLORS.primary, fontWeight: '800' }]}>{'\u20B9'}{selectedMealPlan.dailyCost}/day</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Monthly Cost</Text><Text style={[styles.infoValue, { color: COLORS.primary, fontWeight: '800' }]}>{'\u20B9'}{selectedMealPlan.dailyCost * 30}/mo</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Start Date</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedMealPlan.startDate}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>End Date</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedMealPlan.endDate}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Nutritionist</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedMealPlan.nutritionistName}</Text></View>
                </View>

                <View style={styles.actionsRow}>
                  {selectedMealPlan.status === 'active' && (
                    <>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E3F2FD' }]} onPress={() => Alert.alert('Edit', 'Edit this meal plan?')}>
                        <Icon name="pencil" size={18} color="#1565C0" />
                        <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FFF3E0' }]} onPress={() => Alert.alert('Pause', 'Pause this meal plan?')}>
                        <Icon name="pause-circle" size={18} color="#E65100" />
                        <Text style={[styles.actionBtnText, { color: '#E65100' }]}>Pause</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedMealPlan.status === 'paused' && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]} onPress={() => Alert.alert('Resume', 'Resume this meal plan?')}>
                      <Icon name="play-circle" size={18} color="#388E3C" />
                      <Text style={[styles.actionBtnText, { color: '#388E3C' }]}>Resume</Text>
                    </TouchableOpacity>
                  )}
                  {selectedMealPlan.status === 'expired' && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]} onPress={() => Alert.alert('Renew', 'Renew this meal plan?')}>
                      <Icon name="refresh" size={18} color="#388E3C" />
                      <Text style={[styles.actionBtnText, { color: '#388E3C' }]}>Renew</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
          );
        })()}
      </Modal>

      {/* Report Detail Modal */}
      <Modal visible={!!selectedReport} animationType="slide" presentationStyle="pageSheet">
        {selectedReport && (() => {
          const sc = STATUS_CONFIG[selectedReport.status];
          const scoreColor = selectedReport.score >= 80 ? '#388E3C' : selectedReport.score >= 60 ? '#E65100' : '#C62828';
          return (
            <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top']}>
              <View style={[styles.modalHeader, { backgroundColor: themed.colors.card }]}>
                <TouchableOpacity onPress={() => setSelectedReport(null)}>
                  <Icon name="close" size={24} color={themed.colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, themed.textPrimary]}>Health Report</Text>
                <View style={{ width: 24 }} />
              </View>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={[styles.detailHeader, themed.card]}>
                  <View style={[styles.scoreCircleLg, { borderColor: scoreColor }]}>
                    <Text style={[styles.scoreTextLg, { color: scoreColor }]}>{selectedReport.score}</Text>
                    <Text style={[styles.scoreLabel, { color: scoreColor }]}>Score</Text>
                  </View>
                  <Text style={[styles.detailName, themed.textPrimary]}>{selectedReport.customerName}</Text>
                  <Text style={styles.detailSub}>{selectedReport.month}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg, marginTop: SPACING.sm }]}>
                    <Icon name={sc.icon as any} size={12} color={sc.color} />
                    <Text style={[styles.statusText, { color: sc.color }]}>{selectedReport.status}</Text>
                  </View>
                </View>

                <View style={[styles.infoCard, themed.card]}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Orders Analyzed</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedReport.ordersAnalyzed}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Generated On</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedReport.generatedDate}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Health Score</Text><Text style={[styles.infoValue, { color: scoreColor, fontWeight: '800' }]}>{selectedReport.score}/100</Text></View>
                </View>

                <Text style={[styles.sectionTitle, themed.textPrimary]}>Highlights</Text>
                <View style={[styles.infoCard, themed.card]}>
                  {selectedReport.highlights.map((h, i) => (
                    <View key={i} style={styles.highlightRow}>
                      <Icon name="check-circle" size={16} color="#388E3C" />
                      <Text style={[styles.highlightItemText, themed.textPrimary]}>{h}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.actionsRow}>
                  {selectedReport.status !== 'sent' && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]} onPress={() => Alert.alert('Send', `Send report to ${selectedReport.customerName}?`, [{ text: 'Cancel' }, { text: 'Send', onPress: () => setSelectedReport(null) }])}>
                      <Icon name="send" size={18} color="#388E3C" />
                      <Text style={[styles.actionBtnText, { color: '#388E3C' }]}>Send to Customer</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E3F2FD' }]} onPress={() => Alert.alert('Download', 'Download PDF report?')}>
                    <Icon name="download" size={18} color="#1565C0" />
                    <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Download</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          );
        })()}
      </Modal>

      {/* Nutritionist Detail Modal */}
      <Modal visible={!!selectedNutritionist} animationType="slide" presentationStyle="pageSheet">
        {selectedNutritionist && (() => {
          const sc = STATUS_CONFIG[selectedNutritionist.status];
          return (
            <SafeAreaView style={[styles.safe, themed.safeArea]} edges={['top']}>
              <View style={[styles.modalHeader, { backgroundColor: themed.colors.card }]}>
                <TouchableOpacity onPress={() => setSelectedNutritionist(null)}>
                  <Icon name="close" size={24} color={themed.colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, themed.textPrimary]}>Nutritionist Profile</Text>
                <View style={{ width: 24 }} />
              </View>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={[styles.detailHeader, themed.card]}>
                  <View style={[styles.detailIconLg, { backgroundColor: sc.bg }]}>
                    <Icon name="doctor" size={28} color={sc.color} />
                  </View>
                  <Text style={[styles.detailName, themed.textPrimary]}>{selectedNutritionist.name}</Text>
                  <Text style={styles.detailSub}>{selectedNutritionist.qualification}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg, marginTop: SPACING.sm }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{selectedNutritionist.status}</Text>
                  </View>
                  <View style={[styles.ratingRow, { marginTop: SPACING.sm }]}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Icon key={s} name={s <= Math.floor(selectedNutritionist.rating) ? 'star' : 'star-outline'} size={18} color="#FFD700" />
                    ))}
                    <Text style={[styles.metaText, { fontWeight: '700', marginLeft: 4 }]}>{selectedNutritionist.rating}</Text>
                  </View>
                </View>

                <View style={[styles.infoCard, themed.card]}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Specialization</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedNutritionist.specialization}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Consultations</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedNutritionist.consultations}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedNutritionist.phone}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Availability</Text><Text style={[styles.infoValue, themed.textPrimary]}>{selectedNutritionist.availability}</Text></View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E3F2FD' }]} onPress={() => Alert.alert('Call', `Call ${selectedNutritionist.name}?`)}>
                    <Icon name="phone" size={18} color="#1565C0" />
                    <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]} onPress={() => Alert.alert('Schedule', 'Assign a new consultation?')}>
                    <Icon name="calendar-plus" size={18} color="#388E3C" />
                    <Text style={[styles.actionBtnText, { color: '#388E3C' }]}>Assign</Text>
                  </TouchableOpacity>
                  {selectedNutritionist.status === 'active' ? (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FFF3E0' }]} onPress={() => Alert.alert('Deactivate', `Deactivate ${selectedNutritionist.name}?`)}>
                      <Icon name="account-off" size={18} color="#E65100" />
                      <Text style={[styles.actionBtnText, { color: '#E65100' }]}>Deactivate</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]} onPress={() => Alert.alert('Activate', `Activate ${selectedNutritionist.name}?`)}>
                      <Icon name="account-check" size={18} color="#388E3C" />
                      <Text style={[styles.actionBtnText, { color: '#388E3C' }]}>Activate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
          );
        })()}
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
  statValue: { fontSize: 18, fontWeight: '800', color: '#FFF', marginTop: 2 },
  statLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: SPACING.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1565C0' },
  tabText: { fontSize: 11, fontWeight: '600', color: COLORS.text.muted },
  tabTextActive: { color: '#1565C0', fontWeight: '700' },
  listContent: { padding: SPACING.base, paddingBottom: 40 },
  listCard: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOW.sm },
  listCardIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  cardSubtitle: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  statusText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: COLORS.text.muted },
  metaDot: { fontSize: 11, color: COLORS.text.muted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  scoreCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center' },
  scoreText: { fontSize: 16, fontWeight: '800' },
  highlightChip: { backgroundColor: '#E8F5E9', borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
  highlightText: { fontSize: 9, fontWeight: '600', color: '#388E3C' },
  actionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalContent: { padding: SPACING.base, paddingBottom: 40 },
  detailHeader: { borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', ...SHADOW.sm },
  detailIconLg: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  detailName: { fontSize: 18, fontWeight: '800', marginTop: SPACING.xs, textAlign: 'center' },
  detailSub: { fontSize: 13, color: COLORS.text.secondary, marginTop: 2, textAlign: 'center' },
  infoCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginTop: SPACING.md, ...SHADOW.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 12, color: COLORS.text.muted },
  infoValue: { fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginTop: SPACING.lg, marginBottom: SPACING.xs },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  highlightItemText: { fontSize: 13, fontWeight: '500', flex: 1 },
  scoreCircleLg: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  scoreTextLg: { fontSize: 24, fontWeight: '800' },
  scoreLabel: { fontSize: 9, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg, flexWrap: 'wrap' },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, minWidth: 90 },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
});
