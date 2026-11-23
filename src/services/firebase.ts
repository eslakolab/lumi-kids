import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, ChildProgress } from '../context/AuthContext';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Initialize Firestore with firestoreDatabaseId from configuration
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Error Handling Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Connection Validation Test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration: client is offline.');
    }
    return false;
  }
}

// Run connection health check on module import
testFirestoreConnection().catch(() => {});

// 2. Sync User Profile to Firestore
export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    const docRef = doc(db, 'users', profile.id);
    await setDoc(
      docRef,
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        provider: profile.provider,
        role: profile.role,
        createdAt: profile.createdAt,
        lastLoginAt: new Date().toISOString(),
        avatarUrl: profile.avatarUrl || '',
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. Sync Child Progress to Firestore
export async function syncProgressToFirestore(userId: string, progress: ChildProgress): Promise<void> {
  const path = `users/${userId}/progress/data`;
  try {
    const docRef = doc(db, 'users', userId, 'progress', 'data');
    await setDoc(
      docRef,
      {
        userId,
        completedLetters: progress.completedLetters,
        completedWords: progress.completedWords,
        spellingScore: progress.spellingScore,
        starsCount: progress.starsCount,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 4. Fetch Progress from Firestore
export async function fetchProgressFromFirestore(userId: string): Promise<ChildProgress | null> {
  const path = `users/${userId}/progress/data`;
  try {
    const docRef = doc(db, 'users', userId, 'progress', 'data');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        completedLetters: data.completedLetters || [],
        completedWords: data.completedWords || [],
        spellingScore: data.spellingScore || 0,
        starsCount: data.starsCount || 0,
        storiesRead: data.storiesRead || [],
        mathScore: data.mathScore || 0,
        lastSyncedAt: data.lastSyncedAt || new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// 5. Delete User & Progress from Firestore (Google Play Data Deletion Policy)
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const userPath = `users/${userId}`;
  const progressPath = `users/${userId}/progress/data`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'progress', 'data')).catch(() => {});
    await deleteDoc(doc(db, 'users', userId)).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, userPath);
  }
}

// 6. Native Firebase Google Sign-In Popup
export async function signInWithFirebaseGoogle(): Promise<{
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}> {
  try {
    const credential = await signInWithPopup(auth, googleAuthProvider);
    return { success: true, user: credential.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تسجيل الدخول عبر Google';
    return { success: false, error: message };
  }
}

// 6b. Firebase Email & Password Sign In
export async function signInWithFirebaseEmail(email: string, pass: string): Promise<{
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return { success: true, user: credential.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل تسجيل الدخول بالبريد الإلكتروني';
    return { success: false, error: message };
  }
}

// 6c. Firebase Email & Password Registration
export async function registerWithFirebaseEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<{
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (credential.user && displayName) {
      await updateProfile(credential.user, { displayName }).catch(() => {});
    }
    return { success: true, user: credential.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل إنشاء الحساب عبر Firebase';
    return { success: false, error: message };
  }
}

// 6d. Firebase Password Reset Email
export async function sendFirebasePasswordReset(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل إرسال رابط استعادة كلمة المرور';
    return { success: false, error: message };
  }
}

// 6e. Delete Current Firebase Authentication User
export async function deleteCurrentFirebaseUser(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل حذف مستخدم Firebase Auth';
    return { success: false, error: message };
  }
}

// 7. Firebase Sign Out
export async function firebaseLogout(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.error('Firebase sign out error:', e);
  }
}

// 8. Sync Subscription Record to Firestore
export interface FirestoreSubscriptionRecord {
  userId: string;
  plan: 'monthly' | 'annual';
  platform: 'android' | 'ios' | 'web';
  status: 'active' | 'cancelled' | 'expired';
  sku?: string;
  orderId?: string;
  paymentMethod?: string;
  startDate: string;
  expirationDate: string;
}

export async function syncSubscriptionToFirestore(sub: FirestoreSubscriptionRecord): Promise<void> {
  const path = `users/${sub.userId}/subscriptions/current`;
  try {
    const docRef = doc(db, 'users', sub.userId, 'subscriptions', 'current');
    await setDoc(docRef, sub, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

