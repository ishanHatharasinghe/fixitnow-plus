import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'seeker' | 'service_provider' | 'admin';
  displayName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  city?: string;
  division?: string;
  postalCode?: string;
  nic?: string;
  bio?: string;
  availableServices?: string[];
  profilePicture?: string;
  idFrontImage?: string;
  idBackImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
  displayName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  city?: string;
  division?: string;
  postalCode?: string;
  nic?: string;
  bio?: string;
  profilePicture?: string;
  idFrontImage?: string;
  idBackImage?: string;
}

export interface ServiceInfo {
  availableServices?: string[];
}

const usersCollection = collection(db, 'users');

export const userService = {
  // Create a new user
  async createUser(userData: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
    const userRef = doc(usersCollection, userData.uid);
    const now = new Date();
    
    await setDoc(userRef, {
      ...userData,
      createdAt: now,
      updatedAt: now
    });
  },

  // Get user by ID
  async getUser(uid: string): Promise<UserProfile | null> {
    const userRef = doc(usersCollection, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log('[userService.getUser] raw Firestore data:', data);
      return {
        ...data,
        uid: userSnap.id,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
        nic: data.nic || data.idNumber || '',
        availableServices: data.availableServices ?? data.services ?? [],
        displayName: data.displayName || data.firstName || '',
      } as UserProfile;
    }
    return null;
  },

  // Update user profile with validation
  async updateUser(
    uid: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    const userRef = doc(usersCollection, uid);
    
    // Validate that we're not updating critical fields
    const { email, role, uid: _, createdAt, ...safeUpdates } = updates;
    
    await updateDoc(userRef, {
      ...safeUpdates,
      updatedAt: new Date()
    });
  },

  // Update personal information with validation
  async updatePersonalInfo(
    uid: string,
    personalInfo: PersonalInfo
  ): Promise<void> {
    const userRef = doc(usersCollection, uid);
    
    // Basic validation
    if (personalInfo.phoneNumber && !/^\d{9}$/.test(personalInfo.phoneNumber.replace(/\s/g, ''))) {
      throw new Error('Phone number must be 9 digits');
    }
    
    if (personalInfo.nic && personalInfo.nic.length < 10) {
      throw new Error('NIC must be at least 10 characters');
    }
    
    await updateDoc(userRef, {
      ...personalInfo,
      updatedAt: new Date()
    });
  },

  // Update service information
  async updateServiceInfo(
    uid: string,
    serviceInfo: ServiceInfo
  ): Promise<void> {
    const userRef = doc(usersCollection, uid);
    
    // Validate services array
    if (serviceInfo.availableServices && !Array.isArray(serviceInfo.availableServices)) {
      throw new Error('Available services must be an array');
    }
    
    await updateDoc(userRef, {
      ...serviceInfo,
      updatedAt: new Date()
    });
  },

  // Update password (handled separately through Firebase Auth)
  async updatePassword(newPassword: string): Promise<void> {
    // This would be handled through Firebase Auth, not Firestore
    // Placeholder for future implementation
    throw new Error('Password update should be handled through Firebase Auth');
  },

  // Delete user
  async deleteUser(uid: string): Promise<void> {
    const userRef = doc(usersCollection, uid);
    await deleteDoc(userRef);
  },

  // Get users by role
  async getUsersByRole(role: UserProfile['role']): Promise<UserProfile[]> {
    const q = query(usersCollection, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        uid: doc.id
      } as UserProfile;
    });
  },

  // Check if user exists
  async userExists(uid: string): Promise<boolean> {
    const userRef = doc(usersCollection, uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  },

  // Get user's service information only
  async getUserServices(uid: string): Promise<string[] | undefined> {
    const userRef = doc(usersCollection, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().availableServices;
    }
    return undefined;
  },

  // Get user's personal information only
  async getUserPersonalInfo(uid: string): Promise<PersonalInfo | null> {
    const userRef = doc(usersCollection, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        nic: data.nic,
        bio: data.bio,
        profilePicture: data.profilePicture,
        idFrontImage: data.idFrontImage,
        idBackImage: data.idBackImage
      };
    }
    return null;
  }
};