import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkFirstLaunch = async () => {
    try {
        console.log('Checking first launch..')
        AsyncStorage.removeItem('firstLaunch'); // for dev purposes
        const val = await AsyncStorage.getItem('firstLaunch');
        if (val !== null) {
            console.log('Not first launch')
            return false;
        } else {
            console.log('First launch')
            await AsyncStorage.setItem('firstLaunch', 'false');
            return true;
        }
    } catch (error) {
        throw new Error(`Error occurred: ${error}`)
    }
}

export default function main() {
    const [fontsLoaded] = useFonts({
        'WorkSans-Regular': require('../assets/fonts/WorkSans/WorkSans-Regular.ttf'),
        'WorkSans-Bold': require('../assets/fonts/WorkSans/WorkSans-Bold.ttf'),
        'WorkSans-SemiBold': require('../assets/fonts/WorkSans/WorkSans-SemiBold.ttf'),
        'WorkSans-Light': require('../assets/fonts/WorkSans/WorkSans-Light.ttf'),
        'WorkSans-LightItalic': require('../assets/fonts/WorkSans/WorkSans-LightItalic.ttf'),
    })
    useEffect(() => {
        const init = async () => {
            // await setFirstLaunch();
            const firstLaunch = await checkFirstLaunch();
            if (firstLaunch === true) {
                router.push('/welcome');
            } else {
                router.push('/homepage');
            }
        }
        init();
    }, [])
}
