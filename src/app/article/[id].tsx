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
import { LinearGradient } from 'expo-linear-gradient';
import Article from '../components/constants';
import { formatDate } from '../components/news_card';
import { theme, getTopicColor } from '../components/styles';
import { stripHtml } from '../components/utilities';
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
            const result = (await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [id])) as Article;
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
        if (supported) await Linking.openURL(article.url);
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
    const topicColor = getTopicColor(label);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.theme} edges={['top', 'left', 'right']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 48 }}
                >
                    <Animated.View entering={FadeIn.duration(500)} style={styles.hero_wrapper}>
                        <Image
                            source={imageSource}
                            style={styles.hero_image}
                            contentFit="cover"
                            onError={() => setImageError(true)}
                            transition={300}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(5, 5, 5, 0.6)', theme.bg]}
                            locations={[0.2, 0.6, 1]}
                            style={styles.hero_gradient}
                        />

                        <View style={styles.nav_overlay}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                hitSlop={10}
                                style={styles.nav_btn}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} size={16} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSave} hitSlop={10} style={styles.nav_btn}>
                                <FontAwesomeIcon
                                    icon={saved ? faBookmarkSolid : faBookmarkOutline}
                                    size={16}
                                    color={saved ? theme.accent : 'white'}
                                />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.meta_container}>
                        <View style={[styles.tag_pill, { backgroundColor: topicColor.bg }]}>
                            <Text style={[styles.tag_text, { color: topicColor.color }]}>{label}</Text>
                        </View>
                        <Text style={styles.meta_dot}> </Text>
                        <Text style={styles.meta_date}>{date}</Text>
                        {article.source && (
                            <>
                                <Text style={styles.meta_dot}> </Text>
                                <Text style={styles.source_text}>{article.source}</Text>
                            </>
                        )}
                    </Animated.View>

                    <Animated.View entering={FadeInDown.duration(400).delay(250)} style={styles.content_block}>
                        <Text style={styles.title}>{article.title}</Text>
                    </Animated.View>

                    {article.author && (
                        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.content_block}>
                            <Text style={styles.author_text}>By {article.author}</Text>
                        </Animated.View>
                    )}

                    {article.description && (
                        <Animated.View entering={FadeInDown.duration(400).delay(350)} style={styles.content_block}>
                            <Text style={styles.description}>{stripHtml(article.description)}</Text>
                        </Animated.View>
                    )}

                    {article.content && (
                        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.content_block}>
                            <Text style={styles.content}>{stripHtml(article.content)}</Text>
                        </Animated.View>
                    )}

                    <Animated.View entering={FadeInUp.duration(400).delay(450)} style={styles.content_block}>
                        <TouchableOpacity
                            style={styles.browser_button}
                            onPress={handleOpenInBrowser}
                            activeOpacity={0.8}
                        >
                            <FontAwesomeIcon icon={faUpRightFromSquare} size={15} color="white" style={{ marginRight: 10 }} />
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
        backgroundColor: theme.bg,
    },
    loading_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading_text: {
        fontFamily: 'WorkSans-Light',
        fontSize: 16,
        color: theme.text_tertiary,
    },
    hero_wrapper: {
        width: '100%',
        height: 300,
    },
    hero_image: {
        width: '100%',
        height: '100%',
    },
    hero_gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    nav_overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    nav_btn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    meta_container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 4,
        paddingBottom: 12,
        flexWrap: 'wrap',
        gap: 6,
    },
    tag_pill: {
        backgroundColor: theme.accent_soft,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tag_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 11,
        color: theme.accent,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    meta_dot: {
        color: theme.text_tertiary,
        fontSize: 12,
    },
    meta_date: {
        fontFamily: 'WorkSans-Light',
        fontSize: 13,
        color: theme.text_tertiary,
    },
    source_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 13,
        color: theme.accent,
        opacity: 0.8,
    },
    content_block: {
        paddingHorizontal: 24,
        paddingTop: 4,
    },
    title: {
        fontFamily: 'WorkSans-Bold',
        fontSize: 28,
        color: theme.text,
        lineHeight: 36,
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    author_text: {
        fontFamily: 'WorkSans-LightItalic',
        fontSize: 14,
        color: theme.text_tertiary,
        marginTop: 4,
        marginBottom: 4,
    },
    description: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 17,
        color: 'rgba(255, 255, 255, 0.72)',
        lineHeight: 27,
        marginTop: 16,
    },
    content: {
        fontFamily: 'WorkSans-Light',
        fontSize: 16,
        color: theme.text_secondary,
        lineHeight: 25,
        marginTop: 12,
    },
    browser_button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.accent,
        borderRadius: 14,
        paddingVertical: 16,
        marginTop: 28,
    },
    browser_button_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 16,
        color: 'white',
    },
});
