import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius, FontSize, FontWeight, useThemeColor } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

interface ThemeSettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ThemeSettingsModal({ visible, onClose }: ThemeSettingsModalProps) {
    const themePreference = useAppStore((s) => s.themePreference);
    const setThemePreference = useAppStore((s) => s.setThemePreference);
    const Colors = useThemeColor(); // Subscribe to reactive theme natively

    const OPTIONS: { label: string; value: 'system' | 'light' | 'dark'; icon: keyof typeof Ionicons.glyphMap }[] = [
        { label: "System Default", value: "system", icon: "phone-portrait-outline" },
        { label: "Always Light", value: "light", icon: "sunny-outline" },
        { label: "Always Dark", value: "dark", icon: "moon-outline" },
    ];

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: Colors.overlay,
            justifyContent: 'flex-end',
        },
        sheet: {
            backgroundColor: Colors.bg,
            borderTopLeftRadius: Radius.xl,
            borderTopRightRadius: Radius.xl,
            padding: Spacing.xl,
            paddingBottom: Spacing.xxl,
            width: '100%',
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: Spacing.xl,
        },
        title: {
            fontSize: FontSize.lg,
            fontWeight: FontWeight.bold,
            color: Colors.textPrimary,
        },
        optionBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.md,
            borderRadius: Radius.lg,
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: Colors.border,
            marginBottom: Spacing.sm,
            gap: Spacing.sm,
        },
        optionBtnActive: {
            borderColor: Colors.green,
            backgroundColor: Colors.green + '15',
        },
        optionText: {
            fontSize: FontSize.md,
            color: Colors.textPrimary,
            flex: 1,
        },
        optionTextActive: {
            fontWeight: FontWeight.bold,
            color: Colors.green,
        }
    });

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Display Settings</Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                            <Ionicons name="close" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {OPTIONS.map((opt) => {
                        const isActive = themePreference === opt.value;
                        return (
                            <TouchableOpacity
                                key={opt.value}
                                style={[styles.optionBtn, isActive && styles.optionBtnActive]}
                                onPress={() => setThemePreference(opt.value)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={opt.icon}
                                    size={20}
                                    color={isActive ? Colors.green : Colors.textSecondary}
                                />
                                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                                    {opt.label}
                                </Text>
                                {isActive && (
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </Modal>
    );
}
