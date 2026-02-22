import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../src/constants/theme';
import { useProfileService } from '../../src/services/api/profileService';

export default function EditProfileScreen() {
    const router = useRouter();
    const { data: profile, isLoading, isSaving, saveError, save } = useProfileService();

    const [name, setName] = useState('');
    const [mealsPerDay, setMealsPerDay] = useState('3');
    const [activityLevel, setActivityLevel] = useState('moderate');
    const [waterGoal, setWaterGoal] = useState('2500');

    // Sync form state when profile data arrives
    React.useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setMealsPerDay(profile.baseline?.mealsPerDay?.toString() || '3');
            setActivityLevel(profile.baseline?.activityLevel || 'moderate');
            setWaterGoal(profile.baseline?.waterTargetMl?.toString() || '2500');
        }
    }, [profile]);

    const handleSave = async () => {
        try {
            await save({
                name: name.trim(),
                baseline: {
                    mealsPerDay: parseInt(mealsPerDay) || 3,
                    activityLevel,
                    waterTargetMl: parseInt(waterGoal) || 2500,
                },
            });
            router.back();
        } catch {
            Alert.alert('Error', saveError || 'Failed to save profile');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.headerBtn}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color={Colors.green} />
                    ) : (
                        <Text style={styles.saveBtn}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Error banner */}
            {saveError ? (
                <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                    <Text style={styles.errorText}>{saveError}</Text>
                </View>
            ) : null}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.green} />
                    <Text style={styles.loadingText}>Loading profile…</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {name?.slice(0, 2).toUpperCase() || '??'}
                            </Text>
                        </View>
                        <Text style={styles.emailLabel}>{profile?.email || ''}</Text>
                    </View>

                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Display Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your name"
                            placeholderTextColor={Colors.textMuted}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Baseline Preferences */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Baseline Preferences</Text>

                        <Text style={styles.subLabel}>Average Meals Per Day</Text>
                        <View style={styles.options}>
                            {['2', '3', '4', '5'].map((opt) => (
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
                                    style={[styles.option, styles.optionWide, activityLevel === opt && styles.optionSelected]}
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
                        These preferences help SPAG predict your hunger patterns more accurately.
                    </Text>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    loadingText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerBtn: {
        minWidth: 50,
        alignItems: 'center',
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
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.dangerDim,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.danger,
    },
    errorText: { fontSize: FontSize.sm, color: Colors.danger, flex: 1 },
    container: { flex: 1 },
    content: {
        padding: Spacing.lg,
        gap: Spacing.xl,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: Colors.bg,
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
    },
    emailLabel: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
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
        paddingVertical: 14,
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
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.lg,
        paddingVertical: 10,
        minWidth: 56,
        alignItems: 'center',
    },
    optionWide: {
        flex: 1,
    },
    optionSelected: {
        backgroundColor: Colors.green,
        borderColor: Colors.green,
    },
    optionText: {
        fontSize: FontSize.sm,
        color: Colors.textPrimary,
        fontWeight: FontWeight.medium,
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
