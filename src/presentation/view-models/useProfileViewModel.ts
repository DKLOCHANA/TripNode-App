import { useState, useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { useAuthStore } from '@/store/authStore';
import { useHaptic } from '@/hooks/useHaptic';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { queryClient } from '@/lib/queryClient';
import { AsyncStorageService } from '@/data/sources/local/asyncStorage';
import { checkNetworkAndAlert } from '@/lib/network';
import { revenueCatService } from '@/services/revenueCatService';

type DeleteStep = 'idle' | 'confirm' | 'typing' | 'deleting';

const PROFILE_PHOTO_KEY = 'user_profile_photo';

export function useProfileViewModel() {
  const router = useRouter();
  const haptic = useHaptic();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const subscription = useSubscriptionStatus();

  const [deleteStep, setDeleteStep] = useState<DeleteStep>('idle');
  const [deleteInput, setDeleteInput] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [hasShownExpiryAlert, setHasShownExpiryAlert] = useState(false);

  // Load saved profile photo on mount
  useEffect(() => {
    loadSavedPhoto();
  }, []);

  // Show subscription expiry alert
  useEffect(() => {
    if (subscription.isExpired && !hasShownExpiryAlert) {
      setHasShownExpiryAlert(true);
      Alert.alert(
        'Subscription Expired',
        'Your TripNode Premium subscription has expired. Renew now to continue enjoying premium features.',
        [
          { text: 'Later', style: 'cancel' },
          { 
            text: 'Renew Now', 
            onPress: () => router.push('/paywall'),
          },
        ]
      );
    } else if (subscription.isExpiringSoon && !hasShownExpiryAlert && !subscription.renewsAutomatically) {
      setHasShownExpiryAlert(true);
      Alert.alert(
        'Subscription Expiring Soon',
        `Your TripNode Premium subscription will expire ${subscription.daysUntilExpiry === 1 ? 'tomorrow' : `in ${subscription.daysUntilExpiry} days`}. Renew to keep your premium features.`,
        [
          { text: 'Remind Later', style: 'cancel' },
          { 
            text: 'Manage Subscription', 
            onPress: () => router.push('/(app)/subscription'),
          },
        ]
      );
    }
  }, [subscription.isExpired, subscription.isExpiringSoon, hasShownExpiryAlert, subscription.renewsAutomatically, subscription.daysUntilExpiry, router]);

  const loadSavedPhoto = async () => {
    try {
      const savedUri = await AsyncStorageService.getItem(PROFILE_PHOTO_KEY);
      if (savedUri) {
        // Verify the file still exists
        const file = new File(savedUri);
        if (file.exists) {
          setLocalPhotoUri(savedUri);
        } else {
          // Clean up invalid reference
          await AsyncStorageService.removeItem(PROFILE_PHOTO_KEY);
        }
      }
    } catch {
      // Ignore errors
    }
  };

  // User info
  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || '?';

  const userName = user?.displayName || 'TripNode User';
  const userEmail = user?.email || '';
  // Prioritize local photo over Firebase photoURL
  const userPhotoURL = localPhotoUri || user?.photoURL || null;
  const hasLocalPhoto = !!localPhotoUri;

  // Subscription from RevenueCat
  const subscriptionTier = subscription.tier;
  const subscriptionExpiry = subscription.formattedExpiryDate;
  const isPro = subscription.isPro;
  const isExpired = subscription.isExpired;

  // Request photo library permission
  const requestPhotoPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'TripNode needs access to your photo library to set a profile picture. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    return true;
  };

  // Save photo to local storage
  const savePhotoLocally = async (uri: string): Promise<string | null> => {
    try {
      // Create a permanent copy in app's document directory
      const fileName = `profile_photo_${Date.now()}.jpg`;
      const sourceFile = new File(uri);
      const destinationFile = new File(Paths.document, fileName);

      await sourceFile.copy(destinationFile);

      const destinationUri = destinationFile.uri;

      // Store the URI reference
      await AsyncStorageService.setItem(PROFILE_PHOTO_KEY, destinationUri);

      return destinationUri;
    } catch {
      Alert.alert('Error', 'Failed to save photo. Please try again.');
      return null;
    }
  };

  // Delete saved photo
  const deleteLocalPhoto = async () => {
    try {
      if (localPhotoUri) {
        // Delete the file
        const file = new File(localPhotoUri);
        if (file.exists) {
          await file.delete();
        }
      }
      // Remove the storage reference
      await AsyncStorageService.removeItem(PROFILE_PHOTO_KEY);
      setLocalPhotoUri(null);
    } catch {
      // Ignore errors, just clear the reference
      await AsyncStorageService.removeItem(PROFILE_PHOTO_KEY);
      setLocalPhotoUri(null);
    }
  };

  // Pick and save photo
  const pickPhoto = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Delete old photo if exists
      if (localPhotoUri) {
        await deleteLocalPhoto();
      }

      const savedUri = await savePhotoLocally(result.assets[0].uri);
      if (savedUri) {
        setLocalPhotoUri(savedUri);
        haptic.success();
      }
    }
  };

  // Handle avatar press - show photo options
  const handleAvatarPress = useCallback(() => {
    haptic.lightImpact();

    if (hasLocalPhoto) {
      // Has local photo - show change/delete options
      Alert.alert(
        'Profile Photo',
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Change Photo', onPress: pickPhoto },
          {
            text: 'Remove Photo',
            style: 'destructive',
            onPress: async () => {
              await deleteLocalPhoto();
              haptic.success();
            },
          },
        ]
      );
    } else {
      // No photo - show add option
      Alert.alert(
        'Add Profile Photo',
        'Add a photo to personalize your profile.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Choose Photo', onPress: pickPhoto },
        ]
      );
    }
  }, [hasLocalPhoto, haptic, localPhotoUri]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            // Check network connectivity first
            if (!(await checkNetworkAndAlert())) {
              haptic.error();
              return;
            }

            setIsLoggingOut(true);
            haptic.lightImpact();
            try {
              await signOut();
              queryClient.clear();
              router.replace('/(auth)/welcome');
            } catch {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  }, [signOut, router, haptic]);

  // Delete account flow
  const handleDeletePress = useCallback(() => {
    haptic.lightImpact();
    setDeleteStep('confirm');
  }, [haptic]);

  const handleDeleteConfirm = useCallback(() => {
    haptic.lightImpact();
    setDeleteStep('typing');
    setDeleteInput('');
  }, [haptic]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteStep('idle');
    setDeleteInput('');
  }, []);

  const handleDeleteInputChange = useCallback((text: string) => {
    setDeleteInput(text);
  }, []);

  const handleDeleteFinal = useCallback(async () => {
    if (deleteInput !== 'DELETE') {
      Alert.alert('Invalid Input', 'Please type DELETE exactly to confirm.');
      return;
    }

    // Check network connectivity first
    if (!(await checkNetworkAndAlert())) {
      haptic.error();
      return;
    }

    haptic.impact();
    setDeleteStep('deleting');

    try {
      // Delete local photo if exists
      await deleteLocalPhoto();
      // TODO: Implement full account deletion with Firebase
      // For now, just sign out
      await signOut();
      queryClient.clear();
      router.replace('/(auth)/welcome');
    } catch {
      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
      setDeleteStep('idle');
    }
  }, [deleteInput, signOut, router, haptic]);

  // External links
  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL('https://dklochana.github.io/TripNode/privacy-policy/').catch(() => {
      Alert.alert('Error', 'Unable to open privacy policy');
    });
  }, []);

  const handleTermsOfService = useCallback(() => {
    Linking.openURL('https://dklochana.github.io/TripNode/terms-of-service/').catch(() => {
      Alert.alert('Error', 'Unable to open terms of service');
    });
  }, []);

  // Upgrade to pro or manage subscription
  const handleUpgradeToPro = useCallback(() => {
    haptic.lightImpact();
    router.push('/paywall');
  }, [router, haptic]);

  // Manage subscription for pro users
  const handleManageSubscription = useCallback(() => {
    haptic.lightImpact();
    router.push('/(app)/subscription');
  }, [router, haptic]);

  return {
    // User data
    user,
    userInitials,
    userName,
    userEmail,
    userPhotoURL,
    hasLocalPhoto,

    // Subscription
    subscriptionTier,
    subscriptionExpiry,
    isPro,
    isExpired,
    isSubscriptionLoading: subscription.isLoading,
    renewsAutomatically: subscription.renewsAutomatically,

    // Loading states
    isLoggingOut,

    // Delete account
    deleteStep,
    deleteInput,
    handleDeletePress,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleDeleteInputChange,
    handleDeleteFinal,

    // Actions
    handleLogout,
    handlePrivacyPolicy,
    handleTermsOfService,
    handleUpgradeToPro,
    handleManageSubscription,
    handleAvatarPress,
  };
}
