import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import imageBackground from "../../assets/Backgrounds/Signupscreens3.png";

const SetupYourImagePage = () => {
  const navigate = useNavigate();
  const { completeSignup, isSubmitting, submitError } = useSignup();
  
  const [localError, setLocalError] = useState("");

  /**
   * CRITICAL: This is the final submission step.
   * When 'Complete Setup' is clicked, it will:
   * 1. Call completeSignup() which creates Firebase Auth account + Firestore doc
   * 2. Clear context data
   * 3. Navigate to success screen
   */
  const handleCompleteSetup = async () => {
    try {
      setLocalError("");
      await completeSignup();
      // If successful, navigate to completion screen
      navigate('/signup/complete');
    } catch (error: any) {
      // Error is already set in context via submitError, but also show locally
      setLocalError(error.message || "Failed to complete setup. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main Content Wrapper */}
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10 min-h-screen items-center">
        {/* Left Side - Heading */}
        <div className="flex-1 flex items-start justify-center lg:items-end lg:justify-start max-w-lg text-center lg:text-left">
          <div className="mb-0 lg:mb-10 animate-fadeInUp">
            <h1 className="font-rostex text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] text-white leading-[1.1] mt-13 uppercase italic tracking-tighter">
              SETUP <br />
              <span className="text-white">PROFILE</span>
            </h1>
            <p className="font-poppins font-bold text-white text-sm sm:text-base md:text-lg opacity-100 mt-2">
              Complete your account setup
            </p>
          </div>
        </div>

        {/* Right Side - Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] border border-white/30 animate-slideInRight">
          <div className="relative z-10 w-full">
            <div className="text-center mb-8 animate-fadeInUp">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Ready to Complete?
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Review your information and click 'Complete Setup' to create your account.
              </p>
              
              {/* Error Display */}
              {(submitError || localError) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm font-semibold">
                    {submitError || localError}
                  </p>
                </div>
              )}
            </div>

            {/* Setup Summary Box */}
            <div className="mb-8 p-6 bg-[#F8FAFC] border-2 border-[#0072D1]/20 rounded-2xl animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Account Setup Summary</h3>
              <div className="space-y-3 text-sm text-left">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">All information filled ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-semibold text-gray-900">Service Provider</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Firebase Creation:</span>
                  <span className="font-semibold text-blue-600">On next step</span>
                </div>
              </div>
            </div>

            {/* Buttons Layout */}
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <button 
                type="button"
                onClick={() => navigate('/signup/verify-id')}
                disabled={isSubmitting}
                className="relative overflow-hidden w-full bg-[#FF5A00] hover:bg-[#000000] disabled:bg-gray-400 text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4"
              >
                <span className="relative z-10">Previous</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button
                onClick={handleCompleteSetup}
                disabled={isSubmitting}
                type="button"
                className="relative overflow-hidden w-full bg-[#0072D1] hover:bg-[#000000] disabled:bg-gray-400 text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4"
              >
                <span className="relative z-10">
                  {isSubmitting ? "Creating Account..." : "Complete Setup"}
                </span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>

            {/* Back to login */}
            <div className="text-center mt-6 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
              <button className="text-[#000000] font-semibold hover:text-[#0072D1] transition-colors">
                ← Back to SignUp
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-5 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-700"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageBackground}
          alt="Background"
          className="object-cover w-full h-full opacity-100"
        />
      </div>

      {/* Shared Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out 0.2s forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default SetupYourImagePage;
