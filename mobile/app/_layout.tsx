import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import { Colors, FontSize, FontWeight } from '../src/constants/theme';
import ServiceOrchestrator from '../src/services/ServiceOrchestrator';

export default function RootLayout() {
    const isSplashVisible = useAppStore((s) => s.isSplashVisible);
    const setSplashVisible = useAppStore((s) => s.setSplashVisible);
    const isHistoricalSyncing = useAppStore((s) => s.isHistoricalSyncing);
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

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

    return (
        <SafeAreaProvider>
            <StatusBar style="light" backgroundColor="#1A1A2E" />
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
                        <Text style={styles.logoText}>NutriSense AI</Text>
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
        backgroundColor: '#1A1A2E',
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
        color: Colors.green,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: FontSize.md,
        color: Colors.green,
        marginTop: 8,
        fontWeight: FontWeight.medium,
    },
});
