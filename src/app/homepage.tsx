import React, { useState, useEffect, useRef } from 'react';
import * as SQLite from 'expo-sqlite';
import { ScrollView, View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NewsCard } from './components/news_card';
import { GradientText, HorizonalLine } from './components/styling';
import { BottomNavigation } from './components/navigation';
import { useLocalSearchParams } from 'expo-router';
import { faBars, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';

const BASE_URL = 'http://192.168.0.207:8000';

interface Article {
    id: string;
    genre: string | null;
    category: string | null;
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
    title: string;
    url_to_image: string;
    published_at: string;
    genre: string;
}
// function is just for development purposes
async function clearArticleTable() {
    const db = await SQLite.openDatabaseAsync('newsapp');
    await db.execAsync('DELETE FROM articles');
}

async function articleAPI(genreSelection: string) {
    try {
        var response = await fetch(`${BASE_URL}/api/articles`, {
            // TODO: Add authorization somewhere. Maybe here, maybe not.
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                genre: { genreSelection }, // comma seperated string, e.g., APPLE,AMAZON,BIG TECH, ... , etc
            }),
        });
        if (!response.ok) {
            throw new Error(`Error ocurred, response status: ${response.status}`);
        }
        var data = await response.json();
        const articles = data.articles as Article[];
        const results = articles.map((article) => ({
            id: article.id,
            genre: article.genre,
            category: article.category,
            source: article.source,
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            url_to_image: article.url_to_image,
            published_at: article.published_at,
            content: article.content,
        }));

        // add results to database
        try {
            await Promise.all(
                results.map(async (article) => {
                    console.log(`Inserting article: ${article.id}`);
                    const db = await SQLite.openDatabaseAsync('newsapp');
                    const existing_article = await db.getFirstAsync(
                        'SELECT id FROM articles WHERE id = ?',
                        [article.id],
                    );
                    if (existing_article) {
                        console.log(`Article with ID ${article.id} exists in DB. Skipping.`);
                        return;
                    }
                    const statement = await db.prepareAsync(
                        'INSERT INTO articles(id, genre, category, source, author, title, description, url, url_to_image, published_at, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    );
                    await statement.executeAsync([
                        article.id,
                        article.genre ?? null,
                        article.category ?? null,
                        article.source ?? null,
                        article.author ?? null,
                        article.title ?? null,
                        article.description ?? null,
                        article.url?.toString() ?? null,
                        article.url_to_image?.toString() ?? null,
                        article.published_at ?? null,
                        article.content ?? null,
                    ]);
                    await statement.finalizeAsync();
                }),
            );
        } catch (error) {
            console.error(`Error ocurred inserting data into local DB: ${error}`);
        }
    } catch (error) {
        console.error(`Error ocurred: ${error}`);
    }
}

async function getArticles(genreSelection: string | undefined) {
    const db = await SQLite.openDatabaseAsync('newsapp');
    if (genreSelection === undefined) {
        const query_results = await db.getAllAsync('SELECT * FROM articles LIMIT 20');
        return query_results.flat();
    } else {
        const genreArr = genreSelection.split(',');
        const results = Promise.all(
            genreArr.map(async (genre) => {
                const query_results = await db.getAllAsync(
                    'SELECT * FROM articles WHERE genre = ? LIMIT 5',
                    [genre],
                );
                return query_results;
            }),
        );
        return (await results).flat();
    }
}

export async function loadArticles(genreSelection: string | undefined) {
    // ensure all articles are fetched and in the local database
    if (genreSelection !== undefined) {
        await articleAPI(genreSelection);
    }
    const results = await getArticles(genreSelection);
    return results;
}

export function HomePage() {
    var { data } = useLocalSearchParams();
    const genreSelection = data as string;
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(0);

    // setup for modal
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef<View>(null);
    const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

    useEffect(() => {
        const openModal = () => {
            if (visible && triggerRef.current) {
                triggerRef.current.measure((width, height, px, py) => {
                    setPosition({ x: px, y: py, width, height });
                });
            }
        };
        openModal();
    }, [visible]);

    // loading articles
    useEffect(() => {
        const getArticles = async () => {
            // need to handle case if this is empty.
            setLoading(1);
            try {
                const articles = (await loadArticles(genreSelection)) as Article[];
                setArticles(articles);
            } catch (error) {
                console.error(`Error ocurred: ${error}`);
            } finally {
                setLoading(0);
            }
        };
        getArticles();
    }, [genreSelection]);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={BaseTemplate.theme} edges={['top', 'left', 'right', 'bottom']}>
                <View style={BaseTemplate.config}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderBottomColor: '#141414',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    >
                        <GradientText
                            colors={['#8B5CF6', '#EC4899']}
                            text="Tech News"
                            style={BaseTemplate.title}
                        ></GradientText>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                width: '65%',
                                overflow: 'visible',
                            }}
                        >
                            <TouchableOpacity
                                ref={triggerRef}
                                onPress={() => {
                                    setVisible((state) => !state);
                                }}
                                hitSlop={{ right: 5, top: 5, bottom: 5, left: 5 }}
                            >
                                <FontAwesomeIcon
                                    icon={visible ? faAngleUp : faAngleDown}
                                    size={14}
                                    style={{ color: 'white', opacity: 0.5, marginRight: 5 }}
                                />
                            </TouchableOpacity>
                            {visible && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: position.y + position.height + 10,
                                        left: position.x - 150 / 2 - 14,
                                        backgroundColor: '#141414',
                                        padding: 10,
                                        borderRadius: 6,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 10,
                                        zIndex: 10,
                                        width: 150,
                                        height: 200,
                                    }}
                                ></View>
                            )}
                        </View>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {articles.map((item, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <NewsCard
                                        title={item.title}
                                        url_to_image={item.url_to_image}
                                        published_at={item.published_at}
                                        genre={item.genre ?? ''}
                                    />
                                    <HorizonalLine />
                                </React.Fragment>
                            );
                        })}
                    </ScrollView>
                    <BottomNavigation />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

export const BaseTemplate = StyleSheet.create({
    theme: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'column',
    },

    config: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        justifyContent: 'center',
        alignContent: 'center',
        fontFamily: 'WorkSans-Bold',
        fontSize: 24,
    },

    sub_title: {
        fontSize: 18,
        fontFamily: 'WorkSans-LightItalic',
        marginTop: 4,
    },
});

export default HomePage;
export { card };
