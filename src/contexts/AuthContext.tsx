import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
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
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Check if user is admin based on email
          const isAdmin = user.email === 'ishanhatharasinghe222@gmail.com';
          
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setUserProfile({
              ...userData,
              createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
              updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined
            });
            // Admin email always wins — never let Firestore overwrite it
            if (isAdmin) {
              setUserRole('admin');
            } else if (userData.role) {
              setUserRole(userData.role);
            } else {
              setUserRole('seeker');
            }
          } else {
            // Create basic profile if it doesn't exist
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
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile');
        }
      } else {
        setUserProfile(null);
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
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
      {!loading && children}
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
