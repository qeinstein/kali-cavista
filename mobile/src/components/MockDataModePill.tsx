import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

export default function MockDataModePill() {
    return (
        <View style={styles.container}>
            <View style={styles.dot} />
            <Text style={styles.text}>MOCK DATA MODE</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937', // Darker gray
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: '#374151',
        gap: 6,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.warning,
    },
    text: {
        fontSize: 9,
        color: '#9CA3AF',
        fontWeight: FontWeight.bold,
        letterSpacing: 0.5,
    },
});
