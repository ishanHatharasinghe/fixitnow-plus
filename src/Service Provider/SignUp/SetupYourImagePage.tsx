import { useState, useRef } from "react";
// Assuming you have a background image for this page, using a placeholder import
import imageBackground from "../../assets/Backgrounds/Signupscreens3.png";

const SetupYourImagePage = () => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(""); // Validation state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

  // Validation Logic
  const validateFile = (file: File | null) => {
    if (!file) {
      setError("Please select an image to continue.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 3 MB.");
      return false;
    }
    setError("");
    return true;
  };

  // UI-only Handlers for Drag & Drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setProfileImage(file);
      }
      else {
        setProfileImage(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (validateFile(file)) {
        setProfileImage(file);
      }
      else {
        setProfileImage(null);
      }
    }
  };

  const handleCompleteSetup = () => {
    if (validateFile(profileImage)) {
      console.log("Setup Complete with file:", profileImage);
      // Proceed to final logic
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main Content Wrapper */}
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10 min-h-screen items-center">
        {/* Left Side - Heading styled to match */}
        <div className="flex-1 flex items-start justify-center lg:items-end lg:justify-start max-w-lg text-center lg:text-left">
          <div className="mb-0 lg:mb-10 animate-fadeInUp">
            <h1 className="font-rostex text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] text-white leading-[1.1] mt-13 uppercase italic tracking-tighter">
              SETUP <br />
              <span className="text-white">PROFILE</span>
            </h1>
            <p className="font-poppins font-bold text-white text-sm sm:text-base md:text-lg opacity-100 mt-2">
              Upload your profile image
            </p>
          </div>
        </div>

        {/* Right Side - Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] border border-white/30 animate-slideInRight">
          <div className="relative z-10 w-full">
            <div className="text-center mb-6 animate-fadeInUp">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Profile Image
              </h2>
              <p
                className={`text-sm ${
                  error ? "text-red-500 font-semibold" : "text-gray-500"
                }`}
              >
                {error || "Maximum allowed upload size of 3 MB"}
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              className="mb-8 flex justify-center animate-fadeInUp"
              style={{ animationDelay: "0.1s" }}
            >
              <div
                className={`relative group flex flex-col items-center justify-center border-2 border-dashed rounded-[30px] w-full max-w-[320px] h-[320px] cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? "border-[#0072D1] bg-[#0072D1]/10 scale-105"
                    : error
                    ? "border-red-400 bg-red-50"
                    : "border-[#0072D1]/30 bg-white hover:border-[#0072D1] hover:bg-[#F8FAFC]"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />

                {profileImage ? (
                  <div className="text-center p-4">
                    <div className="w-20 h-20 bg-[#0072D1] rounded-full flex items-center justify-center mb-4 mx-auto shadow-md">
                      <span className="text-white text-3xl">✓</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-2 truncate max-w-[250px]">
                      {profileImage.name}
                    </p>
                    <p className="text-xs text-gray-500 font-medium hover:text-[#0072D1] transition-colors">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div
                      className={`w-20 h-20 ${
                        error ? "bg-red-100" : "bg-[#0072D1]/10"
                      } rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-[#0072D1]/20 transition-colors duration-300`}
                    >
                      <span
                        className={`${
                          error ? "text-red-500" : "text-[#0072D1]"
                        } text-4xl font-light`}
                      >
                        +
                      </span>
                    </div>
                    <p className="text-base font-bold text-gray-800 mb-2">
                      Upload Image
                    </p>
                    <p className="text-xs text-gray-500">
                      Drag & drop or click to browse
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons Layout matching Location Page */}

            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <button className="relative overflow-hidden w-full bg-[#FF5A00] hover:bg-[#000000] text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4">
                <span className="relative z-10">Previous</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button
                onClick={handleCompleteSetup}
                className="relative overflow-hidden w-full bg-[#0072D1] hover:bg-[#000000] text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4"
              >
                <span className="relative z-10">Complete Setup</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>

            {/* Back to login */}
            <div
              className="text-center mt-6 animate-fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <button className="text-[#000000] font-semibold hover:text-[#0072D1] transition-colors">
                ← Back to SignUp
              </button>
            </div>

            {/* Pagination Dots (Assuming this is step 5 based on background dot color) */}
            <div
              className="flex justify-center gap-2 mt-5 animate-fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-700"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Layer with Dark Overlay */}
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
