import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/presentation/components/ui/Typography';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { InterestChip } from '@/presentation/components/plan/InterestChip';
import { DateSelector } from '@/presentation/components/plan/DateSelector';
import { PlacesAutocomplete } from '@/presentation/components/plan/PlacesAutocomplete';
import { AttractionSelectionSheet } from '@/presentation/components/attractions/AttractionSelectionSheet';
import { usePlanTripViewModel } from '@/presentation/view-models/usePlanTripViewModel';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import type { InterestId } from '@/lib/constants';

export function PlanTripScreen() {
  const insets = useSafeAreaInsets();
  const vm = usePlanTripViewModel();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.xxxl,
            paddingHorizontal: spacing.screen,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="title2" weight="bold">
              Plan Your Trip
            </Typography>
            <Pressable onPress={vm.handleReset} hitSlop={12}>
              <Typography variant="callout" color={colors.electricBlue} weight="medium">
                Reset
              </Typography>
            </Pressable>
          </View>

          {/* Destination */}
          <View style={[styles.section, styles.destinationSection]}>
            <Typography variant="callout" weight="semiBold" style={styles.sectionLabel}>
              Where to?
            </Typography>
            <PlacesAutocomplete
              onSelect={vm.handlePlaceSelect}
              onClear={vm.handlePlaceClear}
            />
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Typography variant="callout" weight="semiBold" style={styles.sectionLabel}>
              Dates
            </Typography>
            <View style={styles.dateRow}>
              <DateSelector
                label="Select Date"
                sublabel="START"
                value={vm.startDate}
                active={vm.activePicker === 'start'}
                onPress={() => vm.showStartDatePicker()}
              />
              <View style={styles.dateGap} />
              <DateSelector
                label="Select Date"
                sublabel="END"
                value={vm.endDate}
                active={vm.activePicker === 'end'}
                onPress={() => vm.showEndDatePicker()}
              />
            </View>

            {vm.dateError && (
              <Typography variant="caption1" color={colors.error} style={styles.dateError}>
                {vm.dateError}
              </Typography>
            )}
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Typography variant="callout" weight="semiBold" style={styles.sectionLabel}>
              Interests
            </Typography>
            <View style={styles.chipRow}>
              {vm.INTERESTS.map((interest) => (
                <InterestChip
                  key={interest.id}
                  label={interest.label}
                  emoji={interest.emoji}
                  selected={vm.interests.has(interest.id as InterestId)}
                  onToggle={() => vm.toggleInterest(interest.id as InterestId)}
                />
              ))}
            </View>
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Typography variant="callout" weight="semiBold" style={styles.sectionLabel}>
              Budget
            </Typography>
            <Input
              placeholder="Enter your budget"
              value={vm.budget}
              onChangeText={vm.handleBudgetChange}
              keyboardType="numeric"
              leftIcon={
                <Typography variant="body" color={colors.textTertiary} weight="medium">
                  $
                </Typography>
              }
            />
          </View>

          {/* Generate CTA */}
          <View style={styles.ctaContainer}>
            <Button
              title="Generate My Trip"
              variant="primary"
              size="large"
              loading={vm.isLoading}
              onPress={vm.handleGenerate}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* iOS Spinner Date Picker Modal */}
      <Modal
        visible={vm.activePicker !== null}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={vm.dismissPicker} />
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom, backgroundColor: colors.backgroundSecondary }]}>
            {/* Header with Cancel/Done */}
            <View style={[styles.pickerHeader, { borderBottomColor: colors.glassBorder }]}>
              <Pressable onPress={vm.dismissPicker} hitSlop={12}>
                <Typography variant="body" color={colors.electricBlue}>
                  Cancel
                </Typography>
              </Pressable>
              <Typography variant="callout" weight="semiBold">
                {vm.activePicker === 'start' ? 'Start Date' : 'End Date'}
              </Typography>
              <Pressable onPress={vm.confirmDate} hitSlop={12}>
                <Typography variant="body" color={colors.electricBlue} weight="semiBold">
                  Done
                </Typography>
              </Pressable>
            </View>

            {/* Spinner Picker */}
            <DateTimePicker
              value={vm.tempDate}
              mode="date"
              display="spinner"
              minimumDate={vm.pickerMinDate}
              maximumDate={vm.pickerMaxDate}
              onChange={vm.handleTempDateChange}
              style={styles.picker}
              themeVariant={isDark ? 'dark' : 'light'}
              textColor={colors.textPrimary}
            />
            
            {/* Helper text for end date limit */}
            {vm.activePicker === 'end' && (
              <View style={styles.pickerHint}>
                <Typography variant="caption1" color={colors.textTertiary} align="center">
                  Maximum trip duration is 5 days
                </Typography>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Attraction Selection Sheet */}
      <AttractionSelectionSheet
        visible={vm.showAttractionSheet}
        isLoading={vm.isGenerating}
        loadingMessage={
          vm.generationStep === 'fetching_attractions'
            ? 'Finding attractions...'
            : vm.generationStep === 'building_itinerary'
              ? 'Creating your itinerary...'
              : undefined
        }
        destinationOverview={vm.destinationOverview}
        attractions={vm.suggestedAttractions}
        selectedIds={vm.selectedAttractionIds}
        onToggle={vm.handleToggleAttraction}
        onSelectAll={vm.handleSelectAllAttractions}
        onClearAll={vm.handleClearAllAttractions}
        onConfirm={vm.handleConfirmAttractions}
        onClose={vm.handleCloseAttractionSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  destinationSection: {
    zIndex: 10,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateGap: {
    width: spacing.sm,
  },
  dateError: {
    marginTop: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ctaContainer: {
    marginTop: spacing.xl,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  picker: {
    height: 216,
  },
  pickerHint: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
