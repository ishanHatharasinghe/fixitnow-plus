import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";

// Make sure these paths match your actual project structure
import Img from "../assets/Backgrounds/Landingpage.webp";
import man from "../assets/Landing Page/man.png";
import Logo from "../assets/logo2.png";

// Full list of services based on your dropdown image
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

// Locations Data based on your filter image
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

const HomePage = () => {
  // Main UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Data States
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Plumbing"
  ]);
  const [priceMin, setPriceMin] = useState("1500");
  const [priceMax, setPriceMax] = useState("100000");
  const [emergencyService, setEmergencyService] = useState<string | null>(null); // 'Yes' or 'No'

  // New Location States
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  // Navigation hook
  const navigate = useNavigate();

  // Navigation function to BrowsePlace with filters
  const navigateToBrowsePlace = () => {
    const params = new URLSearchParams();
    
    // Add selected services
    if (selectedServices.length > 0) {
      params.set("services", selectedServices.join(","));
    }
    
    // Add price range
    if (priceMin !== "1500") {
      params.set("priceMin", priceMin);
    }
    if (priceMax !== "100000") {
      params.set("priceMax", priceMax);
    }
    
    // Add emergency service
    if (emergencyService) {
      params.set("emergency", emergencyService);
    }
    
    // Add location filters
    if (selectedProvinces.length > 0) {
      params.set("provinces", selectedProvinces.join(","));
    }
    if (selectedDistricts.length > 0) {
      params.set("cities", selectedDistricts.join(","));
    }
    
    // Navigate to BrowsePlace with filters
    navigate(`/browseplace?${params.toString()}`);
  };

  // Toggles for checkboxes
  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    }
    else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const toggleProvince = (province: string) => {
    if (selectedProvinces.includes(province)) {
      setSelectedProvinces(selectedProvinces.filter((p) => p !== province));
    }
    else {
      setSelectedProvinces([...selectedProvinces, province]);
    }
  };

  const toggleDistrict = (district: string) => {
    if (selectedDistricts.includes(district)) {
      setSelectedDistricts(selectedDistricts.filter((d) => d !== district));
    }
    else {
      setSelectedDistricts([...selectedDistricts, district]);
    }
  };

  const resetFilters = () => {
    setSelectedServices([]);
    setPriceMin("1500");
    setPriceMax("100000");
    setEmergencyService(null);
    setSelectedProvinces([]);
    setSelectedDistricts([]);
  };

  return (
    <div className="relative min-h-auto w-auto overflow-hidden flex flex-col items-center font-sans">
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        <img
          src={Img}
          alt="Scenic Background"
          className="object-cover w-full h-full"
        />
      </div>

      {/* --- MAN IMAGE LAYER --- */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center pointer-events-none">
        <img
          src={man}
          alt="Service Man"
          className="object-contain h-[70vh] md:h-[75vh] max-w-none origin-bottom"
        />
      </div>

      {/* --- CONTENT & MAIN UI LAYER --- */}
      <div className="relative z-20 flex flex-col items-center w-full lg:h-screen min-h-[600px] pt-16 md:pt-10 pb-8 px-4 sm:px-6 justify-between">
        {/* HEADER */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-[#0072D1] font-rostex text-4xl md:text-[112px] leading-[1.1] tracking-wide uppercase">
            FixIT<span className="text-[#FF5A00]">Now</span>
          </h1>
          <p className="font-rostex text-[#0072D1] text-[10px] sm:text-sm md:text-sm tracking-widest uppercase ">
            Local service finder
          </p>
        </div>

        {/* BOTTOM UI SECTION */}
        <div className="w-full flex flex-col items-center mt-auto mb-4 md:mb-8 z-30">
          {/* SEARCH BAR ROW */}
          <div className="w-full max-w-4xl flex items-center justify-between gap-2 p-2 rounded-xl md:rounded-full bg-white/50 backdrop-blur-md md:bg-white md:backdrop-blur-none shadow-lg">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-lg md:rounded-full px-4 py-3 h-12 md:h-14">
              <Search className="w-5 h-5 text-gray-400 hidden md:block" />
              <input
                type="text"
                placeholder="Enter city, neighborhood"
                className="w-full bg-transparent border-none outline-none text-gray-700 text-sm md:text-base placeholder-gray-400"
              />
            </div>

            {/* Service Type Dropdown Wrapper */}
            <div className="relative hidden md:flex items-center border-l border-gray-200">
              <div
                className="flex items-center gap-2 px-4 py-3 h-14 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-sm font-medium whitespace-nowrap">
                  {selectedServices.length === 0
                    ? "Service Type"
                    : selectedServices.length === 1
                    ? selectedServices[0]
                    : `${selectedServices.length} Selected`}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-4 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50 max-h-[400px] overflow-y-auto origin-bottom">
                  <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase">
                    Service Type
                  </h3>
                  <div className="flex flex-col gap-3">
                    {servicesList.map((service, index) => (
                      <label
                        key={index}
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
              )}
            </div>

            {/* Filters Button (Opens Side Drawer) */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center justify-center gap-2 bg-white text-gray-500 rounded-lg md:rounded-full px-3 py-3 h-12 md:h-14 md:px-6 md:border-l md:border-gray-200 hover:text-[#0072D1] transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden md:block text-sm">Filters</span>
            </button>

            {/* Find button */}
            <button 
              onClick={navigateToBrowsePlace}
              className="relative overflow-hidden flex items-center justify-center gap-2 px-8 md:px-10 h-14 md:h-16 rounded-lg md:rounded-full bg-[#FF5A00] text-white font-bold text-sm md:text-lg shadow-lg transition-all duration-300 hover:bg-black hover:scale-105 group flex-shrink-0"
            >
              <Search
                className="w-5 h-5 md:w-6 md:h-6 relative z-10"
                strokeWidth={2.5}
              />
              <span className="relative z-10">Find</span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>

          {/* BLUE INFO BOX */}
          <div className="hidden md:flex w-full max-w-3xl bg-[#0072D1] rounded-full p-2 items-center shadow-2xl relative mt-4">
            <div className="w-20 h-20 flex-shrink-0 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-inner ml-1">
              <img
                src={Logo}
                alt="FixItNow Logo"
                className="w-[70%] h-[70%] object-contain"
              />
            </div>
            <div className="px-6 py-2">
              <p className="text-white text-sm leading-snug text-left font-medium">
                Skip the endless searching. FixItNow provides a centralized
                directory where you can instantly filter skilled service
                providers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SLIDING FILTER DRAWER --- */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Overlay Background */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full md:w-[450px] bg-white h-full flex flex-col shadow-2xl overflow-hidden transform transition-transform duration-300">
            {/* Drawer Header */}
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

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* PRICE RANGE */}
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

              {/* EMERGENCY SERVICE */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">
                  Emergency Service Needed
                </h3>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group bg-[#FFF5F0] px-4 py-1.5 rounded border border-[#FFE0D0]">
                    <input
                      type="checkbox"
                      checked={emergencyService === "Yes"}
                      onChange={() =>
                        setEmergencyService(
                          emergencyService === "Yes" ? null : "Yes"
                        )
                      }
                      className="w-3.5 h-3.5 rounded border-gray-300 accent-[#FF5A00] cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-[#FF5A00]">
                      Yes
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group bg-[#FFF5F0] px-4 py-1.5 rounded border border-[#FFE0D0]">
                    <input
                      type="checkbox"
                      checked={emergencyService === "No"}
                      onChange={() =>
                        setEmergencyService(
                          emergencyService === "No" ? null : "No"
                        )
                      }
                      className="w-3.5 h-3.5 rounded border-gray-300 accent-[#FF5A00] cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-[#FF5A00]">
                      No
                    </span>
                  </label>
                </div>
              </div>

              {/* SERVICE TYPE */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase">
                  Service Type
                </h3>
                <div className="flex flex-col gap-3">
                  {servicesList.map((service, index) => (
                    <label
                      key={index}
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

              {/* LOCATION */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase">
                  Location
                </h3>
                <div className="flex flex-col gap-5">
                  {locationData.map((loc, index) => (
                    <div key={index} className="flex flex-col">
                      {/* Province Checkbox */}
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedProvinces.includes(loc.province)}
                          onChange={() => toggleProvince(loc.province)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#FF5A00] cursor-pointer"
                        />
                        <span className="text-sm text-[#2C3E50] font-bold group-hover:text-[#FF5A00] transition-colors">
                          {loc.province}
                        </span>
                      </label>

                      {/* District Checkboxes */}
                      <div className="pl-7 mt-2 flex flex-col gap-2">
                        {loc.cities.map((city, cIndex) => (
                          <label
                            key={cIndex}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDistricts.includes(city)}
                              onChange={() => toggleDistrict(city)}
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

            {/* Drawer Footer Buttons */}
            <div className="p-5 border-t border-gray-100 flex flex-col gap-3 bg-white">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-[#FF5A00] text-white font-bold py-3 rounded-lg hover:bg-[#E04F00] transition-colors shadow-md"
              >
                Apply Changes
              </button>
              <button
                onClick={resetFilters}
                className="w-full text-[#FF5A00] font-bold text-sm py-2 hover:underline transition-all"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
