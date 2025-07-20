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
import { Article } from '@/server/newsapi';
import * as SQLite from 'expo-sqlite';

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
    isFlipped: SharedValue<boolean>;
}

export const NewsCardFront = ({
    title,
    url_to_image,
    published_at,
    genre,
    id,
    handleEllipsisPress,
    isFlipped,
}: CardFrontProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [badLoad, setBadLoad] = useState(false);

    const date = formatDate(new Date(published_at));
    const fallBackImage = require('../../assets/images/computer_2.jpg');
    const uri_image = url_to_image ? { uri: url_to_image } : { uri: fallBackImage };
    const label = genre === '' ? 'Top' : genre;

    const handleCardFlip = () => {
        isFlipped.value = !isFlipped.value;
    }

    return (
        <Animated.View style={card_style_front.main_card}>
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
                <TouchableHighlight style={{ width: '60%' }} onPress={handleCardFlip} hitSlop={{ top: 30, bottom: 30, right: 80 }}>
                    <View style={{ flexDirection: 'column', height: 'auto' }}>
                        <Text style={card_style_front.date}>
                            {date} | {label}
                        </Text>
                        <View style={{ width: '95%' }}>
                            <Text style={card_style_front.card_title}>{title}</Text>
                        </View>
                    </View>
                </TouchableHighlight>

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
        </Animated.View>
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
                pointerEvents='box-none'
            >
                {RegularContent}
            </Animated.View>
            <Animated.View
                style={[flipCardStyles.flippedCard, cardStyle, flippedCardAnimatedStyle]}
                pointerEvents='box-none'
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
    const [article, setArticle] = useState<Article>()
    useEffect(() => {
        const getArticle = async () => {
            const db = await SQLite.openDatabaseAsync('newsapp')
            const article = await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [id]) as Article;

            if (article) {
                setArticle(article);
            } else {
                throw new Error(`Retrieved 0 articles with id: ${id}`);
            }

        }

        if (id) {
            getArticle();
        } else {
            throw new Error(`ID parameter is required, got: ${id}`)
        }
    }, [])
    
    return (
        <View style={card_style_back.main_card} pointerEvents='box-none'>
            <View>
                <Text style={card_style_back.description_text_style}>
                    {article?.description}
                </Text>
            </View>
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

    return (
        <View>
            <FlipCard
                isFlipped={isFlipped}
                cardStyle={flipCardStyles.flipCard}
                direction='x'
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
                        isFlipped={isFlipped}
                    />
                }
            />
        </View>
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
        width: Dimensions.get('window').width,
        paddingHorizontal: 5
    },
});

const card_style_back = StyleSheet.create({
    main_card: {
        alignContent: 'center',
        justifyContent: 'center',
        height: 150,
    },

    description_text_style: {
        fontFamily: 'WorkSans-Light',
        fontSize: 14,
        color: 'white',
        opacity: 0.8,
    }
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