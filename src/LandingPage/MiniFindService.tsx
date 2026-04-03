import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Plus,
  Minus,
  X
} from "lucide-react";

import bg from "../assets/Backgrounds/MiniFindServices.webp";

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
  {
    province: "Eastern Province",
    cities: ["Trincomalee", "Batticaloa", "Ampara", "Kalmunai"]
  },
  {
    province: "Northern Province",
    cities: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"]
  },
  { province: "Central Province", cities: ["Kandy", "Nuwara Eliya", "Matale"] },
  { province: "North Western Province", cities: ["Kurunegala", "Puttalam"] },
  {
    province: "North Central Province",
    cities: ["Anuradhapura", "Polonnaruwa"]
  },
  { province: "Southern Province", cities: ["Galle", "Matara", "Hambantota"] },
  { province: "Uva Province", cities: ["Badulla", "Monaragala"] },
  { province: "Sabaragamuwa Province", cities: ["Rathnapura", "Kegalle"] }
];

// ─── Map helpers ─────────────────────────────────────────────────────────────

const provinceBBox = {
  "Western Province": "79.7,6.7,80.2,7.4",
  "Eastern Province": "81.0,6.8,81.9,9.0",
  "Northern Province": "79.6,8.5,80.8,9.9",
  "Central Province": "80.3,6.9,81.1,7.7",
  "North Western Province": "79.7,7.4,80.4,8.5",
  "North Central Province": "80.2,7.9,81.1,9.0",
  "Southern Province": "80.0,5.9,81.2,6.5",
  "Uva Province": "80.7,6.5,81.5,7.4",
  "Sabaragamuwa Province": "80.0,6.4,80.8,7.1"
};

const cityCoords = {
  Colombo: { lat: 6.9271, lon: 79.8612 },
  "Sri Jayawardenepura Kotte": { lat: 6.8935, lon: 79.9016 },
  Negombo: { lat: 7.2094, lon: 79.8358 },
  "Dehiwala-Mount Lavinia": { lat: 6.8389, lon: 79.8653 },
  Moratuwa: { lat: 6.7726, lon: 79.8814 },
  Wattala: { lat: 6.9896, lon: 79.8918 },
  Gampaha: { lat: 7.0917, lon: 80.0 },
  Trincomalee: { lat: 8.5874, lon: 81.2152 },
  Batticaloa: { lat: 7.717, lon: 81.6924 },
  Ampara: { lat: 7.2978, lon: 81.6724 },
  Kalmunai: { lat: 7.4, lon: 81.8167 },
  Jaffna: { lat: 9.6615, lon: 80.0255 },
  Kilinochchi: { lat: 9.3803, lon: 80.3774 },
  Mannar: { lat: 8.981, lon: 79.9044 },
  Vavuniya: { lat: 8.7514, lon: 80.4971 },
  Mullaitivu: { lat: 9.2671, lon: 80.8128 },
  Kandy: { lat: 7.2906, lon: 80.6337 },
  "Nuwara Eliya": { lat: 6.9497, lon: 80.7891 },
  Matale: { lat: 7.4675, lon: 80.6234 },
  Kurunegala: { lat: 7.4867, lon: 80.3647 },
  Puttalam: { lat: 8.0362, lon: 79.8283 },
  Anuradhapura: { lat: 8.3114, lon: 80.4037 },
  Polonnaruwa: { lat: 7.9403, lon: 81.0188 },
  Galle: { lat: 6.0535, lon: 80.221 },
  Matara: { lat: 5.9549, lon: 80.555 },
  Hambantota: { lat: 6.1241, lon: 81.1185 },
  Badulla: { lat: 6.9934, lon: 81.055 },
  Monaragala: { lat: 6.8728, lon: 81.3507 },
  Rathnapura: { lat: 6.6828, lon: 80.3992 },
  Kegalle: { lat: 7.2513, lon: 80.3464 }
};

const DEFAULT_MAP_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=79.5,5.8,82.0,10.0&layer=mapnik";

