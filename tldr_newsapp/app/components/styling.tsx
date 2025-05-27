import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

type GradientTextProps = {
  text: string,
  colors: [string, string], //  start color -> end color
  style?: TextStyle,
  summary?: string
}

export const GradientText: React.FC<GradientTextProps> = ({ text, colors, style }) => {
  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent', color: 'black' }]}>
          {text}
        </Text>
      }>
      <LinearGradient
        // gradient goes from left to right
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}>
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

export const BaseTemplate = StyleSheet.create({
  theme: {
    flex: 1,
    backgroundColor: '#000000'
  },

  config: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
  }
})

export default GradientText
