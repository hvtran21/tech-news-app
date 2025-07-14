import { Text, View, StyleSheet, Image, Pressable, TouchableOpacity, TouchableHighlight } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsisV, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react'
import { card } from '../homepage';
import Animated, {
    interpolate,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { url } from 'inspector';
import { setDefaultAutoSelectFamilyAttemptTimeout } from 'net';

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

// type FlipCardProps = {
//     isFlipped: boolean
//     cardStyle: React.CSSProperties
//     direction: string
//     duration: number
//     RegularContent: React.ReactNode
//     FlippedContent: React.ReactNode
// }

// const FlipCard = ({
//   isFlipped,
//   cardStyle,
//   direction = 'y',
//   duration = 500,
//   RegularContent,
//   FlippedContent,
// }: FlipCardProps) => {
//   const isDirectionX = direction === 'x';

//   const regularCardAnimatedStyle = useAnimatedStyle(() => {
//     const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
//     const rotateValue = withTiming(`${spinValue}deg`, { duration });

//     return {
//       transform: [
//         isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
//       ],
//     };
//   });

//   const flippedCardAnimatedStyle = useAnimatedStyle(() => {
//     const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
//     const rotateValue = withTiming(`${spinValue}deg`, { duration });

//     return {
//       transform: [
//         isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
//       ],
//     };
//   });

//   return (
//     <View>
//       <Animated.View
//         style={[
//           flipCardStyles.regularCard,
//           cardStyle,
//           regularCardAnimatedStyle,
//         ]}>
//         {RegularContent}
//       </Animated.View>
//       <Animated.View
//         style={[
//           flipCardStyles.flippedCard,
//           cardStyle,
//           flippedCardAnimatedStyle,
//         ]}>
//         {FlippedContent}
//       </Animated.View>
//     </View>
//   );

export const NewsCardFront = ({ title, url_to_image, published_at, genre, id, handleEllipsisPress}: card) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [badLoad, setBadLoad] = useState(false);
    const date = formatDate(new Date(published_at));
    const fallBackImage = require('../../assets/images/computer_2.jpg');
    const uri_image = url_to_image ? { uri: url_to_image } : {uri: fallBackImage};
    const label = genre === '' ? 'Top' : genre;

    return (
                <View style={card_style.main_card}>
            <TouchableOpacity style={{ position: 'absolute', top: 0, right: 14 }} onPress={() => {handleEllipsisPress(id)}}>
                <FontAwesomeIcon icon={faEllipsisH} color='white' size={18} style={{ opacity: 0.5, marginBottom: 10 }}/>
            </TouchableOpacity>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ width: '60%', flexDirection: 'column', height: 'auto' }}>
                    <Text style={card_style.date}>
                        {date} | {label}
                    </Text>
                    <View style={{ width: '95%' }}>
                        <Text style={card_style.card_title}>{title}</Text>
                    </View>
                </View>

                <View style={card_style.thumbnail_frame}>
                    {badLoad && !imageLoaded && (
                        <Image 
                        source={fallBackImage}
                        alt='Image'
                        style={card_style.thumbnail_image}
                        />
                    )}
                    {!imageError && (
                        <Image
                            source={imageError ? fallBackImage : uri_image}
                            alt='Image'
                            style={card_style.thumbnail_image}
                            onLoad={(e) => {}}
                            onError={() => {setImageError(true)}}
                        />
                    )}
                </View>
            </View>
        </View>
    )
}

export const NewsCardBack = () => {
    
}

export const NewsCard = ({ title, url_to_image, published_at, genre, id, handleEllipsisPress }: card) => {
    const [flipped, setFlipped] = useState(false);
    
    useEffect(() => {
        if (!flipped) {
            console.log('Card facing front')
        } else {
            console.log('Card facing back')
        }

    }, [flipped])

    return (
        <TouchableHighlight onPress={() => {setFlipped((state) => !state)}}>
            <View>
                <NewsCardFront
                    title={title}
                    url_to_image={url_to_image}
                    published_at={published_at}
                    genre={genre}
                    id={id}
                    handleEllipsisPress={handleEllipsisPress}
                />
            </View>
        </TouchableHighlight>
    );
};

export const card_style = StyleSheet.create({
    // styling for the news card itself
    main_card: {
        flexDirection: 'row',
        backgroundColor: '#000000',
        maxHeight: 175,
        width: '98%',
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
        width: '95%',
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
