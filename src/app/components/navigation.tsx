import { View, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faMagnifyingGlass, faBookmark } from '@fortawesome/free-solid-svg-icons';

export function BottomNavigation() {
    return (
        <View style={BottomNavBar.nav_bar_container}>
            <View style={BottomNavBar.nav_icon_config}>
                <View style={BottomNavBar.nav_container}>
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        style={{ color: 'white', opacity: 0.9, zIndex: 9999 }}
                    />
                </View>
                <View style={BottomNavBar.nav_container}>
                    <FontAwesomeIcon icon={faHome} style={{ color: 'white', opacity: 0.9 }} />
                </View>
                <View style={BottomNavBar.nav_container}>
                    <FontAwesomeIcon icon={faBookmark} style={{ color: 'white', opacity: 0.9 }} />
                </View>
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
        borderWidth: StyleSheet.hairlineWidth,
    },

    nav_icon_config: {
        justifyContent: 'space-around',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingTop: 15,
    },

    nav_container: {
        width: 100,
        height: 40,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },

    nav_container_selected: {
        width: 100,
        height: 40,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(106,163,255,0.25)',
        borderWidth: 2,
        borderColor: '#6AA3FF',
    },
});

export default BottomNavBar;
