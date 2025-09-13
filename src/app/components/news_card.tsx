import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import Animated from 'react-native-reanimated';

function formatDate(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid input: Please provide a valid Date object.');
    }

    const months: string[] = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const month: string = months[date.getMonth()];
    const day: number = date.getDate();

    function getOrdinalSuffix(day: number): string {
        if (day > 3 && day < 21) {
            return 'th';
        }
        switch (day % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    }

    return `${month} ${day}${getOrdinalSuffix(day)}`;
}

interface CardFrontProps {
    title: string;
    url_to_image: string;
    published_at: string;
    genre: string;
    id: string;
    handleEllipsisPress: (id: string) => void;
}

export const NewsCard = ({
    title,
    url_to_image,
    published_at,
    genre,
    id,
    handleEllipsisPress,
}: CardFrontProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [badLoad, setBadLoad] = useState(false);

    const date = formatDate(new Date(published_at));
    const fallBackImage = require('../../assets/images/computer_2.jpg');
    const uri_image = url_to_image ? { uri: url_to_image } : { uri: fallBackImage };
    const label = genre === '' ? 'Top' : genre;

    useEffect(() => {
        const result = Image.prefetch(url_to_image, 'disk');
        if (!result) {
            console.log(`Failed to prefetch url: ${url_to_image}`);
        }
    }, []);

    return (
        <Animated.View style={card_style.main_card}>
            <TouchableOpacity
                style={{ position: 'absolute', top: 0, right: 7 }}
                onPress={() => {
                    handleEllipsisPress(id);
                }}
            >
                <FontAwesomeIcon
                    icon={faEllipsisH}
                    color="white"
                    size={18}
                    style={{ opacity: 0.5, marginBottom: 10 }}
                />
            </TouchableOpacity>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ width: '60%' }} hitSlop={{ top: 30, bottom: 30, right: 80 }}>
                    <View style={{ flexDirection: 'column', height: 'auto' }}>
                        <Text style={card_style.date}>
                            {date} | {label}
                        </Text>
                        <View style={{ width: '95%' }}>
                            <Text style={card_style.card_title}>{title}</Text>
                        </View>
                    </View>
                </View>

                <View style={card_style.thumbnail_frame}>
                    {badLoad && !imageLoaded && (
                        <Image
                            source={fallBackImage}
                            alt="Image"
                            style={card_style.thumbnail_image}
                        />
                    )}
                    {!imageError && (
                        <Image
                            source={imageError ? fallBackImage : uri_image}
                            alt="Image"
                            style={card_style.thumbnail_image}
                            onLoad={(e) => {}}
                            onError={() => {
                                setImageError(true);
                            }}
                        />
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

export const card_style = StyleSheet.create({
    main_card: {
        flexDirection: 'row',
        backgroundColor: '#000000',
        maxHeight: 175,
        alignContent: 'center',
        justifyContent: 'center',
        height: 150,
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
        height: '95%',
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
        opacity: 0.5,
    },
});

export default NewsCard;
