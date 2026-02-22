import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

interface Props {
    visible: boolean;
    message?: string;
}

/**
 * Brief overlay toast that slides up, holds, then fades out.
 * Once mounted (on first visible=true), the component is always
 * present in the tree — animation state controls visibility.
 */
export default function WaterToast({ visible, message = '💧 +250ml logged!' }: Props) {
    const [everVisible, setEverVisible] = useState(false);
    const translateY = useRef(new Animated.Value(60)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // Mount permanently once shown for the first time
    useEffect(() => {
        if (visible) setEverVisible(true);
    }, [visible]);

    useEffect(() => {
        if (!visible) return;

        // Reset to starting position first (handles re-taps)
        translateY.setValue(60);
        opacity.setValue(0);

        // Slide in + fade in
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                tension: 120,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Hold for 1.1s then slide out + fade out
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 230,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: 40,
                        duration: 230,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, 1100);
        });
    }, [visible]);

    if (!everVisible) return null;

    return (
        <Animated.View
            style={[styles.toast, { opacity, transform: [{ translateY }] }]}
            pointerEvents="none"
        >
            <View style={styles.inner}>
                <Text style={styles.text}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        bottom: 110,
        left: Spacing.lg,
        right: Spacing.lg,
        alignItems: 'center',
        zIndex: 999,
    },
    inner: {
        backgroundColor: '#1B4332',
        borderRadius: Radius.xl,
        paddingVertical: 12,
        paddingHorizontal: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.green + '66',
        shadowColor: Colors.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    text: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.greenBright,
        textAlign: 'center',
    },
});
