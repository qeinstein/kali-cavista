import React, { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import MealLogButton from '../../src/components/MealLogButton';
import WaterLogButton from '../../src/components/WaterLogButton';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../src/constants/theme';
import { MealSize } from '../../src/store/useAppStore';

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SIZE_COLOR: Record<MealSize, string> = {
    light: Colors.teal,
    medium: Colors.warning,
    heavy: Colors.danger,
};
const SIZE_EMOJI: Record<MealSize, string> = {
    light: '🥗',
    medium: '🍽️',
    heavy: '🍖',
};

export default function LogScreen() {
    const logMeal = useAppStore((s) => s.logMeal);
    const logWater = useAppStore((s) => s.logWater);
    const meals = useAppStore((s) => s.meals);
    const waterLogs = useAppStore((s) => s.waterLogs);

    const today = new Date().toISOString().slice(0, 10);
    const todayMeals = useMemo(
        () => meals.filter((m) => m.timestamp.startsWith(today)),
        [meals, today],
    );
    const todayWaterLogs = useMemo(
        () => waterLogs.filter((w) => w.timestamp.startsWith(today)),
        [waterLogs, today],
    );
    const todayWater = useMemo(
        () => todayWaterLogs.reduce((s, w) => s + w.amountMl, 0),
        [todayWaterLogs],
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.screenTitle}>Log Today</Text>
                <Text style={styles.screenSubtitle}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>

                {/* Meal Logger */}
                <Text style={styles.sectionLabel}>🍽️ Meal</Text>
                <MealLogButton onLog={logMeal} />

                {/* Water Logger */}
                <Text style={styles.sectionLabel}>💧 Hydration</Text>
                <WaterLogButton onLog={logWater} totalTodayMl={todayWater} />

                {/* Today's Meal History */}
                <Text style={styles.sectionLabel}>📋 Today's Meals</Text>
                {todayMeals.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No meals logged yet today. Tap above to log your first meal!</Text>
                    </View>
                ) : (
                    todayMeals
                        .slice()
                        .reverse()
                        .map((meal) => (
                            <View key={meal.id} style={styles.logItem}>
                                <Text style={styles.logItemEmoji}>{SIZE_EMOJI[meal.size]}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.logItemTitle}>
                                        {meal.size.charAt(0).toUpperCase() + meal.size.slice(1)} meal
                                    </Text>
                                    <Text style={styles.logItemTime}>{formatTime(meal.timestamp)}</Text>
                                </View>
                                <View style={[styles.sizeDot, { backgroundColor: SIZE_COLOR[meal.size] }]} />
                            </View>
                        ))
                )}

                {/* Water History */}
                <Text style={styles.sectionLabel}>📋 Today's Water</Text>
                {todayWaterLogs.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No water logged yet. Stay hydrated!</Text>
                    </View>
                ) : (
                    todayWaterLogs
                        .slice()
                        .reverse()
                        .map((log) => (
                            <View key={log.id} style={styles.logItem}>
                                <Text style={styles.logItemEmoji}>💧</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.logItemTitle}>{log.amountMl} ml</Text>
                                    <Text style={styles.logItemTime}>{formatTime(log.timestamp)}</Text>
                                </View>
                                <View style={[styles.sizeDot, { backgroundColor: '#3B9EFF' }]} />
                            </View>
                        ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

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

    sectionLabel: {
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        fontWeight: FontWeight.semibold,
        marginBottom: Spacing.sm,
        marginTop: Spacing.xs,
    },

    emptyCard: {
        backgroundColor: Colors.card,
        borderRadius: Radius.md,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        textAlign: 'center',
    },

    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.sm,
    },
    logItemEmoji: { fontSize: 22 },
    logItemTitle: {
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        fontWeight: FontWeight.medium,
    },
    logItemTime: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    sizeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
