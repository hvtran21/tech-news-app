import React from 'react';
import { Text, TextStyle, StyleSheet, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

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

interface TabHeaderProps {
    title: string;
    rightAccessory?: React.ReactNode;
}

export const TabHeader = ({ title, rightAccessory }: TabHeaderProps) => {
    return (
        <Animated.View entering={FadeInDown.duration(300)} style={header_styles.container}>
            <Text style={header_styles.title}>{title}</Text>
            {rightAccessory}
        </Animated.View>
    );
};

const header_styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomColor: '#1a1a1a',
        borderBottomWidth: StyleSheet.hairlineWidth,
        overflow: 'visible',
        zIndex: 10,
    },
    title: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 28,
        color: 'white',
    },
});

export const HorizonalLine = () => {
    return (
        <View
            style={{
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: '#141414',
                width: '98%',
            }}
        ></View>
    );
};

export default GradientText;
