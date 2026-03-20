import React from "react";
import logo from "../assets/logo.png";

const AlreadyHaveAccount: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center space-y-2 text-center w-full max-w-md">
        {/* Logo */}
        <div className="relative w-40 md:w-64 flex items-center justify-center mb-2">
          <img
            src={logo}
            alt="FixItNow Logo"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="font-rostex text-3xl md:text-4xl uppercase tracking-wide leading-[1.1]">
          <span className="text-[#FF5A00]">ALREADY HAVE</span>
          <br />
          <span className="text-[#0072D1]">ACCOUNT ?</span>
        </h1>

        {/* Spacer */}
        <div className="h-8" />

        {/* Buttons */}
        <div className="flex flex-col w-full max-w-sm gap-3">
          <button
            onClick={() => {
              /* navigate to Login */
            }}
            className="relative overflow-hidden w-full bg-[#FF5A00] text-white font-bold text-xl py-4 rounded-full
              transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-lg"
          >
            <span className="relative z-10">Yes</span>
            <div
              className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
              group-hover:translate-x-full transition-transform duration-700 rounded-full"
            />
          </button>

          <button
            onClick={() => {
              /* navigate to Role Select */
            }}
            className="relative overflow-hidden w-full bg-[#0072D1] text-white font-bold text-xl py-4 rounded-full
              transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-lg"
          >
            <span className="relative z-10">No</span>
            <div
              className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
              group-hover:translate-x-full transition-transform duration-700 rounded-full"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlreadyHaveAccount;
