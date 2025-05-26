import { Text, View, StyleSheet, Image } from 'react-native';


export type NewsCardProps = {
  // define new type with required data members
  title: string;
  image_src: any;
}

export const NewsCard = ({ title, image_src }: NewsCardProps) => {
  // renders a news card based off of 'title' prop, and 'image_src' prop
  return (
    <View style={card_style.main_card}>
      <Text style={card_style.card_title}>
        {title}
      </Text>
      <View style={card_style.thumbnail_frame}>
        <Image source={image_src} alt='Image' style={card_style.thumbnail_image} />
      </View>
    </View>
  )
}

export const card_style = StyleSheet.create({
  // styling for the news card itself
  main_card: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#141414',
    padding: 5,
    margin: 8,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    maxHeight: 150,
    width: 'auto'
  },

  card_title: {
    color: 'white',
    fontSize: 16,
    width: '60%',
    height: 'auto',
    padding: 8,
    fontFamily: 'Nunito-Light',
    
  },

  thumbnail_frame: {
    borderColor: 'black',
    width: '40%',
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  thumbnail_image: {
    width: '100%',
    height: '100%',
    borderRadius: 5
  },

  date: {
    fontSize: 10,
  }
});

export default NewsCard;
