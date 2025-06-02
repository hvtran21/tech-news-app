import React from 'react';
import { Text, TextStyle, StyleSheet, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

type GradientTextProps = {
    text: string;
    colors: [string, string]; //  start color -> end color
    style?: TextStyle;
    summary?: string;
};

export const GradientText: React.FC<GradientTextProps> = ({ text, colors, style }) => {
    return (
        <MaskedView
            maskElement={
                <Text style={[style, { backgroundColor: 'transparent', color: 'black' }]}>
                    {text}
                </Text>
            }
        >
            <LinearGradient
                // gradient goes from left to right
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={[style, { opacity: 0 }]}>{text}</Text>
            </LinearGradient>
        </MaskedView>
    );
};

export const BaseTemplate = StyleSheet.create({
    theme: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'column',
    },

    config: {
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        paddingTop: 20,
        paddingHorizontal: 20,
        fontWeight: 'bold',
        fontFamily: 'Nunito-Bold',
        fontSize: 32,
    },

    sub_title: {
        fontSize: 18,
        fontFamily: 'Nunito-Medium',
        marginTop: 4,
    },
});

export default GradientText;
