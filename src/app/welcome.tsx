import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TouchableHighlight } from 'react-native';
import { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import { openDatabaseAsync } from 'expo-sqlite';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

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

export const welcomePage = () => {
    const [genre, setGenres] = useState('');
    const [submit, setSubmit] = useState(0);
    const [userGenreSelection, setuserGenreSelection] = useState<string[]>([]);
    const genre_arr = Object.values(options) as string[];
    const limit = 5;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (genre && !userGenreSelection.includes(genre) && userGenreSelection.length < limit) {
            setuserGenreSelection((prev) => [...prev, genre]);
            console.log(`${genre} added to preferences.`);
        }
    }, [genre]);

    useEffect(() => {
        const initializeDatabase = async () => {
            const db = await openDatabaseAsync('newsapp');
            await db.execAsync('DROP TABLE IF EXISTS articles;');
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
        };
        initializeDatabase().catch(console.error);
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={welcomeTemplate.theme} edges={['top', 'left', 'right', 'bottom']}>
                {/* Welcome title and subtitle */}
                <View style={welcomeTemplate.title_container}>
                    <Text style={welcomeTemplate.main_title}>Stay updated.</Text>
                    <Text
                        style={{
                            fontFamily: 'WorkSans-LightItalic',
                            fontSize: 30,
                            opacity: 0.8,
                            color: 'white',
                        }}
                    >
                        No cookies, no emails.
                    </Text>
                </View>

                {/* user preference selection */}
                <View
                    style={{
                        height: 'auto',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginBottom: 30,
                        marginTop: 30,
                    }}
                >
                    <Text style={welcomeTemplate.sub_title}>Choose some preferences</Text>
                </View>
                {/* render all genres. TODO: Make this a ScrollView/FlatList */}
                <View style={genreStyling.genre_container}>
                    {genre_arr.map((item, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setGenres(item);
                                }}
                            >
                                <View
                                    style={[
                                        genreStyling.icon_container,
                                        userGenreSelection.includes(item) &&
                                            genreStyling.highlight_icon,
                                    ]}
                                >
                                    <Text style={genreStyling.icon_text}>{item}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View
                    style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                    }}
                >
                    {/* user info msg */}
                    <Text
                        style={{
                            fontFamily: 'WorkSans-LightItalic',
                            fontSize: 16,
                            color: 'white',
                            opacity: 0.5,
                            margin: 2,
                        }}
                    >
                        Select up to 5
                    </Text>
                    <Text
                        style={{
                            fontFamily: 'WorkSans-LightItalic',
                            fontSize: 14,
                            color: 'white',
                            opacity: 0.5,
                            marginTop: 15,
                        }}
                    >
                        Or not, that's fine.
                    </Text>
                </View>

                {/* submit button view */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: insets.bottom + 24,
                        right: 50,
                    }}
                >
                    <Link
                        href={{
                            pathname: '/homepage',
                            params: { data: userGenreSelection.join(',') },
                        }}
                        onPress={() => {
                            setSubmit(1);
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            size={20}
                            style={[
                                genreStyling.submit_button,
                                submit === 1 && genreStyling.submit_button_pushed,
                            ]}
                        />
                    </Link>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

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
        opacity: 0.9,
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
        backgroundColor: '#1f1f1f',
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

    submit_button: {
        color: 'white',
        opacity: 0.9,
    },

    submit_button_pushed: {
        color: 'white',
        opacity: 0.5,
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

export default welcomePage;
