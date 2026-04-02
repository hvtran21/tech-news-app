import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
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
import { TabHeader, HeaderRule, HorizonalLine, theme, tabAccents } from '../components/styles';
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
    faXmark,
    faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import IconFontAwesome from '@react-native-vector-icons/fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Article from '../components/constants';
import getArticles, { syncArticles, getAllArticles, searchArticles } from '../components/services';
import { deleteArticlesByAge, canRefreshArticles } from '../components/utilities';
import ReAnimated, { FadeIn } from 'react-native-reanimated';

type MenuOptionProp = {
    title: string;
    icon: IconProp;
    selected: boolean;
    onPress: () => void;
};

const MenuOption = ({ title, selected, icon, onPress }: MenuOptionProp) => {
    return (
        <TouchableHighlight onPress={onPress} underlayColor="rgba(255,255,255,0.04)" style={{ borderRadius: 10 }}>
            <View style={[menu_styles.option_row, selected && menu_styles.option_selected]}>
                <View style={menu_styles.icon_wrapper}>
                    <FontAwesomeIcon
                        icon={icon}
                        size={13}
                        style={{ color: selected ? theme.accent : 'white', opacity: selected ? 1 : 0.45 }}
                    />
                </View>
                <Text style={[menu_styles.option_text, selected && { opacity: 1, color: theme.accent }]}>
                    {title}
                </Text>
            </View>
        </TouchableHighlight>
    );
};

interface MenuFilterProp {
    setFilter: (filterType: string) => void;
    activeFilter: string;
}

const FilterMenu = ({ setFilter, activeFilter }: MenuFilterProp) => {
    return (
        <View style={menu_styles.menu_inner}>
            <MenuOption title="Home" icon={faHouse} selected={activeFilter === 'Home'} onPress={() => setFilter('Home')} />
            <MenuOption title="Recent" icon={faClock} selected={activeFilter === 'Recent'} onPress={() => setFilter('Recent')} />
            <MenuOption title="Top" icon={faBolt} selected={activeFilter === 'Top'} onPress={() => setFilter('Top')} />
        </View>
    );
};

