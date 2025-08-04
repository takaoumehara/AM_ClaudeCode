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
    throw handleAuthError(error as AuthError);
  }
};

export const signInWithGitHub = async (): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithPopup(auth, githubProvider);
    await createUserDocument(userCredential.user);
    await updateLastLogin(userCredential.user);
    return userCredential;
  } catch (error) {
    throw handleAuthError(error as AuthError);
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
    default:
      message = error.message || 'Authentication failed';
  }
  
  return new Error(message);
};