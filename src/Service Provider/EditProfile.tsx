import React, { useState, useRef } from "react";
import {
  User,
  Mail,
  Pencil,
  Camera,
  Plus,
  ChevronDown,
  Save
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsTab = "personal" | "email" | "service";

// ─── Services list ────────────────────────────────────────────────────────────

const SERVICES = [
  "Plumbing",
  "Electrical Repairs & Wiring",
  "Carpentry & Woodwork",
  "Air Conditioning",
  "Masonry & Tile Laying",
  "House Painting",
  "Roofing & Ceiling Repairs",
  "Welding & Ironworks",
  "Appliance Repair",
  "Cleaning & Pest Control",
  "Garden Maintenance & Tree Cutting",
  "Aluminum Fabrication & Fitting",
  "Waterproofing Services",
  "CCTV & Security Installation",
  "Moving & Transport (Movers)",
  "Sofa Repair & Upholstery (Cushion Works)",
  "Septic Tank & Gully Service",
  "Glass & Mirror Works",
  "Interlock & Driveway Paving"
];

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  "w-full border border-[#0072D1]/40 rounded-xl px-3 py-2.5 text-sm text-gray-700 " +
  "outline-none focus:border-[#0072D1] focus:ring-1 focus:ring-[#0072D1]/20 transition-colors bg-white";

const labelCls = "text-xs font-semibold text-gray-600 mb-1 block";

// ─── Save Button — matches HomePage Find button shimmer pattern exactly ────────

const SaveBtn = ({ label }: { label: string }) => (
  <button
    className="relative overflow-hidden flex items-center gap-2 bg-black text-white
    text-xs font-bold px-5 py-2.5 rounded-xl shadow-md
    transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group whitespace-nowrap"
  >
    <Save className="w-3.5 h-3.5 relative z-10" />
    <span className="relative z-10">{label}</span>
    <div
      className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
      group-hover:translate-x-full transition-transform duration-700"
    />
  </button>
);

// ─── Image Upload Slot ────────────────────────────────────────────────────────

const ImageUploadSlot = ({
  label,
  preview,
  onChange
}: {
  label: string;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label
    className="flex-1 flex flex-col items-center justify-center gap-2 h-28
    border-2 border-dashed border-[#0072D1]/30 rounded-xl cursor-pointer
    hover:border-[#0072D1]/60 transition-colors overflow-hidden"
  >
    {preview ? (
      <img src={preview} alt={label} className="w-full h-full object-cover" />
    ) : (
      <>
        <div
          className="w-9 h-9 rounded-full border-2 border-[#0072D1]/50
          flex items-center justify-center text-[#0072D1]"
        >
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-[10px] text-gray-400 font-medium text-center px-2">
          {label}
        </span>
      </>
    )}
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={onChange}
    />
  </label>
);

// ─── Section: Personal Information ────────────────────────────────────────────

const PersonalInfoSection = () => {
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [frontId, setFrontId] = useState<string | null>(null);
  const [backId, setBackId] = useState<string | null>(null);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setAvatarSrc(URL.createObjectURL(f));
  };

  return (
    <div
      id="personal"
      className="bg-white border border-[#0072D1]/30 rounded-2xl p-5 md:p-7 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">
          Personal Information
        </h2>
        <SaveBtn label="Save info" />
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Avatar upload */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            onClick={() => avatarRef.current?.click()}
            className="relative w-28 h-28 rounded-full overflow-hidden border-4
              border-[#0072D1]/30 bg-gray-100 mb-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-300" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/40 flex items-center justify-center py-1.5">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Update Profile</p>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatar}
          />
        </div>

        {/* Form fields grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First Name</label>
            <input type="text" className={inputCls} placeholder="First name" />
          </div>
          <div>
            <label className={labelCls}>Last Name</label>
            <input type="text" className={inputCls} placeholder="Last name" />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input
              type="email"
              className={inputCls}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <div className="flex gap-2">
              <div
                className="flex items-center gap-1 border border-[#0072D1]/40 rounded-xl
                px-3 h-[42px] bg-white text-sm text-gray-600 flex-shrink-0 cursor-pointer
                hover:border-[#0072D1] transition-colors"
              >
                +94 <ChevronDown className="w-3 h-3" />
              </div>
              <input
                type="tel"
                className={`${inputCls} flex-1`}
                placeholder="712 345 678"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input type="text" className={inputCls} placeholder="Country" />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input type="text" className={inputCls} placeholder="City" />
          </div>
          <div>
            <label className={labelCls}>Division</label>
            <input type="text" className={inputCls} placeholder="Division" />
          </div>
          <div>
            <label className={labelCls}>Postal Code</label>
            <input type="text" className={inputCls} placeholder="Postal code" />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Address</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Full address"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>
              National ID / Driving License Number
            </label>
            <input type="text" className={inputCls} placeholder="ID number" />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>
              Add National ID / Driving License Card Images
            </label>
            <div className="flex gap-3">
              <ImageUploadSlot
                label="Upload Front Side"
                preview={frontId}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFrontId(URL.createObjectURL(f));
                }}
              />
              <ImageUploadSlot
                label="Upload Second Side"
                preview={backId}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setBackId(URL.createObjectURL(f));
                }}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>About me</label>
            <textarea
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Section: Email & Password ────────────────────────────────────────────────

const EmailPasswordSection = () => (
  <div
    id="email"
    className="bg-white border border-[#0072D1]/30 rounded-2xl p-5 md:p-7 shadow-sm"
  >
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-black text-gray-900">Email and password</h2>
      <SaveBtn label="Save password" />
    </div>
    <div className="space-y-4 max-w-xl">
      <div>
        <label className={labelCls}>Set new password</label>
        <input type="password" className={inputCls} placeholder="••••••••" />
      </div>
      <div>
        <label className={labelCls}>Confirm password</label>
        <input type="password" className={inputCls} placeholder="••••••••" />
      </div>
    </div>
  </div>
);

// ─── Section: Providing Service ───────────────────────────────────────────────

const ProvidingServiceSection = () => (
  <div
    id="service"
    className="bg-white border border-[#0072D1]/30 rounded-2xl p-5 md:p-7 shadow-sm"
  >
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-black text-gray-900">Providing Service</h2>
      <SaveBtn label="Save Data" />
    </div>
    <div className="max-w-xs">
      <label className={labelCls}>What Service You Providing</label>
      <div className="relative">
        <select className={`${inputCls} appearance-none pr-8 cursor-pointer`}>
          <option value="">Select a service</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  </div>
);

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { key: SettingsTab; label: string; icon: any }[] = [
  { key: "personal", label: "Personal Information", icon: User },
  { key: "email", label: "Email and Password", icon: Mail },
  { key: "service", label: "Providing Service", icon: Pencil }
];

// ─── Main Component ───────────────────────────────────────────────────────────

const EditProfile: React.FC = () => {
  const [active, setActive] = useState<SettingsTab>("personal");

  const handleNav = (key: SettingsTab) => {
    setActive(key);
    document
      .getElementById(key)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-5">
        {/* ── Sidebar / top nav ── */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <div className="bg-white border border-[#0072D1]/30 rounded-2xl p-4 shadow-sm md:sticky md:top-4">
            <h3 className="font-black text-gray-900 text-base mb-4 px-1">
              Profile management
            </h3>

            {/* Desktop vertical nav — active item uses blue shimmer style */}
            <nav className="hidden md:flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`relative overflow-hidden flex items-center gap-3 px-3 py-2.5
                    rounded-xl text-sm font-semibold text-left
                    transition-all duration-300 group hover:scale-[1.02]
                    ${
                      active === item.key
                        ? "bg-[#0072D1] text-white shadow-md scale-[1.02]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#0072D1]"
                    }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                  <div
                    className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                    group-hover:translate-x-full transition-transform duration-700"
                  />
                </button>
              ))}
            </nav>

            {/* Mobile horizontal tabs — active uses orange shimmer */}
            <div className="md:hidden flex gap-1 overflow-x-auto pb-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`relative overflow-hidden flex items-center gap-1.5 px-3 py-2
                    rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0
                    transition-all duration-300 group hover:scale-[1.02]
                    ${
                      active === item.key
                        ? "bg-[#FF5A00] text-white shadow-md scale-[1.02]"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <item.icon className="w-3.5 h-3.5 flex-shrink-0 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                  <div
                    className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
                    group-hover:translate-x-full transition-transform duration-700"
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── All three sections stacked ── */}
        <div className="flex-1 min-w-0 space-y-5">
          <PersonalInfoSection />
          <EmailPasswordSection />
          <ProvidingServiceSection />
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