const buildProvinceUrl = (province: string) => {
  const bbox = provinceBBox[province as keyof typeof provinceBBox];
  return bbox
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`
    : DEFAULT_MAP_URL;
};

const buildCityUrl = (city: string) => {
  const c = cityCoords[city as keyof typeof cityCoords];
  if (!c) return DEFAULT_MAP_URL;
  const d = 0.05;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${c.lon - d},${
    c.lat - d
  },${c.lon + d},${c.lat + d}&layer=mapnik&marker=${c.lat},${c.lon}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

const ChooseCity = () => {
  const navigate = useNavigate();
  // Map
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState(DEFAULT_MAP_URL);
  const [mapKey, setMapKey] = useState(0);

  // Mobile accordion
  const [expandedProvinces, setExpandedProvinces] = useState<string[]>([]);

  // Search bar
  const [citySearch, setCitySearch] = useState("");
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  // Filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceMin, setPriceMin] = useState("1500");
  const [priceMax, setPriceMax] = useState("100000");
  const [emergencyService, setEmergencyService] = useState<string | null>(null);
  const [filterProvinces, setFilterProvinces] = useState<string[]>([]);
  const [filterDistricts, setFilterDistricts] = useState<string[]>([]);

  // ── Navigation with filters ──
  const navigateToBrowsePlace = () => {
    const params = new URLSearchParams();
    
    // Add selected services
    if (selectedServices.length > 0) {
      params.set("services", selectedServices.join(","));
    }
    
    // Combine map-selected locations with filter drawer locations
    const allCities = [...new Set([
      ...(selectedCity ? [selectedCity] : []),
      ...filterDistricts
    ])];
    const allProvinces = [...new Set([
      ...(selectedProvince ? [selectedProvince] : []),
      ...filterProvinces
    ])];
    
    // Add ALL locations - both cities and provinces can be sent together
    // The BrowsePlace component will handle both
    if (allCities.length > 0) {
      params.set("cities", allCities.join(","));
    }
    if (allProvinces.length > 0) {
      params.set("provinces", allProvinces.join(","));
    }
    
    // Add filter drawer values
    if (priceMin !== "1500") {
      params.set("priceMin", priceMin);
    }
    if (priceMax !== "100000") {
      params.set("priceMax", priceMax);
    }
    if (emergencyService) {
      params.set("emergency", emergencyService);
    }
    
    // Navigate to BrowsePlace with filters
    navigate(`/browseplace?${params.toString()}`);
  };

  // ── Close service dropdown on outside click ──
  useEffect(() => {
    if (!isServiceOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(e.target as Node)
      ) {
        setIsServiceOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isServiceOpen]);

  // ── Map helpers ──
  const updateMap = (url: string) => {
    setMapUrl(url);
    setMapKey((k) => k + 1);
  };

  const handleProvinceMapCheck = (loc: any) => {
    if (selectedProvince === loc.province && !selectedCity) {
      setSelectedProvince(null);
      setSelectedCity(null);
      updateMap(DEFAULT_MAP_URL);
    }
    else {
      setSelectedProvince(loc.province);
      setSelectedCity(null);
      updateMap(buildProvinceUrl(loc.province));
    }
  };

  const handleCityMapCheck = (loc: any, city: string) => {
    if (selectedCity === city) {
      setSelectedCity(null);
      setSelectedProvince(loc.province);
      updateMap(buildProvinceUrl(loc.province));
    }
    else {
      setSelectedProvince(loc.province);
      setSelectedCity(city);
      updateMap(buildCityUrl(city));
    }
  };

  const clearMapSelection = () => {
    setSelectedProvince(null);
    setSelectedCity(null);
    updateMap(DEFAULT_MAP_URL);
  };

  // ── Toggles ──
  const toggleAccordion = (p: string) =>
    setExpandedProvinces((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  const toggleService = (s: string) =>
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  const toggleFilterProvince = (p: string) =>
    setFilterProvinces((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  const toggleFilterDistrict = (d: string) =>
    setFilterDistricts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const resetFilters = () => {
    setSelectedServices([]);
    setPriceMin("1500");
    setPriceMax("100000");
    setEmergencyService(null);
    setFilterProvinces([]);
    setFilterDistricts([]);
  };

  const serviceLabel =
    selectedServices.length === 0
      ? "Service Type"
      : selectedServices.length === 1
      ? selectedServices[0]
      : `${selectedServices.length} Selected`;

  // ── Custom checkbox ──
  const Checkbox = ({
    checked,
    color = "#FF5A00",
    size = "w-4 h-4"
  }: {
    checked: boolean;
    color?: string;
    size?: string;
  }) => (
    <div
      className={`${size} rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 cursor-pointer`}
      style={
        checked
          ? { background: color, borderColor: color }
          : { borderColor: "#9CA3AF" }
      }
    >
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
          <path
            d="M1.5 5L4 7.5L8.5 2.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center font-sans py-16 px-4 md:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={bg} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[1200px] flex flex-col items-center">
        {/* Title */}
        <h2 className="font-rostex text-4xl md:text-[70px] uppercase tracking-widest leading-[1.1] text-white text-center mb-8 md:mb-12">
          CHOOSE A CITY
          <br />
          YOU WANT
        </h2>

        {/* ── Search Bar ── */}
        {/* KEY FIX: overflow-visible so dropdown isn't clipped, and high z-index on the row */}
        <div className="relative z-30 w-full flex flex-wrap md:flex-nowrap items-center gap-3 mb-8 md:mb-12">
          {/* City input */}
          <div className="flex-1 min-w-[180px] flex items-center gap-2 bg-white rounded-xl md:rounded-2xl px-4 h-14 md:h-16 shadow-lg">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Enter city, neighborhood"
              className="w-full bg-transparent border-none outline-none text-gray-700 text-sm md:text-base placeholder-gray-400 font-medium"
            />
          </div>

          {/* Service Type dropdown — KEY FIX: isolated ref + fixed-position panel */}
          <div
            ref={serviceDropdownRef}
            className="relative flex-1 min-w-[160px]"
          >
            <button
              type="button"
              onClick={() => setIsServiceOpen((o) => !o)}
              className="w-full flex items-center justify-between bg-white rounded-xl md:rounded-2xl px-4 h-14 md:h-16 shadow-lg cursor-pointer text-gray-600 hover:text-gray-800 transition-colors select-none"
            >
              <span className="text-sm md:text-base font-medium truncate pr-2">
                {serviceLabel}
              </span>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                  isServiceOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown panel — fixed width, overflow scroll, won't push layout */}
            {isServiceOpen && (
              <div
                className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999]"
                style={{ maxHeight: "320px", overflowY: "auto" }}
              >
                <div className="sticky top-0 bg-white px-4 pt-4 pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                    Service Type
                  </h3>
                </div>
                <div className="flex flex-col gap-3 p-4">
                  {servicesList.map((service, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#FF5A00] cursor-pointer flex-shrink-0"
                      />
                      <span className="text-sm text-[#2C3E50] font-medium group-hover:text-[#FF5A00] transition-colors leading-snug">
                        {service}
                      </span>
                    </label>
                  ))}
                </div>
                {/* Close button inside dropdown */}
                <div className="sticky bottom-0 bg-white px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={() => setIsServiceOpen(false)}
                    className="w-full text-xs font-bold text-gray-400 hover:text-[#FF5A00] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filters button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center gap-2 bg-white text-gray-500 rounded-xl md:rounded-2xl px-4 md:px-6 h-14 md:h-16 shadow-lg hover:text-[#0072D1] transition-colors flex-shrink-0"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-sm md:text-base font-medium">Filters</span>
          </button>

          {/* Find button */}
          <button 
            onClick={navigateToBrowsePlace}
            className="relative overflow-hidden flex items-center justify-center gap-2 px-8 md:px-10 h-14 md:h-16 rounded-xl md:rounded-2xl bg-[#FF5A00] text-white font-bold text-sm md:text-lg shadow-lg transition-all duration-300 hover:bg-black hover:scale-105 group flex-shrink-0"
          >
            <Search
              className="w-5 h-5 md:w-6 md:h-6 relative z-10"
              strokeWidth={2.5}
            />
            <span className="relative z-10">Find</span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>

        {/* ── Map & List ── */}
        <div className="w-full flex flex-col-reverse md:flex-row items-stretch gap-6 md:gap-8">
          {/* LEFT: OSM Map */}
          <div className="w-full md:w-[45%] lg:w-[40%] rounded-3xl overflow-hidden border-4 border-[#0072D1] shadow-2xl flex-shrink-0 relative min-h-[400px] bg-gray-200">
            <iframe
              key={mapKey}
              title="OpenStreetMap"
              src={mapUrl}
              width="100%"
              height="100%"
              className="w-full h-full min-h-[400px] md:min-h-full border-0"
              allowFullScreen
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 text-[10px] text-gray-500 text-center py-0.5 pointer-events-none">
              ©{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                className="underline pointer-events-auto"
                target="_blank"
                rel="noreferrer"
              >
                OpenStreetMap
              </a>{" "}
              contributors
            </div>
            {(selectedCity || selectedProvince) && (
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                <span className="text-xs font-bold text-gray-700 truncate">
                  📍{" "}
                  {selectedCity
                    ? `${selectedCity}, ${selectedProvince}`
                    : selectedProvince}
                </span>
                <button
                  onClick={clearMapSelection}
                  className="ml-2 text-xs text-red-500 font-bold hover:text-red-700 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            )}
            {!selectedProvince && !selectedCity && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                <span className="bg-black/60 text-white text-xs font-semibold px-4 py-2 rounded-full">
                  Select a province or city
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Locations list */}
          <div className="w-full md:w-[55%] lg:w-[60%] bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-3 gap-x-4 gap-y-6 flex-1">
              {locationData.map((loc, i) => (
                <div key={i} className="flex flex-col">
                  <div
                    className="flex items-center gap-2 mb-2 cursor-pointer group"
                    onClick={() => handleProvinceMapCheck(loc)}
                  >
                    <Checkbox
                      checked={selectedProvince === loc.province}
                      color="#0072D1"
                    />
                    <h4
                      className={`font-bold text-sm transition-colors duration-200 ${
                        selectedProvince === loc.province
                          ? "text-[#0072D1]"
                          : "text-gray-800 group-hover:text-[#0072D1]"
                      }`}
                    >
                      {loc.province}
                    </h4>
                  </div>
                  <ul className="flex flex-col gap-1.5 pl-3">
                    {loc.cities.map((city, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 cursor-pointer group/city"
                        onClick={() => handleCityMapCheck(loc, city)}
                      >
                        <Checkbox
                          checked={selectedCity === city}
                          color="#FF5A00"
                          size="w-3 h-3"
                        />
                        <span
                          className={`text-xs font-semibold transition-colors duration-200 ${
                            selectedCity === city
                              ? "text-[#FF5A00]"
                              : "text-gray-600 group-hover/city:text-[#FF5A00]"
                          }`}
                        >
                          {city}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mobile accordion */}
            <div className="md:hidden flex flex-col gap-3 flex-1">
              {locationData.map((loc, i) => (
                <div
                  key={i}
                  className="flex flex-col border-b border-gray-200 pb-2"
                >
                  <div className="flex items-center gap-2 py-2">
                    <button
                      onClick={() => toggleAccordion(loc.province)}
                      className="bg-black text-white rounded-full p-0.5 flex items-center justify-center flex-shrink-0"
                    >
                      {expandedProvinces.includes(loc.province) ? (
                        <Minus className="w-3 h-3" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </button>
                    <div
                      onClick={() => handleProvinceMapCheck(loc)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedProvince === loc.province}
                        color="#0072D1"
                      />
                      <span
                        className={`font-bold text-sm ${
                          selectedProvince === loc.province
                            ? "text-[#0072D1]"
                            : "text-gray-800"
                        }`}
                      >
                        {loc.province}
                      </span>
                    </div>
                  </div>
                  {expandedProvinces.includes(loc.province) && (
                    <ul className="flex flex-col gap-2 pl-10 pt-1 pb-2">
                      {loc.cities.map((city, j) => (
                        <li
                          key={j}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleCityMapCheck(loc, city)}
                        >
                          <Checkbox
                            checked={selectedCity === city}
                            color="#FF5A00"
                            size="w-3 h-3"
                          />
                          <span
                            className={`text-xs font-semibold ${
                              selectedCity === city
                                ? "text-[#FF5A00]"
                                : "text-gray-600"
                            }`}
                          >
                            {city}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* More button */}
            <div className="mt-6 md:mt-8 flex justify-end">
              <button
                onClick={() => navigate("/browseplace")}
                className="relative overflow-hidden flex items-center justify-center gap-2 px-5 py-2 md:py-2.5 rounded-full border border-[#0072D1] bg-white text-[#0072D1] font-bold text-sm transition-all duration-300 hover:bg-black hover:text-white hover:border-black hover:scale-105 group shadow-md"
              >
                <div className="bg-[#0072D1] text-white rounded-full p-1 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                  <ArrowRight className="w-4 h-4" strokeWidth={3} />
                </div>
                <span className="relative z-10 pr-2">More</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Drawer ── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="relative w-full md:w-[450px] bg-white h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-800">
                <SlidersHorizontal className="w-5 h-5 text-[#FF5A00]" />
                <h2 className="font-bold text-lg">Filters</h2>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1 rounded-full text-blue-400 hover:bg-blue-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Price Range */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">
                  Price Range
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-[#FFF5F0] rounded border border-[#FFE0D0] px-3 py-2 flex-1">
                    <span className="text-[#FF5A00] text-xs font-bold mr-1">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full bg-transparent outline-none text-[#FF5A00] text-sm font-semibold"
                    />
                  </div>
                  <span className="text-gray-400 font-bold">—</span>
                  <div className="flex items-center bg-[#FFF5F0] rounded border border-[#FFE0D0] px-3 py-2 flex-1">
                    <span className="text-[#FF5A00] text-xs font-bold mr-1">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full bg-transparent outline-none text-[#FF5A00] text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Service */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">
                  Emergency Service Needed
                </h3>
                <div className="flex items-center gap-6">
                  {["Yes", "No"].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer bg-[#FFF5F0] px-4 py-1.5 rounded border border-[#FFE0D0]"
                    >
                      <input
                        type="checkbox"
                        checked={emergencyService === opt}
                        onChange={() =>
                          setEmergencyService(
                            emergencyService === opt ? null : opt
                          )
                        }
                        className="w-3.5 h-3.5 rounded border-gray-300 accent-[#FF5A00] cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-[#FF5A00]">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Service Type */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase">
                  Service Type
                </h3>
                <div className="flex flex-col gap-3">
                  {servicesList.map((service, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 accent-[#FF5A00] cursor-pointer"
                      />
                      <span className="text-sm text-[#2C3E50] font-medium group-hover:text-[#FF5A00] transition-colors">
                        {service}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase">
                  Location
                </h3>
                <div className="flex flex-col gap-5">
                  {locationData.map((loc, i) => (
                    <div key={i} className="flex flex-col">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filterProvinces.includes(loc.province)}
                          onChange={() => toggleFilterProvince(loc.province)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#FF5A00] cursor-pointer"
                        />
                        <span className="text-sm text-[#2C3E50] font-bold group-hover:text-[#FF5A00] transition-colors">
                          {loc.province}
                        </span>
                      </label>
                      <div className="pl-7 mt-2 flex flex-col gap-2">
                        {loc.cities.map((city, j) => (
                          <label
                            key={j}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={filterDistricts.includes(city)}
                              onChange={() => toggleFilterDistrict(city)}
                              className="w-3.5 h-3.5 rounded border-gray-300 accent-[#FF5A00] cursor-pointer"
                            />
                            <span className="text-xs text-gray-600 font-medium group-hover:text-[#FF5A00] transition-colors">
                              {city}
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
            <div className="p-5 border-t border-gray-100 flex flex-col gap-3 bg-white">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="relative overflow-hidden w-full bg-[#FF5A00] text-white font-bold py-3 rounded-lg transition-all duration-300 hover:bg-black hover:scale-[1.02] group shadow-md"
              >
                <span className="relative z-10">Apply Changes</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              <button
                onClick={resetFilters}
                className="w-full text-[#FF5A00] font-bold text-sm py-2 hover:text-black transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ChooseCity;
