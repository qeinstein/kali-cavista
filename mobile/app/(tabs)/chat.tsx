import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import ChatBubble from '../../src/components/ChatBubble';
import TypingIndicator from '../../src/components/TypingIndicator';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../src/constants/theme';

export default function ChatScreen() {
    const chatMessages = useAppStore((s) => s.chatMessages);
    const sendChatMessage = useAppStore((s) => s.sendChatMessage);
    const isAiTyping = useAppStore((s) => s.isAiTyping);
    const fetchChatHistory = useAppStore((s) => s.fetchChatHistory);
    const clearChat = useAppStore((s) => s.clearChat);
    const [input, setInput] = useState('');
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
        // Load real chat history when the ChatScreen is mounted
        fetchChatHistory();
    }, []);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isAiTyping) return;
        setInput('');
        await sendChatMessage(text);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerAvatar}>
                    <Text style={{ fontSize: 22 }}>🌿</Text>
                </View>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>SPAG AI</Text>
                    <View style={styles.onlineRow}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Health Companion</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={clearChat} style={styles.clearBtn} activeOpacity={0.7}>
                    <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
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
                                    <TypingIndicator />
                                </View>
                            </View>
                        ) : null
                    }
                />

                <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                        <Text style={styles.iconText}>🎙️</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Message SPAG AI..."
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        maxLength={500}
                    />

                    <TouchableOpacity
                        style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!input.trim() || isAiTyping}
                    >
                        <Text style={styles.sendIcon}>🏹</Text>
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
        backgroundColor: Colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.green,
    },
    headerTitleContainer: {
        flex: 1, // Let this container take up the remaining space
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
    },
    clearBtn: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.sm,
        backgroundColor: Colors.cardAlt,
    },
    clearBtnText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },
    onlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.green,
    },
    onlineText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: FontWeight.medium,
    },

    messagesList: {
        paddingVertical: Spacing.md,
        paddingBottom: Spacing.lg,
    },

    typingRow: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xs,
        alignItems: 'flex-start',
    },
    typingBubble: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.bg,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.cardAlt,
    },
    iconText: {
        fontSize: 20,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        borderWidth: 1,
        borderColor: Colors.border,
        maxHeight: 120,
    },
    sendBtn: {
        width: 44,
        height: 44,
        backgroundColor: Colors.green,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: Colors.border,
    },
    sendIcon: {
        fontSize: 20,
        color: Colors.bg,
    },
});
