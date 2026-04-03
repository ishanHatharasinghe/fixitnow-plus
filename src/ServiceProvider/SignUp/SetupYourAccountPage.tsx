import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import categoriesBackground from "../../assets/Backgrounds/Signupscreens.jpg";

interface AccountFormData {
  username: string;
  description: string;
  phone: string;
}

const SetupYourAccountPage = () => {
  const navigate = useNavigate();
  const { updateServiceProviderData, serviceProviderData } = useSignup();
  
  const [localData, setLocalData] = useState<AccountFormData>({
    username: serviceProviderData.firstName || "",
    description: serviceProviderData.lastName || "",
    phone: serviceProviderData.phoneNumber || ""
  });

  // Multi-select services state
  const [selectedServices, setSelectedServices] = useState<string[]>(
    serviceProviderData.services || []
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<
    Partial<Record<keyof AccountFormData | 'serviceType', string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof AccountFormData | 'serviceType', boolean>>
  >({});
  const [loading, setLoading] = useState(false);

  const serviceOptions = [
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isDropdownOpen]);

  // Toggle service selection
  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  // Remove service from tags
  const removeService = (service: string) => {
    setSelectedServices((prev) => prev.filter((s) => s !== service));
  };

  const validate = (): Partial<Record<keyof AccountFormData | 'serviceType', string>> => {
    let newErrors: Partial<Record<keyof AccountFormData | 'serviceType', string>> = {};

    if (!localData.username.trim()) {
      newErrors.username = "Username is required";
    }
    else if (localData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!localData.description.trim()) {
      newErrors.description = "Please provide a short description";
    }

    // Validate at least one service is selected
    if (selectedServices.length === 0) {
      newErrors.serviceType = "Please select at least one service";
    }

    // Sri Lankan phone validation (usually 9 digits after the country code)
    const phoneRegex = /^[0-9]{9}$/;
    if (!localData.phone) {
      newErrors.phone = "Phone number is required";
    }
    else if (!phoneRegex.test(localData.phone)) {
      newErrors.phone = "Enter a valid 9-digit mobile number";
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setLocalData({ ...localData, [name as keyof AccountFormData]: value });
    if (errors[name as keyof AccountFormData]) {
      setErrors({ ...errors, [name as keyof AccountFormData]: "" });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name } = e.target;
    setTouched({ ...touched, [name as keyof AccountFormData]: true });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    // Mark all as touched
    const allTouched = Object.keys(localData).reduce(
      (acc: Partial<Record<keyof AccountFormData, boolean>>, key) => {
        acc[key as keyof AccountFormData] = true;
        return acc;
      },
      {}
    );
    setTouched(allTouched);

    // Also mark service as touched if empty
    if (selectedServices.length === 0) {
      setErrors(prev => ({ ...prev, serviceType: "Please select at least one service" }));
    }

    if (Object.keys(validationErrors).length === 0 && selectedServices.length > 0) {
      setLoading(true);
      
      // Save data to context and navigate to next step
      updateServiceProviderData({
        firstName: localData.username,
        lastName: localData.description,
        phoneNumber: localData.phone,
        services: selectedServices
      });
      
      // Navigate to next step
      navigate('/signup/setup-location');
      
      setLoading(false);
    }
  };

  const getInputClass = (name: keyof AccountFormData) => {
    const baseClass =
      "w-full mt-2 p-3 rounded-2xl border-2 transition-all focus:outline-none ";
    return (
      baseClass +
      (errors[name] && touched[name]
        ? "border-red-500 focus:border-red-500"
        : "border-[#0072D1]/30 focus:border-[#0072D1]")
    );
  };

  const selectedCount = selectedServices.length;
  const serviceLabel = selectedCount === 0
    ? "Select services..."
    : selectedCount === 1
    ? selectedServices[0]
    : `${selectedCount} services selected`;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10 min-h-screen items-center">
        {/* Left Side */}
        <div className="flex-1 flex items-start justify-center lg:items-end lg:justify-start max-w-lg text-center lg:text-left">
          <div className="mb-0 lg:mb-10 animate-fadeInUp">
            <h1 className="font-rostex text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] text-white leading-[1.1] mt-13 uppercase italic tracking-tighter">
              SETUP <br />
              <span className="text-white">ACCOUNT</span>
            </h1>
            <p className="font-poppins font-bold text-white text-sm sm:text-base md:text-lg opacity-100 mt-2">
              Setup your account details
            </p>
          </div>
        </div>

        {/* Right Side - Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] border border-white/30 animate-slideInRight">
          <div className="relative z-10 w-full">
            {/* Username */}
            <div className="mb-4">
              <label className="text-sm font-bold">Username</label>
              <input
                type="text"
                name="username"
                value={localData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("username")}
                placeholder="Enter your username"
              />
              {errors.username && touched.username && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-sm font-bold">Description</label>
              <textarea
                name="description"
                rows={3}
                value={localData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("description")}
                placeholder="Briefly describe your expertise"
              />
              {errors.description && touched.description && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Multi-Select Service Dropdown */}
            <div className="mb-4" ref={dropdownRef}>
              <label className="text-sm font-bold">
                What Services You Provide
              </label>

              {/* Selected Services Tags */}
              {selectedCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedServices.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0072D1]/10 text-[#0072D1] text-sm font-semibold rounded-full"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        className="flex items-center justify-center w-4 h-4 rounded-full bg-[#0072D1]/20 hover:bg-[#0072D1] hover:text-white transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Dropdown Trigger */}
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-4 pr-12 rounded-2xl bg-[#F8FAFC] border-2 transition-all text-left ${
                    errors.serviceType && selectedCount === 0
                      ? "border-red-500"
                      : isDropdownOpen
                      ? "border-[#0072D1] ring-2 ring-[#0072D1]/10"
                      : "border-[#0072D1]/30 hover:border-[#0072D1]"
                  }`}
                >
                  <span className={`text-sm ${selectedCount > 0 ? "text-gray-700 font-semibold" : "text-gray-500"}`}>
                    {isDropdownOpen 
                      ? "Click to close" 
                      : selectedCount === 0 
                        ? "Select services..." 
                        : "Click to add more services"}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-white border-2 border-[#0072D1]/30 rounded-2xl shadow-lg">
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
                      <span className="text-xs font-semibold text-gray-500">
                        {selectedCount} service{selectedCount !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <div className="p-2">
                      {serviceOptions.map((service) => {
                        const isSelected = selectedServices.includes(service);
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
                              onChange={() => toggleService(service)}
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

              {errors.serviceType && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.serviceType}
                </p>
              )}

              {/* Helper Text */}
              <p className="text-[10px] text-gray-400 mt-1">
                Select all services you provide. You can choose multiple.
              </p>
            </div>

            {/* Phone */}
            <div className="mb-8">
              <label className="text-sm font-bold">Phone</label>
              <div
                className={`flex items-center rounded-2xl border-2 bg-[#F8FAFC] overflow-hidden transition-all mt-2 ${
                  errors.phone && touched.phone
                    ? "border-red-500"
                    : "border-[#0072D1]/30 focus-within:border-[#0072D1]"
                }`}
              >
                <span className="flex items-center gap-2 px-4 py-4 bg-white border-r border-[#0072D1]/20 text-[#4B5A69] font-medium">
                  <img
                    src="https://flagcdn.com/w20/lk.png"
                    alt="SL"
                    className="w-5 h-4"
                  />
                  +94
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={localData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="flex-1 px-4 py-4 bg-transparent focus:outline-none"
                  placeholder="7XXXXXXXX"
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate('/signup/get-started')}
                className="relative overflow-hidden w-full bg-[#FF5A00] hover:bg-black text-white py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 group"
              >
                <span className="relative z-10">Previous</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button
                onClick={(e: any) =>
                  handleSubmit(e as React.FormEvent<HTMLFormElement>)
                }
                disabled={loading}
                className={`relative overflow-hidden w-full py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 group ${
                  loading
                    ? "bg-gray-400"
                    : "bg-[#0072D1] hover:bg-black text-white hover:scale-105"
                }`}
              >
                <span className="relative z-10">
                  {loading ? "Saving..." : "Next Page"}
                </span>
                {!loading && (
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                )}
              </button>
            </div>

            {/* Back to login */}
            <div className="text-center mt-6">
              <button className="text-[#000000] font-semibold hover:text-[#0072D1]"
              onClick={() => navigate('/getstarted')}>
                ← Back to SignUp
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-5">
              {[300, 700, 300, 300, 300].map((bg, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full bg-gray-${bg}`}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={categoriesBackground}
          alt="Background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out 0.2s forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default SetupYourAccountPage;