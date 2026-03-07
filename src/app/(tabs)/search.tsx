import { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Modal,
    Dimensions,
    TouchableWithoutFeedback,
    Linking,
    Keyboard,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCircleXmark,
    faUpRightFromSquare,
    faBan,
    faFlag,
    faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import IconFontAwesome from '@react-native-vector-icons/fontawesome';
import Article from '../components/constants';
import { searchArticles } from '../components/services';
import { NewsCard } from '../components/news_card';
import { HorizonalLine } from '../components/styles';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const SearchEmptyState = ({ hasSearched }: { hasSearched: boolean }) => (
    <View style={styles.empty_container}>
        <FontAwesomeIcon
            icon={faMagnifyingGlass}
            size={36}
            color="white"
            style={{ opacity: 0.15, marginBottom: 16 }}
        />
        <Text style={styles.empty_title}>
            {hasSearched ? 'No results found' : 'Search articles'}
        </Text>
        <Text style={styles.empty_subtitle}>
            {hasSearched
                ? 'Try different keywords or check your spelling.'
                : 'Find articles by title or description.'}
        </Text>
    </View>
);

export default function SearchScreen() {
    const [results, setResults] = useState<Article[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [showClear, setShowClear] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalArticle, setModalArticle] = useState<Article>();
    const { height } = Dimensions.get('window');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queryRef = useRef('');
    const inputRef = useRef<TextInput>(null);

    const performSearch = useCallback(async (text: string) => {
        if (text.trim().length === 0) {
            setResults([]);
            setHasSearched(false);
            return;
        }
        setHasSearched(true);
        const articles = await searchArticles(text.trim());
        setResults(articles);
    }, []);

    const handleTextChange = useCallback(
        (text: string) => {
            const wasEmpty = queryRef.current.length === 0;
            const isEmpty = text.length === 0;
            queryRef.current = text;
            if (wasEmpty !== isEmpty) {
                setShowClear(!isEmpty);
            }
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            debounceTimer.current = setTimeout(() => {
                performSearch(text);
            }, 400);
        },
        [performSearch],
    );

    const handleClear = useCallback(() => {
        queryRef.current = '';
        inputRef.current?.clear();
        setShowClear(false);
        setResults([]);
        setHasSearched(false);
    }, []);

    const handleEllipsisPress = useCallback((id: string) => {
        const fetchArticle = async () => {
            const db = await SQLite.openDatabaseAsync('newsapp');
            const article = (await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [
                id,
            ])) as Article;
            if (article) {
                setModalArticle(article);
                setShowModal(true);
            }
        };
        fetchArticle();
    }, []);

    const handleSaveToggle = async () => {
        if (!modalArticle) return;
        const db = await SQLite.openDatabaseAsync('newsapp');
        const newSaved = modalArticle.saved === 1 ? 0 : 1;
        await db.runAsync('UPDATE articles SET saved = ? WHERE id = ?', [
            newSaved,
            modalArticle.id,
        ]);
        setModalArticle({ ...modalArticle, saved: newSaved });
        setShowModal(false);
    };

    const handleOpenInBrowser = async () => {
        if (!modalArticle) return;
        const supported = await Linking.canOpenURL(modalArticle.url);
        if (supported) {
            await Linking.openURL(modalArticle.url);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.theme} edges={['top', 'left', 'right']}>
                <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                    <Text style={styles.header_title}>Search</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(100).duration(400)}
                    style={styles.search_bar_container}
                >
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        size={16}
                        color="white"
                        style={{ opacity: 0.4, marginRight: 10 }}
                    />
                    <TextInput
                        ref={inputRef}
                        style={styles.search_input}
                        placeholder="Search by title or description..."
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        onChangeText={handleTextChange}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    {showClear && (
                        <TouchableOpacity onPress={handleClear} hitSlop={10}>
                            <FontAwesomeIcon
                                icon={faCircleXmark}
                                size={16}
                                color="white"
                                style={{ opacity: 0.4 }}
                            />
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {hasSearched && results.length > 0 && (
                    <Animated.View entering={FadeIn.duration(300)} style={styles.results_count}>
                        <Text style={styles.results_count_text}>
                            {results.length} {results.length === 1 ? 'result' : 'results'}
                        </Text>
                    </Animated.View>
                )}

                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={results}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        results.length === 0
                            ? { flexGrow: 1, justifyContent: 'center' }
                            : { flexGrow: 1 }
                    }
                    ListEmptyComponent={
                        <SearchEmptyState hasSearched={hasSearched} />
                    }
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
                />

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showModal}
                    onRequestClose={() => setShowModal(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />
                    </TouchableWithoutFeedback>
                    <View style={[styles.modal_sheet, { top: height - 225 }]}>
                        <View style={styles.modal_close}>
                            <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={10}>
                                <FontAwesomeIcon
                                    icon={faCircleXmark}
                                    color="white"
                                    size={20}
                                    style={{ opacity: 0.8 }}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modal_content}>
                            <TouchableOpacity
                                style={styles.modal_option}
                                onPress={handleSaveToggle}
                            >
                                <IconFontAwesome
                                    name="bookmark"
                                    color="white"
                                    size={18}
                                    style={{ opacity: 0.8, marginRight: 10 }}
                                />
                                <Text style={styles.modal_text}>
                                    {modalArticle?.saved === 1 ? 'Unsave' : 'Save'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modal_option}
                                onPress={handleOpenInBrowser}
                            >
                                <FontAwesomeIcon
                                    icon={faUpRightFromSquare}
                                    color="white"
                                    size={18}
                                    style={{ opacity: 0.8, marginRight: 10 }}
                                />
                                <Text style={styles.modal_text}>Open in browser</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modal_option}>
                                <FontAwesomeIcon
                                    icon={faBan}
                                    color="white"
                                    size={18}
                                    style={{ opacity: 0.8, marginRight: 10 }}
                                />
                                <Text style={styles.modal_text}>Not Interested</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modal_option}>
                                <FontAwesomeIcon
                                    icon={faFlag}
                                    color="#FF6B6B"
                                    size={18}
                                    style={{ opacity: 0.8, marginRight: 10 }}
                                />
                                <Text style={[styles.modal_text, { color: '#FF6B6B' }]}>
                                    Report
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    theme: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
    },
    header_title: {
        fontFamily: 'WorkSans-Bold',
        fontSize: 28,
        color: 'white',
        opacity: 0.9,
    },
    search_bar_container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#141414',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    search_input: {
        flex: 1,
        fontFamily: 'WorkSans-Regular',
        fontSize: 16,
        color: 'white',
        padding: 0,
    },
    results_count: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    results_count_text: {
        fontFamily: 'WorkSans-Light',
        fontSize: 14,
        color: 'white',
        opacity: 0.4,
    },
    empty_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    empty_title: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 20,
        color: 'white',
        opacity: 0.7,
        marginBottom: 8,
    },
    empty_subtitle: {
        fontFamily: 'WorkSans-Light',
        fontSize: 15,
        color: 'white',
        opacity: 0.4,
        textAlign: 'center',
    },
    modal_sheet: {
        position: 'absolute',
        backgroundColor: '#141414',
        justifyContent: 'center',
        alignContent: 'center',
        height: 225,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        width: '100%',
    },
    modal_close: {
        top: 15,
        right: 15,
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modal_content: {
        justifyContent: 'flex-start',
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 20,
    },
    modal_option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 8,
    },
    modal_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 18,
        color: 'white',
        opacity: 0.8,
    },
});
