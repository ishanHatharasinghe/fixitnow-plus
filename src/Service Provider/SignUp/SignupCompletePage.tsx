import React from "react";
import logo from "../../assets/logo.png";

const SignComplete: React.FC = () => {
  return (
    // Use min-h-screen to ensure it covers the whole view even if the keyboard pops up
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FFFFFF] px-4">
      <div className=" flex flex-col items-center space-y-2 text-center w-full max-w-md">
        {/* Logo Section */}
        {/* Adjusted: Responsive width - smaller on mobile (w-40), larger on desktop (md:w-64) */}
        <div className=" relative w-40 md:w-64 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-auto object-contain" />
        </div>

        {/* Loading Text */}

        <h1 className="font-rostex  text-3xl md:text-3xl tracking-wide md:tracking-wider text-[#FF5A00] font-poppins ">
          Setup
        </h1>
        <h1 className="text-3xl sm:text-4xl md:text-6xl  tracking-normal sm:tracking-widest text-[#0072D1] font-rostex break-words">
          Completed
        </h1>
        <p className="font-poppins text-gray-600 text-sm font-medium mt-1 mb-6">
          Setup Completed. Let's go to Dashboard.
        </p>
      </div>
    </div>
  );
};

export default SignComplete;
