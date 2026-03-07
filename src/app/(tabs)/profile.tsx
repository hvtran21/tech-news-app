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
import { faUser, faCheck } from '@fortawesome/free-solid-svg-icons';
import { TabHeader } from '../components/styles';
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
                                            size={32}
                                            color="white"
                                            style={{ opacity: 0.3 }}
                                        />
                                    </View>

                                    <Text style={styles.form_label}>Display name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={displayName}
                                        onChangeText={setDisplayName}
                                        placeholder="Your name"
                                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                                        autoCapitalize="words"
                                        autoCorrect={false}
                                    />

                                    <Text style={styles.form_label}>Email (optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="you@example.com"
                                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />

                                    <TouchableOpacity
                                        style={[
                                            styles.save_button,
                                            displayName.trim().length === 0 && { opacity: 0.4 },
                                        ]}
                                        onPress={handleSave}
                                        activeOpacity={0.7}
                                        disabled={displayName.trim().length === 0}
                                    >
                                        <Text style={styles.save_text}>
                                            {hasProfile ? 'Update' : 'Save'}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ) : (
                                <Animated.View entering={FadeIn.duration(300)} style={styles.profile_view}>
                                    <View style={styles.avatar_circle}>
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
                                            <FontAwesomeIcon icon={faCheck} size={12} color="#4ade80" />
                                            <Text style={styles.saved_text}>Saved</Text>
                                        </Animated.View>
                                    )}

                                    <TouchableOpacity
                                        style={styles.edit_button}
                                        onPress={() => setEditing(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.edit_text}>Edit Profile</Text>
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
        backgroundColor: '#000000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    form: {
        alignItems: 'center',
    },
    avatar_circle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#141414',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar_initial: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 32,
        color: '#8B5CF6',
    },
    form_label: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 14,
        color: 'white',
        opacity: 0.5,
        alignSelf: 'flex-start',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        width: '100%',
        backgroundColor: '#141414',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontFamily: 'WorkSans-Regular',
        fontSize: 16,
        color: 'white',
    },
    save_button: {
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginTop: 32,
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
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 24,
        color: 'white',
        marginBottom: 4,
    },
    profile_email: {
        fontFamily: 'WorkSans-Light',
        fontSize: 15,
        color: 'white',
        opacity: 0.4,
        marginBottom: 8,
    },
    saved_badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    saved_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 13,
        color: '#4ade80',
    },
    edit_button: {
        backgroundColor: '#141414',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 28,
        marginTop: 24,
    },
    edit_text: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 15,
        color: 'white',
        opacity: 0.7,
    },
});
