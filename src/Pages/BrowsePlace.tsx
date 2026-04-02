import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { postService } from "../services/postService";
import ReviewModal from "../Components/ReviewModal";

// ─── Data ────────────────────────────────────────────────────────────────────

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

// ─── Utility helpers ──────────────────────────────────────────────────────────

/** Normalize any value to a trimmed lowercase string */
const norm = (val: unknown): string =>
  String(val ?? "").trim().toLowerCase();

/** Safely parse a price field that may contain currency symbols or commas */
const parsePrice = (val: unknown): number => {
  const cleaned = String(val ?? "").replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// ─── Full Details Modal ───────────────────────────────────────────────────────

const FullDetailsModal = ({
  card,
  onClose,
  onNavigateToProvider
}: {
  card: any;
  onClose: () => void;
  onNavigateToProvider: (serviceProviderId: string) => void;
}) => {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const details = [
    { label: "Post Title", value: card.title || "Not specified" },
    { label: "Service Category", value: card.category || "Not specified" },
    { label: "Specializations", value: card.specializations || "Not specified" },
    { label: "Province / Location", value: card.location || "Not specified" },
    { label: "Specific Cities", value: card.specificCities || "Not specified" },
    { label: "Maximum Travel Distance", value: card.travelDistance || "Not specified" },
    { label: "Pricing Model", value: card.pricingModel || "Not specified" },
    { label: "Description", value: card.description || "Not specified" },
    { label: "Keywords", value: card.keywords || "Not specified" },
    { label: "Included Services Checklist", value: Array.isArray(card.checklist) ? card.checklist.join(", ") : (card.includedServices || "Not specified") },
    { label: "Client-Provided Materials Required", value: card.clientMaterials || "Not specified" },
    { label: "Available Days", value: Array.isArray(card.availableDays) ? card.availableDays.join(", ") : (card.availableDays || "Not specified") },
    { label: "Available Hours", value: card.timeFromHour ? `${card.timeFromHour}:00 ${card.timeFromAmPm} – ${card.timeToHour}:00 ${card.timeToAmPm}` : (card.availableHours || "Not specified") },
    { label: "Starting Price (LKR)", value: card.startingPrice ? `LKR ${Number(card.startingPrice).toLocaleString()}` : "Not specified" },
    { label: "Inspection Fee (LKR)", value: card.inspectionFee ? `LKR ${Number(card.inspectionFee).toLocaleString()}` : "Not specified" },
    { label: "Emergency Availability", value: card.emergency || "Not specified" },
    { label: "Owner Information", value: card.ownerName || "Not specified" },
    { label: "Email Address", value: card.email || "Not specified" },
    { label: "Address", value: card.ownerAddress || "Not specified" },
    { label: "NIC Number", value: card.nic || "Not specified" },
    { label: "Mobile Number", value: card.mobile || "Not specified" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#0072D1]/30 overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto flex-1 p-6 md:p-8">
          <h2 className="font-black text-gray-900 text-xl md:text-2xl leading-tight mb-1 pr-8">
            {card.title}
          </h2>
          <div className="flex items-center gap-1.5 text-gray-400 mb-5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-sm font-medium">{card.location}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="w-full md:w-[52%] flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                {card.images && card.images.length > 0 ? (
                  <>
                    <img
                      src={card.images[activeImg]}
                      alt={card.title}
                      className="w-full h-56 md:h-[360px] object-cover"
                    />
                    {card.images.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                        {card.images.map((_: any, i: number) => (
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
                  </>
                ) : (
                  <div className="w-full h-56 md:h-[360px] flex items-center justify-center">
                    <span className="text-sm text-gray-400">No images uploaded</span>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <List className="w-4 h-4 text-gray-600" />
                  <h3 className="font-black text-gray-800 text-base">Details</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

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

              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-5 mb-4">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    +94 {card.mobile || card.phone || "—"}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {card.email || "—"}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (card.serviceProviderId) {
                        onNavigateToProvider(card.serviceProviderId);
                        onClose();
                      }
                    }}
                    className="text-[#FF5A00] font-bold text-sm hover:text-black transition-colors"
                  >
                    View Service Owner →
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

const ServiceCard = ({
  card,
  onViewDetails
}: {
  card: any;
  onViewDetails: (card: any) => void;
}) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="w-full h-48 md:h-52 overflow-hidden flex-shrink-0">
      <img
        src={card.img}
        alt={card.title}
        className="w-full h-full object-cover"
      />
    </div>

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
          <span className="text-xs font-medium">{card.phone || card.mobile}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs font-medium">{card.email}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => onViewDetails(card)}
          className="relative overflow-hidden flex-1 bg-[#FF5A00] text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all duration-300 hover:bg-black hover:scale-[1.02] group"
        >
          <span className="relative z-10">View Full Details</span>
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>
    </div>
  </div>
);

// ─── Pagination Component ─────────────────────────────────────────────────────

const Pagination = ({
  current,
  total,
  onChange
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) => {
  const getPages = (): (number | "…")[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
    if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {getPages().map((page, idx) =>
        page === "…" ? (
          <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onChange(page as number)}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200
              ${current === page
                ? "bg-[#FF5A00] text-white shadow-md scale-110"
                : "border border-gray-200 text-gray-600 hover:border-[#FF5A00] hover:text-[#FF5A00]"
              }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

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
}: {
  selectedServices: string[];
  toggleService: (service: string) => void;
  priceMin: string;
  setPriceMin: (price: string) => void;
  priceMax: string;
  setPriceMax: (price: string) => void;
  emergencyService: string | null;
  setEmergencyService: (service: string | null) => void;
  selectedProvinces: string[];
  toggleProvince: (province: string) => void;
  selectedDistricts: string[];
  toggleDistrict: (district: string) => void;
  resetFilters: () => void;
  onApply: () => void;
  isDrawer?: boolean;
  onClose?: () => void;
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

    <div className={`${isDrawer ? "flex-1 overflow-y-auto p-5" : ""} space-y-6`}>
      {!isDrawer && (
        <div className="flex items-center gap-2 text-gray-700 mb-1">
          <SlidersHorizontal className="w-4 h-4 text-[#FF5A00]" />
          <span className="font-bold text-sm">Filters</span>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider mb-2 uppercase">
          Price Range (LKR)
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#FFF5F0] rounded border border-[#FFE0D0] px-2 py-1.5 flex-1">
            <span className="text-[#FF5A00] text-[10px] font-bold mr-1">Rs.</span>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Min"
              min={0}
              className="w-full bg-transparent outline-none text-[#FF5A00] text-xs font-semibold placeholder-[#FF5A00]/40"
            />
          </div>
          <div className="flex items-center bg-[#FFF5F0] rounded border border-[#FFE0D0] px-2 py-1.5 flex-1">
            <span className="text-[#FF5A00] text-[10px] font-bold mr-1">Rs.</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max"
              min={0}
              className="w-full bg-transparent outline-none text-[#FF5A00] text-xs font-semibold placeholder-[#FF5A00]/40"
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
                onChange={() => setEmergencyService(emergencyService === opt ? null : opt)}
                className="w-3 h-3 rounded accent-[#FF5A00]"
              />
              <span className="text-xs font-semibold text-[#FF5A00]">{opt}</span>
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
            <label key={i} className="flex items-start gap-2 cursor-pointer group">
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
                  <label key={j} className="flex items-center gap-2 cursor-pointer group">
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
    <div className={`${isDrawer ? "p-5 border-t border-gray-100 flex-shrink-0" : "pt-6"} flex flex-col gap-2`}>
      <button
        onClick={onApply}
        className="relative overflow-hidden w-full bg-[#FF5A00] text-white font-bold py-3 rounded-xl transition-all duration-300 hover:bg-black group shadow-md"
      >
        <span className="relative z-10">Apply Changes</span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>
      <button
        onClick={resetFilters}
        className="relative overflow-hidden w-full bg-[#FF5A00] text-white font-bold py-3 rounded-xl transition-all duration-300 hover:bg-black group shadow-md"
      >
        <span className="relative z-10">Clear Filters</span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6;

const BrowsePlace = () => {
  const navigate = useNavigate();
  // ✅ FIX 1: Use React Router's useLocation() — not window.location
  const routerLocation = useLocation();

  const [citySearch, setCitySearch] = useState("");
  const [debouncedCitySearch, setDebouncedCitySearch] = useState("");
  const citySearchDebounceRef = useRef<number | null>(null);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [emergencyService, setEmergencyService] = useState<string | null>(null);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedServiceProvider, setSelectedServiceProvider] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ✅ FIX 2: routerLocation.search instead of location.search (window.location)
  useEffect(() => {
    const urlParams = new URLSearchParams(routerLocation.search);

    const servicesParam = urlParams.get("services");
    if (servicesParam) {
      const services = servicesParam.split(",").map(s => s.trim()).filter(Boolean);
      setSelectedServices(services);
    }

    const priceMinParam = urlParams.get("priceMin");
    const priceMaxParam = urlParams.get("priceMax");
    if (priceMinParam) setPriceMin(priceMinParam);
    if (priceMaxParam) setPriceMax(priceMaxParam);

    const emergencyParam = urlParams.get("emergency");
    if (emergencyParam) setEmergencyService(emergencyParam);

    const qParam = urlParams.get("q") || "";
    const citiesParam = urlParams.get("cities");
    const provincesParam = urlParams.get("provinces");

    if (qParam) {
      setCitySearch(qParam);
    }

    if (citiesParam) {
      const cities = citiesParam.split(",").map(c => c.trim()).filter(Boolean);
      setSelectedDistricts(cities);
    } else if (provincesParam) {
      const provinces = provincesParam.split(",").map(p => p.trim()).filter(Boolean);
      setSelectedProvinces(provinces);
    }
  }, [routerLocation.search]);

  // ── Fetch approved posts ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const approvedPosts = await postService.getPostsByStatus("approved", 100);
        setPosts(approvedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ── Close service dropdown on outside click ──────────────────────────────────
  useEffect(() => {
    if (!isServiceOpen) return;
    const handler = (e: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setIsServiceOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isServiceOpen]);

  // ── Debounce city search input ───────────────────────────────────────────────
  useEffect(() => {
    if (citySearchDebounceRef.current) clearTimeout(citySearchDebounceRef.current);
    
    citySearchDebounceRef.current = window.setTimeout(() => {
      setDebouncedCitySearch(citySearch);
      setCurrentPage(1);
    }, 300);

    return () => {
      if (citySearchDebounceRef.current) clearTimeout(citySearchDebounceRef.current);
    };
  }, [citySearch]);

  // ── Reset to page 1 on any filter change ────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedCitySearch, selectedServices, priceMin, priceMax, emergencyService, selectedDistricts, selectedProvinces]);

  // ── Pre-compute province → cities map ───────────────────────────────────────
  const provinceCitiesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    locationData.forEach((loc) => { map[loc.province] = loc.cities; });
    return map;
  }, []);

  // ✅ FIX 3: Completely rewritten robust filter logic
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {

      // ── 1. Keyword / city search ────────────────────────────────────────────
      // Searches across location, specificCities, title, description, keywords, category
      if (debouncedCitySearch.trim()) {
        const q = norm(debouncedCitySearch);
        const matchesSearch =
          norm(post.location).includes(q) ||
          norm(post.specificCities).includes(q) ||
          norm(post.title).includes(q) ||
          norm(post.description).includes(q) ||
          norm(post.keywords).includes(q) ||
          norm(post.category).includes(q);
        if (!matchesSearch) return false;
      }

      // ── 2. Service type filter ──────────────────────────────────────────────
      // ✅ FIX: norm() for case/trim-safe comparison; also checks specializations
      //         and keywords as fallbacks so partial/alternate naming still matches
      if (selectedServices.length > 0) {
        const postCategory = norm(post.category);
        const postSpecializations = norm(post.specializations);
        const postKeywords = norm(post.keywords);

        const hasMatch = selectedServices.some((s) => {
          const sNorm = norm(s);
          return (
            postCategory === sNorm ||
            postCategory.includes(sNorm) ||
            postSpecializations.includes(sNorm) ||
            postKeywords.includes(sNorm)
          );
        });
        if (!hasMatch) return false;
      }

      // ── 3. Price filter ─────────────────────────────────────────────────────
      // ✅ FIX: parsePrice handles "LKR 5,000" and similar formats correctly
      if (priceMin !== "" || priceMax !== "") {
        const price = parsePrice(post.startingPrice);
        const min = priceMin !== "" ? parseFloat(priceMin) : null;
        const max = priceMax !== "" ? parseFloat(priceMax) : null;
        if (min !== null && !isNaN(min) && price < min) return false;
        if (max !== null && !isNaN(max) && price > max) return false;
      }

      // ── 4. Emergency filter ─────────────────────────────────────────────────
      // ✅ FIX: norm() handles "yes"/"Yes"/"YES" variations in stored data
      if (emergencyService) {
        if (norm(post.emergency) !== norm(emergencyService)) return false;
      }

      // ── 5. Location filter (districts + provinces) ──────────────────────────
      // ✅ FIX: Districts and provinces are ADDITIVE (OR logic).
      //         Province selection expands to ALL its cities automatically.
      //         Both filters work together — district list takes precedence
      //         but provinces also independently match their cities.
      const hasDistrictFilter = selectedDistricts.length > 0;
      const hasProvinceFilter = selectedProvinces.length > 0;

      if (hasDistrictFilter || hasProvinceFilter) {
        // Build a flat set of all acceptable location names
        const locationTargets = new Set<string>();

        if (hasDistrictFilter) {
          selectedDistricts.forEach((d) => locationTargets.add(norm(d)));
        }

        if (hasProvinceFilter) {
          selectedProvinces.forEach((province) => {
            // Allow matching the province name itself
            locationTargets.add(norm(province));
            // Expand province to all its cities
            const cities = provinceCitiesMap[province] ?? [];
            cities.forEach((city) => locationTargets.add(norm(city)));
          });
        }

        const targets = Array.from(locationTargets);

        // Check post's location fields against all targets
        const postLocation = norm(post.location);
        const postCities = norm(post.specificCities);
        const postAddress = norm(post.ownerAddress);

        const locationMatched = targets.some(
          (t) =>
            postLocation.includes(t) ||
            postCities.includes(t) ||
            postAddress.includes(t)
        );

        if (!locationMatched) return false;
      }

      return true;
    });
  }, [
    posts,
    debouncedCitySearch,
    selectedServices,
    priceMin,
    priceMax,
    emergencyService,
    selectedDistricts,
    selectedProvinces,
    provinceCitiesMap
  ]);

  // ── Pagination ───────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const toggleService = useCallback((s: string) =>
    setSelectedServices((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])
  , []);

  const toggleProvince = useCallback((p: string) =>
    setSelectedProvinces((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  , []);

  const toggleDistrict = useCallback((d: string) =>
    setSelectedDistricts((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  , []);

  const resetFilters = useCallback(() => {
    setSelectedServices([]);
    setPriceMin("");
    setPriceMax("");
    setEmergencyService(null);
    setSelectedProvinces([]);
    setSelectedDistricts([]);
    setCitySearch("");
  }, []);

  const serviceLabel =
    selectedServices.length === 0
      ? "Any Service Type"
      : selectedServices.length === 1
      ? selectedServices[0]
      : `${selectedServices.length} Selected`;

  const filterProps = {
    selectedServices, toggleService,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    emergencyService, setEmergencyService,
    selectedProvinces, toggleProvince,
    selectedDistricts, toggleDistrict,
    resetFilters,
    onApply: () => setIsFilterOpen(false),
    onClose: () => setIsFilterOpen(false)
  };

  const normalizeCard = (post: any) => ({
    ...post,
    img: post.images?.[0] || SampleImg,
    images: post.images && post.images.length > 0 ? post.images : [SampleImg]
  });

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
                placeholder="Search by city, area, or service title…"
                className="w-full bg-transparent outline-none text-gray-700 text-sm placeholder-gray-400 font-medium"
              />
              {citySearch && (
                <button onClick={() => setCitySearch("")} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
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
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search city or service…"
                  className="w-full bg-transparent outline-none text-gray-700 text-sm placeholder-gray-400"
                />
                {citySearch && (
                  <button onClick={() => setCitySearch("")}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
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
                <span className="text-sm font-medium">{serviceLabel}</span>
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
          {!loading && (
            <p className="text-xs text-gray-400 font-medium mb-4">
              {filteredPosts.length === 0
                ? "No results"
                : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredPosts.length
                  )} of ${filteredPosts.length} service${filteredPosts.length !== 1 ? "s" : ""}`}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5A00]"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-bold text-gray-700 mb-1">No services found</p>
              <p className="text-sm text-gray-400 mb-5">
                Try adjusting your filters or search term
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2 bg-[#FF5A00] text-white font-bold text-sm rounded-xl hover:bg-black transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-2 gap-5">
                {paginatedPosts.map((post) => (
                  <ServiceCard
                    key={post.id}
                    card={normalizeCard(post)}
                    onViewDetails={setSelectedCard}
                  />
                ))}
              </div>
              <div className="md:hidden flex flex-col gap-5">
                {paginatedPosts.map((post) => (
                  <ServiceCard
                    key={post.id}
                    card={normalizeCard(post)}
                    onViewDetails={setSelectedCard}
                  />
                ))}
              </div>
              <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
            </>
          )}
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
          onNavigateToProvider={(id) => navigate(`/public-profile/${id}`)}
        />
      )}

      {/* ── Review Modal ── */}
      {reviewModalOpen && selectedServiceProvider && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedServiceProvider(null);
          }}
          serviceProviderId={selectedServiceProvider.id}
          serviceProviderName={selectedServiceProvider.name}
        />
      )}
    </div>
  );
};

export default BrowsePlace;