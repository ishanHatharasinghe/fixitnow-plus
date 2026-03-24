import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const SignupCompletePage: React.FC = () => {
  const navigate = useNavigate();

  /**
   * CRITICAL: When this component mounts, it displays the success message
   * and automatically navigates to /profile after 3 seconds.
   * The Firebase account and Firestore document were already created
   * when the user clicked "Complete Setup" on the previous screen.
   */
  useEffect(() => {
    // Auto-navigate to profile after exactly 3 seconds
    const timer = setTimeout(() => {
      navigate('/edit-profile');
    }, 3000);

    // Cleanup timer if component unmounts before navigation
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FFFFFF] px-4">
      <div className="flex flex-col items-center space-y-2 text-center w-full max-w-md">
        {/* Logo Section */}
        <div className="relative w-40 md:w-64 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-auto object-contain" />
        </div>

        {/* Success State */}
        <h1 className="font-rostex text-3xl md:text-3xl tracking-wide md:tracking-wider text-[#FF5A00] font-poppins">
          Setup
        </h1>
        <h1 className="text-3xl sm:text-4xl md:text-6xl tracking-normal sm:tracking-widest text-[#0072D1] font-rostex break-words">
          Completed
        </h1>
        <p className="font-poppins text-gray-600 text-sm font-medium mt-1 mb-6">
          Account created successfully! Redirecting to profile...
        </p>
      </div>
    </div>
  );
};

export default SignupCompletePage;
