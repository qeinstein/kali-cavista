import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import HungerTimer from '../../src/components/HungerTimer';
import HydrationScore from '../../src/components/HydrationScore';
import TodayTimeline from '../../src/components/TodayTimeline';
import MealBottomSheet from '../../src/components/MealBottomSheet';
import WaterToast from '../../src/components/WaterToast';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../src/constants/theme';

// ─── Mock API data ────────────────────────────────────────────────────────────
// GET /hydration/score → realistic mock response
const MOCK_HYDRATION = {
    score: 68,           // 0–100
    lastWaterAgo: '1h 40m ago',
    outsideTemp: 33,
    nextDrinkIn: '45m',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function formatDate() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
    const prediction = useAppStore((s) => s.prediction);
    const isLoadingPrediction = useAppStore((s) => s.isLoadingPrediction);
    const fetchPrediction = useAppStore((s) => s.fetchPrediction);
    const meals = useAppStore((s) => s.meals);
    const waterLogs = useAppStore((s) => s.waterLogs);
    const logMeal = useAppStore((s) => s.logMeal);
    const logWater = useAppStore((s) => s.logWater);

    const userName = useAuthStore((s) => s.user?.name ?? 'there');

    const hydrationScore = useAppStore((s) => s.hydrationScore);

    const [mealSheetOpen, setMealSheetOpen] = useState(false);
    const [waterToastVisible, setWaterToastVisible] = useState(false);
    const waterToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Entrance Animations
    const fadeAnims = useRef([
        new Animated.Value(0), // Header
        new Animated.Value(0), // Stats
        new Animated.Value(0), // Timer
        new Animated.Value(0), // Hydration
        new Animated.Value(0), // Timeline
    ]).current;

    const fabScale = useRef(new Animated.Value(0)).current;
    const fabOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchPrediction();

        // Staggered entrance
        const animations = fadeAnims.map((anim, i) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 600,
                delay: i * 150,
                useNativeDriver: true,
            })
        );

        Animated.parallel([
            ...animations,
            Animated.spring(fabScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
            Animated.timing(fabOpacity, { toValue: 1, duration: 400, delay: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    const today = new Date().toISOString().slice(0, 10);
    const todayMeals = useMemo(
        () => meals.filter((m) => m.timestamp.startsWith(today)),
        [meals, today],
    );
    const todayWaterMl = useMemo(
        () => waterLogs
            .filter((w) => w.timestamp.startsWith(today))
            .reduce((s, w) => s + w.amountMl, 0),
        [waterLogs, today],
    );

    const handleLogWater = () => {
        logWater(250);
        if (waterToastTimer.current) clearTimeout(waterToastTimer.current);
        setWaterToastVisible(true);
        waterToastTimer.current = setTimeout(() => setWaterToastVisible(false), 2000);
    };

    const animatedStyle = (index: number) => ({
        opacity: fadeAnims[index],
        transform: [{
            translateY: fadeAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
            })
        }]
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoadingPrediction}
                        onRefresh={fetchPrediction}
                        tintColor={Colors.green}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <Animated.View style={[styles.header, animatedStyle(0)]}>
                    <View style={styles.headerText}>
                        <Text style={styles.greeting}>
                            {getGreeting()}, {userName.split(' ')[0]} 👋
                        </Text>
                        <Text style={styles.dateText}>{formatDate()}</Text>
                    </View>
                    <View style={styles.avatarCircle}>
                        <Text style={{ fontSize: 22 }}>🧬</Text>
                    </View>
                </Animated.View>

                {/* ── Quick stats row ── */}
                <Animated.View style={[styles.statsRow, animatedStyle(1)]}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{todayMeals.length}</Text>
                        <Text style={styles.statLabel}>Meals</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardWater]}>
                        <Text style={[styles.statValue, { color: '#3B82F6' }]}>{todayWaterMl}</Text>
                        <Text style={styles.statLabel}>ml Water</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: Colors.green }]}>
                            {prediction ? `${Math.round(prediction.confidence * 100)}%` : '–'}
                        </Text>
                        <Text style={styles.statLabel}>AI Conf.</Text>
                    </View>
                </Animated.View>

                {/* ── Hunger Timer Card ── */}
                <Animated.View style={animatedStyle(2)}>
                    <HungerTimer
                        nextMealAt={prediction?.nextHungerAt}
                        confidence={prediction?.confidence}
                        isLoading={isLoadingPrediction && !prediction}
                    />
                </Animated.View>

                {/* ── Hydration Ring Card ── */}
                <Animated.View style={animatedStyle(3)}>
                    <HydrationScore
                        score={hydrationScore}
                        lastWaterAgo={MOCK_HYDRATION.lastWaterAgo}
                        outsideTemp={MOCK_HYDRATION.outsideTemp}
                        nextDrinkIn={MOCK_HYDRATION.nextDrinkIn}
                    />
                </Animated.View>

                {/* ── Today's Timeline ── */}
                <Animated.View style={animatedStyle(4)}>
                    <TodayTimeline meals={meals} waterLogs={waterLogs} />
                </Animated.View>

                {/* ── Prevention Tip ── */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipHeader}>💡 Today's Insight</Text>
                    <Text style={styles.tipBody}>
                        Eating within 30 minutes of waking stabilises blood sugar and reduces afternoon
                        energy crashes by up to 40%.
                    </Text>
                </View>

                {/* Bottom padding for FABs */}
                <View style={{ height: 96 }} />
            </ScrollView>

            {/* ── Floating Action Buttons ── */}
            <Animated.View style={[styles.fabRow, { opacity: fabOpacity, transform: [{ scale: fabScale }] }]}>
                <TouchableOpacity
                    style={[styles.fab, styles.fabGreen]}
                    onPress={() => setMealSheetOpen(true)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.fabEmoji}>🍽️</Text>
                    <Text style={styles.fabLabel}>I Just Ate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.fab, styles.fabBlue]}
                    onPress={handleLogWater}
                    activeOpacity={0.85}
                >
                    <Text style={styles.fabEmoji}>💧</Text>
                    <Text style={styles.fabLabel}>I Drank Water</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* ── Meal Bottom Sheet ── */}
            <MealBottomSheet
                visible={mealSheetOpen}
                onClose={() => setMealSheetOpen(false)}
                onSelect={(size) => {
                    // Mock POST /meals/log fires inside the sheet
                    logMeal(size);
                    // Sheet handles its own auto-dismiss after success animation
                }}
            />

            {/* Water logged instant toast */}
            <WaterToast visible={waterToastVisible} />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    content: { padding: Spacing.lg, paddingBottom: Spacing.lg },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    headerText: { flex: 1 },
    greeting: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        lineHeight: 28,
    },
    dateText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 3,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: Colors.green,
    },

    // Stats row
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: Radius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statCardWater: {
        borderColor: '#3B82F633',
        backgroundColor: 'rgba(59,130,246,0.07)',
    },
    statValue: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
        textAlign: 'center',
    },

    // Tip
    tipCard: {
        backgroundColor: Colors.cardAlt,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.sm,
    },
    tipHeader: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    tipBody: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },

    // FABs
    fabRow: {
        position: 'absolute',
        bottom: 24,
        left: Spacing.lg,
        right: Spacing.lg,
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    fab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: 15,
        borderRadius: Radius.xl,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
    },
    fabGreen: {
        backgroundColor: Colors.green,
        shadowColor: Colors.green,
    },
    fabBlue: {
        backgroundColor: '#2563EB',
        shadowColor: '#2563EB',
    },
    fabEmoji: { fontSize: 20 },
    fabLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.white,
    },
});
