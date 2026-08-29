import { Stack } from 'expo-router';
import { ClerkProvider, ClerkLoaded } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
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
