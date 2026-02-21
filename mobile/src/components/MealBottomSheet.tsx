import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
    Pressable,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { MealSize } from '../store/useAppStore';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (size: MealSize) => void;
}

const MEAL_OPTIONS: {
    size: MealSize;
    emoji: string;
    label: string;
    desc: string;
    color: string;
}[] = [
        {
            size: 'light',
            emoji: '🥗',
            label: 'Light',
            desc: 'A snack or small portion',
            color: Colors.green,
        },
        {
            size: 'medium',
            emoji: '🍽️',
            label: 'Medium',
            desc: 'A balanced regular meal',
            color: Colors.warning,
        },
        {
            size: 'heavy',
            emoji: '🥩',
            label: 'Heavy',
            desc: 'A full, filling meal',
            color: Colors.danger,
        },
    ];

type Phase = 'select' | 'success';

export default function MealBottomSheet({ visible, onClose, onSelect }: Props) {
    const slideAnim = useRef(new Animated.Value(400)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    // Success animation values
    const checkScale = useRef(new Animated.Value(0)).current;
    const checkOpacity = useRef(new Animated.Value(0)).current;
    const successTextOpacity = useRef(new Animated.Value(0)).current;

    const [selectedSize, setSelectedSize] = useState<MealSize | null>(null);
    const [phase, setPhase] = useState<Phase>('select');

    // Reset state when sheet opens
    useEffect(() => {
        if (visible) {
            setSelectedSize(null);
            setPhase('select');
            checkScale.setValue(0);
            checkOpacity.setValue(0);
            successTextOpacity.setValue(0);

            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 65,
                    friction: 9,
                    useNativeDriver: true,
                }),
                Animated.timing(bgAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 400,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(bgAnim, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleLogMeal = () => {
        if (!selectedSize) return;

        // Transition to success phase
        setPhase('success');

        // Mock POST /meals/log — then fire callback
        onSelect(selectedSize);

        // Animate success checkmark in
        Animated.sequence([
            Animated.parallel([
                Animated.spring(checkScale, {
                    toValue: 1,
                    tension: 180,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(checkOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(successTextOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Auto-dismiss after brief pause
            setTimeout(() => {
                onClose();
            }, 700);
        });
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, { opacity: bgAnim }]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={phase === 'select' ? onClose : undefined} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                {/* Handle */}
                <View style={styles.handle} />

                {phase === 'select' ? (
                    <>
                        {/* Title */}
                        <Text style={styles.title}>How big was your meal?</Text>
                        <Text style={styles.subtitle}>
                            This trains your personal hunger model
                        </Text>

                        {/* Side-by-side cards */}
                        <View style={styles.cardsRow}>
                            {MEAL_OPTIONS.map((opt) => {
                                const isSelected = selectedSize === opt.size;
                                return (
                                    <TouchableOpacity
                                        key={opt.size}
                                        style={[
                                            styles.card,
                                            { borderColor: isSelected ? opt.color : Colors.border },
                                            isSelected && { backgroundColor: opt.color + '18' },
                                        ]}
                                        onPress={() => setSelectedSize(opt.size)}
                                        activeOpacity={0.8}
                                    >
                                        {/* Check badge */}
                                        {isSelected && (
                                            <View style={[styles.checkBadge, { backgroundColor: opt.color }]}>
                                                <Text style={styles.checkBadgeText}>✓</Text>
                                            </View>
                                        )}

                                        <Text style={styles.cardEmoji}>{opt.emoji}</Text>
                                        <Text
                                            style={[
                                                styles.cardLabel,
                                                { color: isSelected ? opt.color : Colors.textPrimary },
                                            ]}
                                        >
                                            {opt.label}
                                        </Text>
                                        <Text style={styles.cardDesc}>{opt.desc}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Log Meal button */}
                        <TouchableOpacity
                            style={[
                                styles.logBtn,
                                !selectedSize && styles.logBtnDisabled,
                            ]}
                            onPress={handleLogMeal}
                            disabled={!selectedSize}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.logBtnText}>
                                {selectedSize ? `Log ${selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)} Meal` : 'Log Meal'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.cancel}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    /* Success state */
                    <View style={styles.successWrap}>
                        <Animated.View
                            style={[
                                styles.successCircle,
                                { opacity: checkOpacity, transform: [{ scale: checkScale }] },
                            ]}
                        >
                            <Text style={styles.successCheck}>✓</Text>
                        </Animated.View>
                        <Animated.Text style={[styles.successTitle, { opacity: successTextOpacity }]}>
                            Meal logged!
                        </Animated.Text>
                        <Animated.Text style={[styles.successSub, { opacity: successTextOpacity }]}>
                            Updating your hunger prediction…
                        </Animated.Text>
                    </View>
                )}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.card,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        paddingHorizontal: Spacing.lg,
        paddingBottom: 44,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderColor: Colors.border,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.border,
        marginBottom: Spacing.lg,
    },

    // Select phase
    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    cardsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Colors.bg,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xs,
        borderWidth: 2,
        position: 'relative',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBadgeText: {
        fontSize: 11,
        color: Colors.white,
        fontWeight: FontWeight.bold,
    },
    cardEmoji: {
        fontSize: 32,
        marginBottom: Spacing.sm,
    },
    cardLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        marginBottom: 4,
        textAlign: 'center',
    },
    cardDesc: {
        fontSize: 10,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 14,
    },

    logBtn: {
        backgroundColor: Colors.green,
        borderRadius: Radius.xl,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: Spacing.sm,
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    logBtnDisabled: {
        backgroundColor: Colors.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    logBtnText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.white,
    },
    cancel: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    cancelText: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },

    // Success phase
    successWrap: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        gap: Spacing.md,
    },
    successCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.green,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 18,
        elevation: 10,
    },
    successCheck: {
        fontSize: 38,
        color: Colors.white,
        fontWeight: FontWeight.bold,
    },
    successTitle: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
    },
    successSub: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
});
