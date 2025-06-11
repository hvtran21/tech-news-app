import { View, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faMagnifyingGlass, faBookmark } from '@fortawesome/free-solid-svg-icons';

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

export default BottomNavBar;