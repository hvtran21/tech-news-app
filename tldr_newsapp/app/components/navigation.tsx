import { View, StyleSheet, ScrollView, Text } from 'react-native';
import React from 'react';

export const TopNavigation = () => {
    return (
        <View style={TopNavBar.nav_bar_container}>
            <ScrollView horizontal={true} contentContainerStyle={TopNavBar.scroll_content}>
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
            </ScrollView>
        </View>
    );
};

export const BottomNavigation = () => {
    return (
        <View style={BottomNavBar.nav_bar_container}>

        </View>
    )
};

const BottomNavBar = StyleSheet.create({
    nav_bar_container: {
        width: '100%',
        height: '10%',
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: '#141414',

    },
});

const TopNavBar = StyleSheet.create({
    nav_bar_container: {
        width: '100%',
        height: '10%',
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scroll_content: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: '100%',
    },

    single_nav: {
        width: 90,
        height: 35,
        borderRadius: 15,
        margin: 5,
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
