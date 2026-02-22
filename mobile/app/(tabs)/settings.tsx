import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useAppStore } from '../../src/store/useAppStore';
import { useAuth } from '../../src/services/api/authService';
import NotificationPreviewCard from '../../src/components/NotificationPreviewCard';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, useThemeColor } from '../../src/constants/theme';
import { sendTestNotification } from '../../src/services/notifications';
import { useNotificationSettings, NotificationSettingsPayload } from '../../src/services/api/notificationService';
import ThemeSettingsModal from '../../src/components/ThemeSettingsModal';

export default function SettingsScreen() {
    const Colors = useThemeColor();
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const { notifications, setNotificationSetting, quietHours } = useSettingsStore();
    const { logout, isLoading: isLoggingOut } = useAuth();
    const apiSettings = useNotificationSettings();
    const [showThemeModal, setShowThemeModal] = useState(false);

    // Hydrate local settings from API on first load
    useEffect(() => {
        const data = apiSettings?.data as NotificationSettingsPayload | null;
        if (data && data.hungerAlerts !== undefined) {
            useSettingsStore.getState().loadFromApi(data);
        }
    }, [apiSettings?.data]);

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => logout().catch(() => { }),
            },
        ]);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.bg }]} edges={['top']}>
            <ThemeSettingsModal visible={showThemeModal} onClose={() => setShowThemeModal(false)} />
            <View style={[styles.header, { borderBottomColor: Colors.border }]}>
                <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Settings</Text>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={[styles.section, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
                    <View style={styles.profileRow}>
                        <View style={[styles.avatar, { backgroundColor: Colors.green }]}>
                            <Text style={[styles.avatarText, { color: Colors.white }]}>
                                {user?.name?.slice(0, 2).toUpperCase() || '??'}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: Colors.textPrimary }]}>{user?.name || 'User'}</Text>
                            <Text style={[styles.profileEmail, { color: Colors.textMuted }]}>{user?.email || 'No email'}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.editBtn, { backgroundColor: Colors.bg, borderColor: Colors.border }]}
                            onPress={() => router.push('/settings/profile')}
                        >
                            <Text style={[styles.editBtnText, { color: Colors.textPrimary }]}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Appearance Settings */}
                <View style={[styles.section, { gap: Spacing.md, backgroundColor: Colors.card, borderColor: Colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Appearance</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => setShowThemeModal(true)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingText}>
                            <Text style={[styles.settingLabel, { color: Colors.textPrimary }]}>App Theme</Text>
                            <Text style={[styles.settingDesc, { color: Colors.textMuted }]}>
                                {useAppStore.getState().themePreference === 'system' ? 'System Default' :
                                    useAppStore.getState().themePreference === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Notification Settings */}
                <View style={[styles.section, { gap: Spacing.md }]}>
                    <Text style={styles.sectionTitle}>Notifications</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Hunger Alerts</Text>
                            <Text style={styles.settingDesc}>Get notified before you get hungry</Text>
                        </View>
                        <Switch
                            value={notifications.hungerAlerts}
                            onValueChange={(v) => setNotificationSetting('hungerAlerts', v)}
                            trackColor={{ true: Colors.green }}
                        />
                    </View>

                    {notifications.hungerAlerts && (
                        <View style={styles.subOption}>
                            <Text style={styles.subOptionLabel}>
                                Alert me {notifications.hungerAlertOffset} mins before
                            </Text>
                            <View style={styles.sliderMock}>
                                {[10, 20, 30, 45].map((val) => (
                                    <TouchableOpacity
                                        key={val}
                                        style={[
                                            styles.sliderPoint,
                                            notifications.hungerAlertOffset === val && styles.sliderPointActive
                                        ]}
                                        onPress={() => setNotificationSetting('hungerAlertOffset', val)}
                                    >
                                        <Text style={[
                                            styles.sliderPointText,
                                            notifications.hungerAlertOffset === val && styles.sliderPointTextActive
                                        ]}>{val}m</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Hydration Alerts</Text>
                            <Text style={styles.settingDesc}>Drink reminders based on output</Text>
                        </View>
                        <Switch
                            value={notifications.hydrationAlerts}
                            onValueChange={(v) => setNotificationSetting('hydrationAlerts', v)}
                            trackColor={{ true: Colors.green }}
                        />
                    </View>

                    {notifications.hydrationAlerts && (
                        <View style={styles.subOption}>
                            <Text style={styles.subOptionLabel}>
                                Alert threshold: {notifications.hydrationThreshold}%
                            </Text>
                            <View style={styles.sliderMock}>
                                {[30, 40, 50, 60, 70].map((val) => (
                                    <TouchableOpacity
                                        key={val}
                                        style={[
                                            styles.sliderPoint,
                                            notifications.hydrationThreshold === val && styles.sliderPointActive
                                        ]}
                                        onPress={() => setNotificationSetting('hydrationThreshold', val)}
                                    >
                                        <Text style={[
                                            styles.sliderPointText,
                                            notifications.hydrationThreshold === val && styles.sliderPointTextActive
                                        ]}>{val}%</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Pattern Nudges</Text>
                            <Text style={styles.settingDesc}>Insights on your eating habits</Text>
                        </View>
                        <Switch
                            value={notifications.patternNudges}
                            onValueChange={(v) => setNotificationSetting('patternNudges', v)}
                            trackColor={{ true: Colors.green }}
                        />
                    </View>
                </View>

                {/* Notification Preview */}
                <View style={styles.previewSection}>
                    <Text style={styles.sectionTitle}>Preview Alerts</Text>
                    <View style={styles.lockScreen}>
                        <Text style={styles.lockTime}>17:42</Text>
                        <Text style={styles.lockDate}>Saturday, February 21</Text>
                        <View style={styles.previewContainer}>
                            <NotificationPreviewCard
                                type="hunger"
                                title="Pre-Hunger Alert"
                                message="Your body usually gets hungry around now after a light breakfast. Prep something!"
                            />
                            <NotificationPreviewCard
                                type="hydration"
                                title="Hydration Warning"
                                message="It's 35°C and you haven't had water in 2.5 hours. Score hit 38% — drink now."
                            />
                            <NotificationPreviewCard
                                type="pattern"
                                title="Pattern Nudge"
                                message="You've skipped lunch 3 times this week. This correlates with low energy. Set reminder?"
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.testBtn}
                        activeOpacity={0.7}
                        onPress={async () => {
                            await sendTestNotification();
                            Alert.alert('Success', 'Test notification sent!');
                        }}
                    >
                        <Text style={styles.testBtnText}>Send Test Notification</Text>
                    </TouchableOpacity>
                </View>

                {/* Quiet Hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quiet Hours</Text>
                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>No alerts between</Text>
                            <Text style={styles.settingDesc}>{quietHours.start} — {quietHours.end}</Text>
                        </View>
                        <TouchableOpacity style={styles.pickerBtn}>
                            <Text style={styles.pickerBtnText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Data & Privacy */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data & Privacy</Text>
                    <TouchableOpacity
                        style={styles.dangerItem}
                        onPress={() => {
                            Alert.alert('Clear Chat History', 'This will permanently delete all your chat messages.', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Clear',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await useAppStore.getState().clearChat();
                                            Alert.alert('Done', 'Chat history cleared.');
                                        } catch {
                                            Alert.alert('Error', 'Failed to clear chat history.');
                                        }
                                    },
                                },
                            ]);
                        }}
                    >
                        <Text style={styles.dangerText}>Clear Chat History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkItem}>
                        <Text style={styles.linkText}>Export My Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dangerItem}>
                        <Text style={[styles.dangerText, { color: '#ff4d4d' }]}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Sign Out */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                        activeOpacity={0.7}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color="#ff4d4d" />
                        ) : (
                            <>
                                <Ionicons name="log-out-outline" size={20} color="#ff4d4d" />
                                <Text style={styles.logoutText}>Sign Out</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
    },
    container: { flex: 1 },
    section: {
        padding: Spacing.lg,
        marginTop: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    profileInfo: { flex: 1 },
    profileName: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    profileEmail: {
        fontSize: FontSize.sm,
    },
    editBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    editBtnText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },

    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingText: { flex: 1 },
    settingLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    settingDesc: {
        fontSize: FontSize.xs,
        marginTop: 2,
    },

    subOption: {
        backgroundColor: Colors.cardAlt,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginTop: -Spacing.xs,
    },
    subOptionLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    sliderMock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Colors.bg,
        borderRadius: Radius.full,
        padding: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sliderPoint: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: Radius.full,
        flex: 1,
        alignItems: 'center',
    },
    sliderPointActive: {
        backgroundColor: Colors.green,
    },
    sliderPointText: {
        fontSize: 10,
        fontWeight: FontWeight.bold,
        color: Colors.textMuted,
    },
    sliderPointTextActive: {
        color: Colors.bg,
    },

    previewSection: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    lockScreen: {
        backgroundColor: '#000',
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        aspectRatio: 0.8,
        alignItems: 'center',
        overflow: 'hidden',
    },
    lockTime: {
        fontSize: 50,
        fontWeight: FontWeight.bold,
        color: '#fff',
        marginTop: 20,
    },
    lockDate: {
        fontSize: FontSize.md,
        color: '#fff',
        marginBottom: 30,
    },
    previewContainer: {
        width: '100%',
    },
    testBtn: {
        marginTop: Spacing.md,
        backgroundColor: Colors.green,
        padding: Spacing.md,
        borderRadius: Radius.lg,
        alignItems: 'center',
    },
    testBtnText: {
        color: Colors.bg,
        fontWeight: FontWeight.bold,
        fontSize: FontSize.md,
    },

    pickerBtn: {
        backgroundColor: Colors.greenDim,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: Radius.full,
    },
    pickerBtnText: {
        color: Colors.green,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },

    dangerItem: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    dangerText: {
        fontSize: FontSize.md,
        color: Colors.textPrimary,
    },
    linkItem: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    linkText: {
        fontSize: FontSize.md,
        color: Colors.textPrimary,
    },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
    },
    logoutText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: '#ff4d4d',
    },
});
