import { Stack } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';

export default function TripsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={() => ({
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundPrimary },
      })}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
