import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

interface Props {
    score?: number;        // 0–100 integer
    lastWaterAgo?: string; // e.g. "1h 40m ago"
    outsideTemp?: number;  // e.g. 33
    nextDrinkIn?: string;  // e.g. "45m"
}

const SIZE = 130;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HydrationScore({
    score = 68,
    lastWaterAgo = '1h 40m ago',
    outsideTemp = 33,
    nextDrinkIn = '45m',
}: Props) {
    const animScore = useRef(new Animated.Value(0)).current;

    const color =
        score > 70 ? Colors.green :
            score > 40 ? Colors.warning : Colors.danger;
    const label =
        score > 70 ? 'Well Hydrated' :
            score > 40 ? 'Drink Soon' : 'Dehydration Risk!';
    const dimColor =
        score > 70 ? Colors.greenDim :
            score > 40 ? Colors.warningDim : Colors.dangerDim;

    useEffect(() => {
        Animated.timing(animScore, {
            toValue: score / 100,
            duration: 900,
            useNativeDriver: false,
        }).start();
    }, [score]);

    // ─── Dual half-arc ring approach ────────────────────────────────────────────
    // We split the ring into two halves. For scores 0–50, only the right half
    // rotates (0–180°). For scores 51–100, the right half is fully filled and
    // the left half rotates from 180° to 360°.
    const fraction = score / 100;
    const rightRotate = animScore.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0deg', '180deg', '180deg'],
    });
    const leftRotate = animScore.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0deg', '0deg', '180deg'],
    });

    return (
        <View style={[styles.card, { borderColor: color + '44' }]}>
            <View style={styles.headerRow}>
                <Text style={styles.icon}>💧</Text>
                <Text style={styles.cardTitle}>Hydration Score</Text>
                <View style={[styles.badge, { backgroundColor: dimColor }]}>
                    <Text style={[styles.badgeText, { color }]}>{label}</Text>
                </View>
            </View>

            <View style={styles.body}>
                {/* Circular progress ring - dual half-arc technique */}
                <View style={styles.ringWrap}>
                    {/* Background full circle */}
                    <View style={[styles.ringOuter, { borderColor: Colors.border }]} />

                    {/* Right half (0°–180°) — always visible when score > 0 */}
                    <View style={[styles.halfClip, styles.halfClipRight]}>
                        <Animated.View
                            style={[
                                styles.halfArc,
                                {
                                    borderColor: color,
                                    transform: [{ rotate: rightRotate as unknown as string }],
                                },
                            ]}
                        />
                    </View>

                    {/* Left half (180°–360°) — only visible when score > 50 */}
                    <View style={[styles.halfClip, styles.halfClipLeft]}>
                        <Animated.View
                            style={[
                                styles.halfArc,
                                styles.halfArcLeft,
                                {
                                    borderColor: fraction > 0.5 ? color : 'transparent',
                                    transform: [{ rotate: leftRotate as unknown as string }],
                                },
                            ]}
                        />
                    </View>

                    {/* Score in centre */}
                    <View style={styles.scoreCenter}>
                        <Text style={[styles.scoreValue, { color }]}>{score}</Text>
                        <Text style={styles.scoreUnit}>/100</Text>
                    </View>
                </View>

                {/* Right side details */}
                <View style={styles.details}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🕐</Text>
                        <Text style={styles.detailText}>Last water {lastWaterAgo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🌡️</Text>
                        <Text style={styles.detailText}>{outsideTemp}°C outside</Text>
                    </View>
                    <View style={[styles.nextDrinkChip, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                        <Text style={[styles.nextDrinkText, { color }]}>💧 Drink again in {nextDrinkIn}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1.5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    icon: { fontSize: 17 },
    cardTitle: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: FontWeight.medium,
    },
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radius.full,
    },
    badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
    body: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
    },
    ringWrap: {
        width: SIZE,
        height: SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringOuter: {
        position: 'absolute',
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        borderWidth: STROKE,
    },
    // Dual half-arc ring styles
    halfClip: {
        position: 'absolute',
        width: SIZE,
        height: SIZE / 2,
        overflow: 'hidden',
    },
    halfClipRight: {
        top: 0,
    },
    halfClipLeft: {
        bottom: 0,
    },
    halfArc: {
        position: 'absolute',
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        borderWidth: STROKE,
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        top: 0,
    },
    halfArcLeft: {
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: Colors.border, // reset override from halfArc
        borderLeftColor: Colors.border,   // reset override from halfArc
        top: -SIZE / 2,
    },
    scoreCenter: {
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: FontWeight.extrabold,
        lineHeight: 40,
    },
    scoreUnit: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    details: {
        flex: 1,
        gap: Spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailIcon: { fontSize: 14 },
    detailText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        flexShrink: 1,
    },
    nextDrinkChip: {
        borderRadius: Radius.md,
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginTop: Spacing.xs,
    },
    nextDrinkText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
    },
});
