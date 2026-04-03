import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';
// Don't initialize Firebase here - import from the centralized firebase.js file

interface ServiceProviderData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: 'individual' | 'business' | 'boarding_owner';
  businessName?: string;
  businessRegistrationNumber?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  idType: 'national_id' | 'passport' | 'drivers_license';
  idNumber: string;
  services: string[];
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  workingHours: {
    start: string;
    end: string;
  };
  profileImage?: string;
  idFrontImage?: string;
  idBackImage?: string;
}

export interface ExistingUserCheckResult {
  exists: boolean;
  role?: 'seeker' | 'service_provider' | 'admin';
  uid?: string;
  error?: string;
}

interface SignupContextType {
  serviceProviderData: Partial<ServiceProviderData>;
  updateServiceProviderData: (data: Partial<ServiceProviderData>) => void;
  resetSignupData: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  completeSignup: () => Promise<void>;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  formData: Partial<ServiceProviderData>;
  updateFormData: (data: Partial<ServiceProviderData>) => void;
  checkExistingUserByEmail: (email: string) => Promise<ExistingUserCheckResult>;
  upgradeSeekerToProvider: (uid: string, newData: Partial<ServiceProviderData>) => Promise<void>;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

interface SignupProviderProps {
  children: ReactNode;
}

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
};

