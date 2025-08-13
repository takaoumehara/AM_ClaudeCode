// Firebase Authentication utilities
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  AuthError,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  GoogleAuthProvider as GoogleAuthProviderClass,
  GithubAuthProvider as GithubAuthProviderClass,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// GitHub Auth Provider
const githubProvider = new GithubAuthProvider();

// Authentication functions
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user);
    return userCredential;
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await updateLastLogin(userCredential.user);
    return userCredential;
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await createUserDocument(userCredential.user);
    await updateLastLogin(userCredential.user);
    return userCredential;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Google auth error details:', authError);
    
    // Handle account exists with different credential
    if (authError.code === 'auth/account-exists-with-different-credential') {
      // Always return a user-friendly message for this error
      throw new Error('This email is already registered with a different sign-in method (likely GitHub or email/password). Please sign in with your existing method first.');
    }
    
    throw handleAuthError(authError);
  }
};

export const signInWithGitHub = async (): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithPopup(auth, githubProvider);
    await createUserDocument(userCredential.user);
    await updateLastLogin(userCredential.user);
    return userCredential;
  } catch (error) {
    const authError = error as AuthError;
    console.error('GitHub auth error details:', authError);
    
    // Handle account exists with different credential
    if (authError.code === 'auth/account-exists-with-different-credential') {
      // Always return a user-friendly message for this error
      throw new Error('This email is already registered with a different sign-in method (likely Google or email/password). Please sign in with your existing method first.');
    }
    
    throw handleAuthError(authError);
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

// Create user document in Firestore
const createUserDocument = async (user: User): Promise<void> => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const { email, displayName, photoURL } = user;
    const providers = user.providerData.map(p => p.providerId);
    
    try {
      await setDoc(userDocRef, {
        core: {
          name: displayName || email?.split('@')[0] || 'User',
          photoUrl: photoURL || '',
          mainTitle: '',
          teamIds: [],
          mainSkills: [],
        },
        authData: {
          email,
          providers,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        },
        organizationMemberships: {},
      });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }
};

// Update last login timestamp
const updateLastLogin = async (user: User): Promise<void> => {
  const userDocRef = doc(db, 'users', user.uid);
  try {
    await setDoc(userDocRef, {
      authData: {
        lastLogin: serverTimestamp(),
      }
    }, { merge: true });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Error handling
const handleAuthError = (error: AuthError): Error => {
  let message = 'An authentication error occurred';
  
  switch (error.code) {
    case 'auth/user-not-found':
      message = 'No account found with this email address';
      break;
    case 'auth/wrong-password':
      message = 'Incorrect password';
      break;
    case 'auth/email-already-in-use':
      message = 'An account with this email already exists';
      break;
    case 'auth/weak-password':
      message = 'Password should be at least 6 characters';
      break;
    case 'auth/invalid-email':
      message = 'Please enter a valid email address';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Please check your connection';
      break;
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Please try again later';
      break;
    case 'auth/popup-closed-by-user':
      message = 'Sign-in popup was closed';
      break;
    case 'auth/unauthorized-domain':
      message = 'This domain is not authorized for authentication. Please contact support or try using localhost:3000';
      break;
    case 'auth/account-exists-with-different-credential':
      message = 'This email is already registered with a different sign-in method. Please use the original sign-in method.';
      break;
    default:
      // Clean up Firebase error messages
      if (error.message && error.message.includes('Firebase: Error')) {
        // Extract the error code from messages like "Firebase: Error (auth/some-error)"
        const match = error.message.match(/\(([^)]+)\)/);
        if (match && match[1]) {
          message = `Authentication error: ${match[1].replace('auth/', '').replace(/-/g, ' ')}`;
        } else {
          message = 'Authentication failed. Please try again.';
        }
      } else {
        message = error.message || 'Authentication failed';
      }
  }
  
  return new Error(message);
};

// Account linking functions (placeholder for future implementation)
export const linkGoogleAccount = async (): Promise<UserCredential> => {
  if (!auth.currentUser) {
    throw new Error('No user is currently signed in');
  }
  
  try {
    // This would require a full OAuth flow - placeholder for now
    throw new Error('Account linking not yet implemented');
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const linkGitHubAccount = async (): Promise<UserCredential> => {
  if (!auth.currentUser) {
    throw new Error('No user is currently signed in');
  }
  
  try {
    // This would require a full OAuth flow - placeholder for now
    throw new Error('Account linking not yet implemented');
  } catch (error) {
    throw handleAuthError(error as AuthError);
  }
};

export const getLinkedProviders = (): string[] => {
  if (!auth.currentUser) {
    return [];
  }
  
  return auth.currentUser.providerData.map(provider => provider.providerId);
};