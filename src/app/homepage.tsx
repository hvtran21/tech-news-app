import * as React from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NewsCard } from './components/news_card';
import { BaseTemplate, GradientText, HorizonalLine } from './components/styling';
import { TopNavigation, BottomNavigation } from './components/navigation';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { NewsCardProps } from './components/news_card';
import { techGenres } from './components/article';
import * as SQLite from 'expo-sqlite';

const BASE_URL = 'http://localhost:8000'

interface Article {
    id: string;
    genre: string;
    source: string;
    author: string | null;
    title: string;
    description: string;
    url: URL;
    urlToImage: URL;
    publishedAt: string;
    content?: string;
}

async function retrieveArticles(genreSelection: string) {
    try {
        var response = await fetch(`${BASE_URL}/api/articles`, {
            // TODO: Add authorization somewhere. Maybe here, maybe not.
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                genre: {genreSelection},   // comma seperated string, e.g., APPLE,AMAZON,BIG TECH, ... , etc
            }),
        });
        if (!response.ok) {
            throw new Error(`Error ocurred, response status: ${response.status}`);
        }
        var data = await response.json();
        const articles = data.articles as Article[];
        const results = articles.map(article => ({
            id: article.id,
            genre: article.genre,
            source: article.source,
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            url_to_image: article.urlToImage,
            published_at: new Date(article.publishedAt),
            content: article.content
        }))

        // add results to database
        try {
            await Promise.all(results.map(async (article) => {
                const db = await SQLite.openDatabaseAsync('newsapp');
                const statement = await db.prepareAsync(`INSERT INTO articles(id, genre, source, author, title, description, url, url_to_image, published_at, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                await statement.executeAsync([
                    article.id,
                    article.genre ?? null,
                    article.source ?? null,
                    article.author ?? null,
                    article.title ?? null,
                    article.description ?? null,
                    article.url?.toString() ?? null,
                    article.url_to_image?.toString() ?? null,
                    new Date(article.published_at).toISOString(),
                    article.content ?? null
                ]);
                await statement.finalizeAsync();
            })
        );

        } catch (error) {
            console.error(`Error ocurred inserting data into local DB: ${error}`)
        }

    } catch (error) {
        console.error(`Error ocurred: ${error}`);
    }
}

export async function loadArticles(genreSelection: string) {
    // ensure all articles are fetched and in the local database
    await retrieveArticles(genreSelection);

}

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
        const getArticles = async () => {
            await loadArticles(genreSelection);
        };
        getArticles();
    }, [genreSelection])
    // const key = Object.keys(techGenres).find(k => techGenres[k as keyof typeof techGenres] === genre) as string;

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
