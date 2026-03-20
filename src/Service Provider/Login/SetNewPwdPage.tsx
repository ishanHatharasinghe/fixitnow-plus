import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react"; // Added Eye icons for better UX
import Img from "../../assets/Backgrounds/loginscreen2.png";

const SetNewPwdPage = () => {
  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear error as user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
    validate();
  };

  const validate = () => {
    let newErrors = {};

    // Password Validation
    if (!form.password) {
      newErrors.password = "Password is required";
    }
    else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm Password Validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    }
    else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    // Mark all as touched
    setTouched({ password: true, confirmPassword: true });

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      // Simulate API Call
      setTimeout(() => {
        setLoading(false);
        console.log("Password reset successfully:", form.password);
        alert("Password has been reset successfully!");
      }, 2000);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10">
        {/* Left Section */}
        <div className="flex-1 flex items-start justify-center lg:items-end lg:justify-start max-w-lg text-center lg:text-left">
          <div className="mb-0 lg:mb-10">
            <h1 className="font-rostex text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] text-white leading-[1.1] mt-13">
              Set New <span className="text-white">Password</span>
            </h1>
            <p className="font-poppins font-bold text-white text-sm sm:text-base md:text-lg opacity-100">
              Setup your new password.
            </p>
          </div>
        </div>

        {/* Card Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] border border-white/30">
          <div className="mb-6">
            <div className="w-16 h-16 border-2 border-[#0072D1]/30 bg-gray-50 rounded-2xl flex items-center justify-center">
              <Lock className="text-[#0072D1]" />
            </div>
          </div>

          <h2 className="text-[36px] md:text-[42px] font-bold text-[#FF5A00] leading-tight">
            Set New Password
          </h2>
          <p className="text-gray-600 text-sm font-medium mt-1 mb-6">
            Must be at least 8 characters.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Password Field */}
            <div className="mb-4">
              <label className="text-sm font-bold">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full mt-2 p-3 pr-10 rounded-2xl border-2 transition-all focus:outline-none ${
                    errors.password && touched.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#0072D1]/30 focus:border-[#0072D1]"
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[60%] -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label className="text-sm font-bold">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full mt-2 p-3 rounded-2xl border-2 transition-all focus:outline-none ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#0072D1]/30 focus:border-[#0072D1]"
                }`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className={`relative overflow-hidden w-full py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 group mb-4 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0072D1] hover:bg-[#000000] hover:scale-105 hover:shadow-lg text-white"
              }`}
            >
              <span className="relative z-10">
                {loading ? "Updating..." : "Reset Password"}
              </span>
              {!loading && (
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center mt-6">
            <button className="text-[#000000] font-semibold hover:text-[#0072D1] transition-colors">
              ← Back to Login
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-5">
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-gray-700"></span>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={Img}
          className="w-full h-full object-cover"
          alt="background"
        />
        <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-60 w-full h-full"></div>
      </div>
    </div>
  );
};

export default SetNewPwdPage;
