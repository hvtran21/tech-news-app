import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faBookmark, faUser } from '@fortawesome/free-solid-svg-icons';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../components/styles';

// Fully custom tab bar. react-navigation's default button reserves its own
// bottom padding that can't be overridden cleanly, so we own the layout instead.
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[tab_styles.wrapper, { bottom: insets.bottom + 16 }]}>
            <View style={tab_styles.pill}>
                <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFill} />
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const focused = state.index === index;
                    const color = focused ? theme.accent : theme.text_tertiary;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!focused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <Pressable key={route.key} onPress={onPress} style={tab_styles.item}>
                            {options.tabBarIcon?.({ focused, color, size: 20 })}
                            <Text style={[tab_styles.label, { color }]}>{options.title ?? route.name}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Feed',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faHome} size={19} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faUser} size={17} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: 'Saved',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faBookmark} size={16} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const tab_styles = StyleSheet.create({
    // Positioned + shadowed here; no overflow so the shadow isn't clipped.
    wrapper: {
        position: 'absolute',
        left: 20,
        right: 20,
        height: 72,
        borderRadius: 26,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 18,
        elevation: 14,
    },
    // Clips the blur + rounds the corners; separate from wrapper's shadow.
    pill: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 26,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.14)',
    },
    item: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    label: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 10,
        letterSpacing: 0.3,
    },
});
