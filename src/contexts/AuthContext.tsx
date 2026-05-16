import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  profilePicture?: string; // Added to support Firestore field name
  firstName?: string;
  lastName?: string;
  role: 'seeker' | 'service_provider' | 'admin';
  phoneNumber?: string;
  address?: string;
  nic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  userRole: 'seeker' | 'service_provider' | 'admin' | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'seeker' | 'service_provider' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeProfile: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentUser(user);
      setLoading(true);
      setError(null);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        const isAdmin = user.email === 'ishanhatharasinghe222@gmail.com';
        const userRef = doc(db, 'users', user.uid);

        unsubscribeProfile = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              const userData = snap.data() as UserProfile;
              const profileImage = userData.profilePicture || userData.photoURL || user.photoURL || '';
              setUserProfile({
                ...userData,
                photoURL: profileImage,
                profilePicture: profileImage as any,
                createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
                updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined
              });
              if (isAdmin) {
                setUserRole('admin');
              } else if (userData.role) {
                setUserRole(userData.role);
              } else {
                setUserRole('seeker');
              }
            } else {
              const basicProfile: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || undefined,
                photoURL: user.photoURL || undefined,
                role: isAdmin ? 'admin' : 'seeker',
                createdAt: new Date(),
                updatedAt: new Date()
              };
              setUserProfile(basicProfile);
              setUserRole(isAdmin ? 'admin' : 'seeker');
            }
            setLoading(false);
          },
          (err) => {
            console.error('Error listening to user profile:', err);
            setError('Failed to load user profile');
            setLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setUserProfile(null);
      setUserRole(null);
      setError(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  const value = {
    currentUser,
    userProfile,
    userRole,
    loading,
    error,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
