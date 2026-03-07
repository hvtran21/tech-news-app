import { Tabs } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faBookmark, faUser } from '@fortawesome/free-solid-svg-icons';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: tab_styles.tab_bar,
                tabBarActiveTintColor: '#8B5CF6',
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faHome} size={20} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: 'Saved',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faBookmark} size={18} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faUser} size={18} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const tab_styles = StyleSheet.create({
    tab_bar: {
        backgroundColor: '#000000',
        borderTopColor: '#1a1a1a',
        borderTopWidth: StyleSheet.hairlineWidth,
        height: 85,
        paddingTop: 8,
    },
});
