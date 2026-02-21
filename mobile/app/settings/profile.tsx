import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../src/constants/theme';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, saveSurvey, surveyAnswers } = useAuthStore();

    const [name, setName] = useState(user?.name || '');
    const [mealsPerDay, setMealsPerDay] = useState(surveyAnswers?.mealsPerDay || '3');
    const [activityLevel, setActivityLevel] = useState(surveyAnswers?.activityLevel || 'moderate');
    const [waterGoal, setWaterGoal] = useState(surveyAnswers?.waterGoal || '2500');

    const handleSave = () => {
        // Mock save implementation
        saveSurvey({
            mealsPerDay,
            activityLevel,
            waterGoal,
        });
        // In a real app we'd update the user name via an API too
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveBtn}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Display Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Your name"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Baseline Preferences</Text>

                    <Text style={styles.subLabel}>Average Meals Per Day</Text>
                    <View style={styles.options}>
                        {['2', '3', '4', '5+'].map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.option, mealsPerDay === opt && styles.optionSelected]}
                                onPress={() => setMealsPerDay(opt)}
                            >
                                <Text style={[styles.optionText, mealsPerDay === opt && styles.optionTextSelected]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.subLabel}>Activity Level</Text>
                    <View style={styles.options}>
                        {['low', 'moderate', 'high'].map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.option, activityLevel === opt && styles.optionSelected]}
                                onPress={() => setActivityLevel(opt)}
                            >
                                <Text style={[styles.optionText, activityLevel === opt && styles.optionTextSelected]}>
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.subLabel}>Daily Water Goal (ml)</Text>
                    <View style={styles.options}>
                        {['1500', '2000', '2500', '3000'].map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.option, waterGoal === opt && styles.optionSelected]}
                                onPress={() => setWaterGoal(opt)}
                            >
                                <Text style={[styles.optionText, waterGoal === opt && styles.optionTextSelected]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={styles.privacyNote}>
                    These preferences help NutriSense AI predict your hunger patterns more accurately.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        color: Colors.textMuted,
        fontSize: FontSize.md,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
    },
    saveBtn: {
        color: Colors.green,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    container: { flex: 1 },
    content: {
        padding: Spacing.lg,
        gap: Spacing.xl,
    },
    inputGroup: {
        gap: Spacing.md,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    subLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: Colors.textPrimary,
        marginTop: Spacing.sm,
    },
    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    option: {
        backgroundColor: Colors.bg,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
    },
    optionSelected: {
        backgroundColor: Colors.green,
        borderColor: Colors.green,
    },
    optionText: {
        fontSize: FontSize.sm,
        color: Colors.textPrimary,
    },
    optionTextSelected: {
        color: Colors.bg,
        fontWeight: FontWeight.bold,
    },
    privacyNote: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
    },
});
