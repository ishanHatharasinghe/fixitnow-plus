import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  List
} from "lucide-react";

import SampleImg from "../assets/About Section/img1.webp";

// ─── Data (same as HomePage) ─────────────────────────────────────────────────

const servicesList = [
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

const locationData = [
  {
    province: "Western Province",
    cities: [
      "Colombo",
      "Sri Jayawardenepura Kotte",
      "Negombo",
      "Dehiwala-Mount Lavinia",
      "Moratuwa",
      "Wattala",
      "Gampaha"
    ]
  },
  { province: "Central Province", cities: ["Kandy", "Nuwara Eliya", "Matale"] },
  { province: "Southern Province", cities: ["Galle", "Matara", "Hambantota"] },
  {
    province: "Eastern Province",
    cities: ["Trincomalee", "Batticaloa", "Ampara", "Kalmunai"]
  },
  { province: "North Western Province", cities: ["Kurunegala", "Puttalam"] },
  {
    province: "North Central Province",
    cities: ["Anuradhapura", "Polonnaruwa"]
  },
  { province: "Uva Province", cities: ["Badulla", "Monaragala"] },
  { province: "Sabaragamuwa Province", cities: ["Rathnapura", "Kegalle"] },
  {
    province: "Northern Province",
    cities: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"]
  }
];

// ─── Sample service cards data ────────────────────────────────────────────────

const sampleCards = Array(6)
  .fill(null)
  .map((_, i) => ({
    id: i + 1,
    title: "Expert House Plumber – Fast Leak Repairs",
    location: "Location",
    description:
      "Professional plumber with 10 years of experience. Specializing in home plumbing, leak repairs, PVC pipe installations, and water pump setups.",
    phone: "+94 703215789",
    email: "sample@gmail.com",
    img: SampleImg,
    // Full detail fields (matching the screenshot)
    includedServices:
      "Tap repairs, drain cleaning, water tank installation, pipe routing, commode fitting",
    clientMaterials: "Yes",
    pricingModel: "Upon Inspection",
    startingPrice: "LKR 1,500",
    inspectionFee: "LKR 1,000",
    specificCities: "Moratuwa, Panadura, Ratmalana",
    travelDistance: "15 km",
    availableDays:
      "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
    availableHours: "07:00 AM – 07:00 PM",
    emergency: "Yes",
    // Multiple images for carousel
    images: [SampleImg, SampleImg, SampleImg, SampleImg, SampleImg]
  }));

// ─── Full Details Modal ───────────────────────────────────────────────────────

const FullDetailsModal = ({ card, onClose }) => {
  const [activeImg, setActiveImg] = useState(0);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const details = [
    { label: "Included Services Checklist", value: card.includedServices },
    {
      label: "Requirement of Client Provided Materials",
      value: card.clientMaterials
    },
    { label: "Pricing Model", value: card.pricingModel },
    { label: "Starting Price", value: card.startingPrice },
    { label: "Inspection Fee", value: card.inspectionFee },
    { label: "Specific Cities", value: card.specificCities },
    { label: "Maximum Travel Distance", value: card.travelDistance },
    { label: "Available Days", value: card.availableDays },
    { label: "Available Hours", value: card.availableHours },
    { label: "Emergency Availability", value: card.emergency }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card — matches the screenshot layout */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#0072D1]/30 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6 md:p-8">
          {/* Title + location */}
          <h2 className="font-black text-gray-900 text-xl md:text-2xl leading-tight mb-1 pr-8">
            {card.title}
          </h2>
          <div className="flex items-center gap-1.5 text-gray-400 mb-5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-sm font-medium">{card.location}</span>
          </div>

          {/* Main content: image left + details right (desktop) / stacked (mobile) */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* LEFT: Image carousel */}
            <div className="w-full md:w-[52%] flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={card.images[activeImg]}
                  alt={card.title}
                  className="w-full h-56 md:h-[360px] object-cover"
                />
                {/* Dot indicators */}
                {card.images.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    {card.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`rounded-full transition-all duration-200 ${
                          i === activeImg
                            ? "bg-[#0072D1] w-5 h-2.5"
                            : "bg-gray-400/70 w-2.5 h-2.5 hover:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Details section below image */}
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <List className="w-4 h-4 text-gray-600" />
                  <h3 className="font-black text-gray-800 text-base">
                    Details
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            {/* RIGHT: Info list */}
            <div className="flex-1 min-w-0">
              <div className="space-y-3">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <p className="text-sm text-gray-900 leading-snug">
                      <span className="font-black">{label}: </span>
                      <span className="font-normal text-gray-700">{value}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact + View Service Owner */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-5 mb-4">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {card.phone}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {card.email}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button className="text-[#FF5A00] font-bold text-sm hover:text-black transition-colors">
                    View Service Owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Service Card Component ───────────────────────────────────────────────────

const ServiceCard = ({ card, onViewDetails }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    {/* Image */}
    <div className="w-full h-48 md:h-52 overflow-hidden flex-shrink-0">
      <img
        src={card.img}
        alt={card.title}
        className="w-full h-full object-cover"
      />
    </div>

    {/* Content */}
    <div className="p-4 flex flex-col gap-2 flex-1">
      <div className="flex items-center gap-1 text-gray-400">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="text-xs">{card.location}</span>
      </div>
      <h3 className="font-bold text-gray-900 text-base leading-snug">
        {card.title}
      </h3>
      <p className="text-gray-500 text-xs leading-relaxed flex-1">
        {card.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
        <div className="flex items-center gap-1 text-gray-600">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs font-medium">{card.phone}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs font-medium">{card.email}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        {/* ── Only change: onClick opens modal ── */}
        <button
          onClick={() => onViewDetails(card)}
          className="relative overflow-hidden flex-1 bg-[#FF5A00] text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all duration-300 hover:bg-black hover:scale-[1.02] group"
        >
          <span className="relative z-10">View Full Details</span>
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
        <button className="text-[#FF5A00] font-bold text-xs hover:text-black transition-colors whitespace-nowrap">
          View Service Owner
        </button>
      </div>
    </div>
  </div>
);

// ─── Pagination Component ─────────────────────────────────────────────────────

const Pagination = ({ current, total, onChange }) => (
  <div className="flex items-center justify-center gap-2 mt-8">
    <button
      onClick={() => onChange(Math.max(1, current - 1))}
      disabled={current === 1}
      className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
    {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        onClick={() => onChange(page)}
        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200
          ${
            current === page
              ? "bg-[#FF5A00] text-white shadow-md scale-110"
              : "border border-gray-200 text-gray-600 hover:border-[#FF5A00] hover:text-[#FF5A00]"
          }`}
      >
        {page}
      </button>
    ))}
    <button
      onClick={() => onChange(Math.min(total, current + 1))}
      disabled={current === total}
      className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

// ─── Sidebar Filters Component ────────────────────────────────────────────────

const SidebarFilters = ({
  selectedServices,
  toggleService,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  emergencyService,
  setEmergencyService,
  selectedProvinces,
  toggleProvince,
  selectedDistricts,
  toggleDistrict,
  resetFilters,
  onApply,
  isDrawer = false,
  onClose
}) => (
  <div className={`flex flex-col ${isDrawer ? "h-full" : ""}`}>
    {isDrawer && (
      <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 text-gray-800">
          <SlidersHorizontal className="w-5 h-5 text-[#FF5A00]" />
          <h2 className="font-bold text-lg">Filters</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-blue-400 hover:bg-blue-50 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    )}

    <div
      className={`${isDrawer ? "flex-1 overflow-y-auto p-5" : ""} space-y-6`}
    >
      {!isDrawer && (
        <div className="flex items-center gap-2 text-gray-700 mb-1">
          <SlidersHorizontal className="w-4 h-4 text-[#FF5A00]" />
          <span className="font-bold text-sm">Filters</span>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider mb-2 uppercase">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#FFF5F0] rounded border border-[#FFE0D0] px-2 py-1.5 flex-1">
            <span className="text-[#FF5A00] text-[10px] font-bold mr-1">
              Rs.
            </span>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full bg-transparent outline-none text-[#FF5A00] text-xs font-semibold"
            />
          </div>
          <div className="flex items-center bg-[#FFF5F0] rounded border border-[#FFE0D0] px-2 py-1.5 flex-1">
            <span className="text-[#FF5A00] text-[10px] font-bold mr-1">
              Rs.
            </span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full bg-transparent outline-none text-[#FF5A00] text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Emergency Service */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider mb-2 uppercase">
          Emergency Service Needed
        </h3>
        <div className="flex items-center gap-3">
          {["Yes", "No"].map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-1.5 cursor-pointer bg-[#FFF5F0] px-3 py-1 rounded border border-[#FFE0D0]"
            >
              <input
                type="checkbox"
                checked={emergencyService === opt}
                onChange={() =>
                  setEmergencyService(emergencyService === opt ? null : opt)
                }
                className="w-3 h-3 rounded accent-[#FF5A00]"
              />
              <span className="text-xs font-semibold text-[#FF5A00]">
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Service Type */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider mb-2 uppercase">
          Service Type
        </h3>
        <div className="flex flex-col gap-2">
          {servicesList.map((service, i) => (
            <label
              key={i}
              className="flex items-start gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedServices.includes(service)}
                onChange={() => toggleService(service)}
                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 accent-[#FF5A00] flex-shrink-0"
              />
              <span className="text-xs text-[#2C3E50] font-medium group-hover:text-[#FF5A00] transition-colors leading-snug">
                {service}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider mb-2 uppercase">
          Location
        </h3>
        <div className="flex flex-col gap-4">
          {locationData.map((loc, i) => (
            <div key={i}>
              <label className="flex items-start gap-2 cursor-pointer group mb-1">
                <input
                  type="checkbox"
                  checked={selectedProvinces.includes(loc.province)}
                  onChange={() => toggleProvince(loc.province)}
                  className="mt-0.5 w-3.5 h-3.5 rounded accent-[#FF5A00] flex-shrink-0"
                />
                <span className="text-xs text-[#2C3E50] font-bold group-hover:text-[#FF5A00] transition-colors">
                  {loc.province}
                </span>
              </label>
              <div className="pl-5 flex flex-col gap-1">
                {loc.cities.map((city, j) => (
                  <label
                    key={j}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDistricts.includes(city)}
                      onChange={() => toggleDistrict(city)}
                      className="w-3 h-3 rounded accent-[#FF5A00]"
                    />
                    <span className="text-[11px] text-gray-500 font-medium group-hover:text-[#FF5A00] transition-colors">
                      • {city}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Footer */}
    <div
      className={`${
        isDrawer ? "p-5 border-t border-gray-100 flex-shrink-0" : "pt-6"
      } flex flex-col gap-2`}
    >
      <button
        onClick={onApply}
        className="relative overflow-hidden w-full bg-[#FF5A00] text-white font-bold py-3 rounded-xl transition-all duration-300 hover:bg-black group shadow-md"
      >
        <span className="relative z-10">Apply Changes</span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>
      <button
        onClick={resetFilters}
        className="w-full text-[#FF5A00] font-bold text-sm py-1.5 hover:text-black transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  </div>
);

// ─── Main BrowsePlace Component ───────────────────────────────────────────────

const BrowsePlace = () => {
  const [citySearch, setCitySearch] = useState("");
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const serviceDropdownRef = useRef(null);
  const [selectedServices, setSelectedServices] = useState(["Plumbing"]);
  const [priceMin, setPriceMin] = useState("1500");
  const [priceMax, setPriceMax] = useState("100000");
  const [emergencyService, setEmergencyService] = useState(null);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  // ── NEW: modal state ──
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (!isServiceOpen) return;
    const handler = (e) => {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(e.target)
      )
        setIsServiceOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isServiceOpen]);

  const toggleService = (s) =>
    setSelectedServices((p) =>
      p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
    );
  const toggleProvince = (p) =>
    setSelectedProvinces((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  const toggleDistrict = (d) =>
    setSelectedDistricts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const resetFilters = () => {
    setSelectedServices([]);
    setPriceMin("1500");
    setPriceMax("100000");
    setEmergencyService(null);
    setSelectedProvinces([]);
    setSelectedDistricts([]);
  };

  const serviceLabel =
    selectedServices.length === 0
      ? "Any Property Type"
      : selectedServices.length === 1
      ? selectedServices[0]
      : `${selectedServices.length} Selected`;

  const filterProps = {
    selectedServices,
    toggleService,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    emergencyService,
    setEmergencyService,
    selectedProvinces,
    toggleProvince,
    selectedDistricts,
    toggleDistrict,
    resetFilters,
    onApply: () => setIsFilterOpen(false),
    onClose: () => setIsFilterOpen(false)
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans">
      {/* ── Page Title ── */}
      <div className="w-full bg-white pt-8 pb-6 px-4 md:px-8 text-center">
        <h1 className="font-rostex text-3xl md:text-[80px] uppercase tracking-wide leading-tight">
          <span className="text-[#0072D1]">BROWSE</span>
          <span className="text-[#FF5A00]">PLACE</span>
        </h1>
      </div>

      {/* ── Search Bar ── */}
      <div className="w-full bg-white border-b border-gray-100 px-4 md:px-8 pb-5">
        <div className="max-w-[1200px] mx-auto">
          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 h-14 shadow-sm">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Enter city, neighborhood"
                className="w-full bg-transparent outline-none text-gray-700 text-sm placeholder-gray-400 font-medium"
              />
            </div>
            <button className="relative overflow-hidden flex items-center justify-center gap-2 px-8 h-14 rounded-2xl bg-[#0072D1] text-white font-bold text-sm shadow-lg transition-all duration-300 hover:bg-black hover:scale-105 group flex-shrink-0">
              <Search className="w-5 h-5 relative z-10" strokeWidth={2.5} />
              <span className="relative z-10">Find</span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-12 shadow-sm">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter city, neighborhood"
                  className="w-full bg-transparent outline-none text-gray-700 text-sm placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 h-12 shadow-sm text-gray-600 hover:text-[#0072D1] transition-colors flex-shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 h-12 shadow-sm text-gray-500 cursor-pointer">
                <span className="text-sm font-medium">Any Property Type</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <button className="relative overflow-hidden flex items-center justify-center gap-2 px-5 h-12 rounded-xl bg-[#0072D1] text-white font-bold text-sm shadow-lg transition-all duration-300 hover:bg-black group flex-shrink-0">
                <Search className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                <span className="relative z-10">Find</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-2 py-8 flex gap-2 items-start">
        {/* Sidebar */}
        <aside className="hidden md:block w-[220px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
          <SidebarFilters {...filterProps} isDrawer={false} />
        </aside>

        {/* Cards */}
        <div className="flex-1 min-w-0">
          <div className="hidden md:grid grid-cols-2 gap-5">
            {sampleCards.map((card) => (
              <ServiceCard
                key={card.id}
                card={card}
                onViewDetails={setSelectedCard}
              />
            ))}
          </div>
          <div className="md:hidden flex flex-col gap-5">
            {sampleCards.map((card) => (
              <ServiceCard
                key={card.id}
                card={card}
                onViewDetails={setSelectedCard}
              />
            ))}
          </div>
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="relative w-full max-w-[360px] bg-white h-full flex flex-col shadow-2xl overflow-hidden">
            <SidebarFilters {...filterProps} isDrawer={true} />
          </div>
        </div>
      )}

      {/* ── Full Details Modal ── */}
      {selectedCard && (
        <FullDetailsModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};

export default BrowsePlace;
