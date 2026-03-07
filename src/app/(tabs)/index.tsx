import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    TextStyle,
    TouchableHighlight,
    Modal,
    Dimensions,
    TouchableWithoutFeedback,
    Linking,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Keyboard,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { NewsCard } from '../components/news_card';
import { TabHeader, HorizonalLine } from '../components/styles';
import {
    faHouse,
    faAngleDown,
    faAngleUp,
    faBolt,
    faClock,
    faCircleXmark,
    faFlag,
    faBan,
    faUpRightFromSquare,
    faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import IconFontAwesome from '@react-native-vector-icons/fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Article from '../components/constants';
import getArticles, { downloadAndGetArticles, getAllArticles, searchArticles } from '../components/services';
import { deleteArticlesByAge, canRefreshArticles } from '../components/utilities';
import ReAnimated, { FadeIn } from 'react-native-reanimated';

type MenuOptionProp = {
    title: string;
    textStyle: TextStyle;
    icon: IconProp;
    selected: boolean;
    onPress: () => void;
};

interface MenuFilterProp {
    setFilter: (filterType: string) => void;
    home: boolean;
    recent: boolean;
    top: boolean;
}

const MenuOption = ({ title, textStyle, selected, icon, onPress }: MenuOptionProp) => {
    return (
        <TouchableHighlight onPress={onPress} underlayColor="#2a2a2a" style={{ borderRadius: 8 }}>
            <View style={[menu_styles.option_row, selected && menu_styles.option_selected]}>
                <View style={menu_styles.icon_wrapper}>
                    <FontAwesomeIcon
                        icon={icon}
                        size={14}
                        style={{ color: selected ? '#8B5CF6' : 'white', opacity: selected ? 1 : 0.6 }}
                    />
                </View>
                <Text style={[textStyle, selected && { opacity: 1, color: '#8B5CF6' }]}>{title}</Text>
            </View>
        </TouchableHighlight>
    );
};

const FilterMenu = ({ setFilter, home, top, recent }: MenuFilterProp) => {
    return (
        <View style={menu_styles.menu_inner}>
            <MenuOption
                title="Home"
                textStyle={menu_styles.text_style}
                icon={faHouse}
                selected={home}
                onPress={() => setFilter('Home')}
            />
            <MenuOption
                title="Recent"
                textStyle={menu_styles.text_style}
                icon={faClock}
                selected={recent}
                onPress={() => setFilter('Recent')}
            />
            <MenuOption
                title="Top"
                textStyle={menu_styles.text_style}
                icon={faBolt}
                selected={top}
                onPress={() => setFilter('Top')}
            />
        </View>
    );
};

export default function HomeFeed() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Home');
    const [home, setHome] = useState(true);
    const [recent, setRecent] = useState(false);
    const [top, setTop] = useState(false);

    const [visible, setVisible] = useState(false);
    const heightAnim = useRef(new Animated.Value(0)).current;
    const fadeAnimArticles = useRef(new Animated.Value(0)).current;
    const slideAnimArticles = useRef(new Animated.Value(12)).current;

    const [showModal, setShowModal] = useState(false);
    const [modalArticle, setModalArticle] = useState<Article>();
    const { height } = Dimensions.get('window');

    const [refreshing, setRefreshing] = useState(false);
    const initialLoadDone = useRef(false);

    // Search state
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchAnim = useRef(new Animated.Value(0)).current;
    const searchInputRef = useRef<TextInput>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const preSearchArticles = useRef<Article[]>([]);

    const loadByFilter = useCallback(async (activeFilter: string): Promise<Article[]> => {
        const userPreferences = await AsyncStorage.getItem('genreSelection');
        if (activeFilter === 'Recent') {
            return await getAllArticles();
        } else if (activeFilter === 'Top') {
            return (await getArticles(undefined, 'Technology')) ?? [];
        }
        // Home
        if (userPreferences) {
            return (await getArticles(userPreferences, undefined)) ?? [];
        }
        return (await getArticles(undefined, 'Technology')) ?? [];
    }, []);

    const onRefresh = useCallback(async () => {
        const canRefresh = await canRefreshArticles();
        if (!canRefresh) return;

        setRefreshing(true);
        await deleteArticlesByAge();

        const userPreferences = await AsyncStorage.getItem('genreSelection');
        if (userPreferences) {
            await downloadAndGetArticles(userPreferences, undefined);
        }
        await downloadAndGetArticles(undefined, 'Technology');

        const newArticles = await loadByFilter(filter);
        setArticles(newArticles);
        setRefreshing(false);
    }, [filter, loadByFilter]);

    const handleEllipsisPress = useCallback((id: string) => {
        const fetchArticle = async () => {
            const db = await SQLite.openDatabaseAsync('newsapp');
            const article = (await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [
                id,
            ])) as Article;
            if (article) {
                setModalArticle(article);
            }
        };
        fetchArticle();
    }, []);

    useEffect(() => {
        if (modalArticle) {
            setShowModal(true);
        }
    }, [modalArticle]);

    const animateContent = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnimArticles, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnimArticles, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnimArticles, slideAnimArticles]);

    const resetContentAnim = useCallback(() => {
        fadeAnimArticles.setValue(0);
        slideAnimArticles.setValue(12);
    }, [fadeAnimArticles, slideAnimArticles]);

    const toggleMenu = useCallback(() => {
        const opening = !visible;
        setVisible(opening);
        Animated.timing(heightAnim, {
            toValue: opening ? 1 : 0,
            duration: 120,
            useNativeDriver: true,
        }).start();
    }, [visible, heightAnim]);

    // Search toggle
    const toggleSearch = useCallback(() => {
        const opening = !searchOpen;
        setSearchOpen(opening);
        Animated.timing(searchAnim, {
            toValue: opening ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start(() => {
            if (opening) {
                searchInputRef.current?.focus();
            } else {
                // Closing search — restore articles
                setSearchQuery('');
                if (preSearchArticles.current.length > 0) {
                    setArticles(preSearchArticles.current);
                    preSearchArticles.current = [];
                }
                Keyboard.dismiss();
            }
        });
    }, [searchOpen, searchAnim]);

    const handleSearchChange = useCallback((text: string) => {
        setSearchQuery(text);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(async () => {
            if (text.trim().length === 0) {
                if (preSearchArticles.current.length > 0) {
                    setArticles(preSearchArticles.current);
                }
                return;
            }
            const results = await searchArticles(text.trim());
            setArticles(results);
        }, 300);
    }, []);

    const handleSearchOpen = useCallback(() => {
        // Save current articles before searching
        preSearchArticles.current = articles;
        toggleSearch();
    }, [articles, toggleSearch]);

    const handleSearchClear = useCallback(() => {
        setSearchQuery('');
        searchInputRef.current?.clear();
        if (preSearchArticles.current.length > 0) {
            setArticles(preSearchArticles.current);
        }
    }, []);

    useEffect(() => {
        resetContentAnim();
        animateContent();
    }, [filter]);

    useFocusEffect(
        useCallback(() => {
            if (initialLoadDone.current) {
                resetContentAnim();
                animateContent();
            }
        }, [resetContentAnim, animateContent]),
    );

    // initial article load — download from backend, then display
    useEffect(() => {
        const loadArticles = async () => {
            setLoading(true);
            try {
                const existingPreferences = await AsyncStorage.getItem('genreSelection');

                // download user's genres
                if (existingPreferences) {
                    await downloadAndGetArticles(existingPreferences, undefined);
                }
                // always download Technology category so Top filter has data
                await downloadAndGetArticles(undefined, 'Technology');

                const loadedArticles = await loadByFilter('Home');
                setArticles(loadedArticles);
            } catch (error) {
                console.error(`Error occurred: ${error}`);
            } finally {
                setLoading(false);
                animateContent();
                initialLoadDone.current = true;
            }
        };
        loadArticles();
    }, []);

    // filter changes — skip initial render (handled by initial load above)
    useEffect(() => {
        if (!initialLoadDone.current) return;

        const applyFilter = async () => {
            setLoading(true);
            try {
                if (filter === 'Top') {
                    setTop(true); setHome(false); setRecent(false);
                } else if (filter === 'Home') {
                    setHome(true); setRecent(false); setTop(false);
                } else if (filter === 'Recent') {
                    setRecent(true); setHome(false); setTop(false);
                }

                const filtered = await loadByFilter(filter);
                setArticles(filtered);
            } catch (error) {
                console.error(`Error occurred: ${error}`);
            } finally {
                setLoading(false);
                animateContent();
            }
        };

        applyFilter();
    }, [filter, loadByFilter]);

    const searchBarHeight = searchAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 52],
    });

    const EmptyState = () => (
        <ReAnimated.View entering={FadeIn.duration(500)} style={empty_styles.container}>
            <Text style={empty_styles.title}>
                {searchOpen && searchQuery.length > 0 ? 'No results found' : 'No articles yet'}
            </Text>
            <Text style={empty_styles.subtitle}>
                {searchOpen && searchQuery.length > 0
                    ? 'Try different keywords or check your spelling.'
                    : 'Pull down to refresh, or check your server connection.'}
            </Text>
        </ReAnimated.View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={base_template.theme} edges={['top', 'left', 'right']}>
                <View style={base_template.config}>
                    <TabHeader
                        title="Feed"
                        rightAccessory={
                            <View style={base_template.filter_area}>
                                <TouchableOpacity
                                    onPress={searchOpen ? toggleSearch : handleSearchOpen}
                                    style={search_styles.icon_btn}
                                    activeOpacity={0.7}
                                    hitSlop={8}
                                >
                                    <FontAwesomeIcon
                                        icon={searchOpen ? faCircleXmark : faMagnifyingGlass}
                                        size={16}
                                        color="white"
                                        style={{ opacity: searchOpen ? 0.6 : 0.4 }}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={toggleMenu}
                                    style={menu_styles.trigger}
                                    activeOpacity={0.7}
                                >
                                    <Text style={menu_styles.trigger_text}>{filter}</Text>
                                    <FontAwesomeIcon
                                        icon={visible ? faAngleUp : faAngleDown}
                                        size={12}
                                        style={{ color: 'white', opacity: 0.5 }}
                                    />
                                </TouchableOpacity>
                                <Animated.View
                                    pointerEvents={visible ? 'auto' : 'none'}
                                    style={[
                                        menu_styles.dropdown,
                                        {
                                            transform: [{ scaleY: heightAnim }],
                                            opacity: heightAnim,
                                        },
                                    ]}
                                >
                                    <FilterMenu
                                        setFilter={(f) => {
                                            setFilter(f);
                                            Animated.timing(heightAnim, {
                                                toValue: 0,
                                                duration: 100,
                                                useNativeDriver: true,
                                            }).start();
                                            setVisible(false);
                                        }}
                                        home={home}
                                        recent={recent}
                                        top={top}
                                    />
                                </Animated.View>
                            </View>
                        }
                    />

                    {/* Inline search bar */}
                    <Animated.View style={[search_styles.bar_wrapper, { height: searchBarHeight, opacity: searchAnim }]}>
                        <View style={search_styles.bar}>
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                size={14}
                                color="white"
                                style={{ opacity: 0.3, marginRight: 10 }}
                            />
                            <TextInput
                                ref={searchInputRef}
                                style={search_styles.input}
                                placeholder="Search articles..."
                                placeholderTextColor="rgba(255, 255, 255, 0.25)"
                                value={searchQuery}
                                onChangeText={handleSearchChange}
                                returnKeyType="search"
                                autoCapitalize="none"
                                autoCorrect={false}
                                onSubmitEditing={() => Keyboard.dismiss()}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={handleSearchClear} hitSlop={10}>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        size={14}
                                        color="white"
                                        style={{ opacity: 0.3 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>

                    {visible && (
                        <TouchableWithoutFeedback onPress={toggleMenu}>
                            <View style={menu_styles.backdrop} />
                        </TouchableWithoutFeedback>
                    )}

                    {loading && articles.length === 0 ? (
                        <View style={empty_styles.container}>
                            <ActivityIndicator size="large" color="#8B5CF6" />
                            <Text style={[empty_styles.subtitle, { marginTop: 16 }]}>
                                Loading articles...
                            </Text>
                        </View>
                    ) : (
                        <Animated.View style={{ opacity: fadeAnimArticles, transform: [{ translateY: slideAnimArticles }], flex: 1 }}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={articles}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={
                                    articles.length === 0
                                        ? { flexGrow: 1, justifyContent: 'center' }
                                        : { flexGrow: 1 }
                                }
                                bounces={true}
                                alwaysBounceVertical={true}
                                ListEmptyComponent={<EmptyState />}
                                renderItem={({ item }) => (
                                    <View style={{ flexDirection: 'column' }}>
                                        <NewsCard
                                            title={item.title}
                                            url_to_image={item.url_to_image}
                                            published_at={item.published_at}
                                            genre={item.genre ?? ''}
                                            id={item.id}
                                            handleEllipsisPress={handleEllipsisPress}
                                        />
                                        <HorizonalLine />
                                    </View>
                                )}
                                keyExtractor={(item) => item.id}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        tintColor="#8B5CF6"
                                    />
                                }
                            />
                        </Animated.View>
                    )}

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                        onRequestClose={() => setShowModal(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                            <View style={{ flex: 1 }} />
                        </TouchableWithoutFeedback>
                        <View style={[modal_styles.sheet, { top: height - 250 }]}>
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
    article: Article | undefined;
};

const ModalOptions = ({ setShowModal, article }: ModalProps) => {
    const [saved, setSaved] = useState(false);

    const handleOpenInBrowser = useCallback(async () => {
        if (article) {
            const supported = await Linking.canOpenURL(article.url);
            if (supported) {
                await Linking.openURL(article.url);
            }
        }
    }, [article]);

    const handleSave = async () => {
        if (article) {
            const db = await SQLite.openDatabaseAsync('newsapp');
            if (article.saved === 0) {
                article.saved = 1;
                setSaved(true);
                await db.runAsync('UPDATE articles SET saved = 1 WHERE id = ?', article.id);
            } else {
                article.saved = 0;
                setSaved(false);
                await db.runAsync('UPDATE articles SET saved = 0 WHERE id = ?', article.id);
            }
        }
    };

    useEffect(() => {
        if (article) {
            setSaved(article.saved === 1);
        }
    }, [article]);

    return (
        <>
            <View style={modal_styles.close_btn}>
                <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={10}>
                    <FontAwesomeIcon
                        icon={faCircleXmark}
                        color="white"
                        size={20}
                        style={{ opacity: 0.8 }}
                    />
                </TouchableOpacity>
            </View>

            <View style={modal_styles.options_container}>
                <TouchableOpacity style={modal_styles.option} onPress={handleSave}>
                    <IconFontAwesome
                        name={saved ? 'bookmark' : 'bookmark-o'}
                        color="white"
                        size={18}
                        style={{ opacity: 0.8, marginRight: 10 }}
                    />
                    <Text style={modal_styles.option_text}>{saved ? 'Unsave' : 'Save'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={modal_styles.option} onPress={handleOpenInBrowser}>
                    <FontAwesomeIcon
                        icon={faUpRightFromSquare}
                        color="white"
                        size={18}
                        style={{ opacity: 0.8, marginRight: 10 }}
                    />
                    <Text style={modal_styles.option_text}>Open in browser</Text>
                </TouchableOpacity>

                <TouchableOpacity style={modal_styles.option}>
                    <FontAwesomeIcon
                        icon={faBan}
                        color="white"
                        size={18}
                        style={{ opacity: 0.8, marginRight: 10 }}
                    />
                    <Text style={modal_styles.option_text}>Not Interested</Text>
                </TouchableOpacity>

                <TouchableOpacity style={modal_styles.option}>
                    <FontAwesomeIcon
                        icon={faFlag}
                        color="#FF6B6B"
                        size={18}
                        style={{ opacity: 0.8, marginRight: 10 }}
                    />
                    <Text style={[modal_styles.option_text, { color: '#FF6B6B' }]}>Report</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const empty_styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 20,
        color: 'white',
        opacity: 0.7,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'WorkSans-Light',
        fontSize: 15,
        color: 'white',
        opacity: 0.4,
        textAlign: 'center',
    },
});

const search_styles = StyleSheet.create({
    icon_btn: {
        padding: 8,
        marginRight: 8,
    },
    bar_wrapper: {
        overflow: 'hidden',
        paddingHorizontal: 16,
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#141414',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    input: {
        flex: 1,
        fontFamily: 'WorkSans-Regular',
        fontSize: 15,
        color: 'white',
        padding: 0,
    },
});

const menu_styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#141414',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
    },
    trigger_text: {
        fontFamily: 'WorkSans-Light',
        fontSize: 14,
        color: 'white',
        opacity: 0.6,
    },
    text_style: {
        opacity: 0.7,
        fontFamily: 'WorkSans-Regular',
        fontSize: 15,
        color: 'white',
    },
    option_row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    option_selected: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
    },
    icon_wrapper: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    menu_inner: {
        padding: 4,
    },
    dropdown: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: '#141414',
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#2a2a2a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 10,
        width: 140,
        transformOrigin: 'top right',
        overflow: 'hidden',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
    },
});

const modal_styles = StyleSheet.create({
    sheet: {
        position: 'absolute',
        backgroundColor: '#141414',
        justifyContent: 'center',
        alignContent: 'center',
        height: 250,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        width: '100%',
    },
    close_btn: {
        top: 15,
        right: 15,
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    options_container: {
        justifyContent: 'flex-start',
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 8,
    },
    option_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 18,
        color: 'white',
        opacity: 0.8,
    },
});

const base_template = StyleSheet.create({
    theme: {
        flex: 1,
        backgroundColor: '#000000',
    },
    config: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    filter_area: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'visible',
        zIndex: 10,
    },
});
