import * as React from 'react'
import { Text, View, StyleSheet, Image } from 'react-native';

export default function main() {
  return (
    <View style={card_style.main_card}>
      <Text style={card_style.card_title}>Hello there this is a test of the great wonders of React!
          This is a news title summary of an article.
      </Text>
      <View style={card_style.thumbnail_frame}> 
        <Image 
          source={require('../assets/images/computer.jpg')}
          alt='Image'
          style={card_style.thumbnail_image}
         />
      </View>
    </View>
  );
}

const card_style = StyleSheet.create({
  main_card: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    maxHeight: 150,
    width: 'auto'
  },

  card_title: {
    color: 'black',
    fontSize: 18,
    width: "60%",
    padding: 10
  },

  thumbnail_frame: {
    borderColor: 'black',
    backgroundColor: '#ccc',
    width: '40%',
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center'
  },

  thumbnail_image: {
    width: "100%",
    height: "100%",
    borderRadius: 5
  }
});


