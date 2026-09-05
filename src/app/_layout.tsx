import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { ClerkProvider, ClerkLoaded } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { theme } from '@/components/styles';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
    // The native stack lifts both screens during a push/pop, exposing Android's
    // window background -- white by default. contentStyle only paints screens.
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(theme.bg);
    }, []);

    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <ClerkLoaded>
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
                        options={{
                            animation: 'slide_from_right',
                        }}
                    />
                </Stack>
            </ClerkLoaded>
        </ClerkProvider>
    );
}
