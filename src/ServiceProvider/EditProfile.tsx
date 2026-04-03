import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import {
  User,
  Mail,
  Pencil,
  Camera,
  Plus,
  ChevronDown,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  X
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

// ─── Save Button ──────────────────────────────────────────────────────────────

const SaveBtn = ({ label, loading, onClick }: { label: string; loading?: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="relative overflow-hidden flex items-center gap-2 bg-black text-white
    text-xs font-bold px-5 py-2.5 rounded-xl shadow-md
    transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group whitespace-nowrap
    disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? (
      <>
        <Loader className="w-3.5 h-3.5 relative z-10 animate-spin" />
        <span className="relative z-10">Saving...</span>
      </>
    ) : (
      <>
        <Save className="w-3.5 h-3.5 relative z-10" />
        <span className="relative z-10">{label}</span>
      </>
    )}
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

const PersonalInfoSection = ({
  formData,
  handleInputChange,
  handleSavePersonal,
  loading,
  saving
}: {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSavePersonal: () => void;
  loading: boolean;
  saving: boolean;
}) => {
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [frontId, setFrontId] = useState<string | null>(null);
  const [backId, setBackId] = useState<string | null>(null);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setAvatarSrc(URL.createObjectURL(f));
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#0072D1]/30 rounded-2xl p-5 md:p-7 shadow-sm flex items-center justify-center h-40">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-[#0072D1]" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="personal"
      className="bg-white border border-[#0072D1]/30 rounded-2xl p-5 md:p-7 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">
          Personal Information
        </h2>
        <SaveBtn label="Save info" loading={saving} onClick={handleSavePersonal} />
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
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className={inputCls}
              placeholder="First name"
            />
          </div>
          <div>
            <label className={labelCls}>Last Name</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleInputChange}
              className={inputCls} 
              placeholder="Last name" 
            />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className={`${inputCls} bg-gray-50`}
              placeholder="email@example.com"
              disabled
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
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`${inputCls} flex-1`}
                placeholder="712 345 678"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input 
              type="text" 
              name="country"
              value={formData.country || ""}
              onChange={handleInputChange}
              className={inputCls} 
              placeholder="Country" 
            />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input 
              type="text" 
              name="city"
              value={formData.city || ""}
              onChange={handleInputChange}
              className={inputCls} 
              placeholder="City" 
            />
          </div>
          <div>
            <label className={labelCls}>Division</label>
            <input 
              type="text" 
              name="division"
              value={formData.division || ""}
              onChange={handleInputChange}
              className={inputCls} 
              placeholder="Division" 
            />
          </div>
          <div>
            <label className={labelCls}>Postal Code</label>
            <input 
              type="text" 
              name="postalCode"
              value={formData.postalCode || ""}
              onChange={handleInputChange}
              className={inputCls} 
              placeholder="Postal code" 
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={inputCls}
              placeholder="Full address"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>
              National ID / Driving License Number
            </label>
            <input
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleInputChange}
              className={inputCls}
              placeholder="ID number"
            />
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
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
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

