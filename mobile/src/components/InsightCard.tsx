import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

export type InsightType = 'info' | 'warning' | 'alert';

export interface InsightData {
    id: string;
    type: InsightType;
    title: string;
    body: string;
}

interface Props extends InsightData {
    onDismiss: (id: string) => void;
}

const TYPE_CONFIG: Record<InsightType, { color: string; bg: string; icon: string }> = {
    info: { color: Colors.green, bg: Colors.greenDim, icon: 'bulb-outline' },
    warning: { color: Colors.warning, bg: Colors.warningDim, icon: 'warning-outline' },
    alert: { color: Colors.danger, bg: Colors.dangerDim, icon: 'alert-circle-outline' },
};

export default function InsightCard({ id, type, title, body, onDismiss }: Props) {
    const cfg = TYPE_CONFIG[type];
    const opacity = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const maxHeight = useRef(new Animated.Value(200)).current;

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: false }),
            Animated.timing(translateX, { toValue: 40, duration: 220, useNativeDriver: false }),
            Animated.timing(maxHeight, { toValue: 0, duration: 280, delay: 100, useNativeDriver: false }),
        ]).start(() => onDismiss(id));
    };

    return (
        <Animated.View
            style={[
                styles.wrap,
                { opacity, transform: [{ translateX }], maxHeight },
            ]}
        >
            {/* Coloured left accent bar */}
            <View style={[styles.accentBar, { backgroundColor: cfg.color }]} />

            <View style={[styles.card, { backgroundColor: cfg.bg }]}>
                {/* Header row */}
                <View style={styles.headerRow}>
                    <Ionicons name={cfg.icon as any} size={16} color={cfg.color} style={{ marginTop: 1 }} />
                    <Text style={[styles.title, { color: cfg.color }]} numberOfLines={2}>
                        {title}
                    </Text>
                    <TouchableOpacity
                        onPress={handleDismiss}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        style={styles.dismissBtn}
                    >
                        <Ionicons name="close" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.body}>{body}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
        overflow: 'hidden',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    accentBar: {
        width: 4,
        borderTopLeftRadius: Radius.md,
        borderBottomLeftRadius: Radius.md,
    },
    card: {
        flex: 1,
        padding: Spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    title: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        lineHeight: 20,
    },
    dismissBtn: {
        paddingLeft: Spacing.xs,
    },
    body: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 19,
    },
});
