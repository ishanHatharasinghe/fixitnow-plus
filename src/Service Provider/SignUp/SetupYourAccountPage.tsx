import { useState } from "react";
import { ChevronDown } from "lucide-react";
import categoriesBackground from "../../assets/Backgrounds/Signupscreens.jpg";

interface AccountFormData {
  username: string;
  description: string;
  serviceType: string;
  phone: string;
}

const SetupYourAccountPage = () => {
  const [localData, setLocalData] = useState<AccountFormData>({
    username: "",
    description: "",
    serviceType: "",
    phone: ""
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AccountFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof AccountFormData, boolean>>
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

  const validate = () => {
    let newErrors: Partial<Record<keyof AccountFormData, string>> = {};

    if (!localData.username.trim()) {
      newErrors.username = "Username is required";
    }
    else if (localData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!localData.description.trim()) {
      newErrors.description = "Please provide a short description";
    }

    if (!localData.serviceType) {
      newErrors.serviceType = "Please select a service type";
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
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        console.log("Account Setup Data:", localData);
        // Navigate to next page logic here
      }, 1500);
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

            {/* Service list Dropdown */}
            <div className="mb-4">
              <label className="text-sm font-bold">
                What Service You Provide
              </label>
              <div className="relative mt-2">
                <select
                  name="serviceType"
                  value={localData.serviceType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-4 pr-12 rounded-2xl bg-[#F8FAFC] border-2 transition-all cursor-pointer appearance-none text-gray-700 focus:outline-none ${
                    errors.serviceType && touched.serviceType
                      ? "border-red-500"
                      : "border-[#0072D1]/30 focus:border-[#0072D1]"
                  }`}
                >
                  <option value="" disabled hidden>
                    Select Option
                  </option>
                  {serviceOptions.map((service, index) => (
                    <option key={index} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5" />
              </div>
              {errors.serviceType && touched.serviceType && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.serviceType}
                </p>
              )}
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

            {/* Back Link */}
            <div className="text-center mt-6">
              <button
                type="button"
                className="text-[#000000] font-semibold hover:text-[#0072D1]"
              >
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
