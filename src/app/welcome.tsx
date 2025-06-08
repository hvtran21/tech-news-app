import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import { techGenres } from './components/article';

export const welcomePage = () => {
    const [genre, setGenres] = useState("");
    const [userGenreSelection, setuserGenreSelection] = useState<string[]>([]);
    const genre_arr = Object.values(techGenres) as string[];
    const limit = 3;

    useEffect(() => {
        if (genre && !userGenreSelection.includes(genre) && userGenreSelection.length < limit) {
            setuserGenreSelection(prev => [...prev, genre]);
            console.log(`${genre} added to preferences.`);
        }
    }, [genre])
    
    
    return (
        <SafeAreaProvider>
            <SafeAreaView style={welcomeTemplate.theme} edges={['top', 'left', 'right', 'bottom']}>

                {/* Welcome title and subtitle */}
                <View style={welcomeTemplate.title_container}>
                    <Text style={welcomeTemplate.main_title}>
                        Stay updated.
                    </Text>
                    <Text style={{
                        fontFamily: 'WorkSans-LightItalic',
                        fontSize: 30,
                        opacity: 0.8,
                        color: 'white'
                    }}>
                        No cookies, no emails. 
                    </Text>
                </View>

                {/* user preference selection */}
                <View style={{ 
                    height: 'auto',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginBottom: 30,
                    marginTop: 30,
                    }}>
                    <Text style={welcomeTemplate.sub_title}>
                        What do you like?
                    </Text>
                </View>
                {/* render all genres. TODO: Make this a ScrollView/FlatList */}
                <View style={genreStyling.genre_container}>
                    {genre_arr.map((item, index) => {
                        return (
                            <TouchableOpacity onPress={() => {setGenres(item)}}>
                                <View 
                                key={index}
                                style={[genreStyling.icon_container, userGenreSelection.includes(item) && genreStyling.highlight_icon]}>
                                    <Text style={genreStyling.icon_text}>{item}</Text>
                                </View>
                            </TouchableOpacity>    
                        )
                    })}
                </View>

                <View
                style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                    
                }}>
                    {/* user info msg */}
                    <Text
                    style={{
                        fontFamily: 'WorkSans-LightItalic',
                        fontSize: 16,
                        color: 'white',
                        opacity: 0.5,
                        margin: 2
                    }}>
                        Select at least 3 
                    </Text>
                    <Text
                    style={{
                        fontFamily: 'WorkSans-LightItalic',
                        fontSize: 14,
                        color: 'white',
                        opacity: 0.5,
                        margin: 2
                    }}>
                        Or not. That's fine. 
                    </Text>
                </View>
                
                {/* submit button view */}
                <View
                style={{
                    borderColor: 'white',
                    borderWidth: 1,
                    width: '90%',
                    height: '20%'
                }}>
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
        padding: 15
    },

    icon_text: {
        color: 'white',
        opacity: 0.8,
        fontFamily: 'WorkSans-Regular', 
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
        borderColor: 'white',
        borderWidth: 1
    }
})

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
        fontSize: 40
    },

    sub_title: {
        fontFamily: 'WorkSans-Regular',
        color: 'white',
        opacity: 0.6,
        fontSize: 24
    },

    title_container: {
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 45,
        height: 'auto',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }
})


export default welcomePage;