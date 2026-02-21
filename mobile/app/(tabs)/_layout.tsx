import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '../../src/constants/theme';

interface TabIconProps {
    name: React.ComponentProps<typeof Ionicons>['name'];
    focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps) {
    return (
        <View style={styles.tabItem}>
            <Ionicons
                name={name}
                size={22}
                color={focused ? Colors.green : Colors.textSecondary}
                style={[!focused && { opacity: 0.45 }]}
            />
            {/* <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text> */}
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                headerShown: false,
                tabBarStyle: styles.tabBar,
                animation: 'fade',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={focused ? "home" : "home-outline"} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={focused ? "journal" : "journal-outline"} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="insights"
                options={{
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={focused ? "stats-chart" : "stats-chart-outline"} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={focused ? "chatbubbles" : "chatbubbles-outline"} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={focused ? "settings" : "settings-outline"} focused={focused} />
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
    tabLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    tabLabelFocused: {
        color: Colors.green,
    },
});
