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
    faUpRightFromSquare,
    faBan,
    faFlag,
    faBookmark,
} from '@fortawesome/free-solid-svg-icons';
import IconFontAwesome from '@react-native-vector-icons/fontawesome';
import Article from '../components/constants';
import { getSavedArticles } from '../components/services';
import { NewsCard } from '../components/news_card';
import { TabHeader, HeaderRule, HorizonalLine, theme, tabAccents } from '../components/styles';
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
            const article = (await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [id])) as Article;
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
        if (supported) await Linking.openURL(modalArticle.url);
    };

    const EmptyState = () => (
        <Animated.View entering={FadeIn.duration(500)} style={styles.empty_container}>
            <View style={styles.empty_icon_circle}>
                <FontAwesomeIcon icon={faBookmark} size={28} color="white" style={{ opacity: 0.12 }} />
            </View>
            <Text style={styles.empty_title}>Nothing saved yet</Text>
            <Text style={styles.empty_subtitle}>
                Tap the bookmark on any article to save it for later.
            </Text>
        </Animated.View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.theme} edges={['top', 'left', 'right']}>
                <TabHeader
                    title="Saved"
                    subtitle="Your collection"
                    accent={tabAccents.saved}
                    rightAccessory={
                        savedArticles.length > 0 ? (
                            <View style={styles.count_badge}>
                                <Text style={styles.count_text}>{savedArticles.length}</Text>
                            </View>
                        ) : undefined
                    }
                />
                <HeaderRule accent={tabAccents.saved} />

                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={savedArticles}
                    contentContainerStyle={
                        savedArticles.length === 0
                            ? { flexGrow: 1, justifyContent: 'center' }
                            : { flexGrow: 1, paddingBottom: 20 }
                    }
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
                    <View style={[styles.modal_sheet, { top: height - 240 }]}>
                        <View style={styles.handle_bar} />

                        <View style={styles.modal_content}>
                            <TouchableOpacity style={styles.modal_option} onPress={handleUnsave}>
                                <IconFontAwesome name="bookmark" color="white" size={18} style={{ opacity: 0.7, width: 24 }} />
                                <Text style={styles.modal_text}>Unsave</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modal_option} onPress={handleOpenInBrowser}>
                                <FontAwesomeIcon icon={faUpRightFromSquare} color="white" size={17} style={{ opacity: 0.7 }} />
                                <Text style={styles.modal_text}>Open in browser</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modal_option}>
                                <FontAwesomeIcon icon={faBan} color="white" size={17} style={{ opacity: 0.7 }} />
                                <Text style={styles.modal_text}>Not interested</Text>
                            </TouchableOpacity>

                            <View style={styles.modal_divider} />

                            <TouchableOpacity style={styles.modal_option}>
                                <FontAwesomeIcon icon={faFlag} color={theme.danger} size={16} style={{ opacity: 0.8 }} />
                                <Text style={[styles.modal_text, { color: theme.danger }]}>Report</Text>
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
        backgroundColor: theme.bg,
    },
    count_badge: {
        backgroundColor: theme.accent_soft,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    count_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 13,
        color: theme.accent,
    },
    empty_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 48,
    },
    empty_icon_circle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    empty_title: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 18,
        color: theme.text_secondary,
        marginBottom: 8,
    },
    empty_subtitle: {
        fontFamily: 'WorkSans-Light',
        fontSize: 14,
        color: theme.text_tertiary,
        textAlign: 'center',
        lineHeight: 20,
    },
    modal_sheet: {
        position: 'absolute',
        backgroundColor: theme.elevated,
        height: 240,
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
    modal_content: {
        paddingHorizontal: 16,
    },
    modal_option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 13,
        paddingHorizontal: 8,
    },
    modal_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 16,
        color: theme.text,
    },
    modal_divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.border,
        marginVertical: 4,
    },
});
