import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/useAuthStore';

const { width } = Dimensions.get('window');

interface Question {
    question: string;
    field: 'mealsPerDay' | 'activityLevel' | 'waterGoal';
    icon: string;
    options: { label: string; sub?: string }[];
}

const QUESTIONS: Question[] = [
    {
        question: 'How many meals do you eat per day?',
        field: 'mealsPerDay',
        icon: 'restaurant',
        options: [
            { label: '2', sub: 'Two meals' },
            { label: '3', sub: 'Three meals' },
            { label: '4+', sub: 'Four or more' },
        ],
    },
    {
        question: 'How active are you?',
        field: 'activityLevel',
        icon: 'fitness',
        options: [
            { label: 'Sedentary', sub: 'Mostly desk-based' },
            { label: 'Moderate', sub: 'Some walks & exercise' },
            { label: 'Active', sub: 'Regular workouts' },
        ],
    },
    {
        question: 'Daily water goal?',
        field: 'waterGoal',
        icon: 'water',
        options: [
            { label: '1L', sub: '1,000 ml' },
            { label: '1.5L', sub: '1,500 ml' },
            { label: '2L', sub: '2,000 ml' },
            { label: '2.5L+', sub: '2,500 ml+' },
        ],
    },
];

export default function SurveyScreen() {
    const router = useRouter();
    const saveSurvey = useAuthStore((s) => s.saveSurvey);
    const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const current = QUESTIONS[step];
    const selected = answers[current.field];

    const animateTransition = (cb: () => void) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            cb();
            slideAnim.setValue(40);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
            ]).start();
        });
    };

    const handleSelect = (val: string) => {
        setAnswers((a) => ({ ...a, [current.field]: val }));
    };

    const handleContinue = () => {
        if (!selected) return;
        if (step < QUESTIONS.length - 1) {
            animateTransition(() => setStep((s) => s + 1));
        } else {
            // Save answers and complete onboarding
            const finalAnswers = {
                mealsPerDay: answers.mealsPerDay ?? '',
                activityLevel: answers.activityLevel ?? '',
                waterGoal: answers.waterGoal ?? selected,
            };
            saveSurvey(finalAnswers);
            completeOnboarding();
            router.push('/auth/register');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Progress */}
            <View style={styles.progressRow}>
                {QUESTIONS.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.progressDot,
                            i === step && styles.progressDotActive,
                            i < step && styles.progressDotDone,
                        ]}
                    />
                ))}
            </View>

            <Animated.View
                style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
                {/* Question header */}
                <View style={styles.qHeader}>
                    <View style={styles.qEmojiWrap}>
                        <Ionicons name={current.icon as any} size={32} color={Colors.green} />
                    </View>
                    <Text style={styles.stepLabel}>Question {step + 1} of {QUESTIONS.length}</Text>
                    <Text style={styles.question}>{current.question}</Text>
                </View>

                {/* Answer cards */}
                <View style={styles.options}>
                    {current.options.map((opt) => {
                        const isSelected = selected === opt.label;
                        return (
                            <TouchableOpacity
                                key={opt.label}
                                style={[
                                    styles.optCard,
                                    isSelected && styles.optCardSelected,
                                ]}
                                onPress={() => handleSelect(opt.label)}
                                activeOpacity={0.75}
                            >
                                <View style={styles.optInner}>
                                    <Text style={[styles.optLabel, isSelected && styles.optLabelSelected]}>
                                        {opt.label}
                                    </Text>
                                    {opt.sub && (
                                        <Text style={[styles.optSub, isSelected && styles.optSubSelected]}>
                                            {opt.sub}
                                        </Text>
                                    )}
                                </View>
                                <View style={[styles.optRadio, isSelected && styles.optRadioSelected]}>
                                    {isSelected && <View style={styles.optRadioFill} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Animated.View>

            {/* Continue button */}
            <View style={styles.bottom}>
                <TouchableOpacity
                    style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
                    onPress={handleContinue}
                    disabled={!selected}
                    activeOpacity={0.85}
                >
                    <Text style={styles.continueBtnText}>
                        {step < QUESTIONS.length - 1 ? 'Continue' : 'Finish Setup'}
                    </Text>
                    <Text style={styles.continueBtnArrow}>→</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    progressDot: {
        width: 28,
        height: 5,
        borderRadius: 3,
        backgroundColor: Colors.border,
    },
    progressDotActive: {
        backgroundColor: Colors.green,
        width: 48,
    },
    progressDotDone: {
        backgroundColor: Colors.green + '88',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
    },
    qHeader: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    qEmojiWrap: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.green,
    },
    stepLabel: {
        fontSize: FontSize.xs,
        color: Colors.green,
        fontWeight: FontWeight.semibold,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
    },
    question: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 30,
    },
    options: { gap: Spacing.sm },
    optCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    optCardSelected: {
        borderColor: Colors.green,
        backgroundColor: Colors.greenDim,
    },
    optInner: { flex: 1 },
    optLabel: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
    },
    optLabelSelected: { color: Colors.greenBright },
    optSub: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    optSubSelected: { color: Colors.green },
    optRadio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optRadioSelected: { borderColor: Colors.green },
    optRadioFill: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: Colors.green,
    },
    bottom: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    continueBtn: {
        backgroundColor: Colors.green,
        borderRadius: Radius.xl,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    continueBtnDisabled: {
        backgroundColor: Colors.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    continueBtnText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.white,
    },
    continueBtnArrow: { fontSize: FontSize.md, color: Colors.white },
});
