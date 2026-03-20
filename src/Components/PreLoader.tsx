import React from "react";
import logo from "../assets/logo.png";

const Preloader: React.FC = () => {
  return (
    // Use min-h-screen to ensure it covers the whole view even if the keyboard pops up
    <div className="flex min-h-screen w-full items-center justify-center bg-[#000000] px-4">
      <div className="font-rostex  flex flex-col items-center space-y-2 text-center w-full max-w-md">
        {/* Logo Section */}
        {/* Adjusted: Responsive width - smaller on mobile (w-40), larger on desktop (md:w-64) */}
        <div className=" relative w-40 md:w-64 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-auto object-contain" />
        </div>

        {/* Loading Text */}

        <h1 className="text-xl md:text-3xl tracking-wide md:tracking-wider text-[#FF5A00] font-poppins font-semibold">
          LOADING...
        </h1>

        {/* Brand Text */}
        {/* Adjusted: text-3xl on mobile ensures "FIXITNOW" doesn't break into two lines. 
            Responsive tracking prevents it from being wider than the screen. */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-normal sm:tracking-widest text-[#0072D1] font-rostex break-words">
          FIXITNOW
        </h1>
      </div>
    </div>
  );
};

export default Preloader;
