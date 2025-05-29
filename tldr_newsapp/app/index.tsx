import * as React from 'react'
import { ScrollView, View, FlatList } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { NewsCard, HighlightCard } from './components/news_card'
import { BaseTemplate, GradientText } from './components/styling'

export default function main() {
  const [fontsLoaded] = useFonts ({
  'Nunito-Light': require('../assets/fonts/Nunito/static/Nunito-Light.ttf'),
  'Nunito-Bold': require('../assets/fonts/Nunito/static/Nunito-Bold.ttf')
})
 const title='Hackers broke into Commvaults cloud backup system and stole secret passwords'
 const image_src=require('/Users/htran/repos/tldr_newsapp/tldr_newsapp/assets/images/computer.jpg')
 const date='May 24th'
 const genre='Cybersecurity'

 const title_2='Product-Led Growth (PLG) changed the game. Instead of being sold bloated software over steak dinners and locked into multi-year contracts'
 const image_src_2=require('/Users/htran/repos/tldr_newsapp/tldr_newsapp/assets/images/computer_2.jpg')
 const date_2='May 24th'
 const genre_2='AI'

  return (
    <SafeAreaProvider>
      <SafeAreaView style={BaseTemplate.theme} edges={['top', 'left', 'right', 'bottom']}>
        <View style={BaseTemplate.config}>
          <GradientText colors={["#C54B8C", "#6A5ACD"]} text='TLDR Newsletter' style={BaseTemplate.title}></GradientText>
          <ScrollView>
            <HighlightCard title={title_2} image_src={image_src_2} date={date_2} genre={genre_2} />
            <NewsCard title={title} image_src={image_src} date={date} genre={genre} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
