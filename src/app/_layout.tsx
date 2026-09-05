import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { ClerkProvider, ClerkLoaded } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActionSheetProvider } from '@/components/ArticleActionSheet';
import { theme } from '@/components/styles';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
    // The native stack lifts both screens during a push/pop, exposing Android's
    // window background -- white by default. contentStyle only paints screens.
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(theme.bg).catch((error) => {
            console.warn('[system-ui] could not set window background:', error);
        });
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
                <ClerkLoaded>
                    {/* Above the Stack, so the action sheet covers the tab bar. */}
                    <SafeAreaProvider>
                        <ActionSheetProvider>
                            <Stack
                                screenOptions={{
                                    headerShown: false,
                                    contentStyle: { backgroundColor: '#000000' },
                                    animation: 'fade',
                                }}
                            >
                                <Stack.Screen name="index" />
                                <Stack.Screen name="welcome" />
                                <Stack.Screen name="sign-in" />
                                <Stack.Screen name="(tabs)" />
                                <Stack.Screen
                                    name="article/[id]"
                                    options={{ animation: 'slide_from_right' }}
                                />
                            </Stack>
                        </ActionSheetProvider>
                    </SafeAreaProvider>
                </ClerkLoaded>
            </ClerkProvider>
        </GestureHandlerRootView>
    );
}
