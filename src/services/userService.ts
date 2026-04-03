import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, deleteDoc, query, where, getDocs, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'seeker' | 'service_provider' | 'admin';
  // Name — Account Setup writes firstName/lastName; Edit Profile writes displayName/lastName.
  // Both are kept in sync by the save methods below.
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  city?: string;
  division?: string;
  postalCode?: string;
  // NIC — Account Setup writes idNumber/idType; Edit Profile writes nic.
  // Both are kept in sync by the save methods below.
  nic?: string;
  idNumber?: string;
  idType?: string;
  bio?: string;
  // Services — Account Setup writes services[]; Edit Profile writes availableServices[].
  // Both are kept in sync by the save methods below.
  availableServices?: string[];
  services?: string[];
  profilePicture?: string;
  idFrontImage?: string;
  idBackImage?: string;
  // Extra fields written by Account Setup
  userType?: string;
  isActive?: boolean;
  isVerified?: boolean;
  availability?: Record<string, boolean>;
  workingHours?: { start: string; end: string };
  businessName?: string | null;
  businessRegistrationNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
  displayName?: string;
  firstName?: string;   // kept in sync with displayName on save
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  country?: string;
  city?: string;
  division?: string;
  postalCode?: string;
  nic?: string;
  idNumber?: string;    // kept in sync with nic on save
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

  // Real-time listener — use on Profile and PublicProfile pages so edits from
  // EditProfile are reflected instantly without a manual refresh.
  // Returns the Firestore unsubscribe function; call it inside useEffect cleanup.
  //
  // Usage:
  //   useEffect(() => {
  //     if (!uid) return;
  //     const unsub = userService.getUserStream(uid, setUserData);
  //     return unsub;
  //   }, [uid]);
  getUserStream(
    uid: string,
    onData: (profile: UserProfile | null) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const userRef = doc(usersCollection, uid);
    return onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) { onData(null); return; }
        const data = snap.data();
        onData({
          ...data,
          uid: snap.id,
          createdAt:         data.createdAt?.toDate?.()  ?? new Date(),
          updatedAt:         data.updatedAt?.toDate?.()  ?? new Date(),
          displayName:       data.displayName  || data.firstName || '',
          firstName:         data.firstName    || data.displayName || '',
          lastName:          data.lastName     || '',
          nic:               data.nic          || data.idNumber   || '',
          idNumber:          data.idNumber     || data.nic        || '',
          availableServices: data.availableServices ?? data.services ?? [],
          services:          data.services     ?? data.availableServices ?? [],
          country:           data.country      || '',
          city:              data.city         || '',
          division:          data.division     || '',
          postalCode:        data.postalCode   || '',
          bio:               data.bio          || '',
          phoneNumber:       data.phoneNumber  || '',
          address:           typeof data.address === 'string' ? data.address : '',
        } as UserProfile);
      },
      (err) => {
        console.error('[userService.getUserStream] error:', err);
        onError?.(err);
      }
    );
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

    // Build the payload, writing BOTH schema variants so Account Setup fields
    // (firstName, idNumber) and Edit Profile fields (displayName, nic) stay in sync.
    const payload: Record<string, unknown> = { ...personalInfo };
    if (personalInfo.displayName !== undefined) {
      payload.firstName = personalInfo.displayName;   // keep Account Setup field current
    }
    if (personalInfo.nic !== undefined) {
      payload.idNumber = personalInfo.nic;             // keep Account Setup field current
    }
    payload.updatedAt = new Date();

    // setDoc with merge:true is non-destructive — fields absent from payload are preserved.
    // This is safe even if the document doesn't exist yet (unlike updateDoc which would throw).
    await setDoc(userRef, payload, { merge: true });
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

    // Write to both field names so Account Setup ("services") and Edit Profile
    // ("availableServices") always reflect the same value.
    await setDoc(userRef, {
      ...serviceInfo,
      services: serviceInfo.availableServices ?? [],   // keep Account Setup field current
      updatedAt: new Date()
    }, { merge: true });
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
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
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
        displayName:  data.displayName  || data.firstName || '',
        firstName:    data.firstName    || data.displayName || '',
        lastName:     data.lastName     || '',
        phoneNumber:  data.phoneNumber  || '',
        address:      typeof data.address === 'string' ? data.address : '',
        country:      data.country      || '',
        city:         data.city         || '',
        division:     data.division     || '',
        postalCode:   data.postalCode   || '',
        nic:          data.nic          || data.idNumber || '',
        idNumber:     data.idNumber     || data.nic      || '',
        bio:          data.bio          || '',
        profilePicture: data.profilePicture || '',
        idFrontImage:   data.idFrontImage   || '',
        idBackImage:    data.idBackImage    || '',
      };
    }
    return null;
  },
};