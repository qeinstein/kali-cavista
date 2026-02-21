import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import { Colors, FontSize, FontWeight } from '../src/constants/theme';

export default function RootLayout() {
    const isSplashVisible = useAppStore((s) => s.isSplashVisible);
    const setSplashVisible = useAppStore((s) => s.setSplashVisible);
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isSplashVisible) {
            const timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => setSplashVisible(false));
            }, 1500);
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
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>🌿</Text>
                    </View>
                    <Text style={styles.logoText}>NutriSense AI</Text>
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
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.greenDim,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoEmoji: {
        fontSize: 50,
    },
    logoText: {
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: FontSize.md,
        color: Colors.green,
        marginTop: 8,
        fontWeight: FontWeight.medium,
    },
});
