import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
  }, [serviceProviderData, resetSignupData]);

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
    updateFormData: updateServiceProviderData
  };

  return (
    <SignupContext.Provider value={value}>
      {children}
    </SignupContext.Provider>
  );
};