export const SignupProvider: React.FC<SignupProviderProps> = ({ children }) => {
  const [serviceProviderData, setServiceProviderData] = useState<Partial<ServiceProviderData>>({
    userType: 'individual',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Sri Lanka'
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    services: [],
    profileImage: undefined,
    idFrontImage: undefined,
    idBackImage: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [existingUserCheck, setExistingUserCheck] = useState<ExistingUserCheckResult | null>(null);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const updateServiceProviderData = useCallback((data: Partial<ServiceProviderData>) => {
    setServiceProviderData(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  const resetSignupData = useCallback(() => {
    setServiceProviderData({
      userType: 'individual',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Sri Lanka'
      },
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      services: [],
      profileImage: undefined,
      idFrontImage: undefined,
      idBackImage: undefined
    });
    setSubmitError(null);
    setExistingUserCheck(null);
  }, []);

  /**
   * Check if a user exists in Firestore by email address
   * Returns information about the existing user including their role
   */
  const checkExistingUserByEmail = useCallback(async (email: string): Promise<ExistingUserCheckResult> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        return {
          exists: true,
          role: userData.role as 'seeker' | 'service_provider' | 'admin',
          uid: userDoc.id
        };
      }
      
      return { exists: false };
    } catch (error: any) {
      console.error('Error checking existing user:', error);
      return {
        exists: false,
        error: error.message || 'Failed to check existing user'
      };
    }
  }, []);

  /**
   * Upgrade an existing Seeker account to a Service Provider account
   * Updates the Firestore document with provider-specific information
   */
  const upgradeSeekerToProvider = useCallback(async (uid: string, newData: Partial<ServiceProviderData>) => {
    try {
      const {
        firstName,
        lastName,
        phoneNumber,
        userType,
        businessName,
        businessRegistrationNumber,
        address,
        idNumber
      } = newData;

      // Set default values for missing optional fields
      const finalData = {
        ...newData,
        userType: newData.userType || 'individual',
        address: {
          street: address?.street || '',
          city: address?.city || '',
          state: address?.state || '',
          postalCode: address?.postalCode || '',
          country: address?.country || 'Sri Lanka'
        },
        idType: newData.idType || 'national_id',
        services: newData.services || [],
        availability: newData.availability || {
          monday: true, tuesday: true, wednesday: true, thursday: true, 
          friday: true, saturday: false, sunday: false
        },
        workingHours: newData.workingHours || { start: '09:00', end: '17:00' }
      };

      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        role: 'service_provider',
        displayName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        userType: finalData.userType,
        businessName: finalData.userType === 'business' ? businessName : null,
        businessRegistrationNumber: finalData.userType === 'business' ? businessRegistrationNumber : null,
        address: finalData.address,
        idType: finalData.idType,
        idNumber: idNumber || '',
        services: finalData.services,
        availability: finalData.availability,
        workingHours: finalData.workingHours,
        isVerified: false, // Service providers need verification
        isActive: true,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error upgrading seeker to provider:', error);
      throw new Error(error.message || 'Failed to upgrade account');
    }
  }, []);

  const completeSignup = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        userType,
        businessName,
        businessRegistrationNumber,
        address,
        idNumber
      } = serviceProviderData;

      // Validation - only check fields that are actually required
      if (!email || !password || !firstName || !lastName || !phoneNumber) {
        throw new Error('Please fill in all required fields');
      }

      if (password !== serviceProviderData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (userType === 'business' && (!businessName || !businessRegistrationNumber)) {
        throw new Error('Business name and registration number are required for business accounts');
      }

      // Address validation - only check if address object exists
      if (!address || !address.city || !address.state || !address.postalCode || !address.country) {
        throw new Error('Please provide a complete address');
      }

      // STEP 1: Check if user already exists in Firestore
      const existingUserResult = await checkExistingUserByEmail(email);
      setExistingUserCheck(existingUserResult);

      // STEP 2: Handle existing user scenarios
      if (existingUserResult.exists) {
        if (existingUserResult.role === 'service_provider') {
          // SCENARIO 1: User is already a Provider - BLOCK registration
          throw new Error('A provider account already exists with this email.');
        } else if (existingUserResult.role === 'seeker' && existingUserResult.uid) {
          // SCENARIO 2: User is a Seeker - ALLOW upgrade to Provider
          try {
            await upgradeSeekerToProvider(existingUserResult.uid, serviceProviderData);
            // Reset form data after successful upgrade
            resetSignupData();
            return; // Success - exit early
          } catch (upgradeError: any) {
            throw new Error(upgradeError.message || 'Failed to upgrade account to provider.');
          }
        } else if (existingUserResult.role === 'admin') {
          throw new Error('An admin account already exists with this email. Please use a different email.');
        }
      }

      // STEP 3: Handle new user scenario - Create new Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Set default values for missing optional fields
      const finalData = {
        ...serviceProviderData,
        userType: serviceProviderData.userType || 'individual',
        address: {
          street: address?.street || '',
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country || 'Sri Lanka'
        },
        idType: serviceProviderData.idType || 'national_id',
        services: serviceProviderData.services || [],
        availability: serviceProviderData.availability || {
          monday: true, tuesday: true, wednesday: true, thursday: true, 
          friday: true, saturday: false, sunday: false
        },
        workingHours: serviceProviderData.workingHours || { start: '09:00', end: '17:00' }
      };

      // Create complete user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: email,
        displayName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        role: 'service_provider',
        userType: finalData.userType,
        businessName: finalData.userType === 'business' ? businessName : null,
        businessRegistrationNumber: finalData.userType === 'business' ? businessRegistrationNumber : null,
        address: finalData.address,
        idType: finalData.idType,
        idNumber: idNumber || '',
        services: finalData.services,
        availability: finalData.availability,
        workingHours: finalData.workingHours,
        isVerified: false, // Service providers need verification
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Reset form data after successful signup
      resetSignupData();

    } catch (error: any) {
      console.error('Signup error:', error);
      setSubmitError(error.message || 'Failed to create account. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [serviceProviderData, resetSignupData, checkExistingUserByEmail, upgradeSeekerToProvider]);

  const value: SignupContextType = {
    serviceProviderData,
    updateServiceProviderData,
    resetSignupData,
    isSubmitting,
    submitError,
    completeSignup,
    currentStep,
    nextStep,
    prevStep,
    formData: serviceProviderData,
    updateFormData: updateServiceProviderData,
    checkExistingUserByEmail,
    upgradeSeekerToProvider
  };

  return (
    <SignupContext.Provider value={value}>
      {children}
    </SignupContext.Provider>
  );
};