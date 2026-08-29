import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faUpRightFromSquare,
    faBookmark as faBookmarkSolid,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkOutline } from '@fortawesome/free-regular-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Article from '../components/constants';
import { getDb } from '../components/database';
import { formatDate } from '../components/NewsCard';
import { theme, getTopicColor } from '../components/styles';
import { stripHtml } from '../components/utilities';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const fallBackImage = require('../../assets/images/computer_2.jpg');

// Best-effort domain for display only — falls back to the raw url if parsing fails.
function getHostname(url: string): string {
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0];
}

export default function ArticleDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [saved, setSaved] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    useEffect(() => {
        const loadArticle = async () => {
            const db = await getDb();
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
        const db = await getDb();
        const newSaved = saved ? 0 : 1;
        await db.runAsync('UPDATE articles SET saved = ? WHERE id = ?', [newSaved, article.id]);
        setArticle({ ...article, saved: newSaved });
        setSaved(!saved);
    };

    const handleConfirmOpenInBrowser = async () => {
        setShowLeaveModal(false);
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
                            onPress={() => setShowLeaveModal(true)}
                            activeOpacity={0.8}
                        >
                            <FontAwesomeIcon icon={faUpRightFromSquare} size={15} color="white" style={{ marginRight: 10 }} />
                            <Text style={styles.browser_button_text}>Read full article</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>

                <Modal
                    visible={showLeaveModal}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => {}}
                >
                    <View style={styles.modal_backdrop}>
                        <View style={styles.modal_card}>
                            <TouchableOpacity
                                onPress={() => setShowLeaveModal(false)}
                                hitSlop={12}
                                style={styles.modal_close_btn}
                            >
                                <FontAwesomeIcon icon={faXmark} size={13} color={theme.text_secondary} />
                            </TouchableOpacity>

                            <ScrollView
                                bounces={false}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.modal_scroll_content}
                            >
                                <View style={styles.modal_icon_circle}>
                                    <FontAwesomeIcon icon={faUpRightFromSquare} size={18} color={theme.accent} />
                                </View>
                                <Text style={styles.modal_title}>Leaving the app</Text>
                                <Text style={styles.modal_subtitle}>This will open in your browser:</Text>

                                <View style={styles.modal_url_box}>
                                    <Text style={styles.modal_url_host} numberOfLines={1}>
                                        {getHostname(article.url)}
                                    </Text>
                                    <Text style={styles.modal_url_text}>{article.url}</Text>
                                </View>
                            </ScrollView>

                            <View style={styles.modal_actions}>
                                <TouchableOpacity
                                    style={[styles.modal_button, styles.modal_button_secondary]}
                                    onPress={() => setShowLeaveModal(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modal_button_secondary_text}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modal_button, styles.modal_button_primary]}
                                    onPress={handleConfirmOpenInBrowser}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modal_button_primary_text}>Continue</Text>
                                </TouchableOpacity>
                            </View>
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
    modal_backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modal_card: {
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        backgroundColor: theme.elevated,
        borderRadius: 24,
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 24,
    },
    modal_close_btn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    modal_scroll_content: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 20,
    },
    modal_icon_circle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.accent_soft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modal_title: {
        fontFamily: 'WorkSans-Bold',
        fontSize: 19,
        color: theme.text,
        marginBottom: 6,
        textAlign: 'center',
    },
    modal_subtitle: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 14,
        color: theme.text_secondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    modal_url_box: {
        width: '100%',
        backgroundColor: theme.surface,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.border,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    modal_url_host: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 15,
        color: theme.accent,
        marginBottom: 4,
    },
    modal_url_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 13,
        color: theme.text_secondary,
        lineHeight: 18,
    },
    modal_actions: {
        flexDirection: 'row',
        gap: 12,
    },
    modal_button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal_button_secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    modal_button_secondary_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 15,
        color: theme.text,
    },
    modal_button_primary: {
        backgroundColor: theme.accent,
    },
    modal_button_primary_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 15,
        color: 'white',
    },
});
