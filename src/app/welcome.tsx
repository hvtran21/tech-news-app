import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';


export const welcomePage = () => {
    const [genres, setGenres] = useState<string[]>([]);
    
    return (
        <SafeAreaProvider>
            <SafeAreaView style={welcomeTemplate.theme} edges={['top', 'left', 'right', 'bottom']}>
                <View style={{}}>
                    <Text style={welcomeTemplate.main_title}>
                        Stay updated.
                    </Text>
                    <Text style={welcomeTemplate.main_title}>
                        No cookies, no emails. 
                    </Text>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

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
        fontSize: 46
    },

    sub_title: {

    },

})


export default welcomePage;