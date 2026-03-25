import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Keyboard } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import { EXPO_PUBLIC_FIREBASE_GOOGLE_PLACES_API_KEY } from '@env';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';
import { typography } from '@/theme/typography';

export interface PlaceResult {
  name: string;
  placeId: string;
  latitude: number;
  longitude: number;
}

interface PlacesAutocompleteProps {
  placeholder?: string;
  compact?: boolean;
  onSelect: (place: PlaceResult) => void;
  onClear?: () => void;
}

export function PlacesAutocomplete({
  placeholder = 'Explore where?',
  compact = false,
  onSelect,
  onClear,
}: PlacesAutocompleteProps) {
  const { colors } = useTheme();
  const ref = useRef<GooglePlacesAutocompleteRef>(null);

  const handlePress = useCallback((data: any, details: any) => {
    Keyboard.dismiss();
    if (details) {
      onSelect({
        name: data.description,
        placeId: data.place_id,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      });
    }
  }, [onSelect]);

  return (
    <View style={styles.wrapper}>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        fetchDetails
        onPress={handlePress}
        query={{
          key: EXPO_PUBLIC_FIREBASE_GOOGLE_PLACES_API_KEY,
          language: 'en',
          types: '(cities)',
        }}
        textInputProps={{
          placeholderTextColor: colors.textTertiary,
          selectionColor: colors.electricBlue,
          onChangeText: (text: string) => {
            if (!text && onClear) onClear();
          },
        }}
        renderLeftButton={() => (
          <View style={styles.leftIcon}>
            <Ionicons name="location-outline" size={18} color={colors.textTertiary} />
          </View>
        )}
        enablePoweredByContainer={false}
        disableScroll
        debounce={300}
        minLength={2}
        keyboardShouldPersistTaps="handled"
        styles={{
          container: styles.container,
          textInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.glassInputBg,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            paddingHorizontal: compact ? spacing.sm : spacing.md,
          },
          textInput: {
            flex: 1,
            color: colors.textPrimary,
            fontSize: typography.fontSize.body,
            backgroundColor: 'transparent',
            paddingVertical: compact ? spacing.sm : 14,
            marginBottom: 0,
            height: compact ? 44 : 50,
          },
          listView: {
            backgroundColor: colors.backgroundTertiary,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            marginTop: spacing.xxs,
            overflow: 'hidden',
          },
          row: {
            backgroundColor: 'transparent',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          },
          separator: {
            height: 1,
            backgroundColor: colors.glassBorder,
          },
          description: {
            color: colors.textPrimary,
            fontSize: typography.fontSize.callout,
          },
          predefinedPlacesDescription: {
            color: colors.textPrimary,
            fontSize: typography.fontSize.callout,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  container: {
    flex: 0,
  },
  leftIcon: {
    marginRight: spacing.xs,
    justifyContent: 'center',
  },
});
