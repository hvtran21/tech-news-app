import { Text, View, StyleSheet, Image } from 'react-native';


export type NewsCardProps = {
  // define new type with required data members
  title: string;
  date: string;
  genre: string;
  image_src: any;
}

export const NewsCard = ({ title, image_src, date, genre }: NewsCardProps) => {
  // renders a news card based off of 'title' prop, and 'image_src' prop
  return (
    <View style={card_style.main_card}>
      <View style={{ width: '60%', flexDirection: 'column', alignItems: 'flex-start'}}>
        <Text style={card_style.date}>
          {date} | {genre}
        </Text>

        <Text style={card_style.card_title}>
          {title}
        </Text>
        {/* TODO: Add in summary */}
      </View>

      <View style={card_style.thumbnail_frame}>
        <Image source={image_src} alt='Image' style={card_style.thumbnail_image} />
      </View>
  
    </View>
  )
}

export const HighlightCard = ({ title, image_src, date, genre }: NewsCardProps) => {
  return(
    <View style={card_style.highlight_card}>
      <View style={{ width: '60%', flexDirection: 'column', alignItems: 'flex-start'}}>

        <Text style={card_style.date}>
          {date} | {genre}
        </Text>

        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <View style={card_style.highlight_thumbnail}>
            <Image source={image_src} alt='Image' style={card_style.thumbnail_image} />
          </View>

          <Text style={card_style.highlight_title}>
            {title}
          </Text>

        </View>


      </View>
    </View>
  )
}

export const card_style = StyleSheet.create({
  highlight_card: {
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
    height: 300,
    width: 'auto',
  },

  highlight_thumbnail: {
    width: '75%',
    height: '75%',
    padding: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  highlight_title: {
    color: 'white',
    fontSize: 16,
    width: '85%',
    height: '80%',
    padding: 5,
    fontFamily: 'Nunito-Light',
  },

  highlight_summary: {
    
  },

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
    width: '100%',
    height: '80%',
    padding: 5,
    fontFamily: 'Nunito-Light',
    
  },

  thumbnail_frame: {
    width: '40%',
    padding: 5,
    borderRadius: 5,
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
    flexDirection: 'row',
    fontSize: 11,
    color: 'white',
    fontFamily: 'Nunito-Light',
    width: '100%',
    padding: 5
  }
});

export default NewsCard;
