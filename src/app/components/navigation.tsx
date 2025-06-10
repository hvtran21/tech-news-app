import { View, StyleSheet, ScrollView, Text, ImageURISource, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faMagnifyingGlass, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { genre } from '../homepage';

export const TopNavigation = ({value}: genre) => {
    const [genres, setGenres] = useState<string[]>([]);
    useEffect(() => {
        const get_genres = () => {
            setGenres(value.split(','));
        }
        get_genres();
    }, [value])
    
    return (
        <View style={TopNavBar.nav_bar_container}>
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={TopNavBar.scroll_content}
            >
                <TouchableOpacity style={TopNavBar.single_nav}>
                    <Text style={TopNavBar.single_nav_text}>Top News</Text>
                </TouchableOpacity>
                {genres.map((genre, index) => {
                    return (
                        <TouchableOpacity key={index} style={TopNavBar.single_nav}>
                            <Text style={TopNavBar.single_nav_text}>{genre}</Text>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </View>
    );
};

export function BottomNavigation() {
    return (
        <View style={BottomNavBar.nav_bar_container}>
            <View style={BottomNavBar.nav_icon_config}>
                <FontAwesomeIcon icon={faUser} style={{ color: 'white', opacity: 0.9 }} />
                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: 'white', opacity: 0.9 }} />
                <FontAwesomeIcon icon={faBookmark} style={{ color: 'white', opacity: 0.9 }} />
            </View>
        </View>
    );
}

const BottomNavBar = StyleSheet.create({
    nav_bar_container: {
        width: '100%',
        height: '5%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#000000',
        borderTopColor: '#141414',
        borderWidth: StyleSheet.hairlineWidth
    },

    nav_icon_config: {
        justifyContent: 'space-around',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingTop: 15,
    },
});

const TopNavBar = StyleSheet.create({
    nav_bar_container: {
        height: '7%',
        marginTop: 5,
        borderBottomColor: '#141414',
        borderWidth: StyleSheet.hairlineWidth
    },

    scroll_content: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
    },

    single_nav: {
        width: 85,
        height: 35,
        borderRadius: 15,
        margin: 6,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#141414',
    },

    single_nav_text: {
        fontSize: 14,
        fontFamily: 'WorkSans-Light',
        color: 'white',
        opacity: 0.8
    },
});

export default TopNavigation;
