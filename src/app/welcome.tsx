import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { initializeDatabase } from './components/database';
import { theme, topicColors } from './components/styles';

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
            <SafeAreaView style={welcomeStyles.theme} edges={['top', 'left', 'right', 'bottom']}>
                <LinearGradient
                    colors={['rgba(6, 182, 212, 0.06)', 'transparent']}
                    style={welcomeStyles.bg_gradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.5 }}
                />

                <Animated.View
                    entering={FadeInDown.duration(700)}
                    style={welcomeStyles.title_container}
                >
                    <Text style={welcomeStyles.main_title}>Stay{'\n'}updated.</Text>
                    <Text style={welcomeStyles.subtitle_italic}>No cookies, no emails.</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeIn.duration(800).delay(300)}
                    style={welcomeStyles.preference_header}
                >
                    <Text style={welcomeStyles.section_label}>CHOOSE YOUR INTERESTS</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.duration(600).delay(500)}
                    style={welcomeStyles.genre_container}
                >
                    {genre_arr.map((item, index) => {
                        const isSelected = userGenreSelection.includes(item);
                        const tc = topicColors[item];
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => toggleGenre(item)}
                                activeOpacity={0.7}
                            >
                                <Animated.View
                                    entering={FadeIn.duration(400).delay(500 + index * 60)}
                                    style={[
                                        welcomeStyles.chip,
                                        isSelected && tc && {
                                            backgroundColor: tc.bg,
                                            borderColor: tc.color + '40',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            welcomeStyles.chip_text,
                                            isSelected && tc && {
                                                color: tc.color,
                                                fontFamily: 'WorkSans-SemiBold',
                                            },
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
                    style={welcomeStyles.info_container}
                >
                    <Text style={welcomeStyles.info_text}>Select up to {limit}</Text>
                    <Text style={[welcomeStyles.info_text, { fontSize: 13, marginTop: 12 }]}>
                        {"Or don't \u2014 that's fine too."}
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
                        activeOpacity={0.8}
                        style={welcomeStyles.submit_button}
                    >
                        <LinearGradient
                            colors={['#06B6D4', '#0891B2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={welcomeStyles.submit_gradient}
                        >
                            <Text style={welcomeStyles.submit_text}>Get started</Text>
                            <FontAwesomeIcon
                                icon={faArrowRight}
                                size={16}
                                color="white"
                            />
                        </LinearGradient>
                    </TouchableOpacity>

                    {userGenreSelection.length > 0 && (
                        <Animated.View entering={FadeIn.duration(200)}>
                            <Text style={welcomeStyles.selection_count}>
                                {userGenreSelection.length} of {limit} selected
                            </Text>
                        </Animated.View>
                    )}
                </Animated.View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const welcomeStyles = StyleSheet.create({
    theme: {
        flex: 1,
        backgroundColor: theme.bg,
    },
    bg_gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
    },
    title_container: {
        paddingHorizontal: 28,
        paddingTop: 48,
    },
    main_title: {
        fontFamily: 'WorkSans-Bold',
        color: 'white',
        fontSize: 52,
        lineHeight: 58,
        letterSpacing: -1.5,
    },
    subtitle_italic: {
        fontFamily: 'WorkSans-LightItalic',
        fontSize: 20,
        color: theme.text_secondary,
        marginTop: 8,
    },
    preference_header: {
        paddingHorizontal: 28,
        marginTop: 40,
        marginBottom: 20,
    },
    section_label: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 11,
        color: theme.text_tertiary,
        letterSpacing: 2,
    },
    genre_container: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 8,
    },
    chip: {
        backgroundColor: theme.surface,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: theme.border,
    },
    chip_text: {
        color: theme.text_secondary,
        fontFamily: 'WorkSans-Regular',
        fontSize: 15,
    },
    info_container: {
        alignItems: 'center',
        marginTop: 24,
    },
    info_text: {
        fontFamily: 'WorkSans-Light',
        fontSize: 14,
        color: theme.text_tertiary,
    },
    submit_button: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    submit_gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    submit_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 17,
        color: 'white',
    },
    selection_count: {
        fontFamily: 'WorkSans-Light',
        fontSize: 13,
        color: theme.text_tertiary,
        textAlign: 'center',
        marginTop: 12,
    },
});
