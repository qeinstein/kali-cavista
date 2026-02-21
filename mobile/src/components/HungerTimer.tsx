import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

interface Props {
    nextMealAt?: string;
    confidence?: number; // 0–1
    isLoading?: boolean;
}

function formatCountdown(msLeft: number): string {
    if (msLeft <= 0) return 'Now!';
    const totalSeconds = Math.floor(msLeft / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return 'Soon';
}

function formatTime(isoString: string): string {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function HungerTimer({ nextMealAt, confidence = 0.81, isLoading }: Props) {
    const [msLeft, setMsLeft] = useState(0);
    const breatheAnim = useRef(new Animated.Value(1)).current;
    const loopRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        if (!nextMealAt) return;
        const update = () => setMsLeft(Math.max(0, new Date(nextMealAt).getTime() - Date.now()));
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [nextMealAt]);

    const urgencyLevel =
        msLeft > 0 && msLeft < 30 * 60 * 1000 ? 'urgent' :
            msLeft > 0 && msLeft < 90 * 60 * 1000 ? 'warn' : 'ok';

    // Breathing animation — restarts only on urgency change
    useEffect(() => {
        loopRef.current?.stop();
        const speed = urgencyLevel === 'urgent' ? 600 : urgencyLevel === 'warn' ? 1200 : 2200;
        const scale = urgencyLevel === 'urgent' ? 1.04 : 1.015;
        loopRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(breatheAnim, { toValue: scale, duration: speed, useNativeDriver: true }),
                Animated.timing(breatheAnim, { toValue: 1, duration: speed, useNativeDriver: true }),
            ]),
        );
        loopRef.current.start();
        return () => { loopRef.current?.stop(); };
    }, [urgencyLevel]);

    const accentColor =
        urgencyLevel === 'urgent' ? Colors.danger :
            urgencyLevel === 'warn' ? Colors.warning : Colors.green;

    const confPct = Math.round(confidence * 100);

    return (
        <Animated.View style={[styles.card, { transform: [{ scale: breatheAnim }], borderColor: accentColor + '55' }]}>
            {/* Glow overlay */}
            <View style={[styles.glow, { backgroundColor: accentColor }]} pointerEvents="none" />

            <View style={styles.headerRow}>
                <Text style={styles.icon}>🔮</Text>
                <Text style={styles.cardTitle}>Hunger Window</Text>
                <View style={[styles.pill, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
                    <Text style={[styles.pillText, { color: accentColor }]}>LIVE</Text>
                </View>
            </View>

            {isLoading || !nextMealAt ? (
                <View style={styles.loadingWrap}>
                    <Text style={styles.loadingText}>Calculating your rhythm…</Text>
                </View>
            ) : (
                <>
                    <Text style={styles.countdownLabel}>Next hunger window in</Text>
                    <Text style={[styles.countdown, { color: accentColor }]}>{formatCountdown(msLeft)}</Text>
                    <Text style={styles.predictedTime}>Around {formatTime(nextMealAt)}</Text>

                    {/* Confidence bar */}
                    <View style={styles.confRow}>
                        <Text style={styles.confLabel}>Model confidence: {confPct}%</Text>
                        <View style={styles.confTrack}>
                            <View style={[styles.confFill, { width: `${confPct}%` as `${number}%`, backgroundColor: accentColor }]} />
                        </View>
                    </View>
                </>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1.5,
        backgroundColor: Colors.card,
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 140,
        height: 140,
        borderRadius: 70,
        opacity: 0.07,
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
    pill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    pillText: { fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8 },
    loadingWrap: { paddingVertical: Spacing.lg },
    loadingText: { fontSize: FontSize.md, color: Colors.textMuted, fontStyle: 'italic' },
    countdownLabel: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    countdown: {
        fontSize: 54,
        fontWeight: FontWeight.extrabold,
        lineHeight: 62,
        letterSpacing: -1,
    },
    predictedTime: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
        marginTop: 2,
    },
    confRow: { gap: 6 },
    confLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: FontWeight.medium,
    },
    confTrack: {
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: Radius.full,
        overflow: 'hidden',
    },
    confFill: {
        height: '100%',
        borderRadius: Radius.full,
    },
});
