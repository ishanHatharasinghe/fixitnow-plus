import React from "react";
import { ArrowRight } from "lucide-react";
import Human from "../assets/Mini Share Add/human image.png";

const ShareYourAdd = () => {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 py-12 md:py-20 font-sans overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col items-center text-center relative">
        {/* Title */}
        <h2 className="font-rostex text-4xl md:text-[70px]  uppercase tracking-wide leading-[1.05] mb-6">
          <span className="text-[#0072D1]">SHARE YOUR </span>
          <span className="text-[#FF5A00]">ADD</span>
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mb-10 font-medium">
          Discover the smarter way to rent effortlessly list your boarding
          rooms, houses, hostels, or luxury apartments on our all-in-one
          platform. We bridge the gap between property owners and a vibrant
          community of renters actively searching for their perfect place to
          call home. Whether it's a cozy room or a lavish apartment, we make
          connecting simple, fast, and stress-free.
        </p>

        {/* Human image */}
        <div className="relative w-full flex justify-center">
          {/* Fade-out gradient at the bottom of the image */}
          <div className="relative inline-block">
            <img
              src={Human}
              alt="Service Professional"
              className="h-[480px] lg:h-[560px] w-auto object-contain object-bottom relative z-10"
            />
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none" />
          </div>
        </div>

        {/* Add Post Button — overlaid above fade */}
        <div className="relative z-30 -mt-16">
          <button className="relative overflow-hidden flex items-center justify-center gap-3 px-10 py-4 rounded-full border-2 border-[#0072D1] bg-white text-[#0072D1] font-bold text-lg transition-all duration-300 hover:bg-black hover:text-white hover:border-black hover:scale-105 group shadow-lg">
            <div className="bg-[#0072D1] text-white rounded-full p-1.5 group-hover:bg-white group-hover:text-black transition-colors duration-300 flex-shrink-0">
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </div>
            Add Post
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full" />
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col items-center text-center px-2">
        {/* Title */}
        <h2 className="font-rostex text-5xl font-black uppercase tracking-wide leading-[1.1] mb-5">
          <span className="text-[#0072D1]">SHARE YOUR</span>
          <br />
          <span className="text-[#FF5A00]">ADD</span>
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed max-w-sm mb-8 font-medium">
          Discover the smarter way to rent effortlessly list your boarding
          rooms, houses, hostels, or luxury apartments on our all in one
          platform. We bridge the gap between property owners and a vibrant
          community of renters actively searching for their perfect place to
          call home. Whether it's a cozy room or a lavish apartment, we make
          connecting simple, fast, and stress-free.
        </p>

        {/* Add Post Button */}
        <button className="relative overflow-hidden flex items-center justify-center gap-3 px-8 py-3.5 rounded-full border-2 border-[#0072D1] bg-white text-[#0072D1] font-bold text-base transition-all duration-300 hover:bg-black hover:text-white hover:border-black hover:scale-105 group shadow-lg mb-8">
          <div className="bg-[#0072D1] text-white rounded-full p-1.5 group-hover:bg-white group-hover:text-black transition-colors duration-300 flex-shrink-0">
            <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </div>
          Add Post
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full" />
        </button>

        {/* Human image */}
        <div className="relative w-full flex justify-center">
          <img
            src={Human}
            alt="Service Professional"
            className="w-full max-w-xs object-contain object-bottom"
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default ShareYourAdd;
