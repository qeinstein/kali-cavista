import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';
import { ChatMessage } from '../store/useAppStore';

interface Props {
    message: ChatMessage;
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBubble({ message }: Props) {
    const isUser = message.role === 'user';
    return (
        <View style={[styles.row, isUser ? styles.rowUser : styles.rowAi]}>
            {!isUser && (
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>🌿</Text>
                </View>
            )}
            <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={[styles.content, isUser ? styles.contentUser : styles.contentAi]}>
                    {message.content}
                </Text>
                <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAi]}>
                    {formatTime(message.timestamp)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        alignItems: 'flex-end',
    },
    rowUser: { justifyContent: 'flex-end' },
    rowAi: { justifyContent: 'flex-start' },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.green,
    },
    avatarText: { fontSize: 16 },
    bubble: {
        maxWidth: '78%',
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    bubbleUser: {
        backgroundColor: Colors.green,
        borderBottomRightRadius: 4,
    },
    bubbleAi: {
        backgroundColor: Colors.card,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    content: {
        fontSize: FontSize.md,
        lineHeight: 22,
    },
    contentUser: { color: Colors.bg },
    contentAi: { color: Colors.textPrimary },
    time: {
        fontSize: FontSize.xs,
        marginTop: 4,
    },
    timeUser: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
    timeAi: { color: Colors.textMuted },
});
