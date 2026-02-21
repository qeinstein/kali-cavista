import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

export default function VoiceCheckInCard() {
    const [isListening, setIsListening] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [done, setDone] = useState(false);
    const updateWellbeing = useAppStore((s) => s.updateWellbeing);
    const wellbeing = useAppStore((s) => s.wellbeing);

    // Original logic for hiding if already checked in, kept for now
    // if (wellbeing && !analyzing && !done) return null;

    // Original handleMoodSelect, kept for now as it's not explicitly removed
    const handleMoodSelect = (mood: string, energy: number, stress: number) => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setDone(true);
            updateWellbeing(energy, stress, mood);
        }, 1500);
    };

    // Original done state rendering, kept for now
    if (done) {
        return (
            <View style={[styles.card, { alignItems: 'center', gap: 8 }]}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.green} />
                <Text style={styles.doneText}>Your wellbeing has been logged for today.</Text>
            </View>
        );
    }

    // Original analyzing state rendering, kept for now
    if (analyzing) {
        return (
            <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: Spacing.md }}>
                    <Ionicons name="mic" size={20} color={Colors.teal} />
                    <Text style={styles.analyzingText}>Analysing voice patterns...</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Ionicons name="fitness-outline" size={20} color={Colors.teal} />
                <Text style={styles.title}>Wellbeing Check-in</Text>
            </View>
            <Text style={styles.subtitle}>How are you feeling today?</Text>
            <View style={styles.moodRow}>
                <TouchableOpacity
                    style={styles.moodBtn}
                    onPress={() => handleMoodSelect('Good', 4, 1)}
                >
                    <Ionicons name="happy-outline" size={28} color={Colors.green} />
                    <Text style={styles.moodLabel}>Good</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.moodBtn}
                    onPress={() => handleMoodSelect('Okay', 3, 2)}
                >
                    <Ionicons name="ellipsis-horizontal-circle-outline" size={28} color={Colors.warning} />
                    <Text style={styles.moodLabel}>Okay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.moodBtn}
                    onPress={() => handleMoodSelect('Low', 2, 4)}
                >
                    <Ionicons name="sad-outline" size={28} color={Colors.danger} />
                    <Text style={styles.moodLabel}>Low</Text>
                </TouchableOpacity>
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
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    moodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.md,
    },
    moodBtn: {
        flex: 1,
        backgroundColor: Colors.bg,
        borderRadius: Radius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    moodLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
    analyzingText: {
        fontSize: FontSize.sm,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    progressBar: {
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        width: '60%', // Simulated progress
        backgroundColor: Colors.green,
    },
    doneText: {
        fontSize: FontSize.sm,
        color: Colors.green,
        textAlign: 'center',
    }
});
