import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants/theme';
import { useAuth, useGoogleAuth } from '../../src/services/api/authService';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error } = useAuth();
    const { promptAsync, isLoading: isGoogleLoading, error: googleError } = useGoogleAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email.trim() || password.length < 6) return;
        try {
            await login({ email: email.trim(), password });
            router.replace('/(tabs)');
        } catch {
            // error handled in hook
        }
    };

    const handleGoogle = async () => {
        try {
            await promptAsync();
        } catch {
            // error handled in hook
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.logoWrap}>
                                <Text style={styles.logoEmoji}>🧬</Text>
                            </View>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Sign in to your NutriSense account</Text>
                        </View>

                        {/* Error */}
                        {error ? (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>⚠️ {error}</Text>
                            </View>
                        ) : null}

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="alex@email.com"
                                    placeholderTextColor={Colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>Password</Text>
                                    <TouchableOpacity activeOpacity={0.7}>
                                        <Text style={styles.forgotText}>Forgot?</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.passWrap}>
                                    <TextInput
                                        style={[styles.input, styles.passInput]}
                                        placeholder="Your password"
                                        placeholderTextColor={Colors.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPass}
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeBtn}
                                        onPress={() => setShowPass(!showPass)}
                                    >
                                        <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Sign In button */}
                        <TouchableOpacity
                            style={[
                                styles.primaryBtn,
                                (!email || password.length < 6) && styles.primaryBtnDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading || !email || password.length < 6}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.primaryBtnText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google */}
                        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
                            <Text style={styles.googleIcon}>🇬</Text>
                            <Text style={styles.googleText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* Register link */}
                        <TouchableOpacity
                            onPress={() => router.replace('/auth/register')}
                            activeOpacity={0.7}
                            style={styles.registerLink}
                        >
                            <Text style={styles.registerLinkText}>
                                Don't have an account?{' '}
                                <Text style={styles.registerLinkAccent}>Create one</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    flex: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center' },
    inner: { padding: Spacing.lg, paddingTop: Spacing.xl },
    header: { alignItems: 'center', marginBottom: Spacing.xl },
    logoWrap: {
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
    logoEmoji: { fontSize: 30 },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    errorBanner: {
        backgroundColor: Colors.dangerDim,
        borderRadius: Radius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.danger,
        marginBottom: Spacing.md,
    },
    errorText: { fontSize: FontSize.sm, color: Colors.danger },
    form: { gap: Spacing.md, marginBottom: Spacing.lg },
    inputGroup: { gap: Spacing.xs },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        color: Colors.textSecondary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    forgotText: {
        fontSize: FontSize.xs,
        color: Colors.green,
        fontWeight: FontWeight.medium,
    },
    input: {
        backgroundColor: Colors.card,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    passWrap: { position: 'relative' },
    passInput: { paddingRight: 50 },
    eyeBtn: {
        position: 'absolute',
        right: Spacing.md,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    eyeIcon: { fontSize: 18 },
    primaryBtn: {
        backgroundColor: Colors.green,
        borderRadius: Radius.xl,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: Spacing.lg,
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryBtnDisabled: {
        backgroundColor: Colors.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryBtnText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.white,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: { fontSize: FontSize.xs, color: Colors.textMuted },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.xl,
    },
    googleIcon: { fontSize: 18 },
    googleText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.textPrimary,
    },
    registerLink: { alignItems: 'center' },
    registerLinkText: { fontSize: FontSize.sm, color: Colors.textMuted },
    registerLinkAccent: { color: Colors.green, fontWeight: FontWeight.semibold },
});
