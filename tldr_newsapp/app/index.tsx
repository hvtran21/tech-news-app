import * as React from 'react'
import Box from '@mui/material/Box';
import { Text, View, StyleSheet } from 'react-native';
<style>
  @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
</style>

export default function main() {
  return (
    <View style={card_style.card}>
      <Text style={card_style.title}>Hello there this is a test of the great wonders of React!</Text>
    </View>
  );
}

const card_style = StyleSheet.create({

  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 150,
  },

  title: {
    color: 'black',
    fontSize: 18,
  },

});


