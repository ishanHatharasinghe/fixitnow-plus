import React, { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { postService } from "../services/postService";
import { userService } from "../services/userService";
import {
  ArrowRight,
  Edit3,
  Image as ImageIcon,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Plus,
  X,
  ChevronDown,
  List,
  FileText,
  AlertCircle,
  Calendar,
  User,
  Briefcase
} from "lucide-react";

// Replace with your actual background image
import PostBg from "../assets/Backgrounds/Postadd.webp";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICE_CATEGORIES = [
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

const PROVINCES = [
  "Western Province",
  "Central Province",
  "Southern Province",
  "Eastern Province",
  "North Western Province",
  "North Central Province",
  "Uva Province",
  "Sabaragamuwa Province",
  "Northern Province"
];

const TRAVEL_DISTANCES = [
  "5 km",
  "10 km",
  "15 km",
  "20 km",
  "30 km",
  "50 km",
  "Island Wide"
];
const PRICING_MODELS = [
  "Fixed Price",
  "Upon Inspection",
  "Hourly Rate",
  "Negotiable"
];
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

// ─── District to Province Mapping ─────────────────────────────────────────────

const DISTRICT_TO_PROVINCE: Record<string, string> = {
  // Western Province
  "Colombo": "Western Province",
  "Gampaha": "Western Province",
  "Kalutara": "Western Province",
  // Central Province
  "Kandy": "Central Province",
  "Matale": "Central Province",
  "NuwaraEliya": "Central Province",
  "Nuwara Eliya": "Central Province",
  // Southern Province
  "Galle": "Southern Province",
  "Matara": "Southern Province",
  "Hambantota": "Southern Province",
  // Eastern Province
  "Trincomalee": "Eastern Province",
  "Batticaloa": "Eastern Province",
  "Ampara": "Eastern Province",
  // North Western Province
  "Kurunegala": "North Western Province",
  "Puttalam": "North Western Province",
  // North Central Province
  "Anuradhapura": "North Central Province",
  "Polonnaruwa": "North Central Province",
  // Uva Province
  "Badulla": "Uva Province",
  "Moneragala": "Uva Province",
  // Sabaragamuwa Province
  "Kegalle": "Sabaragamuwa Province",
  "Ratnapura": "Sabaragamuwa Province",
  // Northern Province
  "Jaffna": "Northern Province",
  "Kilinochchi": "Northern Province",
  "Mannar": "Northern Province",
  "Mullaitivu": "Northern Province",
  "Vavuniya": "Northern Province"
};

// Helper function to get province from district
const getProvinceFromDistrict = (district: string): string => {
  // Normalize the district name (remove spaces, lowercase for matching)
  const normalizedDistrict = district.trim();
  return DISTRICT_TO_PROVINCE[normalizedDistrict] || "";
};

// ─── Initial form state ───────────────────────────────────────────────────────

export interface FormType {
  title: string;
  category: string;
  specializations: string;
  location: string;
  specificCities: string;
  travelDistance: string;
  pricingModel: string;
  description: string;
  keywords: string;
  checklist: string[];
  clientMaterials: string;
  timeFromHour: string;
  timeFromAmPm: string;
  timeToHour: string;
  timeToAmPm: string;
  availableDays: string[];
  startingPrice: string;
  inspectionFee: string;
  emergency: string;
  ownerName: string;
  ownerAddress: string;
  nic: string;
  mobile: string;
  email: string;
  images: File[];
  imagePreviews: string[];
  pdf: File | null;
  pdfName: string;
}

const INITIAL_FORM: FormType = {
  title: "",
  category: "",
  specializations: "",
  location: "",
  specificCities: "",
  travelDistance: "",
  pricingModel: "",
  description: "",
  keywords: "",
  checklist: [],
  clientMaterials: "No",
  timeFromHour: "07",
  timeFromAmPm: "AM",
  timeToHour: "07",
  timeToAmPm: "PM",
  availableDays: [],
  startingPrice: "",
  inspectionFee: "",
  emergency: "No",
  ownerName: "",
  ownerAddress: "",
  nic: "",
  mobile: "",
  email: "",
  images: [],
  imagePreviews: [],
  pdf: null,
  pdfName: ""
};

// ─── Validation helpers ───────────────────────────────────────────────────────

const VALIDATORS: Record<string, (v: string) => string | null> = {
  title: (v: string) => {
    if (!v || !v.trim()) return "Post title is required.";
    if (v.trim().length < 10) return "Title must be at least 10 characters.";
    if (v.trim().length > 120) return "Title must be 120 characters or fewer.";
    return null;
  },
  category: (v: string) => (!v ? "Please select a service category." : null),
  specializations: (v: string) => {
    if (!v || !v.trim()) return null; // optional
    if (v.trim().length > 200)
      return "Specializations must be 200 characters or fewer.";
    return null;
  },
  location: (v: string) => (!v ? "Please select a province / location." : null),
  specificCities: (v: string) => {
    if (!v || !v.trim()) return null; // optional
    if (!/^[a-zA-Z\s,]+$/.test(v.trim()))
      return "Cities should contain only letters, spaces, and commas.";
    return null;
  },
  travelDistance: () => null, // optional
  pricingModel: () => null, // optional
  description: (v: string) => {
    if (!v || !v.trim()) return null; // optional
    if (v.trim().length < 20)
      return "Description should be at least 20 characters.";
    if (v.trim().length > 1000)
      return "Description must be 1000 characters or fewer.";
    return null;
  },
  keywords: (v: string) => {
    if (!v || !v.trim()) return null; // optional
    if (v.trim().length > 300)
      return "Keywords must be 300 characters or fewer.";
    return null;
  },
  timeFromHour: (v: string) => {
    const n = Number(v);
    if (!v) return null;
    if (isNaN(n) || n < 1 || n > 12) return "Hour must be between 1 and 12.";
    return null;
  },
  timeToHour: (v: string) => {
    const n = Number(v);
    if (!v) return null;
    if (isNaN(n) || n < 1 || n > 12) return "Hour must be between 1 and 12.";
    return null;
  },
  startingPrice: (v: string) => {
    if (!v) return null; // optional
    if (isNaN(Number(v)) || Number(v) < 0)
      return "Starting price must be a positive number.";
    if (Number(v) > 10000000) return "Starting price seems too high.";
    return null;
  },
  inspectionFee: (v: string) => {
    if (!v) return null; // optional
    if (isNaN(Number(v)) || Number(v) < 0)
      return "Inspection fee must be a positive number.";
    if (Number(v) > 10000000) return "Inspection fee seems too high.";
    return null;
  },
  ownerName: (v: string) => {
    if (!v || !v.trim()) return "Full name is required.";
    if (v.trim().length < 3) return "Name must be at least 3 characters.";
    if (!/^[a-zA-Z\s.'-]+$/.test(v.trim()))
      return "Name should contain only letters, spaces, and basic punctuation.";
    return null;
  },
  ownerAddress: (v: string) => {
    if (!v || !v.trim()) return null; // optional
    if (v.trim().length < 5) return "Address seems too short.";
    if (v.trim().length > 300)
      return "Address must be 300 characters or fewer.";
    return null;
  },
  nic: (v: string) => {
    if (!v || !v.trim()) return null; // optional
    // Sri Lanka NIC: 9 digits + V/X  OR  12 digits
    if (!/^(\d{9}[VXvx]|\d{12})$/.test(v.trim()))
      return "NIC must be 9 digits followed by V/X, or 12 digits.";
    return null;
  },
  mobile: (v: string) => {
    if (!v || !v.trim()) return "Mobile number is required.";
    if (!/^\d{9}$/.test(v.trim()))
      return "Enter a valid 9-digit mobile number (without country code).";
    return null;
  },
  email: (v: string) => {
    if (!v || !v.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      return "Enter a valid email address.";
    return null;
  }
};

// ─── Reusable UI primitives ───────────────────────────────────────────────────

const Field = ({
  label,
  children,
  required = false,
  error
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string | null;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
      {label}
      {required && <span className="text-[#FF5A00] ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const Input = ({
  className = "",
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string | null }) => (
  <input
    className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-800
      placeholder-gray-300 outline-none transition-all duration-200
      focus:shadow-[0_0_0_4px_rgba(0,114,209,0.08)]
      hover:border-gray-200
      ${
        error
          ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
          : "border-gray-100 focus:border-[#0072D1]"
      } ${className}`}
    {...props}
  />
);

const Textarea = ({
  className = "",
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string | null;
}) => (
  <textarea
    className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-800
      placeholder-gray-300 outline-none transition-all duration-200 resize-none
      focus:shadow-[0_0_0_4px_rgba(0,114,209,0.08)]
      hover:border-gray-200
      ${
        error
          ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
          : "border-gray-100 focus:border-[#0072D1]"
      } ${className}`}
    {...props}
  />
);

const Select = ({
  options,
  placeholder,
  value,
  onChange,
  className = "",
  error
}: {
  options: string[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string | null;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-sm font-medium
        outline-none transition-all duration-200 appearance-none cursor-pointer pr-10
        focus:shadow-[0_0_0_4px_rgba(0,114,209,0.08)]
        hover:border-gray-200
        ${
          error
            ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
            : "border-gray-100 focus:border-[#0072D1]"
        }
        ${value ? "text-gray-800" : "text-gray-300"} ${className}`}
    >
      <option value="" disabled hidden>
        {placeholder || "Select..."}
      </option>
      {options.map((o) => (
        <option key={o} value={o} className="text-gray-800">
          {o}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

const RadioPill = ({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
      checked
        ? "bg-[#0072D1] border-[#0072D1] text-white shadow-[0_4px_12px_rgba(0,114,209,0.3)]"
        : "bg-white border-gray-200 text-gray-500 hover:border-[#0072D1] hover:text-[#0072D1]"
    }`}
  >
    {label}
  </button>
);

const DayChip = ({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all duration-200 ${
      checked
        ? "bg-[#0072D1] border-[#0072D1] text-white"
        : "bg-white border-gray-200 text-gray-500 hover:border-[#0072D1] hover:text-[#0072D1]"
    }`}
  >
    {label.slice(0, 3)}
  </button>
);

// Primary CTA button — matches project style
const NextBtn = ({
  label = "Next",
  onClick,
  icon = true
}: {
  label?: string;
  onClick: () => void;
  icon?: boolean;
}) => (
  <div className="flex justify-center pt-6">
    <button
      onClick={onClick}
      className="relative overflow-hidden flex items-center gap-3 px-10 py-4 rounded-full
        border-2 border-[#0072D1] bg-white text-[#0072D1] font-bold text-base
        transition-all duration-300 hover:bg-black hover:text-white hover:border-black
        hover:scale-105 group shadow-lg"
    >
      {icon && (
        <div
          className="bg-[#0072D1] text-white rounded-full p-1.5
          group-hover:bg-white group-hover:text-black transition-colors duration-300 flex-shrink-0"
        >
          <ArrowRight className="w-5 h-5" strokeWidth={3} />
        </div>
      )}
      <span className="relative z-10">{label}</span>
      <div
        className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
        group-hover:translate-x-full transition-transform duration-700 rounded-full"
      />
    </button>
  </div>
);

// Section divider with icon
const SectionTitle = ({
  icon: Icon,
  title,
  subtitle
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-start gap-3 pb-4 border-b-2 border-gray-50 mb-6">
    <div className="w-9 h-9 rounded-xl bg-[#0072D1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4.5 h-4.5 text-[#0072D1]" strokeWidth={2.5} />
    </div>
    <div>
      <h3 className="text-lg font-black text-gray-900 tracking-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-gray-400 font-medium mt-0.5">{subtitle}</p>
      )}
    </div>
  </div>
);

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

const StepNav = ({
  step,
  setStep
}: {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const steps = [
    { label: "Details", icon: Edit3 },
    { label: "Gallery", icon: ImageIcon },
    { label: "Finish", icon: CheckCircle }
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      {steps.map((s, i) => {
        const isActive = step === i;
        const isDone = step > i;
        return (
          <button
            key={s.label}
            onClick={() => setStep(i)}
            className={`relative overflow-hidden w-full flex items-center gap-3 px-5 py-4 rounded-2xl
              font-black text-base tracking-wide transition-all duration-300
              ${
                isActive
                  ? "bg-[#0072D1] text-white shadow-[0_8px_24px_rgba(0,114,209,0.35)] scale-[1.02]"
                  : isDone
                  ? "bg-emerald-500 text-white"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
              ${
                isActive
                  ? "bg-white/20"
                  : isDone
                  ? "bg-white/20"
                  : "bg-white/10"
              }`}
            >
              <s.icon className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span>{s.label}</span>
            {isDone && (
              <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                ✓
              </span>
            )}
            {/* Shimmer */}
            {isActive && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                animate-[shimmer_2s_infinite] pointer-events-none"
              />
            )}
          </button>
        );
      })}

      {/* Progress bar */}
      <div className="mt-2 bg-white/20 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>
      <p className="text-white/60 text-xs text-center font-medium">
        Step {step + 1} of 3
      </p>
    </div>
  );
};

// ─── STEP 1: Details ──────────────────────────────────────────────────────────

const DetailsStep = ({
  form,
  set,
  onNext,
  isEditMode = false,
  onAutofill,
  hasProfileData,
  hasAutoFilled
}: {
  form: FormType;
  set: React.Dispatch<React.SetStateAction<FormType>>;
  onNext: () => void;
  isEditMode?: boolean;
  onAutofill?: () => void;
  hasProfileData?: boolean;
  hasAutoFilled?: boolean;
}) => {
  const [checkItem, setCheckItem] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate a single field and update error state
  const validateField = (name: string, value: string) => {
    const validator = VALIDATORS[name as keyof typeof VALIDATORS];
    const error = validator ? validator(value) : null;
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  // Mark field as touched on blur and validate
  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Validate all step-1 fields and return true if valid
  const validateAll = () => {
    const allKeys = [
      "title",
      "category",
      "specializations",
      "location",
      "specificCities",
      "description",
      "keywords",
      "timeFromHour",
      "timeToHour",
      "startingPrice",
      "inspectionFee",
      "ownerName",
      "ownerAddress",
      "nic",
      "mobile",
      "email"
    ];
    const newErrors: Record<string, string | null> = {};
    let valid = true;
    allKeys.forEach((key) => {
      const error = VALIDATORS[key as keyof typeof VALIDATORS]
        ? VALIDATORS[key as keyof typeof VALIDATORS](
            form[key as keyof FormType] as string
          )
        : null;
      if (error) valid = false;
      newErrors[key] = error;
    });
    setErrors(newErrors);
    // Mark all as touched so errors are visible
    const allTouched: Record<string, boolean> = {};
    allKeys.forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);
    return valid;
  };

  const handleNext = () => {
    if (validateAll()) onNext();
  };

  const addCheck = () => {
    const t = checkItem.trim();
    if (!t) return;
    set((f: FormType) => ({ ...f, checklist: [...f.checklist, t] }));
    setCheckItem("");
  };

  const removeCheck = (i: number) =>
    set((f: FormType) => ({
      ...f,
      checklist: f.checklist.filter((_, idx) => idx !== i)
    }));
  const toggleDay = (d: string) =>
    set((f: FormType) => ({
      ...f,
      availableDays: f.availableDays.includes(d)
        ? f.availableDays.filter((x) => x !== d)
        : [...f.availableDays, d]
    }));

  const err = (name: string) => (touched[name] ? errors[name] : null);

  // Show autofill banner if profile data is available and not yet autofilled
  const showAutofillBanner = !isEditMode && hasProfileData && !hasAutoFilled;

  return (
    <div className="space-y-8">
      {/* ── Autofill Banner ── */}
      {showAutofillBanner && onAutofill && (
        <div className="bg-gradient-to-r from-[#0072D1]/10 to-[#0072D1]/5 border-2 border-[#0072D1]/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0072D1]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#0072D1]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0072D1]">
                Auto-fill Available
              </p>
              <p className="text-xs text-[#0072D1]/80 mt-0.5">
                Fill in your profile details automatically
              </p>
            </div>
          </div>
          <button
            onClick={onAutofill}
            className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-full
              bg-[#0072D1] text-white text-sm font-bold
              transition-all duration-300 hover:bg-black hover:scale-105 group shadow-lg"
          >
            <span className="relative z-10">Auto-fill</span>
            <div
              className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
              group-hover:translate-x-full transition-transform duration-700 rounded-full"
            />
          </button>
        </div>
      )}

      {/* ── Already Autofilled Banner ── */}
      {hasAutoFilled && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">
              Profile Auto-filled
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Your profile details have been automatically filled. Please review and edit as needed.
            </p>
          </div>
        </div>
      )}

      {/* ── Edit Mode Banner ── */}
      {isEditMode && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Edit3 className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">
              Editing Your Post
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Make any necessary changes to your post. When finished, it will be resubmitted to the admin for approval.
            </p>
          </div>
        </div>
      )}

      {/* ── Service Info ── */}
      <div>
        <SectionTitle
          icon={Briefcase}
          title={isEditMode ? "Review & Update Your Post" : "Create A Post"}
          subtitle={isEditMode ? "Make changes to your post details" : "Tell clients what you offer"}
        />
        <div className="space-y-4">
          <Field label="Post Title" required error={err("title")}>
            <Input
              value={form.title}
              onChange={(e) => {
                set((f) => ({ ...f, title: e.target.value }));
                if (touched.title) validateField("title", e.target.value);
              }}
              onBlur={(e) => handleBlur("title", e.target.value)}
              placeholder="e.g. Expert House Plumber – Fast Leak Repairs"
              error={err("title")}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Service Category" required error={err("category")}>
              <Select
                value={form.category}
                onChange={(v: string) => {
                  set((f: FormType) => ({ ...f, category: v }));
                  validateField("category", v);
                  setTouched((prev: Record<string, boolean>) => ({
                    ...prev,
                    category: true
                  }));
                }}
                options={SERVICE_CATEGORIES}
                placeholder="Select category"
                error={err("category")}
              />
            </Field>
            <Field label="Specializations" error={err("specializations")}>
              <Input
                value={form.specializations}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  set((f: FormType) => ({
                    ...f,
                    specializations: e.target.value
                  }));
                  if (touched.specializations)
                    validateField("specializations", e.target.value);
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleBlur("specializations", e.target.value)
                }
                placeholder="e.g. Leak repairs, PVC pipe"
                error={err("specializations")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Province / Location" required error={err("location")}>
              <Select
                value={form.location}
                onChange={(v: string) => {
                  set((f: FormType) => ({ ...f, location: v }));
                  validateField("location", v);
                  setTouched((prev: Record<string, boolean>) => ({
                    ...prev,
                    location: true
                  }));
                }}
                options={PROVINCES}
                placeholder="Select province"
                error={err("location")}
              />
            </Field>
            <Field label="Specific Cities" error={err("specificCities")}>
              <Input
                value={form.specificCities}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  set((f: FormType) => ({
                    ...f,
                    specificCities: e.target.value
                  }));
                  if (touched.specificCities)
                    validateField("specificCities", e.target.value);
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleBlur("specificCities", e.target.value)
                }
                placeholder="e.g. Moratuwa, Panadura"
                error={err("specificCities")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Maximum Travel Distance">
              <Select
                value={form.travelDistance}
                onChange={(v) => set((f) => ({ ...f, travelDistance: v }))}
                options={TRAVEL_DISTANCES}
                placeholder="Select distance"
              />
            </Field>
            <Field label="Pricing Model">
              <Select
                value={form.pricingModel}
                onChange={(v) => set((f) => ({ ...f, pricingModel: v }))}
                options={PRICING_MODELS}
                placeholder="Select model"
              />
            </Field>
          </div>

          <Field label="Description" error={err("description")}>
            <Textarea
              value={form.description}
              onChange={(e) => {
                set((f) => ({ ...f, description: e.target.value }));
                if (touched.description)
                  validateField("description", e.target.value);
              }}
              onBlur={(e) => handleBlur("description", e.target.value)}
              rows={4}
              placeholder="Describe your service, experience, and what makes you stand out..."
              error={err("description")}
            />
          </Field>

          <Field label="Keywords" error={err("keywords")}>
            <Input
              value={form.keywords}
              onChange={(e) => {
                set((f) => ({ ...f, keywords: e.target.value }));
                if (touched.keywords) validateField("keywords", e.target.value);
              }}
              onBlur={(e) => handleBlur("keywords", e.target.value)}
              placeholder="e.g. plumber, leak repair, pipes, water pump"
              error={err("keywords")}
            />
          </Field>

          {/* Checklist */}
          <Field label="Included Services Checklist">
            <div className="flex gap-2">
              <Input
                value={checkItem}
                onChange={(e) => setCheckItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCheck()}
                placeholder="Type a service and press Enter or +"
                className="flex-1"
              />
              <button
                onClick={addCheck}
                className="w-12 h-12 flex-shrink-0 rounded-xl bg-[#0072D1] text-white flex items-center
                  justify-center hover:bg-black transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {form.checklist.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.checklist.map((item, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 bg-[#0072D1]/8 text-[#0072D1] border border-[#0072D1]/20
                      text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    {item}
                    <button
                      onClick={() => removeCheck(i)}
                      className="hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>
        </div>
      </div>

      {/* ── Availability ── */}
      <div>
        <SectionTitle
          icon={Calendar}
          title="Availability & Pricing"
          subtitle="When can clients reach you?"
        />
        <div className="space-y-5">
          {/* Client materials + Available time side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Client-Provided Materials Required">
              <div className="flex gap-3 pt-1">
                <RadioPill
                  label="Yes"
                  checked={form.clientMaterials === "Yes"}
                  onChange={() =>
                    set((f) => ({ ...f, clientMaterials: "Yes" }))
                  }
                />
                <RadioPill
                  label="No"
                  checked={form.clientMaterials === "No"}
                  onChange={() => set((f) => ({ ...f, clientMaterials: "No" }))}
                />
              </div>
            </Field>

            <Field label="Available Hours">
              <div className="flex items-center gap-2">
                <Input
                  value={form.timeFromHour}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    set((f: FormType) => ({
                      ...f,
                      timeFromHour: e.target.value
                    }));
                    if (touched.timeFromHour)
                      validateField("timeFromHour", e.target.value);
                  }}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleBlur("timeFromHour", e.target.value)
                  }
                  placeholder="07"
                  className="w-16 text-center px-2"
                  type="number"
                  min="1"
                  max="12"
                  error={err("timeFromHour")}
                />
                <Select
                  value={form.timeFromAmPm}
                  onChange={(v: string) =>
                    set((f: FormType) => ({ ...f, timeFromAmPm: v }))
                  }
                  options={["AM", "PM"]}
                  className="w-20"
                />
                <span className="text-gray-400 font-bold text-sm flex-shrink-0">
                  to
                </span>
                <Input
                  value={form.timeToHour}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    set((f: FormType) => ({
                      ...f,
                      timeToHour: e.target.value
                    }));
                    if (touched.timeToHour)
                      validateField("timeToHour", e.target.value);
                  }}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleBlur("timeToHour", e.target.value)
                  }
                  placeholder="07"
                  className="w-16 text-center px-2"
                  type="number"
                  min="1"
                  max="12"
                  error={err("timeToHour")}
                />
                <Select
                  value={form.timeToAmPm}
                  onChange={(v: string) =>
                    set((f: FormType) => ({ ...f, timeToAmPm: v }))
                  }
                  options={["AM", "PM"]}
                  className="w-20"
                />
              </div>
              {/* Show hour errors below the row */}
              {(err("timeFromHour") || err("timeToHour")) && (
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {err("timeFromHour") || err("timeToHour")}
                </p>
              )}
            </Field>
          </div>

          {/* Days */}
          <Field label="Available Days">
            <div className="flex flex-wrap gap-2 pt-1">
              {DAYS.map((d) => (
                <DayChip
                  key={d}
                  label={d}
                  checked={form.availableDays.includes(d)}
                  onChange={() => toggleDay(d)}
                />
              ))}
            </div>
          </Field>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Starting Price (LKR)" error={err("startingPrice")}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FF5A00]">
                  Rs.
                </span>
                <Input
                  value={form.startingPrice}
                  onChange={(e) => {
                    set((f) => ({ ...f, startingPrice: e.target.value }));
                    if (touched.startingPrice)
                      validateField("startingPrice", e.target.value);
                  }}
                  onBlur={(e) => handleBlur("startingPrice", e.target.value)}
                  placeholder="1,500"
                  type="number"
                  min="0"
                  className="pl-12"
                  error={err("startingPrice")}
                />
              </div>
            </Field>
            <Field label="Inspection Fee (LKR)" error={err("inspectionFee")}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FF5A00]">
                  Rs.
                </span>
                <Input
                  value={form.inspectionFee}
                  onChange={(e) => {
                    set((f) => ({ ...f, inspectionFee: e.target.value }));
                    if (touched.inspectionFee)
                      validateField("inspectionFee", e.target.value);
                  }}
                  onBlur={(e) => handleBlur("inspectionFee", e.target.value)}
                  placeholder="1,000"
                  type="number"
                  min="0"
                  className="pl-12"
                  error={err("inspectionFee")}
                />
              </div>
            </Field>
          </div>

          {/* Emergency */}
          <Field label="Emergency Availability">
            <div className="flex gap-3 pt-1">
              <RadioPill
                label="Yes I'm available"
                checked={form.emergency === "Yes"}
                onChange={() =>
                  set((f: FormType) => ({ ...f, emergency: "Yes" }))
                }
              />
              <RadioPill
                label="No"
                checked={form.emergency === "No"}
                onChange={() =>
                  set((f: FormType) => ({ ...f, emergency: "No" }))
                }
              />
            </div>
          </Field>
        </div>
      </div>

      {/* ── Owner Info ── */}
      <div>
        <SectionTitle
          icon={User}
          title="Owner Information"
          subtitle="Your contact details for clients"
        />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required error={err("ownerName")}>
              <Input
                value={form.ownerName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  set((f: FormType) => ({ ...f, ownerName: e.target.value }));
                  if (touched.ownerName)
                    validateField("ownerName", e.target.value);
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleBlur("ownerName", e.target.value)
                }
                placeholder="Your full name"
                error={err("ownerName")}
              />
            </Field>
            <Field label="Email Address" required error={err("email")}>
              <Input
                value={form.email}
                type="email"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  set((f: FormType) => ({ ...f, email: e.target.value }));
                  if (touched.email) validateField("email", e.target.value);
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleBlur("email", e.target.value)
                }
                placeholder="sample@gmail.com"
                error={err("email")}
              />
            </Field>
          </div>

          <Field label="Address" error={err("ownerAddress")}>
            <Input
              value={form.ownerAddress}
              onChange={(e) => {
                set((f) => ({ ...f, ownerAddress: e.target.value }));
                if (touched.ownerAddress)
                  validateField("ownerAddress", e.target.value);
              }}
              onBlur={(e) => handleBlur("ownerAddress", e.target.value)}
              placeholder="Your full address"
              error={err("ownerAddress")}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="NIC Number" error={err("nic")}>
              <Input
                value={form.nic}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  set((f: FormType) => ({ ...f, nic: e.target.value }));
                  if (touched.nic) validateField("nic", e.target.value);
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleBlur("nic", e.target.value)
                }
                placeholder="e.g. 199012345678"
                error={err("nic")}
              />
            </Field>
            <Field label="Mobile Number" required error={err("mobile")}>
              <div className="flex gap-2">
                <div
                  className="flex items-center justify-center bg-gray-50 border-2 border-gray-100
                  rounded-xl px-3 text-sm font-black text-gray-600 flex-shrink-0 select-none"
                >
                  +94
                </div>
                <Input
                  value={form.mobile}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    set((f: FormType) => ({ ...f, mobile: e.target.value }));
                    if (touched.mobile) validateField("mobile", e.target.value);
                  }}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleBlur("mobile", e.target.value)
                  }
                  placeholder="703 215 789"
                  type="tel"
                  maxLength={9}
                  error={err("mobile")}
                />
              </div>
            </Field>
          </div>
        </div>
      </div>

      <NextBtn label="Continue to Gallery" onClick={handleNext} />
    </div>
  );
};

// ─── STEP 2: Gallery ──────────────────────────────────────────────────────────

const GalleryStep = ({
  form,
  set,
  onNext
}: {
  form: FormType;
  set: React.Dispatch<React.SetStateAction<FormType>>;
  onNext: () => void;
}) => {
  const imgRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const MAX_IMAGE_SIZE_MB = 3;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];
  const MAX_PDF_SIZE_MB = 10;
  const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

  const processFiles = (files: File[]) => {
    setImageError(null);
    const imageFiles = Array.from(files).filter((f: File) =>
      f.type.startsWith("image/")
    );
    const oversized = imageFiles.filter(
      (f: File) => f.size > MAX_IMAGE_SIZE_BYTES
    );
    const invalidType = imageFiles.filter(
      (f: File) => !ALLOWED_IMAGE_TYPES.includes(f.type)
    );

    if (invalidType.length > 0) {
      setImageError("Only JPG, PNG, WebP, and GIF images are allowed.");
      return;
    }
    if (oversized.length > 0) {
      setImageError(
        `Each image must be under ${MAX_IMAGE_SIZE_MB} MB. Please reduce the file size.`
      );
      return;
    }
    const slotsLeft = 5 - form.imagePreviews.length;
    if (imageFiles.length > slotsLeft) {
      setImageError(
        `You can only add ${slotsLeft} more image${slotsLeft !== 1 ? "s" : ""}.`
      );
      return;
    }
    const newPreviews = imageFiles.map((f: File) => URL.createObjectURL(f));
    set((prev: FormType) => ({
      ...prev,
      images: [...prev.images, ...imageFiles].slice(0, 5),
      imagePreviews: [...prev.imagePreviews, ...newPreviews].slice(0, 5)
    }));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      processFiles(Array.from(e.dataTransfer.files));
    },
    [form.imagePreviews.length]
  );

  const removeImage = (i: number) => {
    setImageError(null);
    set((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== i),
      imagePreviews: prev.imagePreviews.filter((_, idx) => idx !== i)
    }));
  };

  const handlePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setPdfError("Only PDF files are allowed.");
      return;
    }
    if (f.size > MAX_PDF_SIZE_BYTES) {
      setPdfError(`PDF must be under ${MAX_PDF_SIZE_MB} MB.`);
      return;
    }
    set((prev: FormType) => ({ ...prev, pdf: f, pdfName: f.name }));
  };

  const handleNext = () => {
    // Gallery is optional — just proceed
    onNext();
  };

  const slotsLeft = 5 - form.imagePreviews.length;

  return (
    <div className="space-y-8">
      {/* Images upload */}
      <div>
        <SectionTitle
          icon={ImageIcon}
          title="Upload Your Advertisement or Images"
          subtitle="Add up to 5 pictures · Max 3 MB each · Use real photos of your work"
        />

        {/* Drop zone */}
        <div
          onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-6 mb-4 text-center
            transition-all duration-200 cursor-pointer
            ${
              dragging
                ? "border-[#0072D1] bg-[#0072D1]/5 scale-[1.01]"
                : imageError
                ? "border-red-400 hover:border-red-400 bg-red-50/30"
                : "border-gray-200 hover:border-[#0072D1]/50 hover:bg-gray-50"
            }`}
          onClick={() =>
            form.imagePreviews.length < 5 && imgRef.current?.click()
          }
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                imageError ? "bg-red-100" : "bg-[#0072D1]/10"
              }`}
            >
              <ImageIcon
                className={`w-6 h-6 ${
                  imageError ? "text-red-500" : "text-[#0072D1]"
                }`}
              />
            </div>
            <p className="text-sm font-bold text-gray-600">
              {dragging
                ? "Drop images here"
                : "Drag & drop images or click to browse"}
            </p>
            <p className="text-xs text-gray-400">
              {slotsLeft > 0
                ? `${slotsLeft} slot${slotsLeft > 1 ? "s" : ""} remaining`
                : "Maximum 5 images reached"}
            </p>
          </div>
          <input
            ref={imgRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) =>
              processFiles(e.target.files ? Array.from(e.target.files) : [])
            }
          />
        </div>

        {/* Image error */}
        {imageError && (
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mb-3">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {imageError}
          </p>
        )}

        {/* Preview grid */}
        {form.imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {form.imagePreviews.map((src: string, i: number) => (
              <div
                key={i}
                className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-100
                  hover:border-[#0072D1] transition-colors shadow-sm"
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover
                  group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                {i === 0 && (
                  <span
                    className="absolute top-1.5 left-1.5 bg-[#0072D1] text-white text-[10px]
                    font-black px-2 py-0.5 rounded-full"
                  >
                    MAIN
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full
                    flex items-center justify-center opacity-0 group-hover:opacity-100
                    transition-opacity hover:bg-red-600 shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {/* Add more slot */}
            {form.imagePreviews.length < 5 && (
              <button
                onClick={() => imgRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-[#0072D1]/30
                  flex flex-col items-center justify-center gap-1 hover:border-[#0072D1]
                  hover:bg-[#0072D1]/5 transition-all text-[#0072D1]"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[10px] font-bold">Add More</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* PDF upload */}
      <div>
        <SectionTitle
          icon={FileText}
          title="Upload PDF"
          subtitle="Attach a brochure, certificate, or portfolio document · Max 10 MB"
        />

        {form.pdfName ? (
          <div className="flex items-center gap-4 p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {form.pdfName}
              </p>
              <p className="text-xs text-gray-500">PDF document attached</p>
            </div>
            <button
              onClick={() => {
                set((f: FormType) => ({ ...f, pdf: null, pdfName: "" }));
                setPdfError(null);
              }}
              className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center
                hover:bg-red-600 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => pdfRef.current?.click()}
            className={`w-full flex items-center gap-4 p-5 border-2 border-dashed
              rounded-2xl transition-all group
              ${
                pdfError
                  ? "border-red-400 hover:border-red-400 bg-red-50/30"
                  : "border-gray-200 hover:border-[#0072D1]/50 hover:bg-gray-50"
              }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0
                ${
                  pdfError
                    ? "bg-red-100"
                    : "bg-gray-100 group-hover:bg-[#0072D1]/10"
                }`}
            >
              <Plus
                className={`w-6 h-6 transition-colors ${
                  pdfError
                    ? "text-red-500"
                    : "text-gray-400 group-hover:text-[#0072D1]"
                }`}
              />
            </div>
            <div className="text-left">
              <p
                className={`text-sm font-bold transition-colors ${
                  pdfError
                    ? "text-red-500"
                    : "text-gray-600 group-hover:text-[#0072D1]"
                }`}
              >
                Upload your PDF
              </p>
              <p className="text-xs text-gray-400">
                Click to browse PDF files · Max 10 MB
              </p>
            </div>
          </button>
        )}

        {/* PDF error */}
        {pdfError && (
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-2">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {pdfError}
          </p>
        )}

        <input
          ref={pdfRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handlePdf}
        />
      </div>

      <NextBtn label="Preview & Finish" onClick={handleNext} />
    </div>
  );
};

// ─── STEP 3: Finish / Preview ─────────────────────────────────────────────────

const FinishStep = ({
  form,
  setStep,
  handleSubmit,
  isEditMode = false,
  submitting = false
}: {
  form: FormType;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  handleSubmit: () => void;
  isEditMode?: boolean;
  submitting?: boolean;
}) => {
  const [activeImg, setActiveImg] = useState(0);

  // No default/placeholder images — images are not stored (no Firebase Storage)
  const previews = form.imagePreviews.length > 0 ? form.imagePreviews : [];

  const infoRows = [
    { label: "Included Services", value: form.checklist.join(", ") || null },
    { label: "Client Materials", value: form.clientMaterials },
    { label: "Pricing Model", value: form.pricingModel || null },
    {
      label: "Starting Price",
      value: form.startingPrice
        ? `LKR ${Number(form.startingPrice).toLocaleString()}`
        : null
    },
    {
      label: "Inspection Fee",
      value: form.inspectionFee
        ? `LKR ${Number(form.inspectionFee).toLocaleString()}`
        : null
    },
    { label: "Specific Cities", value: form.specificCities || null },
    { label: "Max Travel Distance", value: form.travelDistance || null },
    { label: "Available Days", value: form.availableDays.join(", ") || null },
    {
      label: "Available Hours",
      value: form.timeFromHour
        ? `${form.timeFromHour}:00 ${form.timeFromAmPm} – ${form.timeToHour}:00 ${form.timeToAmPm}`
        : null
    },
    { label: "Emergency Availability", value: form.emergency }
  ].filter((r) => r.value);

  return (
    <div>
      {/* Card preview */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm mb-6">
        {/* Card header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <h2 className="font-black text-gray-900 text-lg leading-tight">
              {form.title || "Expert House Plumber – Fast Leak Repairs"}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-gray-400">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs font-medium">
                {form.location || "Location not set"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setStep(0)}
            className="relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-full
              border-2 border-[#0072D1] bg-white text-[#0072D1] font-bold text-xs
              transition-all duration-300 hover:bg-black hover:text-white hover:border-black
              flex-shrink-0 ml-3 group"
          >
            <div
              className="bg-[#0072D1] text-white rounded-full p-0.5
              group-hover:bg-white group-hover:text-black transition-colors"
            >
              <ArrowRight className="w-3 h-3" strokeWidth={3} />
            </div>
            Edit Details
            <div
              className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full
              group-hover:translate-x-full transition-transform duration-700 rounded-full"
            />
          </button>
        </div>

        {/* Image carousel */}
        <div className="relative mx-5 rounded-2xl overflow-hidden bg-gray-100 mb-4">
          <img
            src={previews[activeImg]}
            alt="preview"
            className="w-full h-52 md:h-64 object-cover"
          />
          {previews.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {previews.map((_: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === activeImg
                      ? "bg-[#0072D1] w-5 h-2.5"
                      : "bg-white/70 w-2.5 h-2.5"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <List className="w-4 h-4 text-gray-500" />
            <h4 className="font-black text-gray-800 text-sm tracking-wide uppercase">
              Details
            </h4>
          </div>

          {form.description && (
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              {form.description}
            </p>
          )}

          <div className="space-y-1.5 mb-5">
            {infoRows.map(({ label, value }) => (
              <div key={label} className="flex text-xs gap-1.5">
                <span className="font-black text-gray-700 flex-shrink-0">
                  {label}:
                </span>
                <span className="text-gray-600">{value}</span>
              </div>
            ))}
          </div>

          {/* Contact row */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              +94 {form.mobile || "703215789"}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {form.email || "sample@gmail.com"}
            </span>
          </div>
        </div>
      </div>

      {/* Success note */}
      <div
        className="flex items-start gap-3 p-4 bg-emerald-50 border-2 border-emerald-100
        rounded-2xl mb-2"
      >
        <AlertCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-emerald-700">
            {isEditMode ? "Ready to resubmit!" : "Ready to publish!"}
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">
            {isEditMode
              ? "Review your updated post above. Click Update & Resubmit to send it back to the admin for approval."
              : "Review your post above. Click Finish to submit it for review."}
          </p>
        </div>
      </div>

      <NextBtn
        label={submitting ? "Submitting…" : isEditMode ? "Update & Resubmit" : "Finish"}
        onClick={handleSubmit}
      />
    </div>
  );
};

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

const PostYourAdd = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { postId } = useParams<{ postId?: string }>();

  // When a postId param is present we are in EDIT mode
  const isEditMode = Boolean(postId);

  // ── Fetch user profile data for autofill ────────────────────────────────────
  useEffect(() => {
    // Only fetch profile data for new posts (not edit mode) and only once
    if (isEditMode || hasAutoFilled || !currentUser?.uid) return;

    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const userData = await userService.getUser(currentUser.uid);
        if (userData) {
          setUserProfileData(userData);
        }
      } catch (err) {
        console.error("Error fetching user profile for autofill:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [currentUser?.uid, isEditMode, hasAutoFilled]);

  // ── Autofill handler ────────────────────────────────────────────────────────
  const handleAutofill = () => {
    if (!userProfileData) return;

    const userData = userProfileData;

    // Extract phone number without country code
    let phoneNumber = userData.phoneNumber || "";
    // Remove +94 or 94 prefix if present
    phoneNumber = phoneNumber.replace(/^\+94/, "").replace(/^94/, "");

    // Get province from district/address
    const address = userData.address;
    let province = "";
    let specificCities = "";
    let fullAddress = "";

    if (address) {
      if (typeof address === "string") {
        fullAddress = address;
      } else {
        // Address is an object with street, city, state, postalCode, country
        const district = address.state || "";
        province = getProvinceFromDistrict(district);
        specificCities = address.city || "";
        fullAddress = [
          address.street,
          address.city,
          address.state,
          address.postalCode
        ].filter(Boolean).join(", ");
      }
    }

    // Get service category from availableServices
    const category = userData.availableServices?.[0] || "";

    // Build the autofill data
    const autofillData: Partial<FormType> = {
      ownerName: userData.displayName || userData.firstName || "",
      email: userData.email || "",
      mobile: phoneNumber,
      nic: userData.nic || "",
      ownerAddress: fullAddress,
      category: category,
      location: province,
      specificCities: specificCities
    };

    // Update form with autofill data
    setForm(prev => ({ ...prev, ...autofillData }));
    setHasAutoFilled(true);
  };

  // ── Prefill form when editing ──────────────────────────────────────────────
  useEffect(() => {
    if (!postId) return;

    const loadPost = async () => {
      try {
        setLoadingPost(true);
        const existing = await postService.getPost(postId);
        if (!existing) {
          alert("Post not found.");
          navigate("/my-posts");
          return;
        }

        // Map Firestore Post fields back into FormType
        setForm({
          title:           existing.title         || "",
          category:        existing.category      || "",
          specializations: existing.specializations || "",
          location:        existing.location      || "",
          specificCities:  existing.specificCities || "",
          travelDistance:  existing.travelDistance || "",
          pricingModel:    existing.pricingModel  || "",
          description:     existing.description   || "",
          keywords:        existing.keywords      || "",
          checklist:       existing.checklist     || [],
          clientMaterials: existing.clientMaterials || "No",
          timeFromHour:    existing.timeFromHour  || "07",
          timeFromAmPm:    existing.timeFromAmPm  || "AM",
          timeToHour:      existing.timeToHour    || "07",
          timeToAmPm:      existing.timeToAmPm    || "PM",
          availableDays:   existing.availableDays || [],
          startingPrice:   existing.startingPrice || "",
          inspectionFee:   existing.inspectionFee || "",
          emergency:       existing.emergency     || "No",
          ownerName:       existing.ownerName     || "",
          ownerAddress:    existing.ownerAddress  || "",
          nic:             existing.nic           || "",
          mobile:          existing.mobile        || "",
          email:           existing.email         || "",
          // Images are never stored — keep empty (no Firebase Storage)
          images:          [],
          imagePreviews:   [],
          pdf:             null,
          pdfName:         "",
        });
      } catch (err) {
        console.error("Error loading post for edit:", err);
        alert("Failed to load post data. Please try again.");
        navigate("/my-posts");
      } finally {
        setLoadingPost(false);
      }
    };

    loadPost();
  }, [postId, navigate]);

  // ── Submit: create new OR update+resubmit existing ────────────────────────
  const handleSubmit = async () => {
    if (submitting) return;

    if (!currentUser) {
      alert("You must be logged in.");
      return;
    }

    try {
      setSubmitting(true);

      const postData = {
        title:           form.title,
        category:        form.category,
        specializations: form.specializations  || "",
        location:        form.location,
        specificCities:  form.specificCities   || "",
        travelDistance:  form.travelDistance   || "",
        pricingModel:    form.pricingModel     || "",
        description:     form.description      || "",
        keywords:        form.keywords         || "",
        checklist:       form.checklist,
        clientMaterials: form.clientMaterials,
        timeFromHour:    form.timeFromHour,
        timeFromAmPm:    form.timeFromAmPm,
        timeToHour:      form.timeToHour,
        timeToAmPm:      form.timeToAmPm,
        availableDays:   form.availableDays,
        startingPrice:   form.startingPrice    || "",
        inspectionFee:   form.inspectionFee    || "",
        emergency:       form.emergency,
        ownerName:       form.ownerName,
        ownerAddress:    form.ownerAddress     || "",
        nic:             form.nic              || "",
        mobile:          form.mobile,
        email:           form.email,
        images:          [],  // No Firebase Storage
        pdf:             "",  // No Firebase Storage
        serviceProviderId: currentUser.uid,
      };

      if (isEditMode && postId) {
        // Update existing post and reset to pending for re-approval
        await postService.updatePostAndResubmit(postId, postData);
        alert("Post updated and resubmitted for approval!");
      } else {
        // Brand new post
        await postService.createPost(postData);
        alert("Post submitted successfully! Your post is now pending approval.");
      }

      navigate("/my-posts");
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Failed to submit post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading skeleton while prefilling form ────────────────────────────────
  if (loadingPost) {
    return (
      <div className="relative w-full min-h-screen font-sans flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img src={PostBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-bold text-lg">Loading post data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={PostBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* ── Hero header ── */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="font-rostex text-4xl md:text-[90px] uppercase tracking-wide leading-[1.0]">
            {isEditMode ? (
              <>
                <span className="text-[#FFFFFF]">EDIT YOUR </span>
                <span className="text-[#FF5A00]">POST</span>
              </>
            ) : (
              <>
                <span className="text-[#FFFFFF]">POST YOUR </span>
                <span className="text-[#FFFFFF]">ADD</span>
              </>
            )}
          </h1>
          <p className="text-white/70 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed font-medium">
            {isEditMode
              ? "Update your listing details below. Once submitted, your post will be sent back to the admin for re-approval."
              : "Discover the smarter way to list effortlessly post your boarding rooms, houses, hostels, or luxury apartments on our all in one platform. We bridge the gap between service providers and clients actively searching for help in their area."
            }
          </p>
        </div>

        {/* ── Layout ── */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* LEFT: Step nav */}
          <div className="w-full md:w-52 flex-shrink-0 md:sticky md:top-6">
            <StepNav step={step} setStep={setStep} />
          </div>

          {/* RIGHT: Form card */}
          <div className="flex-1 min-w-0 bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] overflow-hidden">
            {/* Colored top bar */}
            <div
              className="h-1.5 w-full bg-gradient-to-r from-[#0072D1] via-[#0072D1] to-[#FF5A00]"
              style={{
                backgroundSize: `${((step + 1) / 3) * 100}% 100%`,
                backgroundRepeat: "no-repeat"
              }}
            />

            <div className="p-6 md:p-8">
              {step === 0 && (
                <DetailsStep
                  form={form}
                  set={setForm}
                  onNext={() => setStep(1)}
                  isEditMode={isEditMode}
                  onAutofill={handleAutofill}
                  hasProfileData={!!userProfileData}
                  hasAutoFilled={hasAutoFilled}
                />
              )}
              {step === 1 && (
                <GalleryStep
                  form={form}
                  set={setForm}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <FinishStep
                  form={form}
                  setStep={setStep}
                  handleSubmit={handleSubmit}
                  isEditMode={isEditMode}
                  submitting={submitting}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};

export default PostYourAdd;