import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

export default function WeatherChip() {
    const weather = useAppStore((s) => s.weather);
    if (!weather) return null;

    const getStatusColor = () => {
        if (weather.temp < 30) return Colors.green;
        if (weather.temp <= 35) return Colors.warning;
        return Colors.danger;
    };

    const getStatusLabel = () => {
        if (weather.temp > 35 || weather.uvIndex > 8) return "High Hydration Risk";
        if (weather.temp > 32) return "Moderate Risk";
        return "Normal Risk";
    };

    const statusColor = getStatusColor();

    return (
        <View style={[styles.container, { borderColor: statusColor + '44' }]}>
            <View style={styles.content}>
                <Ionicons name="location-outline" size={14} color={Colors.textMuted} style={styles.locIcon} />
                <Text style={styles.text} numberOfLines={1}>
                    {weather.city} · {weather.temp}°C · UV {weather.uvIndex} — {getStatusLabel()}
                </Text>
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
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locIcon: {
        marginTop: 1,
    },
    text: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        fontWeight: FontWeight.medium,
        flex: 1,
    },
});
