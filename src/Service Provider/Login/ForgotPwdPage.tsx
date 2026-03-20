import { useState } from "react";
import { Mail, Fingerprint } from "lucide-react";
import Img from "../../assets/Backgrounds/loginscreen.png";

const ForgotPwdPage = () => {
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ email: true });

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsSubmitted(true);
        console.log("Reset link sent to:", formData.email);
      }, 1500);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cyan-300 via-blue-200 to-purple-200">
      {/* Main Content */}
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-4 lg:gap-20 min-h-screen relative z-10">
        {/* Left Section */}
        <div className="flex-1 flex items-start justify-center lg:items-end lg:justify-start max-w-lg text-center lg:text-left">
          <div className="mb-0 lg:mb-10">
            <h1 className="font-rostex text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] text-white leading-[1.1] mt-13">
              Forgot <span className="text-white">Password?</span>
            </h1>
            <p className="font-poppins font-bold text-white text-sm sm:text-base md:text-lg opacity-100">
              No worries. We'll send you reset instructions.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] relative z-20 border border-white/30 animate-slideInRight">
          {/* Success Message */}
          {isSubmitted && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl">
              Reset link has been sent to your email.
            </div>
          )}

          {/* Icon */}
          <div className="flex mb-6">
            <div className="w-16 h-16 border-2 border-[#0072D1]/30 bg-gray-50 rounded-2xl flex items-center justify-center">
              <Fingerprint className="text-[#0072D1]" />
            </div>
          </div>

          {/* Form Title */}
          <h2 className="text-[36px] md:text-[42px] font-bold text-[#FF5A00] leading-tight">
            Forgot Password?
          </h2>
          <p className="text-gray-600 text-sm font-medium mt-1 mb-6">
            No worries. We'll send you reset instructions.
          </p>

          {/* Email Input */}
          <div className="mb-6">
            <label className="text-sm font-bold text-[#000000]">
              Email Address
            </label>
            <div className="relative group mt-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pl-12 py-3 rounded-2xl border-2 transition-all ${
                  errors.email && touched.email
                    ? "border-red-500"
                    : "border-[#0072D1]/30"
                } focus:outline-none focus:ring-2 focus:ring-[#0072D1]/30`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && touched.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Reset Button with effect */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`relative overflow-hidden w-full py-3 rounded-2xl text-white font-semibold text-lg transition-all duration-300 group mb-4 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#006AFF] hover:bg-[#000000] hover:scale-105 hover:shadow-lg"
            }`}
          >
            <span className="relative z-10">
              {loading ? "Sending..." : "Reset Password"}
            </span>
            {!loading && (
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
          </button>

          {/* Back to login */}
          <div className="text-center mt-6">
            <button className="text-[#000000] font-semibold hover:text-[#0072D1]">
              ← Back to Login
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center  gap-2 mt-5">
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-gray-700"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={Img}
          className="object-cover w-full h-full"
          alt="background"
        />
        <div className="w-full h-full bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-60"></div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default ForgotPwdPage;