export default function HomeFeed() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Home');

    const [visible, setVisible] = useState(false);
    const heightAnim = useRef(new Animated.Value(0)).current;
    const fadeAnimArticles = useRef(new Animated.Value(0)).current;
    const slideAnimArticles = useRef(new Animated.Value(12)).current;

    const [showModal, setShowModal] = useState(false);
    const [modalArticle, setModalArticle] = useState<Article>();
    const { height } = Dimensions.get('window');

    const [refreshing, setRefreshing] = useState(false);
    const initialLoadDone = useRef(false);

    // Pagination
    const PAGE_SIZE = 20;
    const [page, setPage] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Search
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchAnim = useRef(new Animated.Value(0)).current;
    const searchInputRef = useRef<TextInput>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const preSearchArticles = useRef<Article[]>([]);

    // Scroll-to-top
    const flatListRef = useRef<FlatList>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollTopAnim = useRef(new Animated.Value(0)).current;

    const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
        const y = event.nativeEvent.contentOffset.y;
        const threshold = 1200; // ~10 cards worth of scrolling
        const shouldShow = y > threshold;
        if (shouldShow !== showScrollTop) {
            setShowScrollTop(shouldShow);
            Animated.timing(scrollTopAnim, { toValue: shouldShow ? 1 : 0, duration: 200, useNativeDriver: true }).start();
        }
    }, [showScrollTop, scrollTopAnim]);

    const scrollToTop = useCallback(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);

    const loadByFilter = useCallback(async (activeFilter: string, offset: number = 0): Promise<Article[]> => {
        const userPreferences = await AsyncStorage.getItem('genreSelection');
        if (activeFilter === 'Recent') {
            return await getAllArticles(PAGE_SIZE, offset);
        } else if (activeFilter === 'Top') {
            return (await getArticles(undefined, 'Technology', PAGE_SIZE, offset)) ?? [];
        }
        if (userPreferences) {
            return (await getArticles(userPreferences, undefined, PAGE_SIZE, offset)) ?? [];
        }
        return (await getArticles(undefined, 'Technology', PAGE_SIZE, offset)) ?? [];
    }, []);

    const onRefresh = useCallback(async () => {
        const canRefresh = await canRefreshArticles();
        if (!canRefresh) return;

        setRefreshing(true);
        await deleteArticlesByAge();

        const userPreferences = await AsyncStorage.getItem('genreSelection');
        if (userPreferences) {
            await syncArticles(userPreferences, undefined);
        }
        await syncArticles(undefined, 'Technology');

        const newArticles = await loadByFilter(filter, 0);
        setArticles(newArticles);
        setPage(0);
        setHasMore(newArticles.length >= PAGE_SIZE);
        setRefreshing(false);
    }, [filter, loadByFilter]);

    const loadNextPage = useCallback(async () => {
        if (loadingMore || !hasMore || searchOpen) return;

        setLoadingMore(true);
        const nextOffset = (page + 1) * PAGE_SIZE;
        const nextBatch = await loadByFilter(filter, nextOffset);

        if (nextBatch.length < PAGE_SIZE) {
            setHasMore(false);
        }
        if (nextBatch.length > 0) {
            setArticles((prev) => [...prev, ...nextBatch]);
            setPage((prev) => prev + 1);
        }
        setLoadingMore(false);
    }, [loadingMore, hasMore, searchOpen, page, filter, loadByFilter]);

    const handleEllipsisPress = useCallback((id: string) => {
        const fetchArticle = async () => {
            const db = await SQLite.openDatabaseAsync('newsapp');
            const article = (await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [id])) as Article;
            if (article) {
                setModalArticle(article);
            }
        };
        fetchArticle();
    }, []);

    useEffect(() => {
        if (modalArticle) setShowModal(true);
    }, [modalArticle]);

    const animateContent = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnimArticles, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnimArticles, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start();
    }, [fadeAnimArticles, slideAnimArticles]);

    const resetContentAnim = useCallback(() => {
        fadeAnimArticles.setValue(0);
        slideAnimArticles.setValue(12);
    }, [fadeAnimArticles, slideAnimArticles]);

    const toggleMenu = useCallback(() => {
        const opening = !visible;
        setVisible(opening);
        Animated.timing(heightAnim, { toValue: opening ? 1 : 0, duration: 120, useNativeDriver: true }).start();
    }, [visible, heightAnim]);

    // Search
    const toggleSearch = useCallback(() => {
        const opening = !searchOpen;
        setSearchOpen(opening);
        Animated.timing(searchAnim, { toValue: opening ? 1 : 0, duration: 200, useNativeDriver: false }).start(() => {
            if (opening) {
                searchInputRef.current?.focus();
            } else {
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
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            if (text.trim().length === 0) {
                if (preSearchArticles.current.length > 0) setArticles(preSearchArticles.current);
                return;
            }
            const results = await searchArticles(text.trim());
            setArticles(results);
        }, 300);
    }, []);

    const handleSearchOpen = useCallback(() => {
        preSearchArticles.current = articles;
        toggleSearch();
    }, [articles, toggleSearch]);

    const handleSearchClear = useCallback(() => {
        setSearchQuery('');
        searchInputRef.current?.clear();
        if (preSearchArticles.current.length > 0) setArticles(preSearchArticles.current);
    }, []);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
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

    useEffect(() => {
        const loadArticles = async () => {
            setLoading(true);
            try {
                const existingPreferences = await AsyncStorage.getItem('genreSelection');
                if (existingPreferences) await syncArticles(existingPreferences, undefined);
                await syncArticles(undefined, 'Technology');
                const loadedArticles = await loadByFilter('Home', 0);
                setArticles(loadedArticles);
                setPage(0);
                setHasMore(loadedArticles.length >= PAGE_SIZE);
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

    useEffect(() => {
        if (!initialLoadDone.current) return;
        const applyFilter = async () => {
            setLoading(true);
            try {
                const filtered = await loadByFilter(filter, 0);
                setArticles(filtered);
                setPage(0);
                setHasMore(filtered.length >= PAGE_SIZE);
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
        outputRange: [0, 56],
    });

    const EmptyState = () => (
        <ReAnimated.View entering={FadeIn.duration(500)} style={empty_styles.container}>
            <Text style={empty_styles.title}>
                {searchOpen && searchQuery.length > 0 ? 'No results' : 'No articles yet'}
            </Text>
            <Text style={empty_styles.subtitle}>
                {searchOpen && searchQuery.length > 0
                    ? 'Try different keywords.'
                    : 'Pull down to refresh.'}
            </Text>
        </ReAnimated.View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={base_template.theme} edges={['top', 'left', 'right']}>
                <View style={base_template.config}>
                    <TabHeader
                        title="Feed"
                        subtitle="Your news"
                        accent={tabAccents.feed}
                        rightAccessory={
                            <View style={base_template.header_actions}>
                                <TouchableOpacity
                                    onPress={searchOpen ? toggleSearch : handleSearchOpen}
                                    style={search_styles.icon_btn}
                                    activeOpacity={0.6}
                                    hitSlop={6}
                                >
                                    <FontAwesomeIcon
                                        icon={searchOpen ? faXmark : faMagnifyingGlass}
                                        size={searchOpen ? 16 : 15}
                                        color="white"
                                        style={{ opacity: searchOpen ? 0.5 : 0.35 }}
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
                                        size={11}
                                        style={{ color: 'white', opacity: 0.4 }}
                                    />
                                </TouchableOpacity>

                                <Animated.View
                                    pointerEvents={visible ? 'auto' : 'none'}
                                    style={[menu_styles.dropdown, { transform: [{ scaleY: heightAnim }], opacity: heightAnim }]}
                                >
                                    <FilterMenu
                                        setFilter={(f) => {
                                            setFilter(f);
                                            Animated.timing(heightAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start();
                                            setVisible(false);
                                        }}
                                        activeFilter={filter}
                                    />
                                </Animated.View>
                            </View>
                        }
                    />
                    <HeaderRule accent={tabAccents.feed} />

                    <Animated.View style={[search_styles.bar_wrapper, { height: searchBarHeight, opacity: searchAnim }]}>
                        <View style={search_styles.bar}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} size={13} color="white" style={{ opacity: 0.25, marginRight: 10 }} />
                            <TextInput
                                ref={searchInputRef}
                                style={search_styles.input}
                                placeholder="Search articles..."
                                placeholderTextColor={theme.text_tertiary}
                                value={searchQuery}
                                onChangeText={handleSearchChange}
                                returnKeyType="search"
                                autoCapitalize="none"
                                autoCorrect={false}
                                onSubmitEditing={() => Keyboard.dismiss()}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={handleSearchClear} hitSlop={10}>
                                    <FontAwesomeIcon icon={faCircleXmark} size={14} color="white" style={{ opacity: 0.25 }} />
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
                            <ActivityIndicator size="large" color={theme.accent} />
                            <Text style={[empty_styles.subtitle, { marginTop: 16 }]}>Loading articles...</Text>
                        </View>
                    ) : (
                        <Animated.View style={{ opacity: fadeAnimArticles, transform: [{ translateY: slideAnimArticles }], flex: 1 }}>
                            <FlatList
                                ref={flatListRef}
                                showsVerticalScrollIndicator={false}
                                data={articles}
                                keyboardShouldPersistTaps="handled"
                                onScroll={handleScroll}
                                scrollEventThrottle={100}
                                contentContainerStyle={
                                    articles.length === 0
                                        ? { flexGrow: 1, justifyContent: 'center' }
                                        : { flexGrow: 1, paddingBottom: 20 }
                                }
                                bounces={true}
                                alwaysBounceVertical={true}
                                ListEmptyComponent={<EmptyState />}
                                ItemSeparatorComponent={() => <HorizonalLine />}
                                renderItem={({ item }) => (
                                    <NewsCard
                                        title={item.title}
                                        url_to_image={item.url_to_image}
                                        published_at={item.published_at}
                                        genre={item.genre ?? ''}
                                        id={item.id}
                                        handleEllipsisPress={handleEllipsisPress}
                                    />
                                )}
                                keyExtractor={(item) => item.id}
                                onEndReached={loadNextPage}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={
                                    loadingMore ? (
                                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                            <ActivityIndicator size="small" color={theme.accent} />
                                        </View>
                                    ) : null
                                }
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
                                }
                            />
                        </Animated.View>
                    )}

                    <Animated.View
                        pointerEvents={showScrollTop ? 'auto' : 'none'}
                        style={[fab_styles.container, { opacity: scrollTopAnim, transform: [{ scale: scrollTopAnim }] }]}
                    >
                        <TouchableOpacity onPress={scrollToTop} activeOpacity={0.8} style={fab_styles.button}>
                            <FontAwesomeIcon icon={faArrowUp} size={16} color="white" />
                        </TouchableOpacity>
                    </Animated.View>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                        onRequestClose={() => setShowModal(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                            <View style={{ flex: 1 }} />
                        </TouchableWithoutFeedback>
                        <View style={[modal_styles.sheet, { top: height - 260 }]}>
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
            if (supported) await Linking.openURL(article.url);
        }
    }, [article]);

    const handleSave = async () => {
        if (article) {
            const db = await SQLite.openDatabaseAsync('newsapp');
            const newSaved = saved ? 0 : 1;
            await db.runAsync('UPDATE articles SET saved = ? WHERE id = ?', [newSaved, article.id]);
            setSaved(!saved);
        }
    };

    useEffect(() => {
        if (article) setSaved(article.saved === 1);
    }, [article]);

    return (
        <>
            <View style={modal_styles.handle_bar} />

            <View style={modal_styles.options_container}>
                <TouchableOpacity style={modal_styles.option} onPress={handleSave}>
                    <IconFontAwesome
                        name={saved ? 'bookmark' : 'bookmark-o'}
                        color="white"
                        size={18}
                        style={{ opacity: 0.7, width: 24 }}
                    />
                    <Text style={modal_styles.option_text}>{saved ? 'Unsave' : 'Save'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={modal_styles.option} onPress={handleOpenInBrowser}>
                    <FontAwesomeIcon icon={faUpRightFromSquare} color="white" size={17} style={{ opacity: 0.7 }} />
                    <Text style={modal_styles.option_text}>Open in browser</Text>
                </TouchableOpacity>

                <TouchableOpacity style={modal_styles.option}>
                    <FontAwesomeIcon icon={faBan} color="white" size={17} style={{ opacity: 0.7 }} />
                    <Text style={modal_styles.option_text}>Not interested</Text>
                </TouchableOpacity>

                <View style={modal_styles.divider} />

                <TouchableOpacity style={modal_styles.option}>
                    <FontAwesomeIcon icon={faFlag} color={theme.danger} size={16} style={{ opacity: 0.8 }} />
                    <Text style={[modal_styles.option_text, { color: theme.danger }]}>Report</Text>
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
        fontSize: 18,
        color: theme.text_secondary,
        marginBottom: 6,
    },
    subtitle: {
        fontFamily: 'WorkSans-Light',
        fontSize: 14,
        color: theme.text_tertiary,
        textAlign: 'center',
    },
});

const search_styles = StyleSheet.create({
    icon_btn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bar_wrapper: {
        overflow: 'hidden',
        paddingHorizontal: 20,
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: theme.border,
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
        backgroundColor: theme.surface,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: theme.border,
    },
    trigger_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 13,
        color: theme.text_secondary,
    },
    option_text: {
        opacity: 0.6,
        fontFamily: 'WorkSans-Regular',
        fontSize: 15,
        color: 'white',
    },
    option_row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    option_selected: {
        backgroundColor: theme.accent_soft,
    },
    icon_wrapper: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    menu_inner: {
        padding: 6,
    },
    dropdown: {
        position: 'absolute',
        top: 44,
        right: 0,
        backgroundColor: theme.elevated,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
        zIndex: 10,
        width: 150,
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
        backgroundColor: theme.elevated,
        height: 260,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
        paddingHorizontal: 8,
        width: '100%',
    },
    handle_bar: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignSelf: 'center',
        marginBottom: 20,
    },
    options_container: {
        paddingHorizontal: 16,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 13,
        paddingHorizontal: 8,
    },
    option_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 16,
        color: theme.text,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.border,
        marginVertical: 4,
    },
});

const fab_styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        zIndex: 20,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
});

const base_template = StyleSheet.create({
    theme: {
        flex: 1,
        backgroundColor: theme.bg,
    },
    config: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    header_actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        overflow: 'visible',
        zIndex: 10,
    },
});
