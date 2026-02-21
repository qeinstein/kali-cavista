import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import ChatBubble from '../../src/components/ChatBubble';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../src/constants/theme';

const SUGGESTIONS = [
    "When will I be hungry?",
    "How's my hydration?",
    "What should I eat now?",
    "Show my patterns",
];

export default function ChatScreen() {
    const chatMessages = useAppStore((s) => s.chatMessages);
    const sendChatMessage = useAppStore((s) => s.sendChatMessage);
    const isAiTyping = useAppStore((s) => s.isAiTyping);
    const [input, setInput] = useState('');
    const listRef = useRef<FlatList>(null);

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;
        setInput('');
        await sendChatMessage(text);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const handleSuggestion = (text: string) => {
        setInput(text);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerAvatar}>
                        <Text style={{ fontSize: 22 }}>🤖</Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Companion AI</Text>
                        <View style={styles.onlineRow}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>Always online</Text>
                        </View>
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    ref={listRef}
                    data={chatMessages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChatBubble message={item} />}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        isAiTyping ? (
                            <View style={styles.typingRow}>
                                <View style={styles.typingBubble}>
                                    <ActivityIndicator size="small" color={Colors.teal} />
                                    <Text style={styles.typingText}>Thinking…</Text>
                                </View>
                            </View>
                        ) : null
                    }
                />

                {/* Suggestion chips */}
                {chatMessages.length <= 1 && (
                    <View style={styles.suggestions}>
                        {SUGGESTIONS.map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={styles.chip}
                                onPress={() => handleSuggestion(s)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.chipText}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Input bar */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask your AI companion…"
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        maxLength={300}
                        returnKeyType="send"
                        onSubmitEditing={handleSend}
                        blurOnSubmit
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!input.trim() || isAiTyping}
                    >
                        <Text style={styles.sendIcon}>➤</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg },
    flex: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.bg,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.tealDim,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.teal,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        color: Colors.textPrimary,
    },
    onlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: Colors.teal,
    },
    onlineText: {
        fontSize: FontSize.xs,
        color: Colors.teal,
    },

    messagesList: {
        paddingVertical: Spacing.md,
        paddingBottom: Spacing.sm,
    },

    typingRow: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xs,
        alignItems: 'flex-start',
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.cardAlt,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    typingText: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        fontStyle: 'italic',
    },

    suggestions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    chip: {
        backgroundColor: Colors.tealDim,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.teal,
    },
    chipText: {
        fontSize: FontSize.sm,
        color: Colors.teal,
        fontWeight: FontWeight.medium,
    },

    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.bg,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        borderWidth: 1,
        borderColor: Colors.border,
        maxHeight: 120,
    },
    sendBtn: {
        width: 44,
        height: 44,
        backgroundColor: Colors.teal,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: Colors.border,
    },
    sendIcon: {
        color: Colors.bg,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
});
