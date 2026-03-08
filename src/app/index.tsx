import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkFirstLaunch = async () => {
    try {
        const val = await AsyncStorage.getItem('firstLaunch');
        if (val !== null) {
            return false;
        } else {
            await AsyncStorage.setItem('firstLaunch', 'false');
            return true;
        }
    } catch (error) {
        throw new Error(`Error occurred: ${error}`);
    }
};

export default function Main() {
    const [fontsLoaded] = useFonts({
        'WorkSans-Regular': require('../assets/fonts/WorkSans/WorkSans-Regular.ttf'),
        'WorkSans-Bold': require('../assets/fonts/WorkSans/WorkSans-Bold.ttf'),
        'WorkSans-SemiBold': require('../assets/fonts/WorkSans/WorkSans-SemiBold.ttf'),
        'WorkSans-Light': require('../assets/fonts/WorkSans/WorkSans-Light.ttf'),
        'WorkSans-LightItalic': require('../assets/fonts/WorkSans/WorkSans-LightItalic.ttf'),
        'WorkSans-ExtraLight': require('../assets/fonts/WorkSans/WorkSans-ExtraLight.ttf'),
    });

    useEffect(() => {
        const init = async () => {
            if (!fontsLoaded) return;

            const firstLaunch = await checkFirstLaunch();
            if (true) {
                router.replace('/welcome');
            } else {
                router.replace('/(tabs)');
            }
        };
        init();
    }, [fontsLoaded]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="small" color="#06B6D4" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
