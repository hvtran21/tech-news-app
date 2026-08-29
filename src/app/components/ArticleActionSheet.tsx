import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
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
import Article from './constants';
import { theme, getTopicColor } from './styles';

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

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]} onPress={() => {}}>
                    <View style={styles.handle} />

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
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: theme.elevated,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 10,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
        alignSelf: 'center',
        marginBottom: 14,
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
