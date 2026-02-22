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
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants/theme';
import { useAuth, useGoogleAuth } from '../../src/services/api/authService';

export default function RegisterScreen() {
    const router = useRouter();
    const { register, isLoading, error } = useAuth();
    const { promptAsync, isLoading: isGoogleLoading, error: googleError } = useGoogleAuth();

    const [name, setName] = useState('');
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

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || password.length < 6) return;
        try {
            await register({
                name: name.trim(),
                email: email.trim(),
                password,
                water_goal_ml: 2000, // Default values as per requirements or onboarding
                meal_frequency: 3,
                activity_level: 'moderate'
            });
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
                                <Ionicons name="fitness" size={32} color={Colors.green} />
                            </View>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join NutriSense and start tracking smarter</Text>
                        </View>

                        {/* Error */}
                        {error ? (
                            <View style={styles.errorBanner}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            </View>
                        ) : null}

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Alex Johnson"
                                    placeholderTextColor={Colors.textMuted}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />
                            </View>

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
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.passWrap}>
                                    <TextInput
                                        style={[styles.input, styles.passInput]}
                                        placeholder="Min. 6 characters"
                                        placeholderTextColor={Colors.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPass}
                                        returnKeyType="done"
                                        onSubmitEditing={handleRegister}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeBtn}
                                        onPress={() => setShowPass(!showPass)}
                                    >
                                        <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color={Colors.textMuted} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Register button */}
                        <TouchableOpacity
                            style={[
                                styles.primaryBtn,
                                (!name || !email || password.length < 6) && styles.primaryBtnDisabled,
                            ]}
                            onPress={handleRegister}
                            disabled={isLoading || !name || !email || password.length < 6}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.primaryBtnText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or sign up with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google */}
                        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
                            <Ionicons name="logo-google" size={20} color={Colors.textPrimary} />
                            <Text style={styles.googleText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* Login link */}
                        <TouchableOpacity
                            onPress={() => router.replace('/auth/login')}
                            activeOpacity={0.7}
                            style={styles.loginLink}
                        >
                            <Text style={styles.loginLinkText}>
                                Already have an account?{' '}
                                <Text style={styles.loginLinkAccent}>Sign in</Text>
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
    label: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        color: Colors.textSecondary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
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
    googleText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.textPrimary,
    },
    loginLink: { alignItems: 'center' },
    loginLinkText: { fontSize: FontSize.sm, color: Colors.textMuted },
    loginLinkAccent: { color: Colors.green, fontWeight: FontWeight.semibold },
});
