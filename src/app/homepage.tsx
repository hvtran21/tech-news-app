import * as React from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NewsCard } from './components/news_card';
import { BaseTemplate, GradientText, HorizonalLine } from './components/styling';
import { TopNavigation, BottomNavigation } from './components/navigation';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { NewsCardProps } from './components/news_card';
import retrieveArticles from './db/db';


export function HomePage() {
    const title = 'Hackers broke into Commvaults cloud backup system and stole secret passwords';
    const image_src = require('/Users/htran/repos/tech-news-app/src/assets/images/computer.jpg');
    const date = 'May 24th';
    const genre = 'Cybersecurity';

    const title_2 =
        'Product-Led Growth (PLG) changed the game. Instead of being sold bloated software over steak dinners.';
    const image_src_2 = require('/Users/htran/repos/tech-news-app/src/assets/images/computer_2.jpg');
    const date_2 = 'May 24th';
    const genre_2 = 'AI';

    const { data } = useLocalSearchParams();
    const genreSelection = data as string;

    useEffect(() => {
        const loadArticles = async () => {
            await retrieveArticles(genreSelection);
        }
        loadArticles();
    }, [])

    return (
        <SafeAreaProvider>
            <SafeAreaView style={BaseTemplate.theme} edges={['top', 'left', 'right', 'bottom']}>
                <View style={BaseTemplate.config}>
                    <GradientText
                        colors={['#8B5CF6', '#EC4899']}
                        text="Tech Newsletter"
                        style={BaseTemplate.title}
                    ></GradientText>

                    <GradientText
                        colors={['#8B5CF6', '#EC4899']}
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

export default HomePage;
