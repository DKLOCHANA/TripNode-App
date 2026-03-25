import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityCard } from './ActivityCard';
import { FreeTimeCard } from './FreeTimeCard';
import { spacing } from '@/theme/spacing';
import type { TimelineItem } from '@/domain/entities/Activity';

interface TimelineSectionProps {
  items: TimelineItem[];
  destinationCity?: string;
  ianaTimezone?: string;
}

export function TimelineSection({ items, destinationCity, ianaTimezone }: TimelineSectionProps) {
  const renderItem = ({ item }: { item: TimelineItem }) => {
    if (item.type === 'activity') {
      return (
        <ActivityCard
          activity={item.data}
          destinationCity={destinationCity}
          ianaTimezone={ianaTimezone}
        />
      );
    }
    return <FreeTimeCard freeTime={item.data} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.data.id}
        scrollEnabled={false}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
