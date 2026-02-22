import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { Spacing, Radius, FontSize, FontWeight, useThemeColor } from '../constants/theme';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function PulseScannerSimulation({ visible, onClose }: Props) {
    const Colors = useThemeColor();
    const [countdown, setCountdown] = useState(30);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<{ bpm: number; status: "Resting" | "Elevated" | "High" } | null>(null);

    const addHeartRateReading = useAppStore((s) => s.addHeartRateReading);
    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            startScan();
        } else {
            resetScan();
        }
    }, [visible]);

    const startScan = () => {
        setIsScanning(true);
        setResult(null);
        setCountdown(30);

        // Waveform animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                    useNativeDriver: true,
                }),
                Animated.timing(waveAnim, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    completeScan();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const resetScan = () => {
        setIsScanning(false);
        setResult(null);
        setCountdown(30);
        waveAnim.stopAnimation();
    };

    const completeScan = () => {
        const bpm = Math.floor(Math.random() * 18) + 62; // 62-79
        const status = bpm < 80 ? "Resting" : bpm < 100 ? "Elevated" : "High";

        setResult({ bpm, status });
        setIsScanning(false);
        setTimeout(() => {
            addHeartRateReading(bpm, status);
        }, 0);
    };

    const getHealthTip = (status: string) => {
        if (status === "Resting") return "Your resting heart rate is in a healthy range. Great job!";
        if (status === "Elevated") return "Slightly elevated. Take a deep breath or ensure you're hydrated.";
        return "High pulse detected. Avoid caffeine and rest for a few minutes.";
    };

    const scale = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.4],
    });

    const opacity = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={[styles.container, { backgroundColor: Colors.bg }]}>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Ionicons name="close" size={28} color={Colors.textPrimary} />
                </TouchableOpacity>

                {!result ? (
                    <View style={styles.scannerContent}>
                        <Text style={[styles.instruction, { color: Colors.textSecondary }]}>Place finger on camera lens</Text>

                        <View style={styles.waveformContainer}>
                            <Animated.View style={[styles.pulseCircle, { backgroundColor: Colors.green, transform: [{ scale }], opacity }]} />
                            <View style={[styles.waveformLine, { backgroundColor: Colors.green }]} />
                            {countdown < 25 && <Text style={[styles.detectingText, { color: Colors.green }]}>Detecting pulse...</Text>}
                        </View>

                        <View style={[styles.countdownCircle, { borderColor: Colors.border }]}>
                            <Text style={[styles.countdownText, { color: Colors.textPrimary }]}>{countdown}</Text>
                            <Text style={[styles.countdownUnit, { color: Colors.textMuted }]}>seconds left</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.resultContent}>
                        <Text style={[styles.resultTitle, { color: Colors.textSecondary }]}>Result</Text>
                        <Text style={[styles.bpmValue, { color: Colors.green }]}>{result.bpm}</Text>
                        <Text style={[styles.bpmUnit, { color: Colors.textMuted }]}>BPM</Text>

                        <View style={[styles.statusBadge, { backgroundColor: Colors.greenDim }]}>
                            <Text style={[styles.statusText, { color: Colors.green }]}>{result.status}</Text>
                        </View>

                        <View style={[styles.tipCard, { backgroundColor: Colors.cardAlt, borderColor: Colors.border }]}>
                            <Text style={[styles.tipTitle, { color: Colors.textPrimary }]}>Health Tip</Text>
                            <Text style={[styles.tipBody, { color: Colors.textSecondary }]}>{getHealthTip(result.status)}</Text>
                        </View>


                        <TouchableOpacity style={[styles.doneBtn, { backgroundColor: Colors.green }]} onPress={onClose}>
                            <Text style={[styles.doneBtnText, { color: Colors.white }]}>Done</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: 60,
        right: 30,
        zIndex: 10,
    },
    scannerContent: { alignItems: 'center', width: '100%' },
    instruction: { fontSize: FontSize.md, marginBottom: 60 },
    waveformContainer: {
        height: 150,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },
    pulseCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        position: 'absolute',
    },
    waveformLine: {
        width: '80%',
        height: 2,
        opacity: 0.5,
    },
    detectingText: { marginTop: 20, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
    countdownCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countdownText: { fontSize: 48, fontWeight: FontWeight.bold },
    countdownUnit: { fontSize: 10 },
    resultContent: { alignItems: 'center', width: '100%' },
    resultTitle: { fontSize: FontSize.md, marginBottom: 20 },
    bpmValue: { fontSize: 80, fontWeight: FontWeight.bold },
    bpmUnit: { fontSize: FontSize.lg, marginTop: -10 },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: Radius.full,
        marginTop: 20,
    },
    statusText: { fontWeight: FontWeight.bold, fontSize: FontSize.md },
    tipCard: {
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        marginTop: 40,
        width: '100%',
        borderWidth: 1,
    },
    tipTitle: { fontWeight: FontWeight.bold, marginBottom: 8 },
    tipBody: { lineHeight: 20 },
    doneBtn: {
        width: '100%',
        padding: 16,
        borderRadius: Radius.md,
        marginTop: 40,
        alignItems: 'center',
    },
    doneBtnText: { fontWeight: FontWeight.bold, fontSize: FontSize.md },
});
