import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { openDatabaseAsync } from 'expo-sqlite';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

enum options {
    AI = 'Artificial Intelligence',
    ML = 'Machine Learning',
    APPLE = 'Apple',
    MICROSOFT = 'Microsoft',
    AMAZON = 'Amazon',
    GAMING = 'Gaming',
    CYBERSECURITY = 'Cybersecurity',
    GAME_DEVELOPMENT = 'Game development',
    NINTENDO = 'Nintendo',
}

async function initializeDatabase() {
    const db = await openDatabaseAsync('newsapp');

    await db.execAsync(`
        DROP TABLE IF EXISTS articles;
    `);

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        genre TEXT,
        category TEXT,
        source TEXT,
        author TEXT,
        title TEXT,
        description TEXT,
        url TEXT,
        url_to_image TEXT,
        published_at TEXT,
        content TEXT,
        saved INTEGER CHECK (saved IN (0, 1)) DEFAULT 0
    );`);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS metadata (
        latest_article_query TEXT
    );`);
}

export default function WelcomePage() {
    const [userGenreSelection, setUserGenreSelection] = useState<string[]>([]);
    const genre_arr = Object.values(options) as string[];
    const limit = 5;
    const insets = useSafeAreaInsets();

    const toggleGenre = (genre: string) => {
        setUserGenreSelection((prev) => {
            if (prev.includes(genre)) {
                return prev.filter((g) => g !== genre);
            }
            if (prev.length < limit) {
                return [...prev, genre];
            }
            return prev;
        });
    };

    useEffect(() => {
        initializeDatabase();
    }, []);

    const handleSubmit = async () => {
        if (userGenreSelection.length > 0) {
            await AsyncStorage.setItem('genreSelection', userGenreSelection.join(','));
        }
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={welcomeTemplate.theme} edges={['top', 'left', 'right', 'bottom']}>
                <Animated.View
                    entering={FadeInDown.duration(600)}
                    style={welcomeTemplate.title_container}
                >
                    <Text style={welcomeTemplate.main_title}>Stay updated.</Text>
                    <Text style={welcomeTemplate.subtitle_italic}>No cookies, no emails.</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeIn.duration(800).delay(300)}
                    style={genreStyling.preference_header}
                >
                    <Text style={welcomeTemplate.sub_title}>Choose some preferences</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.duration(600).delay(500)}
                    style={genreStyling.genre_container}
                >
                    {genre_arr.map((item, index) => {
                        const isSelected = userGenreSelection.includes(item);
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => toggleGenre(item)}
                                activeOpacity={0.7}
                            >
                                <Animated.View
                                    entering={FadeIn.duration(400).delay(500 + index * 60)}
                                    style={[
                                        genreStyling.icon_container,
                                        isSelected && genreStyling.highlight_icon,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            genreStyling.icon_text,
                                            isSelected && { opacity: 1 },
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </Animated.View>
                            </TouchableOpacity>
                        );
                    })}
                </Animated.View>

                <Animated.View
                    entering={FadeIn.duration(600).delay(800)}
                    style={genreStyling.info_container}
                >
                    <Text style={genreStyling.info_text}>Select up to {limit}</Text>
                    <Text style={[genreStyling.info_text, { fontSize: 14, marginTop: 15 }]}>
                        Or not, that's fine.
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeIn.duration(400).delay(1000)}
                    style={{
                        position: 'absolute',
                        bottom: insets.bottom + 24,
                        right: 24,
                        left: 24,
                    }}
                >
                    <TouchableOpacity
                        onPress={handleSubmit}
                        activeOpacity={0.7}
                        style={genreStyling.submit_button}
                    >
                        <Text style={genreStyling.submit_text}>Get started</Text>
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            size={16}
                            color="white"
                        />
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const genreStyling = StyleSheet.create({
    icon_container: {
        backgroundColor: '#141414',
        width: 'auto',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
        marginRight: 4,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 15,
        padding: 15,
    },
    icon_text: {
        color: 'white',
        opacity: 0.6,
        fontFamily: 'WorkSans-Light',
        fontSize: 16,
    },
    genre_container: {
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        height: 'auto',
    },
    highlight_icon: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.4)',
    },
    submit_button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8B5CF6',
        borderRadius: 14,
        paddingVertical: 16,
        gap: 8,
    },
    submit_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 17,
        color: 'white',
    },
    preference_header: {
        height: 'auto',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
        marginTop: 30,
    },
    info_container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    info_text: {
        fontFamily: 'WorkSans-LightItalic',
        fontSize: 16,
        color: 'white',
        opacity: 0.5,
        margin: 2,
    },
});

const welcomeTemplate = StyleSheet.create({
    theme: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        flexDirection: 'column',
    },
    main_title: {
        fontFamily: 'WorkSans-Bold',
        color: 'white',
        opacity: 0.8,
        fontSize: 40,
        marginTop: 20,
    },
    subtitle_italic: {
        fontFamily: 'WorkSans-LightItalic',
        fontSize: 30,
        opacity: 0.8,
        color: 'white',
    },
    sub_title: {
        fontFamily: 'WorkSans-Light',
        color: 'white',
        opacity: 0.6,
        fontSize: 24,
    },
    title_container: {
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 55,
        height: 'auto',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
