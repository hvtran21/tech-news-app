import * as React from 'react';
import { ScrollView, View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { NewsCard } from './components/news_card';
import { BaseTemplate, GradientText } from './components/styling';
import { TopNavigation, BottomNavigation } from './components/navigation';

export default function main() {
    const [fontsLoaded] = useFonts({
        'Nunito-Light': require('../assets/fonts/Nunito/static/Nunito-Light.ttf'),
        'Nunito-Medium': require('../assets/fonts/Nunito/static/Nunito-Medium.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito/static/Nunito-Bold.ttf'),
    });
    const title = 'Hackers broke into Commvaults cloud backup system and stole secret passwords';
    const image_src = require('/Users/htran/repos/tldr_newsapp/tldr_newsapp/assets/images/computer.jpg');
    const date = 'May 24th';
    const genre = 'Cybersecurity';

    const title_2 =
        'Product-Led Growth (PLG) changed the game. Instead of being sold bloated software over steak dinners.';
    const image_src_2 = require('/Users/htran/repos/tldr_newsapp/tldr_newsapp/assets/images/computer_2.jpg');
    const date_2 = 'May 24th';
    const genre_2 = 'AI';

    return (
        <SafeAreaProvider>
            <SafeAreaView style={BaseTemplate.theme} edges={['top', 'left', 'right', 'bottom']}>
                <View style={BaseTemplate.config}>
                    <GradientText
                        colors={['#C020D0', '#4743EF']}
                        text="TLDR Newsletter"
                        style={BaseTemplate.title}
                    ></GradientText>

                    <GradientText
                        colors={['#8432DF', '#0B54FE']}
                        text="Tech headlines made simple."
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
                        <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: '#282828', width: '100%' }}></View>
                        <NewsCard
                            title={title}
                            image_src={image_src}
                            date={date}
                            genre={genre}
                        />
                        <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: '#282828', width: '100%' }}></View>

                    </ScrollView>
                    <BottomNavigation />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
