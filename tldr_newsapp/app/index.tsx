import * as React from 'react'
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import NewsCard from './components/news_card'


export default function main() {
  const [fontsLoaded] = useFonts ({
  'Nunito-Light': require('../assets/fonts/Nunito/static/Nunito-Light.ttf')
})
 const title='Hackers broke into Commvaults cloud backup system and stole secret passwords that let them access customers Microsoft.'
 const image_src=require('/Users/htran/repos/tldr_newsapp/tldr_newsapp/assets/images/computer.jpg')

  return (
    <SafeAreaView style={base.theme} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView>
        <NewsCard
        title={title}
        image_src={image_src}
        />
      </ScrollView>
    </SafeAreaView>
  );
}


const base = StyleSheet.create({
  theme: {
    flex: 1,
    backgroundColor: '#000000'
  }
})
