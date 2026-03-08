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
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faCheck, faPen } from '@fortawesome/free-solid-svg-icons';
import { TabHeader, theme } from '../components/styles';
import { getUser, upsertUser } from '../components/database';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ProfileScreen() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [hasProfile, setHasProfile] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);

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

    const handleSave = async () => {
        if (displayName.trim().length === 0) return;
        await upsertUser(displayName.trim(), email.trim() || undefined);
        setHasProfile(true);
        setEditing(false);
        setSaved(true);
        Keyboard.dismiss();
        setTimeout(() => setSaved(false), 2000);
    };

    const showForm = !hasProfile || editing;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.theme} edges={['top', 'left', 'right']}>
                <TabHeader title="Profile" />

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.content}>
                            {showForm ? (
                                <Animated.View entering={FadeIn.duration(300)} style={styles.form}>
                                    <View style={styles.avatar_circle}>
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            size={30}
                                            color="white"
                                            style={{ opacity: 0.15 }}
                                        />
                                    </View>

                                    <Text style={styles.form_label}>DISPLAY NAME</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={displayName}
                                        onChangeText={setDisplayName}
                                        placeholder="Your name"
                                        placeholderTextColor={theme.text_tertiary}
                                        autoCapitalize="words"
                                        autoCorrect={false}
                                    />

                                    <Text style={styles.form_label}>EMAIL (OPTIONAL)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="you@example.com"
                                        placeholderTextColor={theme.text_tertiary}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />

                                    <TouchableOpacity
                                        style={[styles.save_button, displayName.trim().length === 0 && { opacity: 0.35 }]}
                                        onPress={handleSave}
                                        activeOpacity={0.8}
                                        disabled={displayName.trim().length === 0}
                                    >
                                        <Text style={styles.save_text}>
                                            {hasProfile ? 'Update profile' : 'Save profile'}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ) : (
                                <Animated.View entering={FadeIn.duration(300)} style={styles.profile_view}>
                                    <View style={styles.avatar_circle_filled}>
                                        <Text style={styles.avatar_initial}>
                                            {displayName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>

                                    <Text style={styles.profile_name}>{displayName}</Text>
                                    {email.length > 0 && (
                                        <Text style={styles.profile_email}>{email}</Text>
                                    )}

                                    {saved && (
                                        <Animated.View entering={FadeIn.duration(200)} style={styles.saved_badge}>
                                            <FontAwesomeIcon icon={faCheck} size={11} color="#4ade80" />
                                            <Text style={styles.saved_text}>Saved</Text>
                                        </Animated.View>
                                    )}

                                    <TouchableOpacity
                                        style={styles.edit_button}
                                        onPress={() => setEditing(true)}
                                        activeOpacity={0.7}
                                    >
                                        <FontAwesomeIcon icon={faPen} size={12} color={theme.text_secondary} style={{ marginRight: 8 }} />
                                        <Text style={styles.edit_text}>Edit profile</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    theme: {
        flex: 1,
        backgroundColor: theme.bg,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
    },
    form: {
        alignItems: 'center',
    },
    avatar_circle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 36,
    },
    avatar_circle_filled: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: theme.accent_soft,
        borderWidth: 1,
        borderColor: theme.accent_border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar_initial: {
        fontFamily: 'WorkSans-Bold',
        fontSize: 34,
        color: theme.accent,
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
        backgroundColor: theme.accent,
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
    profile_view: {
        alignItems: 'center',
    },
    profile_name: {
        fontFamily: 'WorkSans-Bold',
        fontSize: 26,
        color: theme.text,
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    profile_email: {
        fontFamily: 'WorkSans-Light',
        fontSize: 15,
        color: theme.text_tertiary,
    },
    saved_badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
    },
    saved_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 13,
        color: '#4ade80',
    },
    edit_button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 28,
    },
    edit_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 14,
        color: theme.text_secondary,
    },
});
