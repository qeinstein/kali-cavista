import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import Svg, { Circle } from 'react-native-svg';

interface Props {
    score?: number;        // 0–100 integer
    outsideTemp?: number;  // e.g. 33
}

const SIZE = 130;
const RADIUS = 54;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Animated wrapper for SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HydrationScore({
    score = 68,
    outsideTemp = 33,
}: Props) {
    const lastWaterTimestamp = useAppStore((s) => s.lastWaterTimestamp);
    const animScore = useRef(new Animated.Value(0)).current;

    const [lastDrinkStr, setLastDrinkStr] = useState('');
    const [nextDrinkStr, setNextDrinkStr] = useState('');

    const progressColor = Colors.warning;
    const statusColor = score > 70 ? Colors.green : score > 40 ? Colors.warning : Colors.danger;
    const label = score > 70 ? 'Well Hydrated' : score > 40 ? 'Drink Soon' : 'Dehydration Risk!';

    useEffect(() => {
        Animated.timing(animScore, {
            toValue: score / 100,
            duration: 900,
            useNativeDriver: false,
        }).start();
    }, [score]);

    // strokeDashoffset: CIRCUMFERENCE = empty, 0 = full ring
    const strokeDashoffset = animScore.interpolate({
        inputRange: [0, 1],
        outputRange: [CIRCUMFERENCE, 0],
    });

    useEffect(() => {
        const updateTimers = () => {
            if (!lastWaterTimestamp) {
                setLastDrinkStr('No logs yet');
                setNextDrinkStr('Drink now');
                return;
            }

            const now = new Date();
            const last = new Date(lastWaterTimestamp);
            const diffMs = now.getTime() - last.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 1) setLastDrinkStr('just now');
            else if (diffMins < 60) setLastDrinkStr(`${diffMins}m ago`);
            else setLastDrinkStr(`${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`);

            let intervalMins = 120;
            if (score > 80) intervalMins = 120;
            else if (score > 50) intervalMins = 90;
            else intervalMins = 45;

            const remaining = intervalMins - diffMins;
            if (remaining <= 0) setNextDrinkStr('Drink now');
            else if (remaining < 60) setNextDrinkStr(`${remaining}m`);
            else setNextDrinkStr(`${Math.floor(remaining / 60)}h ${remaining % 60}m`);
        };

        updateTimers();
        const interval = setInterval(updateTimers, 60000);
        return () => clearInterval(interval);
    }, [lastWaterTimestamp, score]);

    return (
        <View style={[styles.card, { borderColor: statusColor + '44' }]}>
            <View style={styles.headerRow}>
                <Ionicons name="water" size={18} color={Colors.warning} />
                <Text style={styles.cardTitle}>Hydration Score</Text>
                <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]}>{label}</Text>
                </View>
            </View>

            <View style={styles.body}>
                {/* SVG Ring Chart */}
                <View style={styles.ringWrap}>
                    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                        {/* Grey background track */}
                        <Circle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={RADIUS}
                            stroke={Colors.border}
                            strokeWidth={STROKE}
                            fill="none"
                        />
                        {/* Animated orange progress arc */}
                        <AnimatedCircle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={RADIUS}
                            stroke={progressColor}
                            strokeWidth={STROKE}
                            fill="none"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            rotation="-90"
                            origin={`${SIZE / 2}, ${SIZE / 2}`}
                        />
                    </Svg>

                    {/* Score centered inside ring */}
                    <View style={styles.scoreCenter}>
                        <Text style={[styles.scoreValue, { color: statusColor }]}>
                            {Math.round(score)}
                        </Text>
                        <Text style={styles.scoreUnit}>/100</Text>
                    </View>
                </View>

                {/* Detail rows */}
                <View style={styles.details}>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.detailText}>Last drink {lastDrinkStr}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="thermometer-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.detailText}>{outsideTemp}°C outside</Text>
                    </View>
                    <View style={[
                        styles.nextDrinkChip,
                        { backgroundColor: statusColor + '22', borderColor: statusColor + '44' }
                    ]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="water" size={14} color={statusColor} />
                            <Text style={[styles.nextDrinkText, { color: statusColor }]}>
                                {nextDrinkStr == 'Drink now' ? 'Drink now' : `Drink again in ${nextDrinkStr}`}
                            </Text>
                        </View>
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
    scoreCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: FontWeight.extrabold,
        lineHeight: 40,
        textAlign: 'center',
    },
    scoreUnit: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        textAlign: 'center',
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
