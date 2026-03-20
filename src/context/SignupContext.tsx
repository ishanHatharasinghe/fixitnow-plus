import React, {
  createContext,
  useContext,
  useState,
  type ReactNode
} from "react";

interface SignupDataForm {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  description?: string;
  serviceType?: string;
  phone?: string;
  country?: string;
  district?: string;
  division?: string;
  postalCode?: string;
  profileImage?: File | null;
  idNumber?: string;
  frontImage?: File | null;
  backImage?: File | null;
  userType?: string;
}

interface SignupContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  userType: string | null;
  setUserType: (type: string) => void;
  formData: SignupDataForm;
  updateFormData: (data: Partial<SignupDataForm>) => void;
  nextStep: () => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupDataForm>({});

  const updateFormData = (data: Partial<SignupDataForm>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  return (
    <SignupContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        userType,
        setUserType,
        formData,
        updateFormData,
        nextStep
      }}
    >
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error("useSignup must be used within a SignupProvider");
  }
  return context;
};