const EmailPasswordSection = ({
  saving,
  onSuccess,
  onError
}: {
  saving: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) => {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSavePassword = async () => {
    // Validation
    if (!currentPassword) {
      onError("Please enter your current password");
      return;
    }
    if (!newPassword || !confirmPassword) {
      onError("Please fill in both new password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      onError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      onError("Password must be at least 6 characters long");
      return;
    }

    // Check if user is authenticated
    if (!currentUser?.email) {
      onError("User not authenticated");
      return;
    }

    try {
      setIsUpdating(true);

      // Re-authenticate the user with their current credentials
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update the password
      await updatePassword(currentUser, newPassword);

      // Clear the form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      onSuccess("Password updated successfully!");
    } catch (err: any) {
      console.error("Error updating password:", err);
      console.error("Error code:", err?.code);
      console.error("Error message:", err?.message);
      
      // Firebase Auth error codes for password operations
      const errorCode = err?.code || err?.message || "";
      
      if (errorCode.includes('wrong-password') || errorCode.includes('invalid-credential')) {
        onError("Current password is incorrect");
      } else if (errorCode.includes('requires-recent-login') || errorCode.includes('auth/requires-recent-login')) {
        onError("For security, please log out and log in again to change your password");
      } else if (errorCode.includes('weak-password')) {
        onError("Password is too weak. Please choose a stronger password (min 6 characters)");
      } else if (errorCode.includes('invalid-argument')) {
        onError("Invalid password format. Please try again");
      } else if (errorCode.includes('user-not-found') || errorCode.includes('user-mismatch')) {
        onError("User authentication error. Please log in again");
      } else if (errorCode.includes('network-request-failed')) {
        onError("Network error. Please check your connection and try again");
      } else {
        // Log the full error for debugging
        console.error("Full error object:", JSON.stringify(err, null, 2));
        onError("Failed to update password: " + (err?.message || "Unknown error"));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      id="email"
      className="bg-white border border-[#0072D1]/30 rounded-2xl p-5 md:p-7 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-black text-gray-900">Email and password</h2>
        </div>
        <button
          onClick={handleSavePassword}
          disabled={saving || isUpdating}
          className="relative overflow-hidden flex items-center gap-2 bg-black text-white
          text-xs font-bold px-5 py-2.5 rounded-xl shadow-md
          transition-all duration-300 hover:bg-[#0072D1] hover:scale-105 group whitespace-nowrap
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <>
              <Loader className="w-3.5 h-3.5 relative z-10 animate-spin" />
              <span className="relative z-10">Updating...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Save password</span>
            </>
          )}
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>
      <div className="space-y-4 max-w-xl">
        <div>
          <label className={labelCls}>Current password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`${inputCls} pr-10`}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Required to verify your identity</p>
        </div>
        <div className="pt-2">
          <label className={labelCls}>New password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`${inputCls} pr-10`}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelCls}>Confirm new password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputCls} pr-10`}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Section: Providing Service (Multi-Select) ────────────────────────────────

const ProvidingServiceSection = ({
  formData,
  onToggleService,
  onRemoveService,
  handleSaveService,
  saving
}: {
  formData: any;
  onToggleService: (service: string) => void;
  onRemoveService: (service: string) => void;
  handleSaveService: () => void;
  saving: boolean;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isDropdownOpen]);

  const selectedCount = formData.availableServices?.length || 0;

  return (
    <div
      id="service"
      className="bg-white border border-[#0072D1]/30 rounded-2xl p-5 md:p-7 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">Providing Service</h2>
        <SaveBtn label="Save Data" loading={saving} onClick={handleSaveService} />
      </div>

      <div className="space-y-4">
        {/* Selected Services Tags */}
        {selectedCount > 0 && (
          <div>
            <label className={labelCls}>Selected Services ({selectedCount})</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.availableServices.map((service: string) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0072D1]/10 text-[#0072D1] text-sm font-semibold rounded-full"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => onRemoveService(service)}
                    className="flex items-center justify-center w-4 h-4 rounded-full bg-[#0072D1]/20 hover:bg-[#0072D1] hover:text-white transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Service Selector Dropdown */}
        <div ref={dropdownRef} className="relative">
          <label className={labelCls}>
            {selectedCount === 0 ? "What Services You Providing" : "Add More Services"}
          </label>
          
          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full mt-2 flex items-center justify-between px-3 py-2.5 border rounded-xl bg-white transition-colors ${
              isDropdownOpen 
                ? "border-[#0072D1] ring-2 ring-[#0072D1]/10" 
                : "border-[#0072D1]/40 hover:border-[#0072D1]"
            }`}
          >
            <span className="text-sm text-gray-500">
              {isDropdownOpen 
                ? "Click to close" 
                : selectedCount === 0 
                  ? "Select services..." 
                  : "Click to add more"}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-white border border-[#0072D1]/30 rounded-xl shadow-lg">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2">
                <span className="text-xs font-semibold text-gray-500">
                  {selectedCount} service{selectedCount !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="p-2">
                {SERVICES.map((service) => {
                  const isSelected = formData.availableServices.includes(service);
                  return (
                    <label
                      key={service}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-[#0072D1]/10 hover:bg-[#0072D1]/15" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleService(service)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0072D1] focus:ring-[#0072D1]"
                      />
                      <span className={`text-sm ${isSelected ? "font-semibold text-[#0072D1]" : "text-gray-700"}`}>
                        {service}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Helper Text */}
        <p className="text-[10px] text-gray-400">
          Select all services you provide. You can add or remove services anytime.
        </p>
      </div>
    </div>
  );
};

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { key: SettingsTab; label: string; icon: any }[] = [
  { key: "personal", label: "Personal Information", icon: User },
  { key: "email", label: "Email and Password", icon: Mail },
  { key: "service", label: "Providing Service", icon: Pencil }
];

// ─── Main Component ───────────────────────────────────────────────────────────

const EditProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState<SettingsTab>("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    country: "",
    city: "",
    division: "",
    postalCode: "",
    nic: "",
    bio: "",
    availableServices: [] as string[]
  });

  // ─── Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser?.uid) {
          setLoading(false);
          return;
        }

        const userData = await userService.getUser(currentUser.uid);
        console.log('[EditProfile] fetched userData:', userData);
        if (userData) {
          // Extract address components with fallbacks
          const addressObj = typeof userData.address === "object" ? userData.address : {};
          const addressString = typeof userData.address === "string" ? userData.address : "";
          
          setFormData({
            displayName: userData.displayName || "",
            lastName:    (userData as any).lastName    || "",
            email:       currentUser.email    || "",
            phoneNumber: userData.phoneNumber || "",
            address:     addressString || "",
            country:     (addressObj as any)?.country || (userData as any).country || "",
            city:        (addressObj as any)?.city || (userData as any).city || "",
            division:    (addressObj as any)?.division || (userData as any).division || "",
            postalCode:  (addressObj as any)?.postalCode || (userData as any).postalCode || "",
            nic:         userData.nic        || "",
            bio:         userData.bio        || "",
            availableServices: userData.availableServices || [],
          });
          
          console.log('[EditProfile] formData set to:', {
            displayName: userData.displayName || "",
            lastName:    (userData as any).lastName    || "",
            email:       currentUser.email    || "",
            phoneNumber: userData.phoneNumber || "",
            address:     addressString || "",
            country:     (addressObj as any)?.country || (userData as any).country || "",
            city:        (addressObj as any)?.city || (userData as any).city || "",
            division:    (addressObj as any)?.division || (userData as any).division || "",
            postalCode:  (addressObj as any)?.postalCode || (userData as any).postalCode || "",
            nic:         userData.nic        || "",
            bio:         userData.bio        || "",
            availableServices: userData.availableServices || [],
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser?.uid]);

  // ─── Navigation
  const handleBackClick = () => {
    navigate('/profile');
  };

  // ─── Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Handle service toggle (add/remove from array)
  const handleToggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      availableServices: prev.availableServices.includes(service)
        ? prev.availableServices.filter((s) => s !== service)
        : [...prev.availableServices, service]
    }));
  };

  // ─── Handle service removal from tags
  const handleRemoveService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      availableServices: prev.availableServices.filter((s) => s !== service)
    }));
  };

  // ─── Save functions
  const handleSavePersonal = async () => {
    if (!currentUser?.uid) return;

    try {
      setSaving(true);
      setError(null);

      // Validation is handled inside userService.updatePersonalInfo — no need to repeat it here.
      // We write BOTH schema variants (displayName + firstName, nic + idNumber) so that
      // any page reading either field name (Account Setup vs Edit Profile convention) is correct.
      await userService.updatePersonalInfo(currentUser.uid, {
        displayName:  formData.displayName,
        firstName:    formData.displayName,   // keep Account Setup field in sync
        lastName:     formData.lastName,
        phoneNumber:  formData.phoneNumber,
        address:      formData.address,
        country:      formData.country,
        city:         formData.city,
        division:     formData.division,
        postalCode:   formData.postalCode,
        nic:          formData.nic,
        idNumber:     formData.nic,           // keep Account Setup field in sync
        bio:          formData.bio,
      });

      setSuccess("Personal information updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving personal info:", err);
      setError(err instanceof Error ? err.message : "Failed to save personal information");
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveService = async () => {
    if (!currentUser?.uid) return;

    try {
      setSaving(true);
      setError(null);

      await userService.updateServiceInfo(currentUser.uid, {
        availableServices: formData.availableServices
        // userService.updateServiceInfo automatically mirrors this to the "services" field
      });

      setSuccess("Service information updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving service info:", err);
      setError(err instanceof Error ? err.message : "Failed to save service information");
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleNav = (key: SettingsTab) => {
    setActive(key);
    document
      .getElementById(key)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 z-50">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <p className="text-emerald-700 font-semibold text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 z-50">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 font-semibold text-sm">{error}</p>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-5">
        {/* ── Sidebar / top nav ── */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <div className="bg-white border border-[#0072D1]/30 rounded-2xl p-4 shadow-sm md:sticky md:top-4">
            <button
              onClick={handleBackClick}
              className="w-full mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl 
              bg-gray-900 text-white font-semibold text-sm hover:bg-blue-600
              transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </button>
            
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
          <PersonalInfoSection
            formData={formData}
            handleInputChange={handleInputChange}
            handleSavePersonal={handleSavePersonal}
            loading={loading}
            saving={saving}
          />
          <EmailPasswordSection
            saving={saving}
            onSuccess={(msg) => {
              setSuccess(msg);
              setTimeout(() => setSuccess(null), 3000);
            }}
            onError={(msg) => {
              setError(msg);
              setTimeout(() => setError(null), 5000);
            }}
          />
          <ProvidingServiceSection
            formData={formData}
            onToggleService={handleToggleService}
            onRemoveService={handleRemoveService}
            handleSaveService={handleSaveService}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfile;