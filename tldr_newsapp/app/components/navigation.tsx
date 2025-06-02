import { View, StyleSheet, ScrollView, Text, ImageURISource, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHouse, faUser, faMagnifyingGlass, faBookmark } from '@fortawesome/free-solid-svg-icons';
import {} from '@fortawesome/free-regular-svg-icons';

export const TopNavigation = () => {
    return (
        <View style={TopNavBar.nav_bar_container}>
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={TopNavBar.scroll_content}
            >
                <View style={TopNavBar.single_nav}>
                    <Text style={TopNavBar.single_nav_text}>Top News</Text>
                </View>
                <View style={TopNavBar.single_nav}>
                    <Text style={TopNavBar.single_nav_text}>Tech</Text>
                </View>
                <View style={TopNavBar.single_nav}>
                    <Text style={TopNavBar.single_nav_text}>WebDev</Text>
                </View>
                <View style={TopNavBar.single_nav}>
                    <Text style={TopNavBar.single_nav_text}>DevOps</Text>
                </View>
                <View style={TopNavBar.single_nav}>
                    <Text style={TopNavBar.single_nav_text}>AI</Text>
                </View>
            </ScrollView>
        </View>
    );
};

export function BottomNavigation() {
    return (
        <View style={BottomNavBar.nav_bar_container}>
            <View style={BottomNavBar.nav_icon_config}>
                <FontAwesomeIcon icon={faUser} style={{ color: 'white' }} />
                <FontAwesomeIcon icon={faHouse} style={{ color: 'white' }} />
                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: 'white' }} />
                <FontAwesomeIcon icon={faBookmark} style={{ color: 'white' }} />
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
        borderTopColor: '#282828',
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
        borderBottomColor: '#282828',
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
        fontFamily: 'Nunito-Medium',
        color: 'white',
    },
});

export default TopNavigation;
