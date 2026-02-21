import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Animated,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InsightCard, { InsightData } from '../../src/components/InsightCard';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../src/constants/theme';

// ─── Mock API responses ───────────────────────────────────────────────────────

// GET /insights/weekly-summary
const MOCK_WEEKLY_SUMMARY = {
    narrative:
        'This week you logged 18 meals, hit your water target 4 out of 7 days, and your average gap between meals was 4.1 hours.',
    metrics: [
        { emoji: '🍽️', label: '18 meals' },
        { emoji: '💧', label: '4/7 days' },
        { emoji: '⏱️', label: '4.1h avg gap' },
    ],
};

// GET /insights
const MOCK_INSIGHTS: InsightData[] = [
    {
        id: '1',
        type: 'warning',
        title: 'You skip lunch on busy Tuesdays',
        body: 'On 3 of the last 4 Tuesdays you logged no meal between 11am and 2pm. This correlates with a 340kcal surplus at dinner — your body compensates by overeating later.',
    },
    {
        id: '2',
        type: 'info',
        title: 'Hydration drops on afternoons',
        body: "Your water intake falls 40% between 2pm and 6pm. Adding a reminder at 3pm could close this gap and improve your cognitive focus during your typical work sprint.",
    },
    {
        id: '3',
        type: 'alert',
        title: 'Sleep quality affects next-day hunger',
        body: "On days after less than 6 hours of sleep, you report higher hunger scores and log meals 35 minutes earlier than usual. Prioritising 7+ hours could stabilise your appetite cycle.",
    },
    {
        id: '4',
        type: 'info',
        title: 'Weekend eating window shifts by 2h',
        body: 'Your first meal on Saturday and Sunday is on average 2.3 hours later than weekdays. This social jet lag in eating can disrupt your weekday hunger prediction. A consistent first-meal window (±30 min) would improve AI accuracy significantly.',
    },
    {
        id: '5',
        type: 'warning',
        title: 'Your hunger cycle is lengthening',
        body: "This week your average gap between meals was 4.1 hours, up from 3.5 hours last week. While this can indicate improved insulin sensitivity, watch for energy dips — your prediction model will self-correct over the next 3 days.",
    },
];

// GET /insights → 7-day hydration data (ml per day, goal = 2000ml)
const WATER_GOAL = 2000;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MOCK_WATER_DATA = [1600, 980, 2100, 1450, 2000, 1750, 1320];

// ─── Internal components ──────────────────────────────────────────────────────

function WeeklySummaryCard() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[styles.summaryCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
            {/* Decorative glow blob */}
            <View style={styles.summaryGlow} pointerEvents="none" />

            <View style={styles.summaryHeaderRow}>
                <Text style={styles.summaryIcon}>📊</Text>
                <Text style={styles.summaryTitle}>Weekly Summary</Text>
                <View style={styles.weekBadge}>
                    <Text style={styles.weekBadgeText}>This week</Text>
                </View>
            </View>

            <Text style={styles.summaryNarrative}>{MOCK_WEEKLY_SUMMARY.narrative}</Text>

            {/* Metric chips */}
            <View style={styles.chipsRow}>
                {MOCK_WEEKLY_SUMMARY.metrics.map((m) => (
                    <View key={m.label} style={styles.chip}>
                        <Text style={styles.chipEmoji}>{m.emoji}</Text>
                        <Text style={styles.chipLabel}>{m.label}</Text>
                    </View>
                ))}
            </View>
        </Animated.View>
    );
}

