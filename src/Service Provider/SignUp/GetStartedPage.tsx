import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import Img from "../../assets/Backgrounds/Signupscreens.jpg";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const GetStartedPage = () => {
  const navigate = useNavigate();
  const { updateServiceProviderData, serviceProviderData } = useSignup();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: serviceProviderData.firstName || "",
    lastName: serviceProviderData.lastName || "",
    email: serviceProviderData.email || "",
    password: serviceProviderData.password || "",
    confirmPassword: serviceProviderData.confirmPassword || ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name as keyof FormData]: value });
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors({ ...errors, [name as keyof FormData]: "" });
    }
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched({ ...touched, [e.target.name as keyof FormData]: true });
  };

  const validate = () => {
    let newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Required";
    if (!formData.lastName.trim()) newErrors.lastName = "Required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    else if (formData.password.length < 8) {
      newErrors.password = "Must be at least 8 characters";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    // Mark all fields as touched to show errors
    const allTouched = Object.keys(formData).reduce((acc: Partial<Record<keyof FormData, boolean>>, key) => {
      acc[key as keyof FormData] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      
      // Save data to context and navigate to next step
      updateServiceProviderData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      // Navigate to next step
      navigate('/signup/setup-account');
      
      setLoading(false);
    }
  };

  const getInputClass = (name: keyof FormData) => {
    const baseClass =
      "w-full mt-2 p-3 rounded-2xl border-2 transition-all focus:outline-none ";
    const errorClass =
      errors[name] && touched[name]
        ? "border-red-500 focus:border-red-500"
        : "border-[#0072D1]/30 focus:border-[#0072D1]";
    return baseClass + errorClass;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10 min-h-screen items-center">
        {/* Left Side */}
        <div className="flex-1 flex items-start justify-center lg:items-end lg:justify-start max-w-lg text-center lg:text-left animate-fadeInUp">
          <div className="mb-0 lg:mb-10">
            <h1 className="font-rostex text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] text-white leading-[1.1] mt-13">
              GET <br />
              <span className="text-white">STARTED</span>
            </h1>
            <p className="font-poppins font-bold text-white text-sm sm:text-base md:text-lg opacity-100">
              Let's create your account here
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] border border-white/30 animate-slideInRight">
          <form onSubmit={handleSubmit} className="relative z-10 w-full">
            {/* Name Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="text-sm font-bold">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass("firstName")}
                />
                {errors.firstName && touched.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="text-sm font-bold">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass("lastName")}
                />
                {errors.lastName && touched.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="text-sm font-bold">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 mt-1" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass("email")} pl-12`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="text-sm font-bold">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 mt-1" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass("password")} pl-12`}
                />
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-8">
              <label className="text-sm font-bold">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 mt-1" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass("confirmPassword")} pl-12`}
                />
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            
            <button
              type="submit"
              disabled={loading}
              className={`relative overflow-hidden w-full py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 group mb-4 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0072D1] hover:bg-black text-white hover:scale-105 hover:shadow-lg"
              }`}
            >
              <span className="relative z-10">
                {loading ? "Creating Account..." : "Sign Up"}
              </span>
              {!loading && (
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-[#000000] text-base font-medium">
              Have an account?{" "}
              <button
                type="button"
                className="text-[#0072D1] font-semibold hover:underline transition-colors duration-300"
              >
                Login
              </button>
            </p>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-5">
              <span className="w-2 h-2 rounded-full bg-gray-700"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            </div>
          </form>
        </div>
      </div>

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={Img}
          alt="Background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/20"></div>
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
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out 0.2s forwards; }
      `}</style>
    </div>
  );
};

export default GetStartedPage;
