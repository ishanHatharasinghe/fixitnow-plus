import { useSignup } from "../../context/SignupContext";
import UserTypeSelectionPage from "./UserTypeSelectionPage";
import GetStartedPage from "./GetStartedPage";
import SetupYourAccountPage from "./SetupYourAccountPage";
import SetupYourLocationPage from "./SetupYourLocationPage";
import VerifyYourIdPage from "./VerifyYourIdPage";
import SetupYourImagePage from "./SetupYourImagePage";
import SignupCompletePage from "./SignupCompletePage";

const SignupFlow = () => {
  const { currentStep, formData } = useSignup();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <UserTypeSelectionPage />;
      case 2:
        return <GetStartedPage />;
      case 3:
        // Only for boarding_owner
        return formData.userType === "boarding_owner" ? (
          <SetupYourAccountPage />
        ) : (
          <SignupCompletePage />
        );
      case 4:
        // Only for boarding_owner
        return formData.userType === "boarding_owner" ? (
          <SetupYourLocationPage />
        ) : (
          <SignupCompletePage />
        );
      case 5:
        // Only for boarding_owner
        return formData.userType === "boarding_owner" ? (
          <VerifyYourIdPage />
        ) : (
          <SignupCompletePage />
        );
      case 6:
        // Only for boarding_owner
        return formData.userType === "boarding_owner" ? (
          <SetupYourImagePage />
        ) : (
          <SignupCompletePage />
        );
      case 7:
        return <SignupCompletePage />;
      default:
        return <UserTypeSelectionPage />;
    }
  };

  return <div>{renderStep()}</div>;
};

export default SignupFlow;
