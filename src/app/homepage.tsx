import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, TextStyle, TouchableHighlight, Modal, Dimensions, TouchableWithoutFeedback, Linking } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NewsCard } from './components/news_card';
import { GradientText, HorizonalLine } from './components/styling';
import { BottomNavigation } from './components/navigation';
import { useLocalSearchParams } from 'expo-router';
import { faHouse, faAngleDown, faAngleUp, faBolt, faClock, faBookmark, faCircleInfo, faCircleXmark, faFlag, faBan, faUpRightFromSquare} from '@fortawesome/free-solid-svg-icons';
import IconFontAwesome from '@react-native-vector-icons/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSourceMapsEnabled } from 'process';

const BASE_URL = 'http://192.168.0.24:8000';

type menuOptionProp = {
    title: string,
    textStyle: TextStyle,
    icon: IconProp,
    selected: boolean,
    onPress: () => void
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
    saved: number;
}

interface menuFilterProp {
    setFilter: (filterType: string) => void;
    home: boolean;
    recent: boolean;
    top: boolean;
}

interface card {
    title: string;
    url_to_image: string;
    published_at: string;
    genre: string;
    id: string;
    handleEllipsisPress: (id: string) => void;
}

async function articleAPI(genreSelection: string | undefined, category: string | undefined) {
    var genre = '';
    var cat = '';

    if (genreSelection !== undefined) {
        genre = genreSelection;
    }

    if (category !== undefined) {
        cat = category;
    }

    try {
        var response = await fetch(`${BASE_URL}/api/articles`, {
            // TODO: Add authorization somewhere. Maybe here, maybe not.
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                genre: { genre },
                category: { cat }
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
                        'INSERT OR IGNORE INTO articles(id, genre, category, source, author, title, description, url, url_to_image, published_at, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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

export async function getArticleByID(id: string) {
    const db = await SQLite.openDatabaseAsync('newsapp');
    try {
        const article = await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [id]) as Article;
        if (!article) {
            throw new Error(`Article with ID ${id} not found`);
        }
        return article
    } catch (error) {
        console.error(`Error ocurred: ${error}`);
    }
}

async function getArticles(genreSelection: string | undefined, category: string | undefined) {
    const db = await SQLite.openDatabaseAsync('newsapp');
    var results = null;

    if (genreSelection !== undefined && category === undefined) {
        const genreArr = genreSelection.split(',');
        results = Promise.all(
            genreArr.map(async (genre) => {
                const query_results = await db.getAllAsync(
                    'SELECT * FROM articles WHERE genre = ? LIMIT 5',
                    [genre],
                );
                return query_results;
            }),
        );
        return (await results).flat();

    } else if (category !== undefined && genreSelection === undefined) {
        return await db.getAllAsync('SELECT * FROM articles WHERE category = ?', [category])
    }
}

export async function loadArticles(genreSelection: string | undefined, category: string | undefined) {
    // get articles by genre selection
    var results = null;
    if (genreSelection !== undefined) {
        await AsyncStorage.setItem('genreSelection', genreSelection) // save user preferences for later
        await articleAPI(genreSelection, undefined);
        results = await getArticles(genreSelection, undefined);
    
    // get articles by category
    } else {
        // there are no user preferences to save
        results = await getArticles(undefined, category);
        if (!results || results.length === 0) {
            await articleAPI(undefined, category);
            results = await getArticles(undefined, category);
        }
    }
    return results;
}

const MenuOption = ({title, textStyle, selected, icon, onPress}: menuOptionProp) => {
    return (
        // whatever option is selected, should automatically be highlighted for the user.
        <TouchableHighlight onPress={onPress}>
            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', backgroundColor: selected ? '#2a2a2a' :'#141414' }}>
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

const FilterMenu = ({setFilter, home, top, recent}: menuFilterProp) => {
    // should accept the setState function and updates it accordingly

    // TODO: State of filter option isn't persistent with box drops down
    // should probably use Async storage to track the state or something
    // or the state should be tracked in the homepage component, as it gets reset everytime its collapsed.
    const filterByHome = () => {
        setFilter('Home')
    };
    const filterByTop = () => {
        setFilter('Top')
    };
    const filterByRecent = () => {;
        setFilter('Recent')
    };

    const menuOptionArray: ReactNode[] = [
        <MenuOption key={0} title='Home' textStyle={menuStyling.text_style} icon={faHouse} selected={home} onPress={()=>{ filterByHome() }} />,
        <MenuOption key={1} title='Recent' textStyle={menuStyling.text_style} icon={faClock} selected={recent} onPress={()=>{ filterByRecent() }} />,
        <MenuOption key={2} title='Top' textStyle={menuStyling.text_style} icon={faBolt} selected={top} onPress={()=>{ filterByTop() }} />,
    ]

    return (
        <>
            {menuOptionArray}
        </>
    )
}

export function HomePage() {
    // params passed in from welcome page
    var { data } = useLocalSearchParams();
    const genreSelection = data as string;

    // setup for loading articles
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('Home');
    const [home, setHome] = useState(true);
    const [recent, setRecent] = useState(false);
    const [top, setTop] = useState(false);

    // setup for filter menu
    const [visible, setVisible] = useState(false);
    const triggerRef = useRef<View>(null);
    const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [render, setRender] = useState(false);
    const heightAnim = useRef(new Animated.Value(0)).current;
    const fadeAnimArticles = useRef(new Animated.Value(0)).current;

    // states for showing the modal
    const [showModal, setShowModal] = useState(false);
    const [modalArticle, setModalArticle] = useState<Article>();
    const { height } = Dimensions.get('window');

    const handleEllipsisPress = (id: string) => {
        const fetchArticle = async () => {
            const db = await SQLite.openDatabaseAsync('newsapp');
            const article = await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [id]) as Article;
            if (article) {
                setModalArticle(article);
            } else {
                throw new Error(`Article with ID ${id} not found in database`);
            }
        }
        fetchArticle();
    }

    useEffect(() => {
        if (modalArticle) {
            setShowModal(true);
        }
    }, [modalArticle])
    
    // animation for content to load
    const fadeIn = () => {
        Animated.timing(fadeAnimArticles, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start()
    }

    // animation logic for filter modal open
    const modalOpenAnim = () => {
        heightAnim.setValue(0);
        setRender(true);
        requestAnimationFrame(() => {
            Animated.timing(heightAnim, {
                toValue: 1,
                duration: 140,
                useNativeDriver: true,
            }).start();
        })
    };

    // animation logic for filter modal close
    const modalCloseAnim = () => {
        Animated.timing(heightAnim, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
        }).start(() => {
            setRender(false)
        });
    };

    // fade animation for content to load in
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
            setLoading(true);
            try {
                var articles: Article[] = [];
                if (genreSelection !== undefined) {
                    articles = await loadArticles(genreSelection, undefined) as Article[];
                } else {
                    const existingPreferences = await AsyncStorage.getItem('genreSelection');
                    if (existingPreferences !== null) {
                        articles = await loadArticles(existingPreferences, undefined) as Article[];
                    }
                }

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

    // filtering of articles
    useEffect(() => {
        const getArticlesByFilter = async () => {
            setLoading(true);
            try {
                let articles: Article[] = [];
                if (filter === 'Top') {
                    articles = await loadArticles(undefined, 'Technology') as Article[];
                    setTop(true);
                    setHome(false);
                    setRecent(false);

                } else if (filter === 'Home') {
                    const existingPreferences = await AsyncStorage.getItem('genreSelection');
                    if (existingPreferences) {
                        articles = await getArticles(existingPreferences, undefined) as Article[];
                    } else {
                        articles = await loadArticles(undefined, 'Technology') as Article[];
                    }
                    setHome(true);
                    setRecent(false);
                    setTop(false);

                } else if (filter === 'Recent') {
                    const existingPreferences = await AsyncStorage.getItem('genreSelection');
                    if (existingPreferences) {
                        articles = await getArticles(existingPreferences, undefined) as Article[];
                        articles = [...articles].sort((a, b) =>
                            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
                        );
                    } else {
                        articles = await getArticles(undefined, 'Technology') as Article[];
                    }
                    setRecent(true);
                    setHome(false);
                    setTop(false);
                }

                setArticles(articles);
            } catch (error) {
                console.error(`Error occurred: ${error}`);
            } finally {
                setLoading(false);
                fadeIn();
            }
        };

        getArticlesByFilter();
    }, [filter]);

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
                            text="Your Tech News"
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
                                    <FilterMenu setFilter={setFilter} home={home} recent={recent} top={top}/>
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
                        {!loading ? (
                            <Animated.View style={{ opacity: fadeAnimArticles }}>
                                {articles.map((item, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <NewsCard
                                                title={item.title}
                                                url_to_image={item.url_to_image}
                                                published_at={item.published_at}
                                                genre={item.genre ?? ''}
                                                id={item.id}
                                                handleEllipsisPress={handleEllipsisPress}
                                            />
                                            <HorizonalLine />
                                        </React.Fragment>
                                    );
                                })}
                            </Animated.View>
                            ) : (
                                <ActivityIndicator size="small" color="#fff" style={{ opacity: 0.8 }} />
                            )
                        }   

                    </ScrollView>
                    <BottomNavigation />
                    <Modal
                        animationType='slide'
                        transparent={true}
                        visible={showModal}
                        onRequestClose={() => setShowModal(false)}
                    >   
                        <TouchableWithoutFeedback onPress={() => {setShowModal(false)}}>
                            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0)' }}/>
                        </TouchableWithoutFeedback>
                        <View style={{
                            position: 'absolute',
                            backgroundColor: '#141414',
                            justifyContent: 'center',
                            alignContent: 'center',
                            top: height - 225,
                            height: 225,
                            borderRadius: 20,
                            padding: 20,
                            width: '100%',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                         }}>
                            <ModalOptions setShowModal={setShowModal} article={modalArticle} />
                        </View>
                    </Modal>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

type ModalProps = {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    article: Article | undefined
}

const ModalOptions = ({ setShowModal, article }: ModalProps) => {
    const [saved, setSaved] = useState(false);

    const handleOpenInBrowser = useCallback(async () => {
        if (article) {
            const supported = await Linking.canOpenURL(article.url);
            if (supported) {
                await Linking.openURL(article.url);
            }
        }
    }, []);

    const handleSave = async () => {
        if (article) {
            setSaved((state) => !state);
            const db = await SQLite.openDatabaseAsync('newsapp');
            // handle save option
            if (article.saved === 0) {
                article.saved = 1;
                console.log('Setting article to saved');
                await db.runAsync('UPDATE articles SET saved = 1 WHERE id = ?', article.id);

            } else {
                // handle unsave option
                console.log('Setting article to unsaved');
                article.saved = 0;
                await db.runAsync('UPDATE articles SET saved = 0 WHERE id = ?', article.id);
            }
        }
    };

    useEffect(() => {
        const checkArticleSaved = () => {
            if (article) {
                console.log(`Article ID: ${article?.id} saved: ${article?.saved}`)
                if (article.saved === 1) {
                    setSaved(true);
                } else {
                    setSaved(false);
                }
            }
        }
        checkArticleSaved();
    }, [])

    return (
        <>
            <View style={{
                top: 15,
                right: 15,
                position: 'absolute',
                flexDirection: 'row',
                justifyContent: 'flex-end',
            }}>
                <TouchableOpacity onPress={() => {setShowModal((state) => !state)}} hitSlop={10}>
                    <FontAwesomeIcon icon={faCircleXmark} color='white' size={20} style={{ opacity: 0.8 }}/>
                </TouchableOpacity>
            </View>

            <View style={{
                justifyContent: 'flex-start',
                flexDirection: 'column',
                width: '100%',
                paddingHorizontal: 20,
                }}>

                    {!saved ? (
                        <TouchableOpacity style={modalStyling.modal_option} onPress={handleSave}>
                            <IconFontAwesome name='bookmark-o' color='white' size={18} style={{ opacity: 0.8, marginRight: 10 }}/>
                            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 18 ,color: 'white', opacity: 0.8 }}>
                                Save
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={modalStyling.modal_option} onPress={handleSave}>
                            <IconFontAwesome name='bookmark' color='white' size={18} style={{ opacity: 0.8, marginRight: 10 }} />
                            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 18 ,color: 'white', opacity: 0.8 }}>
                                Unsave
                            </Text>
                        </TouchableOpacity>
                    )}

                <TouchableOpacity style={modalStyling.modal_option} onPress={handleOpenInBrowser}>
                    <FontAwesomeIcon icon={faUpRightFromSquare} color='white' size={18} style={{ opacity: 0.8, marginRight: 10 }}/>
                    <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 18 ,color: 'white', opacity: 0.8 }}>
                        Open in browser
                    </Text>
                </TouchableOpacity>


                <TouchableOpacity style={modalStyling.modal_option}>
                    <FontAwesomeIcon icon={faBan} color='white' size={18} style={{ opacity: 0.8, marginRight: 10 }}/>
                    <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 18 ,color: 'white', opacity: 0.8 }}>
                        Not Interested
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={modalStyling.modal_option}>
                    <FontAwesomeIcon icon={faFlag} color='#FF6B6B' size={18} style={{ opacity: 0.8, marginRight: 10 }}/>
                    <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 18 ,color: '#FF6B6B', opacity: 0.8 }}>
                        Report
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    )
}

const modalStyling = StyleSheet.create({
    modal_option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 8
    }
})

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
