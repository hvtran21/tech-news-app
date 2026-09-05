import { useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    Dimensions,
    type LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
    faUpRightFromSquare,
    faBan,
    faFlag,
    faBookmark as faBookmarkSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkOutline } from '@fortawesome/free-regular-svg-icons';
import Article from '@/lib/constants';
import { theme, getTopicColor } from '@/components/styles';

const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 800;

interface ActionRowProps {
    icon: IconProp;
    label: string;
    onPress: () => void;
    tone?: 'default' | 'active' | 'danger';
}

function ActionRow({ icon, label, onPress, tone = 'default' }: ActionRowProps) {
    const color = tone === 'danger' ? theme.danger : tone === 'active' ? theme.accent : theme.text;
    return (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
            <View
                style={[
                    styles.icon_chip,
                    tone === 'active' && styles.icon_chip_active,
                    tone === 'danger' && styles.icon_chip_danger,
                ]}
            >
                <FontAwesomeIcon icon={icon} size={15} color={color} />
            </View>
            <Text style={[styles.row_label, { color }]}>{label}</Text>
        </TouchableOpacity>
    );
}

interface ArticleActionSheetProps {
    visible: boolean;
    onClose: () => void;
    article: Article | undefined;
    saved: boolean;
    onToggleSave: () => void;
    onOpenInBrowser: () => void;
}

export function ArticleActionSheet({
    visible,
    onClose,
    article,
    saved,
    onToggleSave,
    onOpenInBrowser,
}: ArticleActionSheetProps) {
    const insets = useSafeAreaInsets();
    const label = article?.genre || article?.category || 'Top';
    const topicColor = getTopicColor(label);

    const translateY = useSharedValue(0);
    // Seeded to the screen height so a dismiss still clears the viewport if it
    // fires before onLayout; refined to the real height once measured.
    const sheetHeight = useSharedValue(Dimensions.get('window').height);

    // Modal stays mounted between openings, so clear any leftover drag.
    useEffect(() => {
        if (visible) {
            translateY.value = 0;
        }
    }, [visible, translateY]);

    const pan = useMemo(
        () =>
            Gesture.Pan()
                // Only claim clear vertical drags, so taps on the rows still land.
                .activeOffsetY(8)
                // ...and let a mostly-horizontal swipe go rather than dragging the sheet.
                .failOffsetX([-20, 20])
                .onUpdate((event) => {
                    translateY.value = Math.max(0, event.translationY);
                })
                .onEnd((event) => {
                    if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
                        translateY.value = withTiming(
                            sheetHeight.value,
                            { duration: 180 },
                            (finished) => {
                                if (finished) {
                                    runOnJS(onClose)();
                                }
                            },
                        );
                    } else {
                        translateY.value = withSpring(0, { damping: 22, stiffness: 260 });
                    }
                }),
        [onClose, sheetHeight, translateY],
    );

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const scrimStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateY.value,
            [0, sheetHeight.value],
            [1, 0],
            Extrapolation.CLAMP,
        ),
    }));

    const onSheetLayout = (event: LayoutChangeEvent) => {
        sheetHeight.value = event.nativeEvent.layout.height;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            {/* Modal is a separate native view hierarchy on Android; gestures
                inside it need their own root. */}
            <GestureHandlerRootView style={styles.root}>
                <Animated.View
                    style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}
                    pointerEvents="none"
                />
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <GestureDetector gesture={pan}>
                    <Animated.View
                        style={[styles.sheet, { paddingBottom: insets.bottom + 12 }, sheetStyle]}
                        onLayout={onSheetLayout}
                    >
                        <View style={styles.handle_hitbox}>
                            <View style={styles.handle} />
                        </View>

                        {article && (
                            <View style={styles.header}>
                                <View style={[styles.header_accent, { backgroundColor: topicColor.color }]} />
                                <View style={styles.header_text_block}>
                                    <Text style={[styles.header_label, { color: topicColor.color }]}>{label}</Text>
                                    <Text style={styles.header_title} numberOfLines={2}>
                                        {article.title}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.group}>
                            <ActionRow
                                icon={saved ? faBookmarkSolid : faBookmarkOutline}
                                label={saved ? 'Unsave' : 'Save'}
                                tone={saved ? 'active' : 'default'}
                                onPress={() => {
                                    onToggleSave();
                                    onClose();
                                }}
                            />
                            <ActionRow
                                icon={faUpRightFromSquare}
                                label="Open in browser"
                                onPress={() => {
                                    onOpenInBrowser();
                                    onClose();
                                }}
                            />
                            <ActionRow icon={faBan} label="Not interested" onPress={onClose} />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.group}>
                            <ActionRow icon={faFlag} label="Report" tone="danger" onPress={onClose} />
                        </View>
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    scrim: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
        backgroundColor: theme.elevated,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 10,
    },
    // Widens the grab target around the 4pt handle.
    handle_hitbox: {
        alignItems: 'center',
        paddingVertical: 6,
        paddingBottom: 14,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    header_accent: {
        width: 3,
        height: 32,
        borderRadius: 2,
        marginTop: 2,
    },
    header_text_block: {
        flex: 1,
    },
    header_label: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    header_title: {
        fontFamily: 'WorkSans-SemiBold',
        fontSize: 15,
        lineHeight: 20,
        color: theme.text,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.border,
    },
    group: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    icon_chip: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: theme.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon_chip_active: {
        backgroundColor: theme.accent_soft,
    },
    icon_chip_danger: {
        backgroundColor: 'rgba(239, 68, 68, 0.10)',
    },
    row_label: {
        fontFamily: 'WorkSans-Regular',
        fontSize: 16,
    },
});

export default ArticleActionSheet;
