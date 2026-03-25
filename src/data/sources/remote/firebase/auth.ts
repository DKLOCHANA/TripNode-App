import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  OAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { auth, db } from './config';

export interface AuthResult {
  user: User;
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, { displayName: name });

  // Store user data in Firestore
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    name,
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { user: credential.user };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return { user: credential.user };
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithApple(): Promise<AuthResult> {
  // Generate a secure random nonce
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  // Request Apple credential
  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  const { identityToken, fullName } = appleCredential;

  if (!identityToken) {
    throw new Error('No identity token returned from Apple');
  }

  // Create Firebase OAuth credential
  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({
    idToken: identityToken,
    rawNonce,
  });

  // Sign in to Firebase
  const result = await signInWithCredential(auth, credential);

  // Build display name from Apple's fullName (only provided on first sign-in)
  const displayName = fullName
    ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ')
    : null;

  // Update profile if Apple provided a name and Firebase doesn't have one yet
  if (displayName && !result.user.displayName) {
    await updateProfile(result.user, { displayName });
  }

  // Create Firestore user doc if it doesn't exist (first sign-in)
  const userDocRef = doc(db, 'users', result.user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      uid: result.user.uid,
      name: displayName || result.user.displayName || 'Apple User',
      email: result.user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return { user: result.user };
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  await firebaseSendPasswordResetEmail(auth, email);
}
