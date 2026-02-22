import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import { useAuthStore } from '../src/store/useAuthStore';
import { Colors as GlobalColors, FontSize, FontWeight, useThemeColor } from '../src/constants/theme';
import ServiceOrchestrator from '../src/services/ServiceOrchestrator';
import BaseRequest from '../src/helpers/services';

// ─── Auth Guard ─────────────────────────────────────────────────────────────────
// Redirects based on auth state:
//   • No token → only allowed on onboarding/* and auth/* screens
//   • Has token → only allowed on (tabs)/* and settings/* screens
//   • Logging out clears the token → redirects to /onboarding/welcome

function useProtectedRoute() {
    const token = useAuthStore((s) => s.token);
    const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const inAuthGroup = segments[0] === 'auth';
        const inOnboarding = segments[0] === 'onboarding';
        const inTabs = segments[0] === '(tabs)';
        const isRoot = !segments[0];

        if (token) {
            // ── Logged in: redirect away from auth/onboarding screens ──
            if (inAuthGroup || inOnboarding || isRoot) {
                router.replace('/(tabs)');
            }
        } else {
            // ── Not logged in: redirect away from protected screens ──
            if (inTabs || segments[0] === 'settings') {
                if (!hasCompletedOnboarding) {
                    router.replace('/onboarding/welcome');
                } else {
                    router.replace('/auth/login');
                }
            }
        }
    }, [token, segments]);
}

export default function RootLayout() {
    const isSplashVisible = useAppStore((s) => s.isSplashVisible);
    const setSplashVisible = useAppStore((s) => s.setSplashVisible);
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    // Dynamic theme
    const Colors = useThemeColor();
    const themePreference = useAppStore((s) => s.themePreference);

    // Restore auth token on app launch
    useEffect(() => {
        const token = useAuthStore.getState().token;
        if (token) {
            BaseRequest.setToken(token);
        }
    }, []);

    useEffect(() => {
        ServiceOrchestrator.start();
        return () => ServiceOrchestrator.stop();
    }, []);

    useEffect(() => {
        if (isSplashVisible) {
            const timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => setSplashVisible(false));
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isSplashVisible]);

    // Auth guard — must be called inside a component that has router context
    useProtectedRoute();

    // Determine status bar variant based on theme context (since we support light overlays now)
    const isLightMode = Colors.bg === '#F8F9FA'; // Or checking `useThemeColor`'s internals

    return (
        <SafeAreaProvider>
            <StatusBar style={isLightMode ? "dark" : "light"} backgroundColor={Colors.bg} />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="onboarding/welcome" />
                <Stack.Screen name="onboarding/permissions" />
                <Stack.Screen name="onboarding/survey" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/register" />
            </Stack>

            {isSplashVisible && (
                <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
                    <View style={styles.logoRow}>
                        <Ionicons name="fitness" size={24} color={Colors.green} />
                        <Text style={styles.logoText}>SPAG</Text>
                    </View>
                    <Text style={styles.tagline}>Your Metabolic Companion</Text>
                </Animated.View>
            )}
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    splash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: GlobalColors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800' as const,
        color: GlobalColors.green,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: FontSize.md,
        color: GlobalColors.green,
        marginTop: 8,
        fontWeight: FontWeight.medium,
    },
});
