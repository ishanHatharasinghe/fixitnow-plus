import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import Img from "../../assets/Backgrounds/loginscreen2.png";

const ForgotPwdPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Please check your inbox.');
      setEmail('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/missing-email') {
        setError('Please enter your email address.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/welcomeback');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main Content Wrapper */}
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10">
        {/* Left Side - Heading */}
        <div className="flex-1 max-w-lg text-center lg:text-left">
          <div className="animate-fadeInUp">
            <h1 className="font-rostex text-[32px] sm:text-[48px] md:text-[60px] lg:text-[60px] text-[#0072D1] leading-[1.1] mb-2">
              Forgot <br />
              <span className="text-[#FF5A00] relative">Password ?</span>
            </h1>
            <p className="font-poppins font-bold text-base sm:text-lg md:text-xl text-[#000000] mb-4 opacity-80">
              Reset your password in seconds
            </p>
          </div>
        </div>

        {/* Right Side - Password Reset Form */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] relative z-20 border border-white/30 animate-slideInRight">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>

          <div className="mt-8 sm:mt-12 mb-8 relative z-10">
            {/* Back Button */}
            <button
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-[#0072D1] font-semibold mb-6 hover:text-[#005bb5] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </button>

            {/* Success Message */}
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">{message}</p>
                    <p className="text-green-600 text-sm mt-1">Didn't receive the email? Check your spam folder or try again.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Email Input */}
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <label className="flex items-center gap-2 text-[#000000] text-sm font-bold mb-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 rounded-2xl bg-gray-50/80 backdrop-blur-sm border-2 border-[#0072D1]/30 focus:border-[#3ABBD0] focus:outline-none focus:ring-4 focus:ring-[#3ABBD0]/20 transition-all duration-300 group-hover:border-[#3ABBD0]/50"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  We'll send a password reset link to this email address
                </p>
              </div>

              {/* Reset Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden w-full bg-[#0072D1] hover:bg-[#000000] text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </form>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• We'll send a password reset link to your email</li>
                <li>• Click the link in the email to reset your password</li>
                <li>• Choose a new secure password</li>
                <li>• You'll be able to log in with your new password</li>
              </ul>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-700"></span>
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
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default ForgotPwdPage;