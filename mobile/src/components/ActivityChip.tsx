import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

export default function ActivityChip() {
    const steps = useAppStore((s) => s.steps);
    const activeMinutes = useAppStore((s) => s.activeMinutes);
    const activityLevel = useAppStore((s) => s.activityLevel);

    const getLevelEmoji = () => {
        switch (activityLevel) {
            case 'Sedentary': return <Ionicons name="bed-outline" size={14} color={Colors.textMuted} />;
            case 'Light': return <Ionicons name="walk-outline" size={14} color={Colors.teal} />;
            case 'Active': return <Ionicons name="walk" size={14} color={Colors.green} />;
            case 'Intense': return <Ionicons name="flame" size={14} color={Colors.danger} />;
            default: return <Ionicons name="location-outline" size={14} color={Colors.textPrimary} />;
        }
    };

    const getLevelColor = () => {
        switch (activityLevel) {
            case 'Intense': return Colors.danger;
            case 'Active': return Colors.green;
            case 'Light': return Colors.teal;
            case 'Sedentary': return Colors.textSecondary;
            default: return Colors.textPrimary;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.item}>
                    <Ionicons name="footsteps" size={16} color={Colors.green} />
                    <View>
                        <Text style={styles.value}>{steps.toLocaleString()}</Text>
                        <Text style={styles.label}>Steps</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.item}>
                    <Ionicons name="timer-outline" size={16} color={Colors.teal} />
                    <View>
                        <Text style={styles.value}>{activeMinutes}</Text>
                        <Text style={styles.label}>Mins</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={[styles.item, { flex: 1.2 }]}>
                    {getLevelEmoji()}
                    <View>
                        <Text style={[styles.value, { color: getLevelColor() }]}>{activityLevel}</Text>
                        <Text style={styles.label}>Activity</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.cardAlt,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    item: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    value: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
    },
    label: {
        fontSize: 8,
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: -2,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: Colors.border,
        marginHorizontal: Spacing.sm,
    },
});