function HydrationBarChart() {
    const barAnims = useRef(MOCK_WATER_DATA.map(() => new Animated.Value(0))).current;
    const MAX_BAR_HEIGHT = 90;
    const maxVal = Math.max(...MOCK_WATER_DATA);

    useEffect(() => {
        const animations = barAnims.map((anim, i) =>
            Animated.timing(anim, {
                toValue: MOCK_WATER_DATA[i] / maxVal,
                duration: 500 + i * 60,
                useNativeDriver: false,
                delay: 100 + i * 40,
            }),
        );
        Animated.parallel(animations).start();
    }, []);

    // today's column index (Mon=0 … Sun=6)
    const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    return (
        <View style={styles.chartCard}>
            <View style={styles.chartHeaderRow}>
                <Text style={styles.chartTitle}>7-Day Hydration</Text>
                <Text style={styles.chartGoal}>Goal: {WATER_GOAL / 1000}L/day</Text>
            </View>

            {/* Goal line */}
            <View style={styles.chartArea}>
                <View
                    style={[
                        styles.goalLine,
                        { bottom: (WATER_GOAL / maxVal) * MAX_BAR_HEIGHT },
                    ]}
                />

                <View style={styles.barsRow}>
                    {MOCK_WATER_DATA.map((ml, i) => {
                        const isToday = i === todayIdx;
                        const hitGoal = ml >= WATER_GOAL;
                        const barColor =
                            hitGoal ? Colors.green :
                                ml >= 1200 ? Colors.warning : Colors.danger;
                        const barHeight = barAnims[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, (MOCK_WATER_DATA[i] / maxVal) * MAX_BAR_HEIGHT],
                        });

                        return (
                            <View key={DAYS[i]} style={styles.barCol}>
                                <View style={styles.barTrack}>
                                    <Animated.View
                                        style={[
                                            styles.bar,
                                            {
                                                height: barHeight,
                                                backgroundColor: barColor,
                                                opacity: isToday ? 1 : 0.75,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                                    {DAYS[i]}
                                </Text>
                                <Text style={[styles.barMl, { color: barColor }]}>
                                    {ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}`}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                {[
                    { color: Colors.green, label: '≥ 2L target' },
                    { color: Colors.warning, label: '1.2–2L' },
                    { color: Colors.danger, label: '< 1.2L' },
                ].map((l) => (
                    <View key={l.label} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                        <Text style={styles.legendText}>{l.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

import { useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../../src/store/useAppStore';

export default function InsightsScreen() {
    const [insights, setInsights] = useState<InsightData[]>(MOCK_INSIGHTS);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        // Simulate API fetch refresh
        await new Promise((r) => setTimeout(r, 1000));
        setInsights([...MOCK_INSIGHTS].sort(() => Math.random() - 0.5));
        setRefreshing(false);
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            onRefresh();
        }, [])
    );

    const handleDismiss = (id: string) => {
        setTimeout(() => {
            setInsights((prev) => prev.filter((c) => c.id !== id));
        }, 320);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.green}
                    />
                }
            >
                {/* Screen header */}
                <Text style={styles.screenTitle}>Insights</Text>
                <Text style={styles.screenSubtitle}>Your personal prevention signals</Text>

                {/* 1. Weekly Summary featured card */}
                <WeeklySummaryCard />

                {/* 2. 7-day hydration bar chart */}
                <HydrationBarChart />

                {/* 3. Insight cards */}
                <Text style={styles.sectionLabel}>Prevention Signals</Text>
                {insights.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🎉</Text>
                        <Text style={styles.emptyText}>All caught up! No new signals.</Text>
                    </View>
                ) : (
                    insights.map((ins) => (
                        <InsightCard key={ins.id} {...ins} onDismiss={handleDismiss} />
                    ))
                )}

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

    screenTitle: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    screenSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
    },

    // ── Weekly Summary card ──
    summaryCard: {
        backgroundColor: Colors.cardAlt,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1.5,
        borderColor: Colors.green + '44',
        overflow: 'hidden',
        position: 'relative',
    },
    summaryGlow: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: Colors.green,
        opacity: 0.08,
    },
    summaryHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    summaryIcon: { fontSize: 18 },
    summaryTitle: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.textPrimary,
    },
    weekBadge: {
        backgroundColor: Colors.greenDim,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: Colors.green + '55',
    },
    weekBadgeText: {
        fontSize: FontSize.xs,
        color: Colors.green,
        fontWeight: FontWeight.semibold,
    },
    summaryNarrative: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.bg,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    chipEmoji: { fontSize: 13 },
    chipLabel: {
        fontSize: FontSize.xs,
        color: Colors.textPrimary,
        fontWeight: FontWeight.semibold,
    },

    // ── Hydration bar chart ──
    chartCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    chartHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    chartTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.textPrimary,
    },
    chartGoal: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    chartArea: {
        height: 120,
        position: 'relative',
        marginBottom: Spacing.sm,
    },
    goalLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        borderWidth: 1,
        borderColor: Colors.green + '55',
        borderStyle: 'dashed',
        zIndex: 1,
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: '100%',
        gap: 6,
    },
    barCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
    },
    barTrack: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        borderRadius: 5,
        minHeight: 4,
    },
    barLabel: {
        fontSize: 9,
        color: Colors.textMuted,
        marginTop: 4,
        textAlign: 'center',
    },
    barLabelToday: {
        color: Colors.green,
        fontWeight: FontWeight.bold,
    },
    barMl: {
        fontSize: 8,
        marginTop: 1,
        textAlign: 'center',
        fontWeight: FontWeight.semibold,
    },
    legend: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.xs,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    legendText: {
        fontSize: 9,
        color: Colors.textMuted,
    },

    // ── Section label ──
    sectionLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: FontWeight.semibold,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
    },

    // ── Empty state ──
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.sm,
    },
    emptyIcon: { fontSize: 36 },
    emptyText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
