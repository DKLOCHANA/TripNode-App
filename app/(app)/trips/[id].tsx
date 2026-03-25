import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { ItineraryDetailScreen } from '@/presentation/screens/trips/ItineraryDetailScreen';
import { useTheme } from '@/theme/ThemeContext';

export default function ItineraryDetailRoute() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      parent?.setOptions({
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 0.5,
        },
      });
    };
  }, [navigation, colors]);

  return <ItineraryDetailScreen />;
}
