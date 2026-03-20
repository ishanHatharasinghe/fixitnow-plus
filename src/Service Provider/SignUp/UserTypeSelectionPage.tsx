import { Users, Home } from "lucide-react";
import { useState } from "react";
import { BsStars } from "react-icons/bs";
import { useSignup } from "../../context/SignupContext";
import heroBackground from "../../assets/images/background/hero-background.webp";

const UserTypeSelectionPage = () => {
  const { formData, updateFormData, nextStep } = useSignup();

  const [selectedType, setSelectedType] = useState(formData.userType || "");
  const [error, setError] = useState("");

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedType) {
      setError("Please select a user type to continue");
      return;
    }
    updateFormData({ userType: selectedType });
    nextStep();
  };

  return (
    <div>
      <div className="p-6 md:p-30 min-h-screen bg-gradient-to-br from-cyan-300 via-blue-200 to-purple-200 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-400/15 rounded-full blur-lg animate-bounce"></div>
        </div>

        {/* Main Content Wrapper */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 px-4 md:px-10 relative z-10">
          {/* Left Side - Heading */}
          <div className="flex-1 max-w-lg text-center lg:text-left">
            <div className="animate-fadeInUp">
              <h1 className="font-hugiller text-[50px] sm:text-[70px] md:text-[100px] lg:text-[130px] text-[#263D5D] leading-[1.1] mb-4">
                Join <br />
                <span className="text-[#3ABBD0] relative">Us Today</span>
              </h1>
              <p className="font-montserrat text-lg md:text-xl text-[#303435] mb-4 opacity-80">
                Choose your account type to get started
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-3 bg-[#303435]/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-lg text-sm sm:text-base border border-white/20">
                <BsStars className="w-[25px] sm:w-[30px] text-[#3ABBD0] animate-spin-slow" />
                <span className="font-montserrat font-thin whitespace-nowrap truncate">
                  Discover quality, comfort, and convenience with us.
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - User Type Selection */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 w-full lg:w-[600px] relative z-20 border border-white/30 animate-slideInRight">
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-[#263D5D] mb-2 text-center">
                Select Your Account Type
              </h2>
              <p className="text-gray-600 text-center mb-8 font-montserrat">
                Choose how you want to use our platform
              </p>

              {/* User Type Cards */}
              <div className="space-y-4 mb-8">
                {/* Boarding Finder Card */}
                <div
                  onClick={() => handleTypeSelect("boarding_finder")}
                  className={`relative p-6 rounded-2xl border-3 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedType === "boarding_finder"
                      ? "border-[#3ABBD0] bg-[#3ABBD0]/10 shadow-lg"
                      : "border-gray-300 bg-white/50 hover:border-[#3ABBD0]/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        selectedType === "boarding_finder"
                          ? "bg-[#3ABBD0] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#263D5D] mb-2">
                        Boarding Finder
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        I'm looking for boarding or rental places to stay
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#3ABBD0] rounded-full"></div>
                          Quick registration process
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#3ABBD0] rounded-full"></div>
                          Browse available properties
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#3ABBD0] rounded-full"></div>
                          Contact property owners
                        </li>
                      </ul>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedType === "boarding_finder"
                          ? "border-[#3ABBD0] bg-[#3ABBD0]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedType === "boarding_finder" && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Boarding Owner Card */}
                <div
                  onClick={() => handleTypeSelect("boarding_owner")}
                  className={`relative p-6 rounded-2xl border-3 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedType === "boarding_owner"
                      ? "border-[#3ABBD0] bg-[#3ABBD0]/10 shadow-lg"
                      : "border-gray-300 bg-white/50 hover:border-[#3ABBD0]/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        selectedType === "boarding_owner"
                          ? "bg-[#3ABBD0] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Home className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#263D5D] mb-2">
                        Boarding Owner
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        I want to list my boarding or rental property
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#3ABBD0] rounded-full"></div>
                          Complete verification required
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#3ABBD0] rounded-full"></div>
                          List unlimited properties
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#3ABBD0] rounded-full"></div>
                          Manage bookings and inquiries
                        </li>
                      </ul>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedType === "boarding_owner"
                          ? "border-[#3ABBD0] bg-[#3ABBD0]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedType === "boarding_owner" && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm mb-4 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {error}
                </p>
              )}

              <button
                type="submit"
                onClick={handleSubmit}
                className="relative overflow-hidden w-full bg-[#263D5D] hover:bg-[#303435] text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4"
              >
                <span className="relative z-10">Continue</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <p className="text-center text-[#263D5D] text-sm sm:text-base">
                Have an account?{" "}
                <a
                  href="/login"
                  className="text-[#3ABBD0] hover:text-cyan-700 font-semibold transition-colors duration-300"
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBackground}
            alt="Modern house"
            className="object-cover w-full h-full opacity-100"
          />
          <div className="object-cover w-full h-full opacity-30 bg-gradient-to-br from-cyan-100 via-blue-50 to-purple-100"></div>

          {/* Gradient overlay for small screens only */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#DFECF8]/80 to-transparent opacity-100 block md:hidden"></div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UserTypeSelectionPage;
