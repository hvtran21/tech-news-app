import {
    Text,
    View,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    TouchableHighlight,
    ViewStyle,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsisV, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { card } from '../homepage';
import Animated, {
    interpolate,
    useAnimatedStyle,
    withTiming,
    SharedValue,
    useSharedValue,
} from 'react-native-reanimated';

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

export const NewsCardFront = ({
    title,
    url_to_image,
    published_at,
    genre,
    id,
    handleEllipsisPress,
}: card) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [badLoad, setBadLoad] = useState(false);
    const date = formatDate(new Date(published_at));
    const fallBackImage = require('../../assets/images/computer_2.jpg');
    const uri_image = url_to_image ? { uri: url_to_image } : { uri: fallBackImage };
    const label = genre === '' ? 'Top' : genre;

    return (
        <View style={card_style_front.main_card}>
            <TouchableOpacity
                style={{ position: 'absolute', top: 0, right: 14 }}
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
                <View style={{ width: '60%', flexDirection: 'column', height: 'auto' }}>
                    <Text style={card_style_front.date}>
                        {date} | {label}
                    </Text>
                    <View style={{ width: '95%' }}>
                        <Text style={card_style_front.card_title}>{title}</Text>
                    </View>
                </View>

                <View style={card_style_front.thumbnail_frame}>
                    {badLoad && !imageLoaded && (
                        <Image
                            source={fallBackImage}
                            alt="Image"
                            style={card_style_front.thumbnail_image}
                        />
                    )}
                    {!imageError && (
                        <Image
                            source={imageError ? fallBackImage : uri_image}
                            alt="Image"
                            style={card_style_front.thumbnail_image}
                            onLoad={(e) => {}}
                            onError={() => {
                                setImageError(true);
                            }}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

type FlipCardProps = {
    isFlipped: SharedValue<boolean>;
    cardStyle: ViewStyle;
    direction: string;
    duration: number;
    RegularContent: React.ReactNode;
    FlippedContent: React.ReactNode;
};

const FlipCard = ({
    isFlipped,
    cardStyle,
    direction = 'y',
    duration = 500,
    RegularContent,
    FlippedContent,
}: FlipCardProps) => {
    const isDirectionX = direction === 'x';

    const regularCardAnimatedStyle = useAnimatedStyle(() => {
        const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
        const rotateValue = withTiming(`${spinValue}deg`, { duration });

        return {
            transform: [isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue }],
        };
    });

    const flippedCardAnimatedStyle = useAnimatedStyle(() => {
        const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
        const rotateValue = withTiming(`${spinValue}deg`, { duration });

        return {
            transform: [isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue }],
        };
    });

    return (
        <View>
            <Animated.View
                style={[flipCardStyles.regularCard, cardStyle, regularCardAnimatedStyle]}
            >
                {RegularContent}
            </Animated.View>
            <Animated.View
                style={[flipCardStyles.flippedCard, cardStyle, flippedCardAnimatedStyle]}
            >
                {FlippedContent}
            </Animated.View>
        </View>
    );
};

type cardBackProps = {
    id: string;
};

export const NewsCardBack = ({ id }: cardBackProps) => {
    return (
        <View style={card_style_back.main_card}>
            <Text style={{ color: 'white' }}>This is the back</Text>
        </View>
    );
};

export const NewsCard = ({
    title,
    url_to_image,
    published_at,
    genre,
    id,
    handleEllipsisPress,
}: card) => {
    const isFlipped = useSharedValue(false);
    const handlePress = () => {
        isFlipped.value = !isFlipped.value;
    };
    const screenWidth = Dimensions.get('window').width;

    return (
        <TouchableHighlight onPress={handlePress} style={{ width: screenWidth }}>
            <FlipCard
                isFlipped={isFlipped}
                cardStyle={flipCardStyles.flipCard}
                direction="x"
                duration={300}
                FlippedContent={<NewsCardBack id={id} />}
                RegularContent={
                    <NewsCardFront
                        title={title}
                        url_to_image={url_to_image}
                        published_at={published_at}
                        genre={genre}
                        id={id}
                        handleEllipsisPress={handleEllipsisPress}
                    />
                }
            />
        </TouchableHighlight>
    );
};

const flipCardStyles = StyleSheet.create({
    flippedCard: {
        zIndex: 2,
    },

    regularCard: {
        position: 'absolute',
        zIndex: 1,
    },

    flipCard: {
        backfaceVisibility: 'hidden',
    },
});

const card_style_back = StyleSheet.create({
    main_card: {
        alignContent: 'center',
        justifyContent: 'center',
        height: 150,
    },
});

export const card_style_front = StyleSheet.create({
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
