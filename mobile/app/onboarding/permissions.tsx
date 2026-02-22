import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants/theme';

const PERMISSIONS = [
    {
        icon: '🏥',
        title: 'Health Data',
        description: 'Track your meals & hydration to build your personal nutrition model',
        color: Colors.green,
    },
    {
        icon: '📍',
        title: 'Location',
        description: 'Detect active commutes to dynamically adjust your hunger predictions',
        color: '#3498DB',
    },
    {
        icon: '🔔',
        title: 'Notifications',
        description: 'Send smart nudges right when you\'re predicted to get hungry',
        color: Colors.warning,
    },
];

export default function PermissionsScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIconWrap}>
                        <Text style={styles.headerIcon}>🔐</Text>
                    </View>
                    <Text style={styles.title}>Before we begin</Text>
                    <Text style={styles.subtitle}>
                        NutriSense needs a few permissions to give you accurate, personalised insights.
                    </Text>
                </View>

                {/* Permission cards */}
                <ScrollView style={styles.scroll} contentContainerStyle={styles.cards} showsVerticalScrollIndicator={false}>
                    {PERMISSIONS.map((perm, i) => (
                        <Animated.View
                            key={perm.title}
                            style={[
                                styles.card,
                                {
                                    opacity: fadeAnim,
                                    transform: [{
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 30],
                                            outputRange: [0, 30 + i * 15],
                                        }),
                                    }],
                                },
                            ]}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: perm.color + '22' }]}>
                                <Text style={styles.permIcon}>{perm.icon}</Text>
                            </View>
                            <View style={styles.permText}>
                                <Text style={styles.permTitle}>{perm.title}</Text>
                                <Text style={styles.permDesc}>{perm.description}</Text>
                            </View>
                            <View style={[styles.checkDot, { backgroundColor: perm.color }]}>
                                <Text style={styles.checkMark}>✓</Text>
                            </View>
                        </Animated.View>
                    ))}

                    {/* Privacy note */}
                    <View style={styles.privacyNote}>
                        <Text style={styles.privacyIcon}>🔒</Text>
                        <Text style={styles.privacyText}>
                            Your data is encrypted and never sold. You can revoke access any time in Settings.
                        </Text>
                    </View>
                </ScrollView>

                {/* CTA */}
                <View style={styles.bottom}>
                    <TouchableOpacity
                        style={styles.allowBtn}
                        onPress={() => router.push('/onboarding/survey')}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.allowBtnText}>Allow & Continue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/onboarding/survey')} activeOpacity={0.7}>
                        <Text style={styles.skipText}>Skip for now</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    inner: { flex: 1, paddingHorizontal: Spacing.lg },
    header: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
    headerIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.green,
    },
    headerIcon: { fontSize: 32 },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: Spacing.md,
    },
    scroll: { flex: 1 },
    cards: { gap: Spacing.sm, paddingBottom: Spacing.md },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.md,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permIcon: { fontSize: 24 },
    permText: { flex: 1 },
    permTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    permDesc: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        lineHeight: 17,
    },
    checkDot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkMark: { fontSize: 13, color: Colors.white, fontWeight: FontWeight.bold },
    privacyNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        backgroundColor: Colors.greenDim,
        borderRadius: Radius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.green,
        marginTop: Spacing.xs,
    },
    privacyIcon: { fontSize: 16 },
    privacyText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 17 },
    bottom: { paddingVertical: Spacing.lg, gap: Spacing.md, alignItems: 'center' },
    allowBtn: {
        width: '100%',
        backgroundColor: Colors.green,
        borderRadius: Radius.xl,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    allowBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
    skipText: { fontSize: FontSize.sm, color: Colors.textMuted },
});
