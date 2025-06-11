import { Text, View, StyleSheet, Image } from 'react-native';
import { card } from '../homepage';

function formatDate(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Invalid input: Please provide a valid Date object.");
    }

    const months: string[] = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    const month: string = months[date.getMonth()];
    const day: number = date.getDate();

    function getOrdinalSuffix(day: number): string {
        if (day > 3 && day < 21) {
            return 'th';
        }
        switch (day % 10) {
            case 1:  return 'st';
            case 2:  return 'nd';
            case 3:  return 'rd';
            default: return 'th';
        }
    }

  return `${month} ${day}${getOrdinalSuffix(day)}`;
}

export const NewsCard = ({ title, url_to_image, published_at, genre }: card) => {
    // renders a news card based off of 'title' prop, and 'image_src' prop
    const date = formatDate(new Date(published_at));
    const uri_image = url_to_image ?? '/Users/htran/repos/tech-news-app/src/assets/images/computer_2.jpg'
    return (
        <View style={card_style.main_card}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <View style={{ width: '60%', flexDirection: 'column', height: 'auto' }}>
                    <Text style={card_style.date}>
                        {date} | {genre}
                    </Text>
                    <View style={{ width: '95%' }}>
                        <Text style={card_style.card_title}>{title}</Text>
                    </View>
                </View>

                <View style={card_style.thumbnail_frame}>
                    <Image source={{ uri: uri_image }} alt="Image" style={card_style.thumbnail_image} />
                </View>
            </View>
        </View>
    );
};

export const card_style = StyleSheet.create({
    // styling for the news card itself
    main_card: {
        flexDirection: 'row',
        backgroundColor: '#000000',
        borderRadius: 5,
        maxHeight: 175,
        width: '98%',
        alignContent: 'center',
        justifyContent: 'center',
        height: 150
    },

    card_title: {
        color: 'white',
        fontSize: 16,
        width: '100%',
        paddingLeft: 2,
        fontFamily: 'WorkSans-Light',
        opacity: 0.8,
    },

    thumbnail_frame: {
        width: '40%',
        height: '80%',
        padding: 2,
    },

    thumbnail_image: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },

    date: {
        flexDirection: 'row',
        fontSize: 13,
        color: 'white',
        fontFamily: 'WorkSans-Light',
        width: '100%',
        paddingLeft: 3,
        paddingBottom: 5,
        opacity: 0.5
    },
});

export default NewsCard;
