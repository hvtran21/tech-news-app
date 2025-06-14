import React, { useState, useEffect, useRef, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, TextStyle, TouchableHighlight } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NewsCard } from './components/news_card';
import { GradientText, HorizonalLine } from './components/styling';
import { BottomNavigation } from './components/navigation';
import { useLocalSearchParams } from 'expo-router';
import { faHouse, faAngleDown, faAngleUp, faBolt, faClock} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePrime } from 'crypto';
import { clear } from 'console';


const BASE_URL = 'http://192.168.0.207:8000';

type menuOptionProp = {
    title: string,
    textStyle: TextStyle,
    icon: IconProp,
    onPress: () => void,
}

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

interface FilteArticles {
    articles: Article[],
    filterBy: string,
}

interface menuFilterProp {
    setFilter: (filterType: string) => void;
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
    if (genreSelection === undefined || genreSelection === '') {
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
    if (genreSelection !== undefined && genreSelection !== '') {
        await AsyncStorage.setItem('genreSelection', genreSelection)
        await articleAPI(genreSelection);
    }
    const results = await getArticles(genreSelection);
    return results;
}

const MenuOption = ({title, textStyle, icon, onPress}: menuOptionProp) => {
    return (
        // whatever option is selected, should automatically be highlighted for the user.
        <TouchableHighlight onPress={onPress}>
            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', backgroundColor: '#141414' }}>
                <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', margin: 8}}>
                    <FontAwesomeIcon icon={icon} style={{color: 'white', opacity: 0.8 }} />
                </View>
                <View style={{ marginTop: 8, marginBottom: 8}}>
                    <Text style={textStyle}>{title}</Text>
                </View>
            </View>
        </TouchableHighlight>
    )
}

// articles is the list of articles retrieved by preference
// how to sort by Top? Probably use the category=technology API.
// filter by home and Recent first.
// filterBy = {Home, Top, Recent}
const DisplayArticles: React.FC<FilteArticles> = ({ articles, filterBy }) => {
    // the filterBy option should be a state
    var articles_to_display: Article[] = [];
    if (filterBy === 'Home') {
        articles_to_display = articles;
    } else if (filterBy === 'Recent') {
        // should this fetch the Recent data from server with the user given preferences?
        articles.sort((a, b) => {
            const date_a = new Date(a.published_at).getTime();
            const date_b = new Date(b.published_at).getTime();
            return date_b - date_a;
        })
        articles_to_display = articles;
    } else {
        // TOP -> fetch articles by category technology. involves modifying articleAPI to accept a category.
        // also inolves in processing a category option on the backend
        // also involves changing the backend to use a diff url.
        // category 'genre' could just be 'Top'.. dunno.
    }

    return (
        <>
            {articles_to_display.map((item, index) => {
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
        </>
    )
}

const FilterMenu = ({setFilter}: menuFilterProp) => {
    // should accept the setState function and updates it accordingly
    const filterByHome = () => {setFilter('Home')};
    const filterByTop = () => {setFilter('Top')};
    const filterByRecent = () => {setFilter('Recent')};

    const menuOptionArray: ReactNode[] = [
        <MenuOption key={0} title='Home' textStyle={menuStyling.text_style} icon={faHouse} onPress={()=>{ filterByHome() }} />,
        <MenuOption key={1} title='Recent' textStyle={menuStyling.text_style} icon={faClock} onPress={()=>{ filterByRecent() }} />,
        <MenuOption key={2} title='Top' textStyle={menuStyling.text_style} icon={faBolt} onPress={()=>{ filterByTop() }} />,
    ]

    return (<>{menuOptionArray}</>)
}

export function HomePage() {
    // params passed in from welcome page
    var { data } = useLocalSearchParams();
    const genreSelection = data as string;

    // setup for loading articles
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('Home');

    // setup for modal
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef<View>(null);
    const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [render, setRender] = useState(false);
    const heightAnim = useRef(new Animated.Value(0)).current;
    const fadeAnimArticles = useRef(new Animated.Value(0)).current;

    const fadeIn = () => {
        Animated.timing(fadeAnimArticles, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start()
    }

    const modalOpenAnim = () => {
        heightAnim.setValue(0);
        setRender(true);
        //
        requestAnimationFrame(() => {
            Animated.timing(heightAnim, {
                toValue: 1,
                duration: 140,
                useNativeDriver: true,
            }).start();
        })
    };

    const modalCloseAnim = () => {
        Animated.timing(heightAnim, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
        }).start(() => {
            setRender(false)
        });
    };

    useEffect(() => {
        fadeAnimArticles.setValue(0);
        fadeIn();
    }, [filter])
    

    // control opening filter menu
    useEffect(() => {
        const openModal = () => {
            if (visible && triggerRef.current) {
                triggerRef.current.measure((width, height, px, py) => {
                    setPosition({ x: px, y: py, width, height });
                });
                modalOpenAnim();
            }
            if (!visible) {
                modalCloseAnim();
            }
        };
        openModal();
    }, [visible]);

    // initialization of loading articles
    useEffect(() => {
        const getArticles = async () => {
            // need to handle case if this is empty.
            setLoading(true);
            try {
                const articles = (await loadArticles(genreSelection)) as Article[];
                setArticles(articles);
            } catch (error) {
                console.error(`Error ocurred: ${error}`);
            } finally {
                setLoading(false);
                fadeIn();
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
                                width: '70%',
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
                                    style={{ color: 'white', opacity: 0.5, marginLeft: 8, marginRight: 8, marginBottom: 2 }}
                                />
                            </TouchableOpacity>
                            {render && (
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        top: position.y + position.height + 10,
                                        // position.x - width of container / 2 - width of icon
                                        left: position.x - 100 / 2 - 14,
                                        backgroundColor: '#141414',
                                        borderRadius: 8,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 10,
                                        zIndex: 10,
                                        width: 100,
                                        transformOrigin: 'top',
                                        transform: [{scaleY: heightAnim}],
                                        overflow: 'hidden',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <FilterMenu setFilter={setFilter}/>
                                </Animated.View>
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
                        {loading ? (
                            <ActivityIndicator size='small' color='#fff' />
                        ) : (
                            <Animated.View style={{ opacity: fadeAnimArticles }}>
                                <DisplayArticles articles={articles} filterBy={filter} />
                            </Animated.View>
                        )}

                    </ScrollView>
                    <BottomNavigation />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const menuStyling = StyleSheet.create({
    text_style: {
      opacity: 0.8,
      fontFamily: 'WorkSans-Light',
      fontSize: 16,
      color: 'white',
    }
})

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
