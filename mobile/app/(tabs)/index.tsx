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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import HungerTimer from '../../src/components/HungerTimer';
import HydrationScore from '../../src/components/HydrationScore';
import TodayTimeline from '../../src/components/TodayTimeline';
import ActivityChip from '../../src/components/ActivityChip';
import MealBottomSheet from '../../src/components/MealBottomSheet';
import WaterToast from '../../src/components/WaterToast';
import WeatherChip from '../../src/components/WeatherChip';
import VoiceCheckInCard from '../../src/components/VoiceCheckInCard';
import PulseScannerSimulation from '../../src/components/PulseScannerSimulation';
import DailyCheckInModal from '../../src/components/DailyCheckInModal';
import ThemeSettingsModal from '../../src/components/ThemeSettingsModal';
import ActivityService from '../../src/services/ActivityService';
import { useInsightsService, InsightData } from '../../src/services/api/insightsService';
import { registerPushToken, scheduleHydrationAlert } from '../../src/services/notifications';
import { Spacing, Radius, FontSize, FontWeight, useThemeColor } from '../../src/constants/theme';

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
    const Colors = useThemeColor();
    const prediction = useAppStore((s) => s.prediction);
    const isLoadingPrediction = useAppStore((s) => s.isLoadingPrediction);
    const fetchPrediction = useAppStore((s) => s.fetchPrediction);
    const meals = useAppStore((s) => s.meals);
    const waterLogs = useAppStore((s) => s.waterLogs);
    const logMeal = useAppStore((s) => s.logMeal);
    const logWater = useAppStore((s) => s.logWater);
    const fetchTodayData = useAppStore((s) => s.fetchTodayData);
    const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
    const completeOnboarding = useAppStore((s) => s.completeOnboarding);

    const userName = useAuthStore((s) => s.user?.name ?? 'there');

    const hydrationScore = useAppStore((s) => s.hydrationScore);
    const lastHeartRate = useAppStore((s) => s.lastHeartRate);
    const lastDailyCheckInDate = useAppStore((s) => s.lastDailyCheckInDate);

    // Insights matching
    const { insights } = useInsightsService() as unknown as { insights: InsightData[] };
    const todayInsight: InsightData | undefined = insights && insights.length > 0 ? insights[0] : undefined;

    const [mealSheetOpen, setMealSheetOpen] = useState(false);
    const [pulseScannerOpen, setPulseScannerOpen] = useState(false);
    const [waterToastVisible, setWaterToastVisible] = useState(false);
    const [showThemeSettings, setShowThemeSettings] = useState(false);
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
        ActivityService.start();
        return () => ActivityService.stop();
    }, []);

    useEffect(() => {
        fetchTodayData();
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

    const activityLevel = useAppStore((s) => s.activityLevel);
    const [lastLevel, setLastLevel] = useState(activityLevel);
    const [toastMsg, setToastMsg] = useState('+250ml logged!');

    useEffect(() => {
        if ((activityLevel === 'Active' || activityLevel === 'Intense') && lastLevel !== activityLevel) {
            setToastMsg("You're active right now — drink water soon");
            setWaterToastVisible(true);
            setTimeout(() => setWaterToastVisible(false), 3000);
        }
        setLastLevel(activityLevel);
    }, [activityLevel]);

    const handleLogWater = () => {
        setToastMsg('+250ml logged!');
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

    if (!hasCompletedOnboarding) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}>
                <View style={[styles.onboardingCard, { backgroundColor: Colors.card }]}>
                    <View style={styles.onboardingIconWrap}>
                        <Text style={{ fontSize: 40 }}>🌿</Text>
                    </View>
                    <Text style={[styles.onboardingTitle, { color: Colors.textPrimary }]}>Welcome to SPAG</Text>
                    <Text style={[styles.onboardingDesc, { color: Colors.textSecondary }]}>
                        Let's start fresh! Empty your timeline and begin logging
                        real meals, hydration drops, and pulse scans. We'll automatically
                        fetch daily insights from the server.
                    </Text>
                    <TouchableOpacity
                        style={styles.onboardingBtn}
                        onPress={async () => {
                            // Register push token for backend updates & Request permissions
                            await registerPushToken();
                            // Begin background hydration reminders
                            await scheduleHydrationAlert();
                            completeOnboarding();
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.onboardingBtnText, { color: Colors.white }]}>Start Tracking</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const todayString = new Date().toISOString().slice(0, 10);
    const showDailyCheckIn = lastDailyCheckInDate !== todayString;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.bg }]} edges={['top']}>
            <DailyCheckInModal
                visible={showDailyCheckIn}
                onComplete={() => {
                    // Modal handles setting the date internally 
                    // This triggers a re-render closing the modal inherently.
                }}
            />
            <ThemeSettingsModal
                visible={showThemeSettings}
                onClose={() => setShowThemeSettings(false)}
            />
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.greeting, { color: Colors.textPrimary }]}>
                                {getGreeting()}, {userName.split(' ')[0]}
                            </Text>
                            <Ionicons name="sparkles" size={18} color={Colors.teal} />
                        </View>
                        <Text style={[styles.dateText, { color: Colors.textSecondary }]}>{formatDate()}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.avatarCircle, { backgroundColor: Colors.greenDim, borderColor: Colors.green }]}
                        onPress={() => setShowThemeSettings(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="person" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Real-time Activity Chip ── */}
                <Animated.View style={animatedStyle(0)}>
                    <ActivityChip />
                </Animated.View>

                {/* ── Quick stats row ── */}
                <Animated.View style={[styles.statsRow, animatedStyle(1)]}>
                    <View style={[styles.statCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
                        <Text style={[styles.statValue, { color: Colors.textPrimary }]}>{todayMeals.length}</Text>
                        <Text style={[styles.statLabel, { color: Colors.textMuted }]}>Meals</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardWater, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
                        <Text style={[styles.statValue, { color: '#3B82F6' }]}>{todayWaterMl}</Text>
                        <Text style={[styles.statLabel, { color: Colors.textMuted }]}>ml Water</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
                        <Text style={[styles.statValue, { color: Colors.green }]}>
                            {lastHeartRate ? `${lastHeartRate} BPM` : '–'}
                        </Text>
                        <Text style={[styles.statLabel, { color: Colors.textMuted }]}>Heart Rate</Text>
                    </View>
                </Animated.View>

                {/* ── Daily Check-in ── */}
                <Animated.View style={animatedStyle(1)}>
                    <VoiceCheckInCard />
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
                        outsideTemp={useAppStore.getState().weather?.temp ?? 33}
                    />
                    <WeatherChip />
                </Animated.View>

                {/* ── Pulse Check Action ── */}
                <Animated.View style={[styles.pulseAction, animatedStyle(4)]}>
                    <TouchableOpacity
                        style={[styles.pulseBtn, { backgroundColor: Colors.card, borderColor: Colors.border }]}
                        onPress={() => setPulseScannerOpen(true)}
                    >
                        <Ionicons name="heart" size={24} color={Colors.danger} />
                        <Text style={[styles.pulseBtnText, { color: Colors.textPrimary }]}>Check Pulse</Text>
                    </TouchableOpacity>
                </Animated.View>

                <PulseScannerSimulation
                    visible={pulseScannerOpen}
                    onClose={() => setPulseScannerOpen(false)}
                />

                {/* ── Today's Timeline ── */}
                <Animated.View style={animatedStyle(4)}>
                    <TodayTimeline meals={meals} waterLogs={waterLogs} />
                </Animated.View>

                {todayInsight && (
                    <View style={[styles.tipCard, { backgroundColor: Colors.cardAlt, borderColor: Colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.xs }}>
                            <Ionicons name="bulb-outline" size={18} color={Colors.textPrimary} />
                            <Text style={[styles.tipHeader, { color: Colors.textPrimary }]}>{todayInsight.title}</Text>
                        </View>
                        <Text style={[styles.tipBody, { color: Colors.textSecondary }]}>
                            {todayInsight.body}
                        </Text>
                    </View>
                )}

                {/* Bottom padding for FABs */}
                <View style={{ height: 96 }} />
            </ScrollView>

            {/* ── Floating Action Buttons ── */}
            <Animated.View style={[styles.fabRow, { opacity: fabOpacity, transform: [{ scale: fabScale }] }]}>
                <TouchableOpacity
                    style={[styles.fab, styles.fabGreen, { backgroundColor: Colors.green, shadowColor: Colors.green }]}
                    onPress={() => setMealSheetOpen(true)}
                    activeOpacity={0.85}
                >
                    <Ionicons name="restaurant" size={20} color={Colors.white} />
                    <Text style={[styles.fabLabel, { color: Colors.white }]}>I Just Ate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.fab, styles.fabBlue]}
                    onPress={handleLogWater}
                    activeOpacity={0.85}
                >
                    <Ionicons name="water" size={20} color={Colors.white} />
                    <Text style={[styles.fabLabel, { color: Colors.white }]}>I Drank Water</Text>
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
            <WaterToast visible={waterToastVisible} message={toastMsg} />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
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
        lineHeight: 28,
    },
    dateText: {
        fontSize: FontSize.sm,
        marginTop: 3,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },

    // Stats row
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statCard: {
        flex: 1,
        borderRadius: Radius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
    },
    statCardWater: {
        borderColor: '#3B82F633',
        backgroundColor: 'rgba(59,130,246,0.07)',
    },
    statValue: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
    },
    statLabel: {
        fontSize: FontSize.xs,
        marginTop: 2,
        textAlign: 'center',
    },

    // Tip
    tipCard: {
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        marginBottom: Spacing.sm,
    },
    tipHeader: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        marginBottom: Spacing.xs,
    },
    tipBody: {
        fontSize: FontSize.sm,
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
        backgroundColor: '#1B4332',
        shadowColor: '#1B4332',
    },
    fabBlue: {
        backgroundColor: '#2563EB',
        shadowColor: '#2563EB',
    },
    fabLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    pulseAction: {
        marginBottom: Spacing.lg,
    },
    pulseBtn: {
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
    },
    pulseBtnText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    onboardingCard: {
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        width: '100%',
        maxWidth: 400,
    },
    onboardingIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 2,
    },
    onboardingTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    onboardingDesc: {
        fontSize: FontSize.md,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    onboardingBtn: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.full,
        width: '100%',
        alignItems: 'center',
    },
    onboardingBtnText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    }
});
