import React from 'react';
import { Text, TextStyle, StyleSheet, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

export const theme = {
    bg: '#050505',
    surface: '#0e0e0e',
    elevated: '#161616',
    accent: '#06B6D4',
    accent_soft: 'rgba(6, 182, 212, 0.10)',
    accent_border: 'rgba(6, 182, 212, 0.22)',
    text: 'rgba(255, 255, 255, 0.90)',
    text_secondary: 'rgba(255, 255, 255, 0.50)',
    text_tertiary: 'rgba(255, 255, 255, 0.28)',
    border: 'rgba(255, 255, 255, 0.06)',
    danger: '#EF4444',
};

export const tabAccents = {
    feed: '#06B6D4',
    saved: '#F59E0B',
    profile: '#A78BFA',
} as const;

export const topicColors: Record<string, { color: string; bg: string }> = {
    'Artificial Intelligence': { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.10)' },
    'Machine Learning':       { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.10)' },
    'Apple':                  { color: '#F472B6', bg: 'rgba(244, 114, 182, 0.10)' },
    'Microsoft':              { color: '#34D399', bg: 'rgba(52, 211, 153, 0.10)' },
    'Amazon':                 { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.10)' },
    'Google':                 { color: '#4ADE80', bg: 'rgba(74, 222, 128, 0.10)' },
    'Gaming':                 { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.10)' },
    'Cybersecurity':          { color: '#F87171', bg: 'rgba(248, 113, 113, 0.10)' },
    'Game development':       { color: '#C084FC', bg: 'rgba(192, 132, 252, 0.10)' },
    'Nintendo':               { color: '#E879F9', bg: 'rgba(232, 121, 249, 0.10)' },
    'Tesla':                  { color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.10)' },
    'Space Tech':             { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.10)' },
    'Startups':               { color: '#FB7185', bg: 'rgba(251, 113, 133, 0.10)' },
    'Blockchain':             { color: '#FACC15', bg: 'rgba(250, 204, 21, 0.10)' },
    'Robotics':               { color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.10)' },
    'Technology':             { color: '#2DD4BF', bg: 'rgba(45, 212, 191, 0.10)' },
    'Top':                    { color: '#2DD4BF', bg: 'rgba(45, 212, 191, 0.10)' },
};

export function getTopicColor(topic: string) {
    return topicColors[topic] ?? { color: theme.accent, bg: theme.accent_soft };
}

type GradientTextProps = {
    text: string;
    colors: [string, string];
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
    subtitle?: string;
    accent?: string;
}

export const TabHeader = ({ title, rightAccessory, subtitle, accent = theme.accent }: TabHeaderProps) => {
    return (
        <Animated.View entering={FadeIn.duration(450)} style={header_styles.container}>
            <View style={header_styles.title_row}>
                <View style={[header_styles.accent_bar, { backgroundColor: accent }]} />
                <View style={header_styles.title_block}>
                    {subtitle && (
                        <Text style={[header_styles.subtitle, { color: accent }]}>
                            {subtitle}
                        </Text>
                    )}
                    <GradientText
                        text={title}
                        colors={['#ffffff', 'rgba(255,255,255,0.48)']}
                        style={header_styles.title}
                    />
                </View>
            </View>
            {rightAccessory}
        </Animated.View>
    );
};

export const HeaderRule = ({ accent = theme.accent }: { accent?: string }) => (
    <View style={header_styles.rule_wrapper}>
        <LinearGradient
            colors={[accent, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={header_styles.rule_line}
        />
    </View>
);

const header_styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 6,
        overflow: 'visible',
        zIndex: 10,
    },
    title_row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    accent_bar: {
        width: 3,
        height: 32,
        borderRadius: 2,
        marginRight: 12,
    },
    title_block: {
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'WorkSans-Bold',
        fontSize: 30,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 10,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        marginBottom: 1,
        opacity: 0.7,
    },
    rule_wrapper: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    rule_line: {
        height: StyleSheet.hairlineWidth * 2,
        borderRadius: 1,
    },
});

export const HorizonalLine = () => {
    return (
        <View
            style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: theme.border,
                marginHorizontal: 20,
            }}
        />
    );
};

export default GradientText;
