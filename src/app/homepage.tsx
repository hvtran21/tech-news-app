import * as React from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NewsCard } from './components/news_card';
import { BaseTemplate, GradientText, HorizonalLine } from './components/styling';
import { TopNavigation, BottomNavigation } from './components/navigation';
import { Link, router, useLocalSearchParams } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { clear } from 'console';

const BASE_URL = 'http://192.168.0.207:8000'

interface Article {
    id: string;
    genre: string;
    source: string;
    author: string | null;
    title: string;
    description: string;
    url: string;
    url_to_image: string;
    published_at: string;
    content?: string;
}

interface card {
    genre: string;
    published_at: string;
    url_to_image: string;
    title: string;
}

interface genre {
    value: string;
}

async function clearArticleTable() {
    const db = await SQLite.openDatabaseAsync('newsapp');
    await db.execAsync('DELETE FROM articles')
}

async function articleAPI(genreSelection: string) {
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
            url_to_image: article.url_to_image,
            published_at: article.published_at,
            content: article.content
        }))

        // add results to database
        try {
            await Promise.all(results.map(async (article) => {
                console.log(`Inserting article: ${article.id}`)
                const db = await SQLite.openDatabaseAsync('newsapp');
                const existing_article = await db.getFirstAsync('SELECT id FROM articles WHERE id = ?', [article.id]);
                if (existing_article) {
                    console.log(`Article with ID ${article.id} exists in DB. Skipping.`);
                    return;
                }
                const statement = await db.prepareAsync('INSERT INTO articles(id, genre, source, author, title, description, url, url_to_image, published_at, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                await statement.executeAsync([
                    article.id,
                    article.genre ?? null,
                    article.source ?? null,
                    article.author ?? null,
                    article.title ?? null,
                    article.description ?? null,
                    article.url?.toString() ?? null,
                    article.url_to_image?.toString() ?? null,
                    article.published_at ?? null,
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

async function getArticles(genreSelection: string) {
    const genreArr = genreSelection.split(',');
    const db = await SQLite.openDatabaseAsync('newsapp');
    const results = Promise.all(genreArr.map(async(genre) => {
        const query_results = await db.getAllAsync('SELECT * FROM articles WHERE genre = ? LIMIT 5', [genre]);
        return query_results
    }))
    return (await results).flat()
}

export async function loadArticles(genreSelection: string) {
    // ensure all articles are fetched and in the local database
    await articleAPI(genreSelection);
    const results = await getArticles(genreSelection);
    return results;
}

export function HomePage() {
    const { data } = useLocalSearchParams();
    const genreSelection = data as string;
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(0);

    useEffect(() => {
        const getArticles = async () => {
            // need to handle case if this is empty.
            setLoading(1);
            try {
                const articles = await loadArticles(genreSelection) as Article[];
                setArticles(articles);
            } catch (error) {
                console.error(`Error ocurred: ${error}`);
            } finally {
                setLoading(0);
            }
        };
        getArticles();
    }, [genreSelection])


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

                    <TopNavigation value={genreSelection}/>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ 
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                     }}>
                        {articles.map((item, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <NewsCard 
                                    title={item.title}
                                    url_to_image={item.url_to_image}
                                    published_at={item.published_at}
                                    genre={item.genre}
                                    />
                                    <HorizonalLine />
                                </React.Fragment>
                            )
                        })}
                    </ScrollView>
                    <BottomNavigation />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

export default HomePage;
export { card, genre }
