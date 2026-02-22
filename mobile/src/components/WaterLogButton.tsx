import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

interface Props {
    onLog: (amountMl: number) => void;
    totalTodayMl?: number;
}

const PRESETS = [
    { label: '½ Glass', ml: 150, icon: 'cafe-outline' },
    { label: '1 Glass', ml: 250, icon: 'pint-outline' },
    { label: 'Bottle', ml: 500, icon: 'water-outline' },
];

const GOAL_ML = 2000;

export default function WaterLogButton({ onLog, totalTodayMl = 0 }: Props) {
    const [selected, setSelected] = useState(1); // index into PRESETS
    const [justLogged, setJustLogged] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleLog = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
        onLog(PRESETS[selected].ml);
        setJustLogged(true);
        setTimeout(() => setJustLogged(false), 2000);
    };

    const progress = Math.min(1, totalTodayMl / GOAL_ML);
    const progressColor =
        progress >= 0.8 ? Colors.teal : progress >= 0.5 ? Colors.warning : Colors.danger;

    return (
        <View style={styles.container}>
            {/* Today's progress */}
            <View style={styles.progressHeader}>
                <Text style={styles.sectionLabel}>Today's Water</Text>
                <Text style={[styles.progressText, { color: progressColor }]}>
                    {totalTodayMl} / {GOAL_ML} ml
                </Text>
            </View>
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${progress * 100}%`, backgroundColor: progressColor },
                    ]}
                />
            </View>

            {/* Size selector */}
            <View style={styles.presetRow}>
                {PRESETS.map(({ label, icon }, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.presetBtn, selected === idx && styles.presetBtnSelected]}
                        onPress={() => setSelected(idx)}
                        activeOpacity={0.75}
                    >
                        <Ionicons
                            name={icon as any}
                            size={22}
                            color={selected === idx ? '#3B9EFF' : Colors.textMuted}
                            style={{ marginBottom: 4 }}
                        />
                        <Text style={[styles.presetLabel, selected === idx && styles.presetLabelSelected]}>
                            {label}
                        </Text>
                        <Text style={[styles.presetMl, selected === idx && styles.presetMlSelected]}>
                            {PRESETS[idx].ml} ml
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    style={[styles.logBtn, justLogged && styles.logBtnSuccess]}
                    onPress={handleLog}
                    activeOpacity={0.85}
                >
                    <View style={styles.logBtnContent}>
                        <Ionicons
                            name={justLogged ? "checkmark-circle" : "water"}
                            size={20}
                            color={Colors.white}
                        />
                        <Text style={styles.logBtnText}>
                            {justLogged ? 'Logged!' : `Drank ${PRESETS[selected].label}`}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.md,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    sectionLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: FontWeight.semibold,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    progressText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
    progressTrack: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: Radius.full,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    progressFill: {
        height: '100%',
        borderRadius: Radius.full,
    },
    presetRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    presetBtn: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.cardAlt,
    },
    presetBtnSelected: {
        borderColor: '#3B9EFF',
        backgroundColor: 'rgba(59,158,255,0.15)',
    },
    presetLabel: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: FontWeight.semibold,
        marginBottom: 2,
    },
    presetLabelSelected: { color: '#3B9EFF' },
    presetMl: { fontSize: FontSize.xs, color: Colors.textMuted },
    presetMlSelected: { color: '#3B9EFF' },
    logBtn: {
        backgroundColor: '#3B9EFF',
        borderRadius: Radius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    logBtnSuccess: { backgroundColor: Colors.success },
    logBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logBtnText: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
});
