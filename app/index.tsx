import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export default function Index() {
  const { colors } = useTheme();

  return (
    <View style={[styles.loading, { backgroundColor: colors.backgroundPrimary }]}>
      <ActivityIndicator size="large" color={colors.electricBlue} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
