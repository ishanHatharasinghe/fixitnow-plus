import { useState } from "react";
import { Mail } from "lucide-react";
import Img from "../../assets/Backgrounds/loginscreen2.png";

const PwdResetPage = () => {
  const [codes, setCodes] = useState(["", "", "", "", "", ""]);

  const handleChange = (i, val) => {
    if (/^\d?$/.test(val)) {
      const newCodes = [...codes];
      newCodes[i] = val;
      setCodes(newCodes);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10">
        {/* Left Section */}
        <div className="flex-1 flex items-start justify-center lg:items-end lg:justify-start max-w-lg text-center lg:text-left">
          <div className="mb-0 lg:mb-10">
            <h1 className="font-rostex text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] text-white leading-[1.1] mt-13">
              Password <span className="text-white">Reset</span>
            </h1>
            <p className="font-poppins font-bold text-white text-sm sm:text-base md:text-lg opacity-100">
              We sent a code to your email
            </p>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] border border-white/30">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 border-2 border-[#0072D1]/30 bg-gray-50 rounded-2xl flex items-center justify-center">
              <Mail className="text-[#0072D1]" />
            </div>
          </div>
          {/* Form Title */}
          <h2 className="text-[36px] md:text-[42px] font-bold text-[#FF5A00] leading-tight">
            Password Reset
          </h2>
          <p className="text-gray-600 text-sm font-medium mt-1 mb-6">
            We sent a code to your email.
          </p>

          {/* Code Inputs */}
          <div className="flex gap-3 justify-between mb-6">
            {codes.map((c, i) => (
              <input
                key={i}
                value={c}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-12 h-12 text-center text-lg rounded-xl border-2 border-[#0072D1]/30 focus:border-[#0072D1] focus:outline-none"
              />
            ))}
          </div>

          {/* Button */}

          <button className="relative overflow-hidden w-full bg-[#0072D1] hover:bg-[#000000] text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4">
            <span className="relative z-10">Verify Code</span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>

          {/* Resend */}
          <p className="text-center mt-4 text-sm">
            Didn’t receive?{" "}
            <span className="text-[#0072D1] font-semibold cursor-pointer">
              Resend
            </span>
          </p>

          {/* Back to login */}
          <div className="text-center mt-6">
            <button className="text-[#000000] font-semibold hover:text-[#0072D1]">
              ← Back to Login
            </button>
          </div>
          {/* Pagination Dots */}
          <div className="flex justify-center  gap-2 mt-5">
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-gray-700"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={Img} className="w-full h-full object-cover" />
        <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 opacity-60 w-full h-full"></div>
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

export default PwdResetPage;
