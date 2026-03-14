import { Tabs } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faBookmark, faUser } from '@fortawesome/free-solid-svg-icons';
import { StyleSheet } from 'react-native';
import { theme, tabAccents } from '../components/styles';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: tab_styles.tab_bar,
                tabBarInactiveTintColor: theme.text_tertiary,
                tabBarShowLabel: true,
                tabBarLabelStyle: tab_styles.label,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Feed',
                    tabBarActiveTintColor: tabAccents.feed,
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faHome} size={20} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarActiveTintColor: tabAccents.profile,
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faUser} size={17} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: 'Saved',
                    tabBarActiveTintColor: tabAccents.saved,
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faBookmark} size={17} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const tab_styles = StyleSheet.create({
    tab_bar: {
        backgroundColor: theme.bg,
        borderTopColor: theme.border,
        borderTopWidth: StyleSheet.hairlineWidth,
        height: 88,
        paddingTop: 8,
    },
    label: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 10,
        letterSpacing: 0.3,
        marginTop: 2,
    },
});
