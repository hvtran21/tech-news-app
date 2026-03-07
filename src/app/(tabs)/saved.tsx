import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    Dimensions,
    TouchableWithoutFeedback,
    Linking,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCircleXmark,
    faUpRightFromSquare,
    faBan,
    faFlag,
    faBookmark,
} from '@fortawesome/free-solid-svg-icons';
import IconFontAwesome from '@react-native-vector-icons/fontawesome';
import Article from '../components/constants';
import { getSavedArticles } from '../components/services';
import { NewsCard } from '../components/news_card';
import { TabHeader, HorizonalLine } from '../components/styles';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function SavedScreen() {
    const [savedArticles, setSavedArticles] = useState<Article[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalArticle, setModalArticle] = useState<Article>();
    const { height } = Dimensions.get('window');

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const articles = await getSavedArticles();
                setSavedArticles(articles);
            };
            load();
        }, []),
    );

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

    const handleUnsave = async () => {
        if (!modalArticle) return;
        const db = await SQLite.openDatabaseAsync('newsapp');
        await db.runAsync('UPDATE articles SET saved = 0 WHERE id = ?', modalArticle.id);
        setShowModal(false);
        const updated = await getSavedArticles();
        setSavedArticles(updated);
    };

    const handleOpenInBrowser = async () => {
        if (!modalArticle) return;
        const supported = await Linking.canOpenURL(modalArticle.url);
        if (supported) {
            await Linking.openURL(modalArticle.url);
        }
    };

    const EmptyState = () => (
        <Animated.View entering={FadeIn.duration(500)} style={styles.empty_container}>
            <FontAwesomeIcon
                icon={faBookmark}
                size={40}
                color="white"
                style={{ opacity: 0.15, marginBottom: 16 }}
            />
            <Text style={styles.empty_title}>No saved articles</Text>
            <Text style={styles.empty_subtitle}>
                Articles you save will appear here for easy access.
            </Text>
        </Animated.View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.theme} edges={['top', 'left', 'right']}>
                <TabHeader
                    title="Saved"
                    rightAccessory={
                        <Text style={styles.header_count}>
                            {savedArticles.length}{' '}
                            {savedArticles.length === 1 ? 'article' : 'articles'}
                        </Text>
                    }
                />

                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={savedArticles}
                    contentContainerStyle={
                        savedArticles.length === 0
                            ? { flexGrow: 1, justifyContent: 'center' }
                            : { flexGrow: 1 }
                    }
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
                />

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showModal}
                    onRequestClose={() => setShowModal(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                        <View style={{ flex: 1 }} />
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
                            <TouchableOpacity style={styles.modal_option} onPress={handleUnsave}>
                                <IconFontAwesome
                                    name="bookmark"
                                    color="white"
                                    size={18}
                                    style={{ opacity: 0.8, marginRight: 10 }}
                                />
                                <Text style={styles.modal_text}>Unsave</Text>
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
    header_count: {
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
