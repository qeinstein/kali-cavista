import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Animated,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import InsightCard, { InsightData } from '../../src/components/InsightCard';
import { Spacing, Radius, FontSize, FontWeight, useThemeColor } from '../../src/constants/theme';
import { useInsightsService, WeeklySummaryResponse } from '../../src/services/api/insightsService';
import { useHydrationHistory, HydrationDayData } from '../../src/services/api/hydrationService';
import { useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../../src/store/useAppStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const WATER_GOAL = 2000;
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Internal components ──────────────────────────────────────────────────────

function WeeklySummaryCard({ data }: { data: WeeklySummaryResponse | null }) {
    const Colors = useThemeColor();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    // Build metric chips from API data
    const metrics = data?.metrics
        ? [
            { icon: 'restaurant', label: `${data.metrics.mealsLogged} meals`, color: Colors.green },
            { icon: 'water', label: `${data.metrics.waterTargetDaysHit}/7 days`, color: '#3B9EFF' },
            { icon: 'time-outline', label: `${data.metrics.avgMealGapHours}h avg gap`, color: Colors.warning },
        ]
        : [
            { icon: 'restaurant', label: '— meals', color: Colors.green },
            { icon: 'water', label: '—/7 days', color: '#3B9EFF' },
            { icon: 'time-outline', label: '— avg gap', color: Colors.warning },
        ];

    const narrative =
        data?.summary ||
        'Loading your weekly summary…';

    return (
        <Animated.View
            style={[styles.summaryCard, { backgroundColor: Colors.cardAlt, borderColor: Colors.green + '44', opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
            <View style={[styles.summaryGlow, { backgroundColor: Colors.green }]} pointerEvents="none" />

            <View style={styles.summaryHeaderRow}>
                <Ionicons name="analytics" size={18} color={Colors.green} />
                <Text style={[styles.summaryTitle, { color: Colors.textPrimary }]}>Weekly Summary</Text>
                <View style={[styles.weekBadge, { backgroundColor: Colors.greenDim, borderColor: Colors.green + '55' }]}>
                    <Text style={[styles.weekBadgeText, { color: Colors.green }]}>This week</Text>
                </View>
            </View>

            <Text style={[styles.summaryNarrative, { color: Colors.textSecondary }]}>{narrative}</Text>

            <View style={styles.chipsRow}>
                {metrics.map((m) => (
                    <View key={m.label} style={[styles.chip, { backgroundColor: Colors.bg, borderColor: Colors.border }]}>
                        <Ionicons name={m.icon as any} size={14} color={m.color} />
                        <Text style={[styles.chipLabel, { color: Colors.textPrimary }]}>{m.label}</Text>
                    </View>
                ))}
            </View>
        </Animated.View>
    );
}

function HydrationBarChart({ history, todayWater }: { history: HydrationDayData[], todayWater: number }) {
    const Colors = useThemeColor();
    const MAX_BAR_HEIGHT = 90;

    // Apply optimistic local water logs to today's data
    const todayStr = new Date().toISOString().slice(0, 10);
    let chartHistory = [...history];

    if (chartHistory.length > 0) {
        const lastEntry = chartHistory[chartHistory.length - 1];
        if (lastEntry.date === todayStr) {
            // Server returned today's entry, merge optimistic local
            chartHistory[chartHistory.length - 1] = {
                ...lastEntry,
                totalMl: Math.max(lastEntry.totalMl, todayWater) // Avoid double counting if sync happened
            };
        } else if (todayWater > 0) {
            // Server hasn't returned today's entry yet, append it
            chartHistory.push({
                date: todayStr,
                totalMl: todayWater,
                targetMl: WATER_GOAL,
                avgScore: 0
            });
        }
    } else if (todayWater > 0) {
        chartHistory = [{
            date: todayStr,
            totalMl: todayWater,
            targetMl: WATER_GOAL,
            avgScore: 0
        }];
    }

    // Map history data to 7-day array (fill missing days with 0)
    const waterData = chartHistory.length > 0
        ? chartHistory.slice(-7).map((d) => d.totalMl)
        : [0, 0, 0, 0, 0, 0, 0];

    const dayLabels = chartHistory.length > 0
        ? chartHistory.slice(-7).map((d) => {
            const dt = new Date(d.date);
            return DAYS_SHORT[dt.getDay() === 0 ? 6 : dt.getDay() - 1] || d.date.slice(5);
        })
        : DAYS_SHORT;

    const barAnims = useRef(waterData.map(() => new Animated.Value(0))).current;
    const maxVal = Math.max(...waterData, WATER_GOAL);

    useEffect(() => {
        const animations = barAnims.map((anim, i) =>
            Animated.timing(anim, {
                toValue: waterData[i] / maxVal,
                duration: 500 + i * 60,
                useNativeDriver: false,
                delay: 100 + i * 40,
            }),
        );
        Animated.parallel(animations).start();
    }, [waterData.join(',')]); // re-run animation when data changes

    const todayIdx = waterData.length - 1;

    return (
        <View style={[styles.chartCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
            <View style={styles.chartHeaderRow}>
                <Text style={[styles.chartTitle, { color: Colors.textPrimary }]}>7-Day Hydration</Text>
                <Text style={[styles.chartGoal, { color: Colors.textMuted }]}>Goal: {WATER_GOAL / 1000}L/day</Text>
            </View>

            <View style={styles.chartArea}>
                <View
                    style={[
                        styles.goalLine,
                        { borderColor: Colors.green + '55', bottom: (WATER_GOAL / maxVal) * MAX_BAR_HEIGHT },
                    ]}
                />

                <View style={styles.barsRow}>
                    {waterData.map((ml, i) => {
                        const isToday = i === todayIdx;
                        const hitGoal = ml >= WATER_GOAL;
                        const barColor =
                            hitGoal ? Colors.green :
                                ml >= 1200 ? Colors.warning : Colors.danger;
                        const barHeight = barAnims[i]
                            ? barAnims[i].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, (waterData[i] / maxVal) * MAX_BAR_HEIGHT],
                            })
                            : 0;

                        return (
                            <View key={dayLabels[i] || i} style={styles.barCol}>
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
                                <Text style={[styles.barLabel, { color: Colors.textMuted }, isToday && { color: Colors.green, fontWeight: 'bold' }]}>
                                    {dayLabels[i]}
                                </Text>
                                <Text style={[styles.barMl, { color: barColor }]}>
                                    {ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : ml > 0 ? `${ml}` : '—'}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.legend}>
                {[
                    { color: Colors.green, label: '≥ 2L target' },
                    { color: Colors.warning, label: '1.2–2L' },
                    { color: Colors.danger, label: '< 1.2L' },
                ].map((l) => (
                    <View key={l.label} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                        <Text style={[styles.legendText, { color: Colors.textMuted }]}>{l.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InsightsScreen() {
    const Colors = useThemeColor();
    const { insights, weeklySummary, dismissInsight } = useInsightsService();
    const hydrationHistory = useHydrationHistory(7);
    const [refreshing, setRefreshing] = useState(false);

    // Pull local water logs to optimistically update chart
    const waterLogs = useAppStore((s) => s.waterLogs);
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayWater = waterLogs
        .filter((w) => w.timestamp.startsWith(todayStr))
        .reduce((sum, w) => sum + w.amountMl, 0);

    // Local state for dismissed insights (optimistic UI)
    const [insightsList, setInsightsList] = useState<InsightData[]>([]);

    // Sync API data to local state
    useEffect(() => {
        const apiData = insights?.data as any;
        if (apiData?.insights) {
            setInsightsList(apiData.insights);
        }
    }, [insights?.data]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            if (insights?.onRefresh) insights.onRefresh();
            if (weeklySummary?.onRefresh) weeklySummary.onRefresh();
            if (hydrationHistory?.onRefresh) hydrationHistory.onRefresh();
        } catch { }
        // Small delay so spinner is visible
        await new Promise((r) => setTimeout(r, 500));
        setRefreshing(false);
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            onRefresh();
        }, [])
    );

    const handleDismiss = async (id: string) => {
        // Optimistic: remove from local list immediately
        setTimeout(() => {
            setInsightsList((prev) => prev.filter((c) => c.id !== id));
        }, 320);
        // Fire API
        try {
            await dismissInsight(id);
        } catch {
            // Insight was already removed from UI
        }
    };

    const summaryData = weeklySummary?.data as WeeklySummaryResponse | null;
    const historyData = (hydrationHistory?.data as any)?.history || [];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.bg }]} edges={['top']}>
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
                <Text style={[styles.screenTitle, { color: Colors.textPrimary }]}>Insights</Text>
                <Text style={[styles.screenSubtitle, { color: Colors.textSecondary }]}>Your personal prevention signals</Text>

                {/* 1. Weekly Summary featured card */}
                <WeeklySummaryCard data={summaryData} />

                {/* 2. 7-day hydration bar chart */}
                <HydrationBarChart history={historyData} todayWater={todayWater} />

                {/* 3. Insight cards */}
                <Text style={[styles.sectionLabel, { color: Colors.textMuted }]}>Prevention Signals</Text>
                {insightsList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="sparkles-outline" size={36} color={Colors.textMuted} />
                        <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>All caught up! No new signals.</Text>
                    </View>
                ) : (
                    insightsList.map((ins) => (
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
    safeArea: { flex: 1 },
    scroll: { flex: 1 },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

    screenTitle: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        marginBottom: 4,
    },
    screenSubtitle: {
        fontSize: FontSize.sm,
        marginBottom: Spacing.lg,
    },

    // ── Weekly Summary card ──
    summaryCard: {
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1.5,
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
        opacity: 0.08,
    },
    summaryHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    summaryTitle: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    weekBadge: {
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderWidth: 1,
    },
    weekBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
    },
    summaryNarrative: {
        fontSize: FontSize.md,
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
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderWidth: 1,
    },
    chipLabel: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
    },

    // ── Hydration bar chart ──
    chartCard: {
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
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
    },
    chartGoal: {
        fontSize: FontSize.xs,
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
        marginTop: 4,
        textAlign: 'center',
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
    },

    // ── Section label ──
    sectionLabel: {
        fontSize: FontSize.xs,
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
    emptyText: {
        fontSize: FontSize.md,
        textAlign: 'center',
    },
});
