import React from "react";
import { 
  Shield, Lock, User, Globe, FileText, MapPin, 
  Camera, CreditCard, Smartphone, Cookie, EyeOff, 
  AlertTriangle, History, Trash2, Scale, Mail 
} from "lucide-react";

const PrivacyPolicy = () => {
  // 16 Comprehensive Privacy Clauses
  const sections = [
    {
      title: "1. Account Information",
      icon: <User className="w-5 h-5" />,
      content: "We collect your name, phone number, email, and base address when you create an account to use FixItNow either as a Customer or Professional."
    },
    {
      title: "2. Identity Verification (KYC)",
      icon: <Shield className="w-5 h-5" />,
      content: "For Service Providers, we securely collect and verify National Identity Card (NIC) details to ensure a safe environment for homeowners."
    },
    {
      title: "3. Location & GPS Data",
      icon: <MapPin className="w-5 h-5" />,
      content: "We use location data (with permission) to power our Smart Filtering, connecting customers with workers within their specific travel radius."
    },
    {
      title: "4. Media & Portfolios",
      icon: <Camera className="w-5 h-5" />,
      content: "Images uploaded by Professionals (e.g., Before-and-After photos, profile pictures) are stored and displayed publicly to help secure jobs."
    },
    {
      title: "5. Public Profile Visibility",
      icon: <Globe className="w-5 h-5" />,
      content: "Professional profiles, including trade names, ratings, active promotions, and working hours, are publicly visible on search engines and our platform."
    },
    {
      title: "6. Private Communications",
      icon: <EyeOff className="w-5 h-5" />,
      content: "Direct messages and exact residential addresses shared between users are kept strictly confidential and are not publicly displayed."
    },
    {
      title: "7. Payment & Fee Data",
      icon: <CreditCard className="w-5 h-5" />,
      content: "While FixItNow currently facilitates direct payments between users, any platform subscription fees are processed securely via encrypted third-party gateways."
    },
    {
      title: "8. Device & Usage Information",
      icon: <Smartphone className="w-5 h-5" />,
      content: "We collect IP addresses, browser types, and device information to optimize the platform for mobile users and prevent fraudulent activity."
    },
    {
      title: "9. Cookies & Tracking",
      icon: <Cookie className="w-5 h-5" />,
      content: "We use essential cookies to keep you logged in and analytics cookies to understand how users interact with our search features."
    },
    {
      title: "10. Dispute Resolution Data",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: "In the event of a dispute, we may review communication history, call-out fee agreements, and review logs to mediate fairly."
    },
    {
      title: "11. Service History",
      icon: <History className="w-5 h-5" />,
      content: "We retain records of completed jobs, canceled requests, and reviews to maintain platform integrity and calculate average ratings."
    },
    {
      title: "12. Third-Party Sharing",
      icon: <FileText className="w-5 h-5" />,
      content: "We do not sell your data. Information is only shared with legal authorities if required by Sri Lankan law, or with cloud hosting providers under strict confidentiality."
    },
    {
      title: "13. Data Retention",
      icon: <Lock className="w-5 h-5" />,
      content: "We retain your data as long as your account is active. Paused or drafted advertisements are saved indefinitely until you choose to delete them."
    },
    {
      title: "14. Right to Deletion",
      icon: <Trash2 className="w-5 h-5" />,
      content: "You have the 'Right to be Forgotten'. You can request complete deletion of your profile, NIC data, and history at any time via account settings."
    },
    {
      title: "15. Legal Compliance",
      icon: <Scale className="w-5 h-5" />,
      content: "Our data practices strictly comply with local digital privacy regulations and consumer protection laws in Sri Lanka."
    },
    {
      title: "16. Policy Updates",
      icon: <Mail className="w-5 h-5" />,
      content: "If we make material changes to this policy, we will notify all active users via email or an in-app dashboard notification."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans">
      <div className="w-full bg-white pt-10 pb-8 px-4 md:px-8 text-center border-b border-gray-100">
        <h1 className="font-rostex text-3xl md:text-[60px] uppercase tracking-wide leading-tight">
          <span className="text-[#0072D1]">PRIVACY</span>
          <span className="text-[#FF5A00] ml-2">POLICY</span>
        </h1>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-sm md:text-base">
          Last Updated: March 2026. We believe in complete transparency. Here is exactly how we handle, protect, and use your data on the FixItNow platform.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-100 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3 text-[#0072D1]">
                <div className="p-2 bg-blue-50 rounded-lg">
                  {section.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">
                  {section.title}
                </h3>
              </div>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;