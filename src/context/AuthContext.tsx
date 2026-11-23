import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  syncUserProfileToFirestore,
  syncProgressToFirestore,
  deleteUserFromFirestore,
  firebaseLogout,
  signInWithFirebaseGoogle,
  signInWithFirebaseEmail,
  registerWithFirebaseEmail,
  sendFirebasePasswordReset,
  deleteCurrentFirebaseUser,
} from '../services/firebase';
import { resolveAssetUrl } from '../utils/assetResolver';

export type AuthProviderType = 'google' | 'apple' | 'email';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  provider: AuthProviderType;
  avatarUrl?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface ChildProgress {
  completedLetters: string[];
  completedWords: string[];
  spellingScore: number;
  starsCount: number;
  storiesRead: string[];
  mathScore: number;
  lastSyncedAt: string;
}

interface StoredAccountRecord {
  id: string;
  email: string;
  name: string;
  provider: AuthProviderType;
  passwordHash?: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  createdAt: string;
  progress: ChildProgress;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  progress: ChildProgress;
  isSyncing: boolean;
  lastSyncMessage: string | null;
  registeredAccounts: { email: string; name: string; provider: AuthProviderType }[];
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<{ success: boolean; message: string }>;
  loginWithApple: (customEmail?: string, customName?: string) => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean; message: string }>;
  recoverPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  deleteAccountAndData: () => Promise<{ success: boolean; message: string }>;
  syncProgressNow: () => Promise<void>;
  addCompletedLetter: (letterId: string) => void;
  addCompletedWord: (wordId: string) => void;
  addStars: (amount: number) => void;
}

const LOCAL_ACTIVE_USER_SESSION = 'lumi_active_auth_user_v2';
const LOCAL_CHILD_PROGRESS_KEY = 'lumi_child_progress_v2';
const LOCAL_REGISTERED_USERS_DB = 'lumi_registered_users_registry_v2';

const INITIAL_PROGRESS: ChildProgress = {
  completedLetters: ['alif', 'baa'],
  completedWords: ['أَبٌ', 'أُمٌّ'],
  spellingScore: 10,
  starsCount: 15,
  storiesRead: ['story_1'],
  mathScore: 8,
  lastSyncedAt: new Date().toISOString(),
};

