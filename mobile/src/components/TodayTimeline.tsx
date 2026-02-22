import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { MealLog, WaterLog } from '../store/useAppStore';

interface Props {
    meals: MealLog[];
    waterLogs: WaterLog[];
}

interface TimelineEvent {
    id: string;
    type: 'meal' | 'water';
    timestamp: string;
    label: string;
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function TodayTimeline({ meals, waterLogs }: Props) {
    const today = new Date().toISOString().slice(0, 10);

    const events: TimelineEvent[] = [
        ...meals
            .filter((m) => m.timestamp.startsWith(today))
            .map((m) => ({
                id: m.id,
                type: 'meal' as const,
                timestamp: m.timestamp,
                label: m.size.charAt(0).toUpperCase() + m.size.slice(1),
            })),
        ...waterLogs
            .filter((w) => w.timestamp.startsWith(today))
            .map((w) => ({
                id: w.id,
                type: 'water' as const,
                timestamp: w.timestamp,
                label: `${w.amountMl}ml`,
            })),
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return (
        <View style={styles.wrap}>
            <Text style={styles.sectionTitle}>Today's Timeline</Text>

            {events.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="list-outline" size={18} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>Nothing logged yet today</Text>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                >
                    {/* Timeline line */}
                    <View style={styles.lineWrap}>
                        <View style={styles.line} />
                        {events.map((ev, i) => (
                            <View key={ev.id} style={styles.eventWrap}>
                                {/* Dot + icon */}
                                <View
                                    style={[
                                        styles.iconCircle,
                                        ev.type === 'meal'
                                            ? styles.mealCircle
                                            : styles.waterCircle,
                                    ]}
                                >
                                    <Ionicons
                                        name={ev.type === 'meal' ? "restaurant" : "water"}
                                        size={20}
                                        color={ev.type === 'meal' ? Colors.green : "#3B82F6"}
                                    />
                                </View>

                                {/* Labels */}
                                <Text style={styles.eventLabel}>{ev.label}</Text>
                                <Text style={styles.eventTime}>{formatTime(ev.timestamp)}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginBottom: Spacing.md },
    sectionTitle: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: FontWeight.semibold,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
    },
    empty: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.card,
        borderRadius: Radius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    emptyText: { fontSize: FontSize.sm, color: Colors.textMuted },
    scroll: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xs },
    lineWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        position: 'relative',
    },
    line: {
        position: 'absolute',
        top: 22,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: Colors.border,
        zIndex: 0,
    },
    eventWrap: {
        alignItems: 'center',
        width: 64,
        zIndex: 1,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        borderWidth: 1.5,
    },
    mealCircle: {
        backgroundColor: Colors.greenDim,
        borderColor: Colors.green,
    },
    waterCircle: {
        backgroundColor: 'rgba(59,130,246,0.15)',
        borderColor: '#3B82F6',
    },
    eventLabel: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        fontWeight: FontWeight.medium,
        textAlign: 'center',
    },
    eventTime: {
        fontSize: 10,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: 1,
    },
});
