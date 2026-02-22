import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { useAppStore, MealSize } from '../store/useAppStore';

interface DailyCheckInModalProps {
    visible: boolean;
    onComplete: () => void;
}

export default function DailyCheckInModal({ visible, onComplete }: DailyCheckInModalProps) {
    const logMeal = useAppStore((s) => s.logMeal);
    const logWater = useAppStore((s) => s.logWater);
    const setLastDailyCheckInDate = useAppStore((s) => s.setLastDailyCheckInDate);

    const [selectedMeal, setSelectedMeal] = useState<MealSize | 'none'>('none');
    const [selectedWater, setSelectedWater] = useState<number>(0);

    const handleComplete = () => {
        if (selectedMeal !== 'none') {
            logMeal(selectedMeal as MealSize);
        }
        if (selectedWater > 0) {
            logWater(selectedWater);
        }
        const today = new Date().toISOString().slice(0, 10);
        setLastDailyCheckInDate(today);
        onComplete();
    };

    const MEAL_OPTIONS: { label: string; value: MealSize | 'none'; icon: keyof typeof Ionicons.glyphMap }[] = [
        { label: "None Yet", value: "none", icon: "close-circle-outline" },
        { label: "Light", value: "light", icon: "cafe-outline" },
        { label: "Medium", value: "medium", icon: "restaurant-outline" },
        { label: "Heavy", value: "heavy", icon: "fast-food-outline" },
    ];

    const WATER_OPTIONS = [
        { label: "None", value: 0 },
        { label: "1 Glass", value: 250 },
        { label: "2 Glasses", value: 500 },
        { label: "3+ Glasses", value: 750 },
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => { }} // Force them to complete it
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Ionicons name="sunny" size={32} color={Colors.warning} />
                        <Text style={styles.title}>Good Morning!</Text>
                        <Text style={styles.subtitle}>Let's calibrate your daily tracking.</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What have you eaten today?</Text>
                        <View style={styles.optionsRow}>
                            {MEAL_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.optionBtn,
                                        selectedMeal === opt.value && styles.optionBtnSelected
                                    ]}
                                    onPress={() => setSelectedMeal(opt.value)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={opt.icon}
                                        size={20}
                                        color={selectedMeal === opt.value ? Colors.white : Colors.textPrimary}
                                    />
                                    <Text style={[
                                        styles.optionText,
                                        selectedMeal === opt.value && styles.optionTextSelected
                                    ]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Water logged so far?</Text>
                        <View style={styles.optionsRow}>
                            {WATER_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.optionBtn,
                                        styles.waterOptionBtn,
                                        selectedWater === opt.value && styles.waterOptionBtnSelected
                                    ]}
                                    onPress={() => setSelectedWater(opt.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedWater === opt.value && styles.optionTextSelected
                                    ]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleComplete}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitBtnText}>Start My Day</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    card: {
        width: '100%',
        backgroundColor: Colors.bg,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginTop: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        fontWeight: FontWeight.semibold,
        marginBottom: Spacing.md,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: Radius.full,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    optionBtnSelected: {
        backgroundColor: Colors.green,
        borderColor: Colors.green,
    },
    waterOptionBtn: {
        paddingHorizontal: Spacing.md,
    },
    waterOptionBtnSelected: {
        backgroundColor: '#3B9EFF',
        borderColor: '#3B9EFF',
    },
    optionText: {
        fontSize: FontSize.sm,
        color: Colors.textPrimary,
        fontWeight: FontWeight.medium,
    },
    optionTextSelected: {
        color: Colors.white,
    },
    submitBtn: {
        backgroundColor: Colors.green,
        paddingVertical: Spacing.lg,
        borderRadius: Radius.full,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    submitBtnText: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    }
});
