import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import locationBackground from "../../assets/Backgrounds/Signupscreens3.png";

interface IdVerificationFormData {
  idNumber: string;
  frontImage: File | null;
  backImage: File | null;
}

const VerifyYourIdPage = () => {
  const navigate = useNavigate();
  const { updateServiceProviderData, serviceProviderData } = useSignup();
  
  // Keeping simple local state for the UI demonstration
  const [localData, setLocalData] = useState<IdVerificationFormData>({
    idNumber: serviceProviderData.idNumber || "",
    frontImage: null,
    backImage: null
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof IdVerificationFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof IdVerificationFormData, boolean>>
  >({});
  const [dragOver, setDragOver] = useState({ front: false, back: false });

  // Refs for hidden file inputs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Validation function
  const validate = () => {
    let newErrors: Partial<Record<keyof IdVerificationFormData, string>> = {};
    if (!localData.idNumber.trim()) {
      newErrors.idNumber = "ID number is required";
    }
    else if (localData.idNumber.length < 9) {
      newErrors.idNumber = "Enter a valid ID number (min 9 characters)";
    }

    if (!localData.frontImage) newErrors.frontImage = "Front image is required";
    if (!localData.backImage) newErrors.backImage = "Back image is required";

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalData({
      ...localData,
      [name as keyof IdVerificationFormData]: value
    });
    if (errors[name as keyof IdVerificationFormData]) {
      setErrors({ ...errors, [name as keyof IdVerificationFormData]: "" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      setLocalData({
        ...localData,
        [name as keyof IdVerificationFormData]: files[0]
      });
      setErrors({ ...errors, [name as keyof IdVerificationFormData]: "" });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, type: string) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [type]: true });
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>,
    type: string
  ) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [type]: false });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: string) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [type]: false });
    const file = e.dataTransfer.files[0];
    if (file) {
      const name = type === "front" ? "frontImage" : "backImage";
      setLocalData({ ...localData, [name]: file });
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (field: keyof IdVerificationFormData) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleNextPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simplified validation - only check ID number, NOT images
    const newErrors: Partial<Record<keyof IdVerificationFormData, string>> = {};
    if (!localData.idNumber.trim()) {
      newErrors.idNumber = "ID number is required";
    }
    else if (localData.idNumber.length < 9) {
      newErrors.idNumber = "Enter a valid ID number (min 9 characters)";
    }
    
    setErrors(newErrors);
    setTouched({ ...touched, idNumber: true });

    if (Object.keys(newErrors).length === 0) {
      // Save ONLY idNumber to context (NO images as per requirement)
      updateServiceProviderData({
        idNumber: localData.idNumber
        // Do NOT save image files - user specified no image uploads
      });
      
      // Navigate to next step
      navigate('/signup/setup-image');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main Content Wrapper */}
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10 min-h-screen items-center">
        {/* Left Side - Heading styled to match the mockups */}
        <div className="flex-1 flex items-start justify-center lg:items-end lg:justify-start max-w-lg text-center lg:text-left">
          <div className="mb-0 lg:mb-10 animate-fadeInUp">
            <h1 className="font-rostex text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] text-white leading-[1.1] mt-13 uppercase italic tracking-tighter">
              VERIFY <br />
              <span className="text-white">IDENTITY</span>
            </h1>
            <p className="font-poppins font-bold text-white text-sm sm:text-base md:text-lg opacity-100 mt-2">
              Verify your identity details
            </p>
          </div>
        </div>

        {/* Right Side - Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] border border-white/30 animate-slideInRight">
          <div className="relative z-10 w-full">
            {/* ID Number */}
            <div className="mb-5">
              <label className="text-sm font-bold">
                National ID / Driving License Number
              </label>
              <input
                type="text"
                name="idNumber"
                value={localData.idNumber}
                onChange={handleChange}
                onBlur={() => handleBlur("idNumber")}
                className={`w-full mt-2 p-3 rounded-2xl border-2 transition-all focus:outline-none ${
                  errors.idNumber && touched.idNumber
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#0072D1]/30 focus:border-[#0072D1]"
                }`}
                placeholder="Enter your ID number"
              />
              {errors.idNumber && touched.idNumber && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.idNumber}
                </p>
              )}
            </div>

            {/* Upload Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Front Image Upload */}
              <div>
                <label className="text-sm font-bold block mb-2">
                  Front Image
                </label>
                <p className="font-poppins text-black text-sm opacity-100 mt-2">
                  Upload Id Front Image
                </p>
                <div
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                    dragOver.front
                      ? "border-[#0072D1] bg-[#0072D1]/10"
                      : errors.frontImage && touched.frontImage
                      ? "border-red-500 bg-red-50"
                      : "border-[#0072D1]/30 hover:border-[#0072D1] bg-white"
                  }`}
                  onClick={() => frontInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, "front")}
                  onDragLeave={(e) => handleDragLeave(e, "front")}
                  onDrop={(e) => handleDrop(e, "front")}
                >
                  <input
                    ref={frontInputRef}
                    type="file"
                    name="frontImage"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <div
                    className={`text-4xl mb-2 transition-transform duration-300 ${
                      localData.frontImage
                        ? "text-green-500 scale-110"
                        : errors.frontImage && touched.frontImage
                        ? "text-red-500"
                        : "text-[#0072D1]"
                    }`}
                  >
                    {localData.frontImage ? "✓" : "＋"}
                  </div>
                  <p className="text-xs font-bold text-center text-gray-700">
                    {localData.frontImage
                      ? localData.frontImage.name
                      : "Upload front side"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Drag & drop or click
                  </p>
                </div>
                {errors.frontImage && touched.frontImage && (
                  <p className="text-red-500 text-[10px] mt-1 text-center">
                    {errors.frontImage}
                  </p>
                )}
              </div>

              {/* Back Image Upload */}
              <div>
                <label className="text-sm font-bold block mb-2">
                  Back Image
                </label>
                <p className="font-poppins text-black text-sm opacity-100 mt-2">
                  Upload Id Back Image
                </p>
                <div
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                    dragOver.back
                      ? "border-[#0072D1] bg-[#0072D1]/10"
                      : errors.backImage && touched.backImage
                      ? "border-red-500 bg-red-50"
                      : "border-[#0072D1]/30 hover:border-[#0072D1] bg-white"
                  }`}
                  onClick={() => backInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, "back")}
                  onDragLeave={(e) => handleDragLeave(e, "back")}
                  onDrop={(e) => handleDrop(e, "back")}
                >
                  <input
                    ref={backInputRef}
                    type="file"
                    name="backImage"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <div
                    className={`text-4xl mb-2 transition-transform duration-300 ${
                      localData.backImage
                        ? "text-green-500 scale-110"
                        : errors.backImage && touched.backImage
                        ? "text-red-500"
                        : "text-[#0072D1]"
                    }`}
                  >
                    {localData.backImage ? "✓" : "＋"}
                  </div>
                  <p className="text-xs font-bold text-center text-gray-700">
                    {localData.backImage
                      ? localData.backImage.name
                      : "Upload back side"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Drag & drop or click
                  </p>
                </div>
                {errors.backImage && touched.backImage && (
                  <p className="text-red-500 text-[10px] mt-1 text-center">
                    {errors.backImage}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons Layout */}
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <button 
                type="button"
                onClick={() => navigate('/signup/setup-location')}
                className="relative overflow-hidden w-full bg-[#FF5A00] hover:bg-[#000000] text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4">
                <span className="relative z-10">Previous</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button
                onClick={(e: any) =>
                  handleNextPage(e as React.FormEvent<HTMLFormElement>)
                }
                type="submit"
                className="relative overflow-hidden w-full bg-[#0072D1] hover:bg-[#000000] text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4"
              >
                <span className="relative z-10">Next Page</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>

            {/* Back to login */}
            <div className="text-center mt-6">
              <button className="text-[#000000] font-semibold hover:text-[#0072D1]">
                ← Back to SignUp
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-5">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-700"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Layer with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={locationBackground}
          alt="Background"
          className="object-cover w-full h-full opacity-100"
        />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out 0.2s forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default VerifyYourIdPage;
