import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

interface Props {
    type: 'hunger' | 'hydration' | 'pattern';
    title: string;
    message: string;
    time?: string;
}

export default function NotificationPreviewCard({ type, title, message, time = 'now' }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.appIcon}>
                    <Ionicons name="fitness" size={12} color={Colors.green} />
                </View>
                <Text style={styles.appName}>NUTRISENSE</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.time}>{time}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message} numberOfLines={2}>{message}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    appIcon: {
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    appName: {
        fontSize: 10,
        fontWeight: FontWeight.bold,
        color: Colors.textSecondary,
        letterSpacing: 1,
    },
    dot: {
        fontSize: 10,
        color: Colors.textMuted,
        marginHorizontal: 4,
    },
    time: {
        fontSize: 10,
        color: Colors.textMuted,
    },
    content: {},
    title: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    message: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
});
