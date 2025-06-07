import * as React from 'react';
import { ScrollView, View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { NewsCard } from './components/news_card';
import { BaseTemplate, GradientText, HorizonalLine } from './components/styling';
import { TopNavigation, BottomNavigation } from './components/navigation';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkFirstLaunch = async () => {
    try {
        console.log('Checking first launch..')
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

export default function HomePage() {
    const [fontsLoaded] = useFonts({
        'Nunito-Light': require('../assets/fonts/Nunito/static/Nunito-Light.ttf'),
        'Nunito-Medium': require('../assets/fonts/Nunito/static/Nunito-Medium.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito/static/Nunito-Bold.ttf'),
    });
    const title = 'Hackers broke into Commvaults cloud backup system and stole secret passwords';
    const image_src = require('/Users/htran/repos/tech-news-app/src/assets/images/computer.jpg');
    const date = 'May 24th';
    const genre = 'Cybersecurity';

    const title_2 =
        'Product-Led Growth (PLG) changed the game. Instead of being sold bloated software over steak dinners.';
    const image_src_2 = require('/Users/htran/repos/tech-news-app/src/assets/images/computer_2.jpg');
    const date_2 = 'May 24th';
    const genre_2 = 'AI';

    return (
        <SafeAreaProvider>
            <SafeAreaView style={BaseTemplate.theme} edges={['top', 'left', 'right', 'bottom']}>
                <View style={BaseTemplate.config}>
                    <GradientText
                        colors={['#C020D0', '#4743EF']}
                        text="Tech Newsletter"
                        style={BaseTemplate.title}
                    ></GradientText>

                    <GradientText
                        colors={['#8432DF', '#0B54FE']}
                        text="Yep. That's it."
                        style={BaseTemplate.sub_title}
                    ></GradientText>

                    <TopNavigation />
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ 
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                     }}>
                        <NewsCard
                            title={title_2}
                            image_src={image_src_2}
                            date={date_2}
                            genre={genre_2}
                        />
                        <HorizonalLine />
                        <NewsCard
                            title={title}
                            image_src={image_src}
                            date={date}
                            genre={genre}
                        />
                        <HorizonalLine />

                    </ScrollView>
                    <BottomNavigation />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
