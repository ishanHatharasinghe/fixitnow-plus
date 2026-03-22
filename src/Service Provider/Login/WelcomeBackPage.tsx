import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../src/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../src/contexts/AuthContext";
import Img from "../../assets/Backgrounds/loginscreen.png";

const WelcomeBackPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirect based on user role
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'service_provider') {
        navigate('/service-provider/profile');
      } else {
        navigate('/seeker/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else {
        setError('Login failed. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main Content Wrapper */}
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10">
        {/* Left Side - Heading */}
        <div className="flex-1 max-w-lg text-center lg:text-left">
          <div className="animate-fadeInUp"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] relative z-20 border border-white/30 animate-slideInRight">
          <div className="flex-1 max-w-lg text-center lg:text-left">
            <div className="animate-fadeInUp">
              <h1 className="font-rostex text-[32px] sm:text-[48px] md:text-[60px] lg:text-[60px] text-[#0072D1] leading-[1.1] mb-2">
                Welcome <br />
                <span className="text-[#FF5A00] relative">Back !</span>
              </h1>
              <p className="font-poppins font-bold text-base sm:text-lg md:text-xl text-[#000000] mb-4 opacity-80">
                Welcome back to the FixItNow
              </p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>

          <div className="mt-8 sm:mt-12 mb-8 relative z-10">
            {/* Email */}
            <div className="mb-6 sm:mb-8">
              <label className="flex items-center gap-2 text-[#000000] text-sm font-bold mb-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />

                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 rounded-2xl bg-gray-50/80 backdrop-blur-sm border-2 border-[#0072D1]/30 focus:border-[#3ABBD0] focus:outline-none focus:ring-4 focus:ring-[#3ABBD0]/20 transition-all duration-300 group-hover:border-[#3ABBD0]/50"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-[#000000] text-sm font-bold mb-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 rounded-2xl bg-gray-50/80 backdrop-blur-sm border-2 border-[#0072D1]/30 focus:border-[#3ABBD0] focus:outline-none focus:ring-4 focus:ring-[#3ABBD0]/20 transition-all duration-300 group-hover:border-[#3ABBD0]/50"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-[#0072D1] hover:text-[#0072D1] transition-colors z-10"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* Forgot password link */}
              <p className="text-right mt-2">
                <button 
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-[#0072D1] font-semibold transition-colors duration-300 hover:text-[#005bb5]"
                >
                  Forgot password?
                </button>
              </p>

              {/* Error message */}
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Login Button */}
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="relative overflow-hidden w-full bg-[#0072D1] hover:bg-[#000000] text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>

            <p className="text-center text-[#000000] text-sm sm:text-base">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={() => navigate('/getstarted')}
                className="text-[#0072D1] font-semibold transition-colors duration-300 hover:text-[#005bb5]"
              >
                Sign Up
              </button>
            </p>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-5">
              <span className="w-2 h-2 rounded-full bg-gray-700"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={Img}
          alt="Background"
          className="object-cover w-full h-full opacity-100"
        />
        <div className="w-full h-full bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-60"></div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
};

export default WelcomeBackPage;