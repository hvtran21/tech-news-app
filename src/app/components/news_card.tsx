import { Text, View, StyleSheet, Image } from 'react-native';
import { GradientText } from './styling';
import { text } from '@fortawesome/fontawesome-svg-core';

export type NewsCardProps = {
    // define new type with required data members
    title: string;
    date: string;
    genre: string;
    image_src: any;
};

export const NewsCard = ({ title, image_src, date, genre }: NewsCardProps) => {
    // renders a news card based off of 'title' prop, and 'image_src' prop
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
                    <Image source={image_src} alt="Image" style={card_style.thumbnail_image} />
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
        fontFamily: 'WorkSans-LightItalic',
        width: '100%',
        paddingLeft: 3,
        paddingBottom: 5,
        opacity: 0.5
    },
});

export default NewsCard;
