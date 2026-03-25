import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/presentation/components/ui/Typography';
import { Button } from '@/presentation/components/ui/Button';
import { AttractionCard } from './AttractionCard';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import type { Attraction } from '@/domain/entities/Attraction';

interface AttractionSelectionSheetProps {
  visible: boolean;
  isLoading: boolean;
  loadingMessage?: string;
  destinationOverview: string | null;
  attractions: Attraction[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function AttractionSelectionSheet({
  visible,
  isLoading,
  loadingMessage,
  destinationOverview,
  attractions,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
  onConfirm,
  onClose,
}: AttractionSelectionSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const renderAttraction = useCallback(
    ({ item }: { item: Attraction }) => (
      <AttractionCard
        attraction={item}
        selected={selectedIds.has(item.id)}
        onToggle={() => onToggle(item.id)}
      />
    ),
    [selectedIds, onToggle]
  );

  const keyExtractor = useCallback((item: Attraction) => item.id, []);

  const selectedCount = selectedIds.size;
  const canConfirm = selectedCount > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.backgroundPrimary }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Typography variant="body" color={colors.electricBlue}>
              Cancel
            </Typography>
          </Pressable>
          <Typography variant="headline" weight="semiBold">
            Select Attractions
          </Typography>
          <View style={styles.headerRight}>
            {selectedCount > 0 && (
              <Typography variant="caption1" color={colors.textSecondary}>
                {selectedCount} selected
              </Typography>
            )}
          </View>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.electricBlue} />
            <Typography
              variant="body"
              color={colors.textSecondary}
              style={styles.loadingText}
            >
              {loadingMessage || 'Finding attractions...'}
            </Typography>
          </View>
        ) : (
          <>
            {/* Destination Overview */}
            {destinationOverview && (
              <View style={[styles.overviewContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <Typography variant="footnote" color={colors.textSecondary}>
                  {destinationOverview}
                </Typography>
              </View>
            )}

            {/* Selection Actions */}
            <View style={styles.actions}>
              <Pressable onPress={onSelectAll} hitSlop={8}>
                <Typography variant="footnote" color={colors.electricBlue}>
                  Select All
                </Typography>
              </Pressable>
              <View style={[styles.actionDivider, { backgroundColor: colors.glassBorder }]} />
              <Pressable onPress={onClearAll} hitSlop={8}>
                <Typography variant="footnote" color={colors.textSecondary}>
                  Clear All
                </Typography>
              </Pressable>
            </View>

            {/* Attractions List */}
            <FlatList
              data={attractions}
              renderItem={renderAttraction}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
            />

            {/* Confirm Button */}
            <View style={[
              styles.footer,
              { paddingBottom: insets.bottom + spacing.md, borderTopColor: colors.glassBorder, backgroundColor: colors.backgroundPrimary },
            ]}>
              <Button
                title={`Create Itinerary (${selectedCount} attractions)`}
                variant="primary"
                size="large"
                disabled={!canConfirm}
                onPress={onConfirm}
              />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
  },
  overviewContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionDivider: {
    width: 1,
    height: 16,
    marginHorizontal: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
