import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, FontSize } from '../../src/constants/theme';

interface TabIconProps {
    emoji: string;
    label: string;
    focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
    return (
        <View style={styles.tabItem}>
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>{emoji}</Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                animation: 'fade',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon emoji="🏠" label="Home" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon emoji="📝" label="Log" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="insights"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon emoji="📊" label="Insights" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon emoji="🤖" label="Chat" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon emoji="⚙️" label="Settings" focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.card,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: Platform.OS === 'ios' ? 85 : 66,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    tabEmoji: {
        fontSize: 22,
        opacity: 0.45,
    },
    tabEmojiFocused: {
        opacity: 1,
    },
    tabLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    tabLabelFocused: {
        color: Colors.green,
    },
});
