import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faUpRightFromSquare,
    faBookmark as faBookmarkSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkOutline } from '@fortawesome/free-regular-svg-icons';
import Article from '../components/constants';
import { formatDate } from '../components/news_card';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const fallBackImage = require('../../assets/images/computer_2.jpg');

export default function ArticleDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [saved, setSaved] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const loadArticle = async () => {
            const db = await SQLite.openDatabaseAsync('newsapp');
            const result = (await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [
                id,
            ])) as Article;
            if (result) {
                setArticle(result);
                setSaved(result.saved === 1);
            }
        };
        if (id) loadArticle();
    }, [id]);

    const handleSave = async () => {
        if (!article) return;
        const db = await SQLite.openDatabaseAsync('newsapp');
        const newSaved = saved ? 0 : 1;
        await db.runAsync('UPDATE articles SET saved = ? WHERE id = ?', [newSaved, article.id]);
        article.saved = newSaved;
        setSaved(!saved);
    };

    const handleOpenInBrowser = async () => {
        if (!article) return;
        const supported = await Linking.canOpenURL(article.url);
        if (supported) {
            await Linking.openURL(article.url);
        }
    };

    if (!article) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.theme}>
                    <View style={styles.loading_container}>
                        <Text style={styles.loading_text}>Loading...</Text>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    const imageSource =
        article.url_to_image && !imageError
            ? { uri: article.url_to_image }
            : fallBackImage;
    const date = formatDate(new Date(article.published_at));
    const label = article.genre || article.category || 'Top';

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.theme} edges={['top', 'left', 'right']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Header with back button */}
                    <View style={styles.nav_header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            hitSlop={10}
                            style={styles.back_button}
                        >
                            <FontAwesomeIcon
                                icon={faArrowLeft}
                                size={18}
                                color="white"
                                style={{ opacity: 0.8 }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSave} hitSlop={10}>
                            <FontAwesomeIcon
                                icon={saved ? faBookmarkSolid : faBookmarkOutline}
                                size={18}
                                color={saved ? '#8B5CF6' : 'white'}
                                style={{ opacity: 0.8 }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Hero image */}
                    <Animated.View entering={FadeIn.duration(400)}>
                        <Image
                            source={imageSource}
                            style={styles.hero_image}
                            contentFit="cover"
                            onError={() => setImageError(true)}
                            transition={300}
                        />
                    </Animated.View>

                    {/* Article meta */}
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(150)}
                        style={styles.meta_container}
                    >
                        <Text style={styles.meta_text}>
                            {date} | {label}
                        </Text>
                        {article.source && (
                            <Text style={styles.source_text}>{article.source}</Text>
                        )}
                    </Animated.View>

                    {/* Title */}
                    <Animated.View
                        entering={FadeInDown.duration(400).delay(250)}
                        style={styles.content_container}
                    >
                        <Text style={styles.title}>{article.title}</Text>
                    </Animated.View>

                    {/* Author */}
                    {article.author && (
                        <Animated.View
                            entering={FadeInDown.duration(400).delay(300)}
                            style={styles.content_container}
                        >
                            <Text style={styles.author_text}>By {article.author}</Text>
                        </Animated.View>
                    )}

                    {/* Description */}
                    {article.description && (
                        <Animated.View
                            entering={FadeInDown.duration(400).delay(350)}
                            style={styles.content_container}
                        >
                            <Text style={styles.description}>{article.description}</Text>
                        </Animated.View>
                    )}

                    {/* Content */}
                    {article.content && (
                        <Animated.View
                            entering={FadeInDown.duration(400).delay(400)}
                            style={styles.content_container}
                        >
                            <Text style={styles.content}>{article.content}</Text>
                        </Animated.View>
                    )}

                    {/* Open in browser button */}
                    <Animated.View
                        entering={FadeInUp.duration(400).delay(450)}
                        style={styles.content_container}
                    >
                        <TouchableOpacity
                            style={styles.browser_button}
                            onPress={handleOpenInBrowser}
                            activeOpacity={0.7}
                        >
                            <FontAwesomeIcon
                                icon={faUpRightFromSquare}
                                size={16}
                                color="white"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.browser_button_text}>Read full article</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    theme: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loading_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading_text: {
        fontFamily: 'WorkSans-Light',
        fontSize: 16,
        color: 'white',
        opacity: 0.5,
    },
    nav_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    back_button: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#141414',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hero_image: {
        width: '100%',
        height: 240,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    meta_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    meta_text: {
        fontFamily: 'WorkSans-Light',
        fontSize: 14,
        color: 'white',
        opacity: 0.5,
    },
    source_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 13,
        color: '#8B5CF6',
        opacity: 0.9,
    },
    content_container: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    title: {
        fontFamily: 'WorkSans-Bold',
        fontSize: 26,
        color: 'white',
        opacity: 0.9,
        lineHeight: 34,
    },
    author_text: {
        fontFamily: 'WorkSans-LightItalic',
        fontSize: 14,
        color: 'white',
        opacity: 0.5,
        marginTop: 4,
    },
    description: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 17,
        color: 'white',
        opacity: 0.75,
        lineHeight: 26,
        marginTop: 12,
    },
    content: {
        fontFamily: 'WorkSans-Light',
        fontSize: 16,
        color: 'white',
        opacity: 0.6,
        lineHeight: 24,
        marginTop: 8,
    },
    browser_button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 24,
    },
    browser_button_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 16,
        color: 'white',
    },
});
