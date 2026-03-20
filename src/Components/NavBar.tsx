import React, { useState } from "react";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100 relative z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 1. Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <h1 className="text-2xl font-rostex font-bold tracking-widest flex items-center">
              <span className="text-[#0072D1]">FIXIT</span>
              <span className="text-[#FF5A00]">NOW</span>
            </h1>
          </div>

          {/* 2. Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-[#0072D1]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                className="block w-full pl-9 pr-4 py-2 border border-[#0072D1]/40 rounded-full bg-white
                  text-sm text-[#0072D1] placeholder-[#0072D1] focus:outline-none focus:ring-2
                  focus:ring-[#0072D1]/30 focus:border-[#0072D1] transition-all"
              />
            </div>
          </div>

          {/* 3. Desktop Nav + Buttons */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Nav links */}
            <div className="flex gap-5 text-[#0072D1] font-medium text-sm">
              <a href="#" className="hover:text-blue-800 transition-colors">
                Home
              </a>
              <a href="#" className="hover:text-blue-800 transition-colors">
                About
              </a>
              <a href="#" className="hover:text-blue-800 transition-colors">
                Contact
              </a>
            </div>

            {/* Action buttons — shimmer hover→black like HomePage */}
            <div className="flex items-center gap-2">
              {/* Find Service */}
              <button
                className="relative overflow-hidden flex items-center gap-1.5 bg-[#FF5A00]
                text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm
                transition-all duration-300 hover:bg-black hover:scale-105 group"
              >
                <svg
                  className="w-4 h-4 relative z-10 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="relative z-10">Find Service</span>
                <div
                  className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                  group-hover:translate-x-full transition-transform duration-700"
                />
              </button>

              {/* Add Post */}
              <button
                className="relative overflow-hidden flex items-center gap-1.5 bg-[#0072D1]
                text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm
                transition-all duration-300 hover:bg-black hover:scale-105 group"
              >
                <svg
                  className="w-4 h-4 relative z-10 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="relative z-10">Add Post</span>
                <div
                  className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                  group-hover:translate-x-full transition-transform duration-700"
                />
              </button>

              {/* Login */}
              <button
                className="relative overflow-hidden bg-black text-white px-5 py-2
                rounded-lg font-semibold text-sm shadow-sm
                transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group"
              >
                <span className="relative z-10">Login</span>
                <div
                  className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                  group-hover:translate-x-full transition-transform duration-700"
                />
              </button>
            </div>
          </div>

          {/* 4. Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-[#0072D1] text-white p-2 rounded-full hover:bg-black
                transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0072D1]"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0">
          <div className="px-4 pt-4 pb-5 space-y-3">
            {/* Mobile Search */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-[#0072D1]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                className="block w-full pl-9 pr-4 py-2.5 border border-[#0072D1]/40 rounded-xl
                  bg-white text-sm text-[#0072D1] placeholder-[#0072D1] focus:outline-none
                  focus:ring-2 focus:ring-[#0072D1]/30"
              />
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col gap-1 pb-3 border-b border-gray-100">
              <a
                href="#"
                className="text-[#0072D1] font-medium text-sm px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-[#0072D1] font-medium text-sm px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-[#0072D1] font-medium text-sm px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Contact
              </a>
            </div>

            {/* Mobile Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              {/* Find Service */}
              <button
                className="relative overflow-hidden flex items-center justify-center gap-2
                w-full bg-[#FF5A00] text-white px-5 py-2.5 rounded-xl font-semibold text-sm
                transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-sm"
              >
                <svg
                  className="w-4 h-4 relative z-10 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="relative z-10">Find Service</span>
                <div
                  className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                  group-hover:translate-x-full transition-transform duration-700"
                />
              </button>

              {/* Add Post */}
              <button
                className="relative overflow-hidden flex items-center justify-center gap-2
                w-full bg-[#0072D1] text-white px-5 py-2.5 rounded-xl font-semibold text-sm
                transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-sm"
              >
                <svg
                  className="w-4 h-4 relative z-10 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="relative z-10">Add Post</span>
                <div
                  className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                  group-hover:translate-x-full transition-transform duration-700"
                />
              </button>

              {/* Login */}
              <button
                className="relative overflow-hidden w-full bg-black text-white px-5 py-2.5
                rounded-xl font-semibold text-sm
                transition-all duration-300 hover:bg-[#0072D1] hover:scale-[1.02] group shadow-sm"
              >
                <span className="relative z-10">Login</span>
                <div
                  className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                  group-hover:translate-x-full transition-transform duration-700"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
