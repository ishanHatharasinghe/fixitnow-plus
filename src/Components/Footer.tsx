import { Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0072D1] text-white pt-16 pb-8 px-6 md:px-12 lg:px-20 font-sans">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* --- TOP SECTION: Newsletter / Contact --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
          {/* Left Text */}
          <div className="max-w-2xl flex flex-col gap-2">
            <h2 className="font-rostex text-4xl md:text-6xl font-black uppercase tracking-widest mb-2">
              CONTACT
            </h2>
            <h3 className="text-xl md:text-2xl font-bold">
              Send Your Messages to us
            </h3>
            <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-xl">
              Sign up for our mailing list to receive news and updates about
              remove.bg products and services. You can unsubscribe at any time.
            </p>
          </div>

          {/* Right Input Form */}
          <form
            className="w-full lg:w-auto lg:min-w-[450px] flex items-center border border-white rounded-full p-1 bg-transparent transition-all duration-300 focus-within:bg-white/10"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder=""
              className="flex-1 bg-transparent border-none outline-none px-4 text-white text-sm md:text-base w-full min-w-0"
            />
            {/* Themed Button with Shine Hover Effect */}
            <button
              type="submit"
              className="relative overflow-hidden group flex items-center justify-center px-6 md:px-8 py-3 rounded-full bg-white text-black font-bold text-sm md:text-base transition-all duration-300 hover:bg-black hover:text-white hover:scale-105 flex-shrink-0"
            >
              <span className="relative z-10 whitespace-nowrap">
                Send Your Message
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full" />
            </button>
          </form>
        </div>

        {/* --- MIDDLE SECTION: Links --- */}
        {/* Desktop Layout (4 columns without headers) / Mobile Layout (Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 mb-16">
          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            <a
              href="#home"
              className="text-lg md:text-xl hover:translate-x-1 transition-transform w-fit"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-lg md:text-xl hover:translate-x-1 transition-transform w-fit"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-lg md:text-xl hover:translate-x-1 transition-transform w-fit"
            >
              Contact
            </a>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            <a
              href="#find-place"
              className="text-lg md:text-xl hover:translate-x-1 transition-transform w-fit"
            >
              Find Place
            </a>
            <a
              href="#add-post"
              className="text-lg md:text-xl hover:translate-x-1 transition-transform w-fit"
            >
              Add Post
            </a>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <a
              href="#user"
              className="text-lg md:text-xl hover:translate-x-1 transition-transform w-fit"
            >
              User
            </a>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-3">
            <a
              href="#faq"
              className="text-lg md:text-xl hover:translate-x-1 transition-transform w-fit"
            >
              FAQ
            </a>
            <a
              href="#privacy"
              className="text-lg md:text-xl hover:translate-x-1 transition-transform w-fit"
            >
              Privacy Policy
            </a>
          </div>
        </div>

        {/* --- BOTTOM SECTION: Copyright & Socials --- */}
        <div className="border-t border-white/50 pt-8 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Logo & Copyright */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-2 md:gap-4">
            <h1 className="font-rostex text-3xl md:text-4xl font-black uppercase tracking-widest leading-none">
              FIXITNOW
            </h1>
            <p className="text-sm md:text-base text-white/90 pb-1">
              Copyright 2025 All rights reserved.
            </p>
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="#facebook"
              className="hover:scale-110 hover:text-gray-200 transition-all"
            >
              <Facebook className="w-6 h-6" fill="currentColor" stroke="none" />
            </a>

            <a
              href="#twitter"
              className="hover:scale-110 hover:text-gray-200 transition-all"
            >
              <Twitter className="w-6 h-6" fill="currentColor" stroke="none" />
            </a>
            <a
              href="#x-platform"
              className="hover:scale-110 hover:text-gray-200 transition-all font-bold border-2 border-white rounded flex items-center justify-center w-6 h-6 text-xs"
            >
              𝕏
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
