import { Facebook, Twitter, Mail, Phone, Globe, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRef, useEffect, useState } from "react";
import emailjs from '@emailjs/browser';

const Footer = () => {
  const navigate = useNavigate();
  const { currentUser, userRole, loading } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("");
  const footerRef = useRef<HTMLElement>(null);

  const handleNavigation = (path: string, requiresAuth: boolean = false) => {
    if (loading) return;
    if (requiresAuth && !currentUser) { navigate("/select-role"); return; }
    if (requiresAuth && currentUser && userRole === "seeker") {
      alert("Only service providers and administrators can access this feature.");
      return;
    }
    navigate(path);
  };

  const handleSendMessage = () => {
    if (!currentUser) {
      navigate("/select-role");
      return;
    }

    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    const templateParams = {
  from_name: currentUser.email,   // user's email shown in body
  reply_to: currentUser.email,    // hitting Reply goes to user
  to_email: 'fixitnowplus@gmail.com',
  subject: `Message from ${currentUser.email}`,
  message: message,
};

    emailjs.send(
      'service_3tuavf8',
      'template_g6mp8uc',
      templateParams,
      '2amLi4U06M6ljwSjQ'
    ).then(
      () => {
        alert("Message sent successfully!");
        setMessage("");
        const whatsappLink = `https://wa.me/94703052181?text=${encodeURIComponent(
          `Message from: ${currentUser.email}\n\n${message}`
        )}`;
        window.open(whatsappLink, "_blank");
      },
      (error) => {
        console.error("EmailJS error:", error);
        alert("Failed to send message. Please try again.");
      }
    );
  };

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!footerRef.current) return;
      const rect = footerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    const el = footerRef.current;
    el?.addEventListener("mousemove", handleMouse);
    return () => el?.removeEventListener("mousemove", handleMouse);
  }, []);

  const navLinks = [
    { label: "Home", sectionId: "home" },
    { label: "About", sectionId: "about" },
    { label: "Contact", sectionId: "contact" },
  ];

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return true;
    }
    return false;
  };

  const handleLandingNavigation = (sectionId: string) => {
    if (window.location.pathname === "/") {
      scrollToSection(sectionId);
      return;
    }

    navigate("/");
    setTimeout(() => {
      scrollToSection(sectionId);
    }, 150);
  };

  const serviceLinks = [
    { label: "Find Place", onClick: () => handleNavigation("/browseplace", true) },
    { label: "Add Post", onClick: () => handleNavigation("/add-post", true) },
  ];

  const policyLinks = [
    { label: "FAQ", onClick: () => navigate("/faq") },
    { label: "Privacy Policy", onClick: () => navigate("/privacy-policy") },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-[#0072D1] text-white font-sans"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Radial glow that follows mouse */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.07) 0%, transparent 70%)`,
        }}
      />

      {/* Diagonal decorative stripe */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[50%] h-full z-0 opacity-[0.04]"
        style={{
          background:
            "repeating-linear-gradient(-55deg, white, white 1px, transparent 1px, transparent 28px)",
        }}
      />

      {/* Large ghost wordmark */}
      <div className="absolute bottom-0 left-0 select-none pointer-events-none z-0 overflow-hidden leading-none">
        <span
          className="text-white opacity-[0.04] font-rostex font-black uppercase tracking-tighter"
          style={{ fontSize: "clamp(80px, 18vw, 220px)", letterSpacing: "-0.04em" }}
        >
          FIXITNOW
        </span>
      </div>

      {/* ── HERO CTA BAND ── */}
      <div className="relative z-10 border-b border-white/20 px-6 md:px-16 lg:px-24 py-16">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          {/* Headline */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50 mb-3">
              Stay in the loop
            </p>
            <h2
              className="font-rostex uppercase text-5xl md:text-7xl leading-none"
              style={{ letterSpacing: "-0.03em" }}
            >
              Connect<span className="text-white/30">.</span>
            </h2>
          </div>

          {/* Input pill */}
          <div className="w-full lg:w-auto lg:min-w-[480px] group">
            <div className="relative flex items-center border border-white/30 rounded-full p-1.5 transition-all duration-500 hover:border-white/70 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                className="flex-1 bg-transparent border-none outline-none px-5 text-white placeholder-white/40 text-sm min-w-0"
              />
              <button
                onClick={handleSendMessage}
                className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0072D1] font-bold text-sm transition-all duration-300 hover:bg-white/90 hover:gap-3 flex-shrink-0"
              >
                <span>Send Message</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/30 text-xs mt-2 pl-5">
              Only logged-in users can send messages. Messages are sent via email and WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN LINKS GRID ── */}
      <div className="relative z-10 px-6 md:px-16 lg:px-24 py-16 border-b border-white/20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Col 1: Explore */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-5">
              Explore
            </p>
            <div className="flex flex-col gap-3">
              {navLinks.map(({ label, sectionId }) => (
                <button
                  key={label}
                  onClick={() => handleLandingNavigation(sectionId)}
                  className="group flex items-center gap-1 text-white/80 hover:text-white text-base font-medium transition-colors duration-200 w-fit bg-transparent border-none p-0 text-left cursor-pointer"
                >
                  <span className="border-b border-transparent group-hover:border-white/60 transition-all duration-200 pb-px">
                    {label}
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                </button>
              ))}
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-5">
              Services
            </p>
            <div className="flex flex-col gap-3">
              {serviceLinks.map(({ label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="group flex items-center gap-1 text-white/80 hover:text-white text-base font-medium transition-colors duration-200 w-fit bg-transparent border-none p-0 text-left cursor-pointer"
                >
                  <span className="border-b border-transparent group-hover:border-white/60 transition-all duration-200 pb-px">
                    {label}
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Legal */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-5">
              Legal
            </p>
            <div className="flex flex-col gap-3">
              {policyLinks.map(({ label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="group flex items-center gap-1 text-white/80 hover:text-white text-base font-medium transition-colors duration-200 w-fit bg-transparent border-none p-0 text-left cursor-pointer"
                >
                  <span className="border-b border-transparent group-hover:border-white/60 transition-all duration-200 pb-px">
                    {label}
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                </button>
              ))}
            </div>
          </div>

          {/* Col 4: Contact Card */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-5">
              Reach Us
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:fixitnowplus@gmail.com"
                className="group flex items-center gap-2.5 text-white/80 hover:text-white text-sm transition-colors duration-200"
              >
                <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 transition-colors duration-200 flex-shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                fixitnowplus@gmail.com
              </a>
              <a
                href="tel:+94703052181"
                className="group flex items-center gap-2.5 text-white/80 hover:text-white text-sm transition-colors duration-200"
              >
                <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 transition-colors duration-200 flex-shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                +94 70 305 2181
              </a>
              <a
                href="https://ishanhatharasinghe.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 text-white/80 hover:text-white text-sm transition-colors duration-200"
              >
                <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 transition-colors duration-200 flex-shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                ishanhatharasinghe.netlify.app
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="relative z-10 px-6 md:px-16 lg:px-24 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand + copyright */}
          <div className="flex items-center gap-4">
            <span
              className="font-rostex uppercase text-2xl tracking-tight leading-none"
              style={{ letterSpacing: "-0.03em" }}
            >
              FIXITNOW
            </span>
            <span className="w-px h-4 bg-white/30" />
            <span className="text-white/40 text-xs">
              © 2025 All rights reserved · ishan hatharasinghe
            </span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              {
                href: "https://facebook.com",
                icon: <Facebook className="w-4 h-4" fill="currentColor" stroke="none" />,
                label: "Facebook",
              },
              {
                href: "https://twitter.com",
                icon: <Twitter className="w-4 h-4" fill="currentColor" stroke="none" />,
                label: "Twitter",
              },
              {
                href: "https://x.com",
                icon: <span className="text-xs font-black">𝕏</span>,
                label: "X",
              },
            ].map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/60 hover:bg-white/10 transition-all duration-200"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;