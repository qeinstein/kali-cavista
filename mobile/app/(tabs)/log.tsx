import React, { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Linking,
    TouchableOpacity,
    FlatList,
    Image,
    Animated,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import MealLogButton from '../../src/components/MealLogButton';
import WaterLogButton from '../../src/components/WaterLogButton';
import { Spacing, Radius, FontSize, FontWeight, useThemeColor } from '../../src/constants/theme';
import { MealSize } from '../../src/store/useAppStore';

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const getSizeColor = (size: MealSize, colors: any): string => {
    const map: Record<MealSize, string> = {
        light: colors.teal,
        medium: colors.warning,
        heavy: colors.danger,
    };
    return map[size] || colors.teal;
};

const getMealIcon = (size: MealSize) => {
    switch (size) {
        case 'light': return 'cafe';
        case 'medium': return 'restaurant';
        case 'heavy': return 'fast-food';
        default: return 'restaurant';
    }
};

const CHOWDECK_PREVIEWS = [
    {
        id: '1',
        title: 'Spicy Jollof Rice',
        restaurant: 'Chicken Republic',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=300',
    },
    {
        id: '2',
        title: 'Chicken Shawarma',
        restaurant: '01 Shawarma',
        image: 'https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?auto=format&fit=crop&q=80&w=300',
    },
    {
        id: '3',
        title: 'Gourmet Burger',
        restaurant: 'Bite Burgers',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    },
    {
        id: '4',
        title: 'Fried Rice & Turkey',
        restaurant: 'Sweet Sensation',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=300',
    }
];

export default function LogScreen() {
    const Colors = useThemeColor();
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

    // Carousel Configuration
    const carouselRef = useRef<FlatList>(null);
    const activeIndex = useRef(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (carouselRef.current) {
                // Loop around when reaching the end
                activeIndex.current = (activeIndex.current + 1) % CHOWDECK_PREVIEWS.length;
                carouselRef.current.scrollToIndex({
                    index: activeIndex.current,
                    animated: true,
                });
            }
        }, 3500);

        return () => clearInterval(intervalId);
    }, []);

    const handleOrderChowdeck = () => {
        Linking.openURL('https://chowdeck.com/');
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.bg }]} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.screenTitle, { color: Colors.textPrimary }]}>Log Today</Text>
                <Text style={[styles.screenSubtitle, { color: Colors.textSecondary }]}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>

                {/* Meal Logger */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="restaurant" size={18} color={Colors.textPrimary} />
                    <Text style={[styles.sectionLabel, { color: Colors.textPrimary }]}>Meal</Text>
                </View>
                <MealLogButton onLog={logMeal} />

                {/* Chowdeck Interstitial Carousel */}
                <View style={styles.carouselContainer}>
                    <View style={styles.carouselHeader}>
                        <Text style={[styles.carouselTitle, { color: Colors.textPrimary }]}>Craving Something?</Text>
                    </View>
                    <FlatList
                        ref={carouselRef}
                        data={CHOWDECK_PREVIEWS}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.foodCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}
                                activeOpacity={0.9}
                                onPress={handleOrderChowdeck}
                            >
                                <Image source={{ uri: item.image }} style={styles.foodImage} />
                                <View style={styles.foodOverlay}>
                                    <View style={styles.foodInfo}>
                                        <Text style={styles.foodTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.foodRestaurant} numberOfLines={1}>from {item.restaurant}</Text>
                                    </View>
                                    <View style={styles.chowdeckPill}>
                                        <Ionicons name="fast-food" size={12} color={Colors.white} />
                                        <Text style={[styles.chowdeckPillText, { color: Colors.white }]}>Order via Chowdeck</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={280 + Spacing.sm}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: Spacing.xs, gap: Spacing.sm }}
                        initialNumToRender={CHOWDECK_PREVIEWS.length}
                    />
                </View>

                {/* Water Logger */}
                <View style={[styles.sectionHeader, { marginTop: Spacing.md }]}>
                    <Ionicons name="water" size={18} color={Colors.textPrimary} />
                    <Text style={[styles.sectionLabel, { color: Colors.textPrimary }]}>Hydration</Text>
                </View>
                <WaterLogButton onLog={logWater} totalTodayMl={todayWater} />

                {/* Today's Meal History */}
                <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
                    <Ionicons name="list" size={18} color={Colors.textPrimary} />
                    <Text style={[styles.sectionLabel, { color: Colors.textPrimary }]}>Today's Meals</Text>
                </View>
                {todayMeals.length === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
                        <Text style={[styles.emptyText, { color: Colors.textMuted }]}>No meals logged yet today. Tap above to log your first meal!</Text>
                    </View>
                ) : (
                    todayMeals
                        .slice()
                        .reverse()
                        .map((meal) => {
                            const sizeColor = getSizeColor(meal.size, Colors);
                            return (
                                <View key={meal.id} style={[styles.logItem, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
                                    <Ionicons name={getMealIcon(meal.size)} size={22} color={sizeColor} />
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={[styles.logItemTitle, { color: Colors.textPrimary }]}>
                                                {meal.size.charAt(0).toUpperCase() + meal.size.slice(1)} meal
                                            </Text>
                                            <View style={[styles.sizeDot, { backgroundColor: sizeColor }]} />
                                        </View>
                                        <Text style={[styles.logItemTime, { color: Colors.textMuted }]}>{formatTime(meal.timestamp)}</Text>
                                    </View>
                                </View>
                            );
                        })
                )}

                {/* Water History */}
                <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
                    <Ionicons name="list" size={18} color={Colors.textPrimary} />
                    <Text style={[styles.sectionLabel, { color: Colors.textPrimary }]}>Today's Water</Text>
                </View>
                {todayWaterLogs.length === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
                        <Text style={[styles.emptyText, { color: Colors.textMuted }]}>No water logged yet. Stay hydrated!</Text>
                    </View>
                ) : (
                    todayWaterLogs
                        .slice()
                        .reverse()
                        .map((log) => (
                            <View key={log.id} style={[styles.logItem, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
                                <Ionicons name="water" size={22} color="#3B9EFF" />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.logItemTitle, { color: Colors.textPrimary }]}>{log.amountMl} ml</Text>
                                    <Text style={[styles.logItemTime, { color: Colors.textMuted }]}>{formatTime(log.timestamp)}</Text>
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

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    sectionLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },

    emptyCard: {
        borderRadius: Radius.md,
        padding: Spacing.lg,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    emptyText: {
        fontSize: FontSize.sm,
        textAlign: 'center',
    },

    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    logItemTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
    },
    logItemTime: {
        fontSize: FontSize.xs,
        marginTop: 2,
    },
    sizeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    carouselContainer: {
        marginTop: Spacing.lg,
        marginBottom: Spacing.xs,
    },
    carouselHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    carouselTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    foodCard: {
        width: 280,
        height: 160,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
    },
    foodImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    foodOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
        padding: Spacing.md,
        justifyContent: 'space-between',
    },
    foodInfo: {
        marginTop: 'auto',
        marginBottom: Spacing.sm,
    },
    foodTitle: {
        color: '#FFFFFF',
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    foodRestaurant: {
        color: '#E2E8F0',
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },
    chowdeckPill: {
        backgroundColor: '#008542',
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: Radius.full,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    chowdeckPillText: {
        fontSize: 12,
        fontWeight: FontWeight.bold,
    }
});