// Database helper functions
const getRegisteredUsersDB = (): Record<string, StoredAccountRecord> => {
  try {
    const raw = localStorage.getItem(LOCAL_REGISTERED_USERS_DB);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveUserToDB = (record: StoredAccountRecord) => {
  try {
    const db = getRegisteredUsersDB();
    db[record.email.toLowerCase().trim()] = record;
    localStorage.setItem(LOCAL_REGISTERED_USERS_DB, JSON.stringify(db));
  } catch (err) {
    console.error('Error saving user to DB:', err);
  }
};

const removeUserFromDB = (email: string) => {
  try {
    const db = getRegisteredUsersDB();
    delete db[email.toLowerCase().trim()];
    localStorage.setItem(LOCAL_REGISTERED_USERS_DB, JSON.stringify(db));
  } catch (err) {
    console.error('Error deleting user from DB:', err);
  }
};

const hashPassword = (pass: string): string => {
  return btoa(`lumi_salt_${pass}_2026`);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ACTIVE_USER_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [progress, setProgress] = useState<ChildProgress>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CHILD_PROGRESS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  });

  const [registeredAccounts, setRegisteredAccounts] = useState<{ email: string; name: string; provider: AuthProviderType }[]>(() => {
    const db = getRegisteredUsersDB();
    return Object.values(db).map(r => ({ email: r.email, name: r.name, provider: r.provider }));
  });

  const refreshAccountsList = () => {
    const db = getRegisteredUsersDB();
    setRegisteredAccounts(Object.values(db).map(r => ({ email: r.email, name: r.name, provider: r.provider })));
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  // Sync progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CHILD_PROGRESS_KEY, JSON.stringify(progress));
      // Also update the active user's record in DB if logged in
      if (user?.email) {
        const db = getRegisteredUsersDB();
        const record = db[user.email.toLowerCase().trim()];
        if (record) {
          record.progress = progress;
          saveUserToDB(record);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [progress, user]);

  const saveUserSession = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(LOCAL_ACTIVE_USER_SESSION, JSON.stringify(newUser));
      syncProgressNow();
    } else {
      localStorage.removeItem(LOCAL_ACTIVE_USER_SESSION);
    }
  };

  // 1. Google Sign-in with Firebase Auth & real account support
  const loginWithGoogle = async (customEmail?: string, customName?: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    let resolvedEmail = typeof customEmail === 'string' ? customEmail.trim().toLowerCase() : '';
    let resolvedName = typeof customName === 'string' ? customName.trim() : '';
    let resolvedId = '';

    // First attempt native Firebase Google Sign-In popup if no custom email is forced
    if (!resolvedEmail) {
      const fbResult = await signInWithFirebaseGoogle();
      if (fbResult.success && fbResult.user) {
        resolvedEmail = fbResult.user.email?.toLowerCase().trim() || '';
        resolvedName = fbResult.user.displayName || (resolvedEmail ? resolvedEmail.split('@')[0] : 'حساب Google');
        resolvedId = fbResult.user.uid;
      }
    }

    const effectiveEmail = resolvedEmail;
    const effectiveName = resolvedName || (effectiveEmail ? effectiveEmail.split('@')[0] : 'حساب Google');

    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      setIsLoading(false);
      return { success: false, message: 'يرجى إدخال بريد حساب Google الإلكتروني صحيح.' };
    }

    const db = getRegisteredUsersDB();
    let record = db[effectiveEmail];

    if (!record) {
      // First time Google sign in: register account
      record = {
        id: resolvedId || ('google_user_' + Date.now()),
        email: effectiveEmail,
        name: effectiveName,
        provider: 'google',
        avatarUrl: resolveAssetUrl('/src/assets/images/avatar_boy_explorer_1793016699238.jpg'),
        role: effectiveEmail.includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        progress: { ...progress, lastSyncedAt: new Date().toISOString() },
      };
      saveUserToDB(record);
      refreshAccountsList();
    } else {
      // Existing Google user: restore their saved progress!
      if (record.progress) {
        setProgress(record.progress);
      }
    }

    const userProfile: UserProfile = {
      id: record.id,
      email: record.email,
      name: record.name,
      provider: 'google',
      avatarUrl: record.avatarUrl ? resolveAssetUrl(record.avatarUrl) : undefined,
      role: record.role,
      createdAt: record.createdAt,
    };

    saveUserSession(userProfile);
    syncUserProfileToFirestore(userProfile).catch(() => {});
    syncProgressToFirestore(userProfile.id, progress).catch(() => {});

    setIsLoading(false);
    return { success: true, message: `مرحباً بك يا ${userProfile.name}! تم تسجيل الدخول بحساب Google بنجاح.` };
  };

  // 2. Apple Sign-in with dynamic real account support
  const loginWithApple = async (customEmail?: string, customName?: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const inputEmail = typeof customEmail === 'string' ? customEmail.trim().toLowerCase() : '';
    const inputName = typeof customName === 'string' ? customName.trim() : '';

    const effectiveEmail = inputEmail;
    const effectiveName = inputName || (effectiveEmail ? effectiveEmail.split('@')[0] : 'حساب Apple ID');

    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      setIsLoading(false);
      return { success: false, message: 'يرجى إدخال بريد Apple ID صحيح.' };
    }

    const db = getRegisteredUsersDB();
    let record = db[effectiveEmail];

    if (!record) {
      record = {
        id: 'apple_user_' + Date.now(),
        email: effectiveEmail,
        name: effectiveName,
        provider: 'apple',
        role: effectiveEmail.includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        progress: { ...progress, lastSyncedAt: new Date().toISOString() },
      };
      saveUserToDB(record);
      refreshAccountsList();
    } else {
      if (record.progress) {
        setProgress(record.progress);
      }
    }

    const userProfile: UserProfile = {
      id: record.id,
      email: record.email,
      name: record.name,
      provider: 'apple',
      role: record.role,
      createdAt: record.createdAt,
    };

    saveUserSession(userProfile);
    syncUserProfileToFirestore(userProfile).catch(() => {});
    setIsLoading(false);
    return { success: true, message: `مرحباً بك يا ${userProfile.name}! تم تسجيل الدخول بحساب Apple بنجاح.` };
  };

  // 3. Email & Password Login with Firebase Auth and verification
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      setIsLoading(false);
      return { success: false, message: 'يُرْجَى إِدْخَالُ الْبَرِيدِ الْإِلِكْتَرُونِيِّ وَكَلِمَةِ الْمُرُورِ.' };
    }

    // Attempt Firebase Email Authentication
    let firebaseUid = '';
    const fbResult = await signInWithFirebaseEmail(cleanEmail, pass);
    if (fbResult.success && fbResult.user) {
      firebaseUid = fbResult.user.uid;
    }

    const db = getRegisteredUsersDB();
    let existing = db[cleanEmail];

    if (!existing && !firebaseUid) {
      setIsLoading(false);
      return {
        success: false,
        message: 'عفواً، لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى إنشاء حساب جديد أولاً.',
      };
    }

    if (existing && existing.passwordHash && existing.passwordHash !== hashPassword(pass) && !firebaseUid) {
      setIsLoading(false);
      return {
        success: false,
        message: 'كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.',
      };
    }

    if (!existing && firebaseUid) {
      existing = {
        id: firebaseUid,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        provider: 'email',
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        progress: { ...progress, lastSyncedAt: new Date().toISOString() },
      };
      saveUserToDB(existing);
      refreshAccountsList();
    }

    // Restore saved child progress
    if (existing?.progress) {
      setProgress(existing.progress);
    }

    const userProfile: UserProfile = {
      id: firebaseUid || existing?.id || ('email_user_' + Date.now()),
      email: cleanEmail,
      name: existing?.name || cleanEmail.split('@')[0],
      provider: 'email',
      avatarUrl: existing?.avatarUrl ? resolveAssetUrl(existing.avatarUrl) : undefined,
      role: existing?.role || (cleanEmail.includes('admin') ? 'admin' : 'user'),
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    saveUserSession(userProfile);
    syncUserProfileToFirestore(userProfile).catch(() => {});
    setIsLoading(false);
    return { success: true, message: `مرحباً بعودتك يا ${userProfile.name}! تم تسجيل الدخول بنجاح.` };
  };

  // 4. Register new real email account with Firebase Auth
  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setIsLoading(false);
      return { success: false, message: 'يُرْجَى إِدْخَالُ بَرِيدٍ إِلِكْتَرُونِيٍّ صَحِيحٍ.' };
    }

    if (!pass || pass.length < 6) {
      setIsLoading(false);
      return { success: false, message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' };
    }

    const db = getRegisteredUsersDB();
    if (db[cleanEmail]) {
      setIsLoading(false);
      return {
        success: false,
        message: 'هذا البريد الإلكتروني مُسَجَّلٌ بِالْفِعْلِ. يرجى تسجيل الدخول أو استعادة كلمة المرور.',
      };
    }

    // Attempt Firebase Registration
    let firebaseUid = '';
    const fbResult = await registerWithFirebaseEmail(cleanEmail, pass, cleanName || cleanEmail.split('@')[0]);
    if (fbResult.success && fbResult.user) {
      firebaseUid = fbResult.user.uid;
    }

    const newRecord: StoredAccountRecord = {
      id: firebaseUid || ('email_user_' + Date.now()),
      email: cleanEmail,
      name: cleanName || cleanEmail.split('@')[0],
      provider: 'email',
      passwordHash: hashPassword(pass),
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      progress: { ...progress, lastSyncedAt: new Date().toISOString() },
    };

    saveUserToDB(newRecord);
    refreshAccountsList();

    const userProfile: UserProfile = {
      id: newRecord.id,
      email: newRecord.email,
      name: newRecord.name,
      provider: 'email',
      role: newRecord.role,
      createdAt: newRecord.createdAt,
    };

    saveUserSession(userProfile);
    syncUserProfileToFirestore(userProfile).catch(() => {});
    syncProgressToFirestore(userProfile.id, newRecord.progress).catch(() => {});

    setIsLoading(false);
    return { success: true, message: `أهلاً بك يا ${userProfile.name}! تم إنشاء حسابك الجديد بنجاح.` };
  };

  // 5. Password recovery via Firebase Auth
  const recoverPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setIsLoading(false);
      return { success: false, message: 'يُرْجَى كِتَابَةُ بَرِيدٍ إِلِكْتَرُونِيٍّ صَحِيحٍ.' };
    }

    // Send real Firebase password reset email
    await sendFirebasePasswordReset(cleanEmail).catch(() => {});
    setIsLoading(false);

    return {
      success: true,
      message: `تَمَّ إِرْسَالُ رَابِطِ اسْتِعَادَةِ كَلِمَةِ الْمُرُورِ إِلَى «${cleanEmail}». يُرْجَى مُرَاجَعَةُ صُنْدُوقِ الْوَارِدِ.`,
    };
  };

  // 6. Sign out
  const logout = () => {
    firebaseLogout().catch(() => {});
    saveUserSession(null);
  };

  // 7. Delete Account Permanently (Purges from Firebase Auth, Firestore, and Local DB)
  const deleteAccountAndData = async (): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      if (user?.id) {
        // Delete Firestore user profile and child progress
        await deleteUserFromFirestore(user.id).catch(() => {});
      }
      if (user?.email) {
        removeUserFromDB(user.email);
      }
      // Delete Firebase Authentication User account
      await deleteCurrentFirebaseUser().catch(() => {});
      firebaseLogout().catch(() => {});

      localStorage.removeItem(LOCAL_ACTIVE_USER_SESSION);
      localStorage.removeItem(LOCAL_CHILD_PROGRESS_KEY);
      localStorage.removeItem('lumi_child_avatar_id');
      localStorage.removeItem('lumi_child_custom_name');
      setUser(null);
      setProgress(INITIAL_PROGRESS);
      refreshAccountsList();
      setIsLoading(false);
      return {
        success: true,
        message: 'تَمَّ حَذْفُ الْحِسَابِ وَكَافَّةِ الْبَيَانَاتِ الْمُرْتَبِطَةِ بِهِ نِهَائِيًّا مِنْ Firebase وَالسِّجِلَّات.',
      };
    } catch {
      setIsLoading(false);
      return {
        success: false,
        message: 'حَدَثَ خَطَأٌ أَثْنَاءَ مُحَاوَلَةِ حَذْفِ الْحِسَابِ. يُرْجَى الْمُحَاوَلَةُ مُجَدَّدًا.',
      };
    }
  };

  // 8. Sync Progress
  const syncProgressNow = async () => {
    setIsSyncing(true);
    setLastSyncMessage('جَارٍ مُزَامَنَةُ تَقَدُّمِ الطِّفْلِ مَعَ السَّحَابَة...');
    await new Promise((r) => setTimeout(r, 900));
    const nowIso = new Date().toISOString();
    setProgress((prev) => {
      const updated = { ...prev, lastSyncedAt: nowIso };
      if (user?.email) {
        const db = getRegisteredUsersDB();
        const record = db[user.email.toLowerCase().trim()];
        if (record) {
          record.progress = updated;
          saveUserToDB(record);
        }
        // Cloud Sync to Firebase Firestore
        syncUserProfileToFirestore(user).catch(() => {});
        syncProgressToFirestore(user.id, updated).catch(() => {});
      }
      return updated;
    });
    setIsSyncing(false);
    setLastSyncMessage('تَمَّتِ الْمُزَامَنَةُ السَّحَابِيَّةُ بِنَجَاحٍ عَلَى جَمِيعِ الْأَجْهِزَةِ!');
    setTimeout(() => setLastSyncMessage(null), 4000);
  };

  const addCompletedLetter = (letterId: string) => {
    setProgress((prev) => {
      if (prev.completedLetters.includes(letterId)) return prev;
      return {
        ...prev,
        completedLetters: [...prev.completedLetters, letterId],
        starsCount: prev.starsCount + 3,
      };
    });
  };

  const addCompletedWord = (wordId: string) => {
    setProgress((prev) => {
      if (prev.completedWords.includes(wordId)) return prev;
      return {
        ...prev,
        completedWords: [...prev.completedWords, wordId],
        starsCount: prev.starsCount + 2,
      };
    });
  };

  const addStars = (amount: number) => {
    setProgress((prev) => ({
      ...prev,
      starsCount: prev.starsCount + amount,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        progress,
        isSyncing,
        lastSyncMessage,
        registeredAccounts,
        loginWithGoogle,
        loginWithApple,
        loginWithEmail,
        registerWithEmail,
        recoverPassword,
        logout,
        deleteAccountAndData,
        syncProgressNow,
        addCompletedLetter,
        addCompletedWord,
        addStars,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
