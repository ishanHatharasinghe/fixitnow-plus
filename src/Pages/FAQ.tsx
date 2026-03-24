import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, Users, Wrench, ShieldCheck, CreditCard, LayoutGrid } from "lucide-react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState([0]);
  const [activeCategory, setActiveCategory] = useState("All");

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // 18 Comprehensive FAQs
  const allFaqs = [
    // GENERAL
    { category: "General", question: "What is FixItNow?", answer: "FixItNow is a digital marketplace connecting homeowners in Sri Lanka with skilled, local informal sector workers like plumbers, electricians, and carpenters." },
    { category: "General", question: "Is it free to register?", answer: "Yes! Registration is 100% free for both Customers looking for services and Professionals who want to create a profile." },
    { category: "General", question: "How do I reset my password?", answer: "Click 'Forgot Password' on the login screen. We will send an OTP via SMS or a reset link to your registered email address." },
    
    // CUSTOMERS
    { category: "For Customers", question: "How do I find an Emergency Service?", answer: "Use the search bar and toggle the 'Emergency Callout Availability' switch. This filters for workers who are ready for immediate dispatch." },
    { category: "For Customers", question: "Do I have to buy the materials?", answer: "Check the worker's profile. Under 'Pricing & Fees', they will state if their price is 'Labour Only' (you buy materials) or 'Materials Included'." },
    { category: "For Customers", question: "What is a Minimum Call-Out Fee?", answer: "This is a fixed fee some workers charge just to travel to your house and inspect the problem, even if you don't hire them for the final repair." },
    { category: "For Customers", question: "How do I leave a review?", answer: "After a job is marked 'Completed', you can go to your dashboard, rate the worker out of 5 stars, and leave written feedback." },
    { category: "For Customers", question: "Can I cancel a request?", answer: "Yes, but we ask that you inform the professional as soon as possible via phone or chat to respect their travel time." },

    // PROFESSIONALS
    { category: "For Professionals", question: "How do I create an Advertisement?", answer: "Go to your Profile Dashboard, click 'Post Ad', and fill out the 4-step form (Details, Scope, Pricing, Images). Your ad will go live instantly." },
    { category: "For Professionals", question: "How does the Travel Radius work?", answer: "You set a maximum travel distance (e.g., 15km). Customers outside this radius will not see your ad, ensuring you don't get calls for jobs too far away." },
    { category: "For Professionals", question: "Can I hide my ad if I am too busy?", answer: "Yes. Go to 'Ad State' in your dashboard and change visibility to 'Pause'. You can republish it when you are free." },
    { category: "For Professionals", question: "How many images can I upload?", answer: "You can upload 1 Cover Photo, up to 10 Portfolio Gallery images, and up to 5 Before-and-After project comparisons." },
    { category: "For Professionals", question: "Can I offer discounts?", answer: "Yes! Use the 'Promotional Offers' field in the Ad Creator to add banners like '10% off for Senior Citizens'." },

    // TRUST & SAFETY
    { category: "Trust & Safety", question: "Are workers verified?", answer: "We require all service providers to upload a valid National Identity Card (NIC) before they can publish an advertisement." },
    { category: "Trust & Safety", question: "What if I am unhappy with the work?", answer: "Please try to resolve it directly with the worker first. If unresolved, you can leave an honest review or report the profile to our moderation team." },
    { category: "Trust & Safety", question: "Are reviews moderated?", answer: "We do not delete bad reviews unless they contain hate speech, profanity, or are proven to be fake/spam." },

    // PAYMENTS
    { category: "Payments", question: "How do I pay the worker?", answer: "Currently, you pay the worker directly (Cash or Bank Transfer) after the job is completed. FixItNow does not hold funds." },
    { category: "Payments", question: "Are prices negotiable?", answer: "It depends on the worker. Look for 'Pricing Model: Negotiable' or 'Upon Inspection' on their advertisement details." }
  ];

  const categories = [
    { name: "All", icon: <LayoutGrid className="w-4 h-4 mr-2" /> },
    { name: "General", icon: <LayoutGrid className="w-4 h-4 mr-2" /> },
    { name: "For Customers", icon: <Users className="w-4 h-4 mr-2" /> },
    { name: "For Professionals", icon: <Wrench className="w-4 h-4 mr-2" /> },
    { name: "Trust & Safety", icon: <ShieldCheck className="w-4 h-4 mr-2" /> },
    { name: "Payments", icon: <CreditCard className="w-4 h-4 mr-2" /> }
  ];

  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const filteredFaqs = activeCategory === "All" 
    ? allFaqs 
    : allFaqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans pb-16">
      {/* Header */}
      <div className="w-full bg-white pt-10 pb-8 px-4 text-center border-b border-gray-100">
        <h1 className="font-rostex text-3xl md:text-[50px] uppercase tracking-wide leading-tight">
          <span className="text-[#0072D1]">HELP & </span>
          <span className="text-[#FF5A00]">SUPPORT</span>
        </h1>
      </div>

      <div className="max-w-[900px] mx-auto px-4 mt-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setActiveCategory(cat.name); setOpenItems([]); }}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat.name 
                  ? "bg-[#0072D1] text-white shadow-md" 
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#0072D1] hover:text-[#0072D1]"
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div id={`faq-${index}`} key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col pr-4">
                  {activeCategory === "All" && (
                    <span className="text-[10px] font-bold tracking-wider uppercase mb-1 text-gray-400">
                      {faq.category}
                    </span>
                  )}
                  <h3 className="font-bold text-gray-800 text-sm md:text-base">
                    {faq.question}
                  </h3>
                </div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-colors ${openItems.includes(index) ? 'bg-[#FF5A00] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {openItems.includes(index) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openItems.includes(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 pt-1">
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;