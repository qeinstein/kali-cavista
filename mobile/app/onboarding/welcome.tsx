import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants/theme';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const glowAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 900,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 60,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulsing glow loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1800,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.6,
                    duration: 1800,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background decoration */}
            <Animated.View style={[styles.glow, { opacity: glowAnim }]} />
            <View style={styles.glowInner} />

            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                {/* Logo */}
                <Animated.View style={[styles.logoWrap, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.logoCircleOuter}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoEmoji}>🧬</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* App name */}
                <Text style={styles.appName}>NutriSense</Text>
                <Text style={styles.appNameAccent}>AI</Text>

                {/* Tagline */}
                <Text style={styles.tagline}>
                    We learn your body so you don't have to think about it
                </Text>

                {/* Features preview */}
                <View style={styles.features}>
                    {[
                        { icon: '🔮', text: 'Predicts hunger before it hits' },
                        { icon: '💧', text: 'Tracks hydration intelligently' },
                        { icon: '📊', text: 'Learns your personal patterns' },
                    ].map(({ icon, text }) => (
                        <View key={text} style={styles.featureRow}>
                            <Text style={styles.featureIcon}>{icon}</Text>
                            <Text style={styles.featureText}>{text}</Text>
                        </View>
                    ))}
                </View>
            </Animated.View>

            {/* CTA */}
            <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.getStartedBtn}
                    onPress={() => router.push('/onboarding/permissions')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.getStartedText}>Get Started</Text>
                    <Text style={styles.getStartedArrow}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/auth/login')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.loginLink}>
                        Already have an account?{' '}
                        <Text style={styles.loginLinkGreen}>Sign in</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.xxl,
        paddingTop: 60,
    },
    glow: {
        position: 'absolute',
        top: -80,
        alignSelf: 'center',
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: Colors.green,
        opacity: 0.12,
    },
    glowInner: {
        position: 'absolute',
        top: -20,
        alignSelf: 'center',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: Colors.green,
        opacity: 0.06,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
    },
    logoWrap: {
        marginBottom: Spacing.lg,
    },
    logoCircleOuter: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: Colors.green,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.cardAlt,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.greenLight,
    },
    logoEmoji: { fontSize: 36 },
    appName: {
        fontSize: 38,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    appNameAccent: {
        fontSize: 38,
        fontWeight: FontWeight.extrabold,
        color: Colors.green,
        letterSpacing: -0.5,
        marginTop: -10,
    },
    tagline: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.sm,
    },
    features: {
        width: '100%',
        gap: Spacing.sm,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.md,
    },
    featureIcon: { fontSize: 20 },
    featureText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: FontWeight.medium,
    },
    bottom: {
        width: '100%',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.md,
        alignItems: 'center',
    },
    getStartedBtn: {
        width: '100%',
        backgroundColor: Colors.green,
        borderRadius: Radius.xl,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    getStartedText: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.white,
        letterSpacing: 0.3,
    },
    getStartedArrow: {
        fontSize: FontSize.lg,
        color: Colors.white,
    },
    loginLink: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },
    loginLinkGreen: {
        color: Colors.green,
        fontWeight: FontWeight.semibold,
    },
});
