import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faCheck, faPen, faChevronRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabHeader, HeaderRule, theme, tabAccents, topicColors } from '../components/styles';
import { getUser, upsertUser } from '../components/database';
import Animated, { FadeIn } from 'react-native-reanimated';

const genreOptions = [
    'Artificial Intelligence',
    'Machine Learning',
    'Apple',
    'Microsoft',
    'Amazon',
    'Google',
    'Gaming',
    'Cybersecurity',
    'Game development',
    'Nintendo',
    'Tesla',
    'Space Tech',
    'Startups',
    'Blockchain',
    'Robotics',
];

function GenrePreferences() {
    const [selected, setSelected] = useState<string[]>([]);
    const [saved, setSaved] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const stored = await AsyncStorage.getItem('genreSelection');
                if (stored) setSelected(stored.split(','));
                setLoaded(true);
            };
            load();
        }, []),
    );

    const toggle = async (genre: string) => {
        let next: string[];
        if (selected.includes(genre)) {
            next = selected.filter((g) => g !== genre);
        } else {
            next = [...selected, genre];
        }
        setSelected(next);
        if (next.length > 0) {
            await AsyncStorage.setItem('genreSelection', next.join(','));
        } else {
            await AsyncStorage.removeItem('genreSelection');
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    return (
        <View style={styles.section}>
            <View style={styles.section_header}>
                <Text style={styles.section_label}>INTERESTS</Text>
                {saved && (
                    <Animated.View entering={FadeIn.duration(200)} style={styles.saved_inline}>
                        <FontAwesomeIcon icon={faCheck} size={10} color="#4ade80" />
                        <Text style={styles.saved_inline_text}>Updated</Text>
                    </Animated.View>
                )}
            </View>
            <Text style={styles.section_hint}>
                {selected.length} selected
            </Text>
            <View style={styles.chip_container}>
                {!loaded ? null : genreOptions.map((genre, index) => {
                    const active = selected.includes(genre);
                    const tc = topicColors[genre];
                    return (
                        <TouchableOpacity key={genre} onPress={() => toggle(genre)} activeOpacity={0.7}>
                            <Animated.View
                                entering={FadeIn.duration(350).delay(index * 40)}
                                style={[
                                    styles.chip,
                                    active && tc && {
                                        backgroundColor: tc.bg,
                                        borderColor: tc.color + '40',
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chip_text,
                                        active && tc && {
                                            color: tc.color,
                                            fontFamily: 'WorkSans-SemiBold',
                                        },
                                    ]}
                                >
                                    {genre}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

function ProfileCard({
    displayName,
    email,
    onEdit,
}: {
    displayName: string;
    email: string;
    onEdit: () => void;
}) {
    return (
        <TouchableOpacity style={styles.profile_card} onPress={onEdit} activeOpacity={0.7}>
            {displayName ? (
                <View style={styles.card_avatar_filled}>
                    <Text style={styles.card_avatar_initial}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
            ) : (
                <View style={styles.card_avatar_empty}>
                    <FontAwesomeIcon icon={faUser} size={18} color="white" style={{ opacity: 0.15 }} />
                </View>
            )}
            <View style={styles.card_info}>
                <Text style={styles.card_name}>
                    {displayName || 'Set up your profile'}
                </Text>
                {email.length > 0 && <Text style={styles.card_email}>{email}</Text>}
            </View>
            <FontAwesomeIcon icon={faChevronRight} size={13} color={theme.text_tertiary} />
        </TouchableOpacity>
    );
}

function ProfileEditor({
    displayName,
    email,
    hasProfile,
    onDone,
}: {
    displayName: string;
    email: string;
    hasProfile: boolean;
    onDone: () => void;
}) {
    const [name, setName] = useState(displayName);
    const [mail, setMail] = useState(email);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (name.trim().length === 0) return;
        await upsertUser(name.trim(), mail.trim() || undefined);
        setSaved(true);
        Keyboard.dismiss();
        setTimeout(() => {
            setSaved(false);
            onDone();
        }, 1000);
    };

    return (
        <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
            <View style={styles.editor_header}>
                <TouchableOpacity onPress={onDone} hitSlop={10} style={styles.back_btn}>
                    <FontAwesomeIcon icon={faArrowLeft} size={16} color="white" />
                </TouchableOpacity>
                <Text style={styles.editor_title}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.editor_content}>
                        <View style={styles.avatar_circle}>
                            {name.trim() ? (
                                <Text style={styles.avatar_initial}>
                                    {name.trim().charAt(0).toUpperCase()}
                                </Text>
                            ) : (
                                <FontAwesomeIcon icon={faUser} size={30} color="white" style={{ opacity: 0.15 }} />
                            )}
                        </View>

                        <Text style={styles.form_label}>DISPLAY NAME</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your name"
                            placeholderTextColor={theme.text_tertiary}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />

                        <Text style={styles.form_label}>EMAIL (OPTIONAL)</Text>
                        <TextInput
                            style={styles.input}
                            value={mail}
                            onChangeText={setMail}
                            placeholder="you@example.com"
                            placeholderTextColor={theme.text_tertiary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TouchableOpacity
                            style={[styles.save_button, name.trim().length === 0 && { opacity: 0.35 }]}
                            onPress={handleSave}
                            activeOpacity={0.8}
                            disabled={name.trim().length === 0}
                        >
                            <Text style={styles.save_text}>
                                {saved ? 'Saved!' : hasProfile ? 'Update profile' : 'Save profile'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Animated.View>
    );
}

export default function ProfileScreen() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [hasProfile, setHasProfile] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const user = await getUser();
                if (user) {
                    setDisplayName(user.display_name ?? '');
                    setEmail(user.email ?? '');
                    setHasProfile(true);
                }
            };
            load();
        }, []),
    );

    const handleEditDone = async () => {
        const user = await getUser();
        if (user) {
            setDisplayName(user.display_name ?? '');
            setEmail(user.email ?? '');
            setHasProfile(true);
        }
        setEditingProfile(false);
    };

    if (editingProfile) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.theme} edges={['top', 'left', 'right']}>
                    <ProfileEditor
                        displayName={displayName}
                        email={email}
                        hasProfile={hasProfile}
                        onDone={handleEditDone}
                    />
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.theme} edges={['top', 'left', 'right']}>
                <TabHeader title="Profile" subtitle="Your account" accent={tabAccents.profile} />
                <HeaderRule accent={tabAccents.profile} />

                <ScrollView
                    contentContainerStyle={styles.scroll_content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.section}>
                        <Text style={styles.section_label}>PROFILE</Text>
                        <ProfileCard
                            displayName={displayName}
                            email={email}
                            onEdit={() => setEditingProfile(true)}
                        />
                    </View>

                    <GenrePreferences />
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
    scroll_content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    section_header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    section_label: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 11,
        color: theme.text_tertiary,
        letterSpacing: 2,
        marginBottom: 12,
    },
    section_hint: {
        fontFamily: 'WorkSans-Light',
        fontSize: 13,
        color: theme.text_tertiary,
        marginTop: -6,
        marginBottom: 14,
    },
    saved_inline: {
        position: 'absolute',
        right: 0,
        top: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    saved_inline_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 12,
        color: '#4ade80',
    },
    chip_container: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        backgroundColor: theme.surface,
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 21,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: theme.border,
    },
    chip_text: {
        color: theme.text_secondary,
        fontFamily: 'WorkSans-Regular',
        fontSize: 14,
    },
    profile_card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 16,
    },
    card_avatar_filled: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: tabAccents.profile + '18',
        borderWidth: 1,
        borderColor: tabAccents.profile + '35',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    card_avatar_initial: {
        fontFamily: 'WorkSans-Bold',
        fontSize: 18,
        color: tabAccents.profile,
    },
    card_avatar_empty: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.elevated,
        borderWidth: 1,
        borderColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    card_info: {
        flex: 1,
    },
    card_name: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 16,
        color: theme.text,
    },
    card_email: {
        fontFamily: 'WorkSans-Light',
        fontSize: 13,
        color: theme.text_tertiary,
        marginTop: 2,
    },
    editor_header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    back_btn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editor_title: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 17,
        color: theme.text,
    },
    editor_content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        alignItems: 'center',
    },
    avatar_circle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: tabAccents.profile + '18',
        borderWidth: 1,
        borderColor: tabAccents.profile + '35',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 36,
    },
    avatar_initial: {
        fontFamily: 'WorkSans-Bold',
        fontSize: 34,
        color: tabAccents.profile,
    },
    form_label: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 11,
        color: theme.text_tertiary,
        letterSpacing: 1.5,
        alignSelf: 'flex-start',
        marginBottom: 8,
        marginTop: 20,
    },
    input: {
        width: '100%',
        backgroundColor: theme.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontFamily: 'WorkSans-Regular',
        fontSize: 16,
        color: 'white',
    },
    save_button: {
        backgroundColor: tabAccents.profile,
        borderRadius: 14,
        paddingVertical: 16,
        marginTop: 36,
        width: '100%',
        alignItems: 'center',
    },
    save_text: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 16,
        color: 'white',
    },
});
