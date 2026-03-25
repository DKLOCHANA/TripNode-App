import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/presentation/components/ui/Typography';
import { Button } from '@/presentation/components/ui/Button';
import { colors, gradients } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radii } from '@/theme/radii';

const TITLE_TEXT = 'TripNode';
const TAGLINE_TEXT = 'Your path, AI-planned.';

export function OnboardingSplashScreen() {
  const insets = useSafeAreaInsets();
  const [typedTitle, setTypedTitle] = useState('');
  const [typedTagline, setTypedTagline] = useState('');
  
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const iconTranslateY = useRef(new Animated.Value(12)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonTranslateY = useRef(new Animated.Value(50)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const compassRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    const activeTimeouts: ReturnType<typeof setTimeout>[] = [];

    // Background fade-in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Icon entrance animation
    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 500,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(iconTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Text fade-in container
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        delay: 360,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 450,
        delay: 360,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    const startTyping = () => {
      let titleIndex = 0;
      let taglineIndex = 0;

      const typeTitle = () => {
        if (!isMounted) {
          return;
        }

        if (titleIndex <= TITLE_TEXT.length) {
          setTypedTitle(TITLE_TEXT.slice(0, titleIndex));
          titleIndex += 1;
          const timeoutId = setTimeout(typeTitle, 70);
          activeTimeouts.push(timeoutId);
          return;
        }

        const taglineDelayId = setTimeout(typeTagline, 120);
        activeTimeouts.push(taglineDelayId);
      };

      const typeTagline = () => {
        if (!isMounted) {
          return;
        }

        if (taglineIndex <= TAGLINE_TEXT.length) {
          setTypedTagline(TAGLINE_TEXT.slice(0, taglineIndex));
          taglineIndex += 1;
          const timeoutId = setTimeout(typeTagline, 38);
          activeTimeouts.push(timeoutId);
        }
      };

      typeTitle();
    };

    const typingStartTimeout = setTimeout(startTyping, 450);
    activeTimeouts.push(typingStartTimeout);
    
    // Button slide-up entrance (appears after 1.2s)
    Animated.sequence([
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Compass rotation animation - random directions
    const animateCompass = () => {
      if (!isMounted) {
        return;
      }

      const randomAngle = (Math.random() - 0.5) * 120;
      Animated.sequence([
        Animated.timing(compassRotation, {
          toValue: randomAngle,
          duration: 800 + Math.random() * 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(200 + Math.random() * 300),
      ]).start(() => {
        if (isMounted) {
          animateCompass();
        }
      });
    };
    animateCompass();

    return () => {
      isMounted = false;
      activeTimeouts.forEach(clearTimeout);
    };
  }, []);

  const handleGetStarted = () => {
    router.push('/(auth)/onboarding/question1');
  };

  const compassSpin = compassRotation.interpolate({
    inputRange: [-60, 60],
    outputRange: ['-60deg', '60deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated background */}
      <Animated.View style={[styles.backgroundAnimation, { opacity: backgroundOpacity }]}> 
        <LottieView
          source={require('@/../assets/onboard-background-animation.json')}
          style={StyleSheet.absoluteFill}
          autoPlay
          loop
          resizeMode="cover"
        />
      </Animated.View>

      {/* Gradient overlay for content readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top }]}> 
        {/* Icon + text in center area */}
        <View style={styles.centerSection}>
          <View style={styles.logoIconContainer}>
            <Animated.View
              style={[
                styles.logoIcon,
                {
                  opacity: iconOpacity,
                  transform: [{ scale: iconScale }, { translateY: iconTranslateY }],
                },
              ]}
            >
              <Animated.View style={{ transform: [{ rotate: compassSpin }] }}>
                <Ionicons name="navigate" size={36} color={colors.white} />
              </Animated.View>
            </Animated.View>
          </View>

          <Animated.View style={[styles.textSection, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <Typography variant="largeTitle" weight="heavy" align="center">
              {typedTitle}
            </Typography>
            <Typography
              variant="title3"
              color={colors.textSecondary}
              align="center"
              style={styles.tagline}
            >
              {typedTagline}
            </Typography>
          </Animated.View>
        </View>

        {/* Button */}
        <Animated.View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.xl, opacity: buttonOpacity, transform: [{ translateY: buttonTranslateY }] }]}>
          <Button
            title="GET STARTED"
            onPress={handleGetStarted}
            size="large"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  backgroundAnimation: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  logoIconContainer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.electricBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.electricBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
  },
  tagline: {
    marginTop: spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: spacing.screen,
  },
});
