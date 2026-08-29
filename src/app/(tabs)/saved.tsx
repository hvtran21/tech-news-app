import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Linking } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import Article from '../components/constants';
import { ArticleActionSheet } from '../components/ArticleActionSheet';
import { getDb } from '../components/database';
import { getSavedArticles } from '../components/services';
import { NewsCard } from '../components/NewsCard';
import { TabHeader, HeaderRule, HorizonalLine, theme } from '../components/styles';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function SavedScreen() {
    const [savedArticles, setSavedArticles] = useState<Article[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalArticle, setModalArticle] = useState<Article>();

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
            const db = await getDb();
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
        const db = await getDb();
        await db.runAsync('UPDATE articles SET saved = 0 WHERE id = ?', modalArticle.id);
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
                    rightAccessory={
                        savedArticles.length > 0 ? (
                            <View style={styles.count_badge}>
                                <Text style={styles.count_text}>{savedArticles.length}</Text>
                            </View>
                        ) : undefined
                    }
                />
                <HeaderRule />

                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={savedArticles}
                    contentContainerStyle={
                        savedArticles.length === 0
                            ? { flexGrow: 1, justifyContent: 'center' }
                            : { flexGrow: 1, paddingBottom: 130 }
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

                <ArticleActionSheet
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    article={modalArticle}
                    saved
                    onToggleSave={handleUnsave}
                    onOpenInBrowser={handleOpenInBrowser}
                />
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
});
