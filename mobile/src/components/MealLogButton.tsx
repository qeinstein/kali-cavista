import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    TextStyle,
    ViewStyle,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { MealSize } from '../store/useAppStore';

interface Props {
    onLog: (size: MealSize) => void;
}

const SIZES: { key: MealSize; label: string; emoji: string; desc: string }[] = [
    { key: 'light', label: 'Light', emoji: '🥗', desc: 'Snack or salad' },
    { key: 'medium', label: 'Medium', emoji: '🍽️', desc: 'Regular meal' },
    { key: 'heavy', label: 'Heavy', emoji: '🍖', desc: 'Large meal' },
];

export default function MealLogButton({ onLog }: Props) {
    const [selected, setSelected] = useState<MealSize>('medium');
    const [justLogged, setJustLogged] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleLog = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
        onLog(selected);
        setJustLogged(true);
        setTimeout(() => setJustLogged(false), 2000);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionLabel}>Meal Size</Text>
            <View style={styles.sizeRow}>
                {SIZES.map(({ key, label, emoji, desc }) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.sizeBtn, selected === key && styles.sizeBtnSelected] as ViewStyle[]}
                        onPress={() => setSelected(key)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.sizeEmoji}>{emoji}</Text>
                        <Text style={[styles.sizeLabel, selected === key && styles.sizeLabelSelected] as TextStyle[]}>
                            {label}
                        </Text>
                        <Text style={[styles.sizeDesc, selected === key && styles.sizeDescSelected] as TextStyle[]}>
                            {desc}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    style={[styles.logBtn, justLogged && styles.logBtnSuccess] as ViewStyle[]}
                    onPress={handleLog}
                    activeOpacity={0.85}
                >
                    <Text style={styles.logBtnText}>
                        {justLogged ? '✅ Logged!' : '🍽️  I Just Ate'}
                    </Text>
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
    } as ViewStyle,
    sectionLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: FontWeight.semibold,
        letterSpacing: 1,
        textTransform: 'uppercase' as TextStyle['textTransform'],
        marginBottom: Spacing.sm,
    },
    sizeRow: {
        flexDirection: 'row' as const,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    sizeBtn: {
        flex: 1,
        alignItems: 'center' as const,
        padding: Spacing.sm,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.cardAlt,
    },
    sizeBtnSelected: {
        borderColor: Colors.teal,
        backgroundColor: Colors.tealDim,
    },
    sizeEmoji: { fontSize: 22, marginBottom: 4 },
    sizeLabel: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: FontWeight.semibold,
        marginBottom: 2,
    },
    sizeLabelSelected: { color: Colors.teal },
    sizeDesc: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        textAlign: 'center' as const,
    },
    sizeDescSelected: { color: Colors.teal },
    logBtn: {
        backgroundColor: Colors.teal,
        borderRadius: Radius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center' as const,
    },
    logBtnSuccess: {
        backgroundColor: Colors.success,
    },
    logBtnText: {
        color: Colors.bg,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    } as TextStyle,
});
