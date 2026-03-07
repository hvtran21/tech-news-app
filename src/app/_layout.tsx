import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000000' },
                animation: 'fade',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
                name="article/[id]"
                options={{
                    animation: 'slide_from_right',
                }}
            />
        </Stack>
    );
}
