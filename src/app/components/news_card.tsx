import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

function formatDate(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }

    const months: string[] = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const month: string = months[date.getMonth()];
    const day: number = date.getDate();

    function getOrdinalSuffix(day: number): string {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    return `${month} ${day}${getOrdinalSuffix(day)}`;
}

export { formatDate };

interface CardFrontProps {
    title: string;
    url_to_image: string;
    published_at: string;
    genre: string;
    id: string;
    handleEllipsisPress: (id: string) => void;
}

const fallBackImage = require('../../assets/images/computer_2.jpg');

export const NewsCard = ({
    title,
    url_to_image,
    published_at,
    genre,
    id,
    handleEllipsisPress,
}: CardFrontProps) => {
    const [imageError, setImageError] = useState(false);

    const date = formatDate(new Date(published_at));
    const imageSource = url_to_image && !imageError ? { uri: url_to_image } : fallBackImage;
    const label = genre === '' ? 'Top' : genre;

    useEffect(() => {
        if (url_to_image) {
            Image.prefetch(url_to_image, 'disk');
        }
    }, [url_to_image]);

    const handleCardPress = () => {
        router.push({ pathname: '/article/[id]', params: { id } });
    };

    return (
        <Animated.View entering={FadeIn.duration(300)} style={card_style.main_card}>
            <TouchableOpacity
                onPress={handleCardPress}
                activeOpacity={0.7}
                style={card_style.card_touchable}
            >
                <View style={card_style.text_column}>
                    <View style={card_style.meta_row}>
                        <Text style={card_style.date} numberOfLines={1}>
                            {date} · {label}
                        </Text>
                        <TouchableOpacity
                            onPress={() => handleEllipsisPress(id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={card_style.ellipsis_btn}
                        >
                            <FontAwesomeIcon
                                icon={faEllipsisVertical}
                                color="white"
                                size={14}
                                style={{ opacity: 0.3 }}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={card_style.card_title} numberOfLines={3}>
                        {title}
                    </Text>
                </View>

                <View style={card_style.thumbnail_frame}>
                    <Image
                        source={imageSource}
                        alt="Article thumbnail"
                        style={card_style.thumbnail_image}
                        contentFit="cover"
                        onError={() => setImageError(true)}
                        transition={200}
                    />
                </View>
            </TouchableOpacity>
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
    card_touchable: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    text_column: {
        flex: 3,
        justifyContent: 'center',
        paddingRight: 8,
    },
    meta_row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 5,
    },
    ellipsis_btn: {
        padding: 6,
        marginLeft: 4,
        marginTop: -2,
    },
    card_title: {
        color: 'white',
        fontSize: 16,
        width: '95%',
        paddingLeft: 2,
        fontFamily: 'WorkSans-Light',
        opacity: 0.8,
    },
    thumbnail_frame: {
        flex: 2,
        height: '80%',
        padding: 2,
    },
    thumbnail_image: {
        height: '95%',
        borderRadius: 15,
    },
    date: {
        flex: 1,
        fontSize: 13,
        color: 'white',
        fontFamily: 'WorkSans-Light',
        paddingLeft: 3,
        opacity: 0.5,
    },
});

export default NewsCard;
