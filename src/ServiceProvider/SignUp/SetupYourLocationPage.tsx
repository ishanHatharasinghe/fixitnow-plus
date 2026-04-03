import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignupContext";
import locationBackground from "../../assets/Backgrounds/Signupscreens3.png";

const countries = [
  { name: "Sri Lanka" },
  { name: "United States" },
  { name: "United Kingdom" },
  { name: "India" },
  { name: "Canada" }
];

const sriLankaLocations = {
  Ampara: [
    "Addalaichenai",
    "Akkaraipattu",
    "Alayadiwembu",
    "Ampara",
    "Damana",
    "Dehiattakandiya",
    "Irakkamam",
    "Kalmunai",
    "Karaitivu",
    "Lahugala",
    "Mahaoya",
    "Navithanveli",
    "Ninthavur",
    "Padiyathalawa",
    "Pothuvil",
    "Sainthamaruthu",
    "Sammanthurai",
    "Uhana"
  ],
  Anuradhapura: [
    "Galenbindunuwewa",
    "Galnewa",
    "Horowpothana",
    "Ipalogama",
    "Kahatagasdigiliya",
    "Kebithigollewa",
    "Kekirawa",
    "Mahavilachchiya",
    "Medawachchiya",
    "Mihintale",
    "Nachchaduwa",
    "Nanattan",
    "Nochchiyagama",
    "Nuwaragam Palatha Central",
    "Nuwaragam Palatha East",
    "Padaviya",
    "Palagala",
    "Palugaswewa",
    "Rajanganaya",
    "Rambewa",
    "Thalawa",
    "Thambuttegama",
    "Thirappane"
  ],
  Badulla: [
    "Badulla",
    "Bandarawela",
    "Ella",
    "Haldummulla",
    "Hali-Ela",
    "Haputale",
    "Kandaketiya",
    "Lunugala",
    "Mahiyanganaya",
    "Meegahakivula",
    "Passara",
    "Rideemaliyadda",
    "Soranathota",
    "Uva-Paranagama",
    "Welimada"
  ],
  Batticaloa: [
    "Batticaloa",
    "Eravur Pattu",
    "Eravur Town",
    "Kattankudy",
    "Koralai Pattu",
    "Koralai Pattu Central",
    "Koralai Pattu North",
    "Koralai Pattu South",
    "Koralai Pattu West",
    "Manmunai North",
    "Manmunai Pattu",
    "Manmunai South & Eruvil Pattu",
    "Manmunai South West",
    "Manmunai West"
  ],
  Colombo: [
    "Colombo",
    "Dehiwala",
    "Homagama",
    "Kaduwela",
    "Kesbewa",
    "Kolonnawa",
    "Maharagama",
    "Moratuwa",
    "Padukka",
    "Ratmalana",
    "Seethawaka",
    "Sri Jayawardenepura Kotte",
    "Thimbirigasyaya"
  ],
  Galle: [
    "Akmeemana",
    "Ambalangoda",
    "Baddegama",
    "Balapitiya",
    "Benthota",
    "Bope-Poddala",
    "Elpitiya",
    "Galle",
    "Gonapinuwala",
    "Habaraduwa",
    "Hikkaduwa",
    "Imaduwa",
    "Karandeniya",
    "Nagoda",
    "Neluwa",
    "Niyagama",
    "Thawalama",
    "Welivitiya-Divithura",
    "Yakkalamulla"
  ],
  Gampaha: [
    "Attanagalla",
    "Biyagama",
    "Divulapitiya",
    "Dompe",
    "Gampaha",
    "Ja-Ela",
    "Katana",
    "Kelaniya",
    "Mahara",
    "Minuwangoda",
    "Mirigama",
    "Negombo",
    "Wattala"
  ],
  Hambantota: [
    "Ambalantota",
    "Angunakolapelessa",
    "Beliatta",
    "Hambantota",
    "Katuwana",
    "Lunugamvehera",
    "Okewela",
    "Sooriyawewa",
    "Tangalle",
    "Tissamaharama",
    "Walasmulla",
    "Weeraketiya"
  ],
  Jaffna: [
    "Delft",
    "Island North",
    "Island South",
    "Jaffna",
    "Karainagar",
    "Nallur",
    "Thenmaradchi",
    "Vadamaradchi East",
    "Vadamaradchi North",
    "Vadamaradchi Southwest",
    "Valikamam East",
    "Valikamam North",
    "Valikamam South",
    "Valikamam Southwest",
    "Valikamam West"
  ],
  Kalutara: [
    "Agalawatta",
    "Bandaragama",
    "Beruwala",
    "Bulathsinhala",
    "Dodangoda",
    "Horana",
    "Ingiriya",
    "Kalutara",
    "Madurawela",
    "Mathugama",
    "Millaniya",
    "Palindanuwara",
    "Panadura",
    "Walallavita"
  ],
  Kandy: [
    "Akurana",
    "Delthota",
    "Doluwa",
    "Harispattuwa",
    "Hatharaliyadda",
    "Kandy",
    "Kundasale",
    "Medadumbara",
    "Minipe",
    "Panvila",
    "Pasbage Korale",
    "Pathadumbara",
    "Pathahewaheta",
    "Poojapitiya",
    "Thumpane",
    "Udadumbara",
    "Udapalatha",
    "Udunuwara",
    "Yatinuwara"
  ],
  Kegalle: [
    "Aranayaka",
    "Bulathkohupitiya",
    "Dehiovita",
    "Deraniyagala",
    "Galigamuwa",
    "Kegalle",
    "Mawanella",
    "Rambukkana",
    "Ruwanwella",
    "Warakapola",
    "Yatiyanthota"
  ],
  Kilinochchi: ["Kandavalai", "Karachchi", "Pachchilaipalli", "Poonakary"],
  Kurunegala: [
    "Alawwa",
    "Ambanpola",
    "Bamunakotuwa",
    "Bingiriya",
    "Ehetuwewa",
    "Galgamuwa",
    "Ganewatta",
    "Giribawa",
    "Ibbagamuwa",
    "Katupotha",
    "Kobeigane",
    "Kotawehera",
    "Kuliyapitiya East",
    "Kuliyapitiya West",
    "Kurunegala",
    "Maho",
    "Mallawapitiya",
    "Maspotha",
    "Mawathagama",
    "Narammala",
    "Nikaweratiya",
    "Panduwasnuwara",
    "Pannala",
    "Polgahawela",
    "Polpithigama",
    "Rasnayakapura",
    "Rideegama",
    "Udubaddawa",
    "Wariyapola",
    "Weerambugedera"
  ],
  Mannar: ["Madhu", "Mannar", "Mantal", "Musali", "Nanattan"],
  Matale: [
    "Ambanganga Korale",
    "Dambulla",
    "Galewela",
    "Laggala-Pallegama",
    "Matale",
    "Naula",
    "Pallepola",
    "Rattota",
    "Ukuwela",
    "Wilgamuwa",
    "Yatawatta"
  ],
  Matara: [
    "Akuressa",
    "Athuraliya",
    "Devinuwara",
    "Dickwella",
    "Hakmana",
    "Kamburupitiya",
    "Kirinda Puhulwella",
    "Kotapola",
    "Malimbada",
    "Matara",
    "Mulatiyana",
    "Pasgoda",
    "Pitabeddara",
    "Thihagoda",
    "Weligama",
    "Welipitiya"
  ],
  Moneragala: [
    "Badalkumbura",
    "Bibile",
    "Buttala",
    "Katharagama",
    "Madulla",
    "Medagama",
    "Moneragala",
    "Siyambalanduwa",
    "Tanamalwila",
    "Wellawaya"
  ],
  Mullaitivu: [
    "Maritimepattu",
    "Oddusuddan",
    "Puthukudiyiruppu",
    "Thunukkai",
    "Welioya"
  ],
  NuwaraEliya: [
    "Ambagamuwa",
    "Hanguranketha",
    "Kothmale",
    "Nuwara Eliya",
    "Walapane"
  ],
  Polonnaruwa: [
    "Dimbulagala",
    "Elahera",
    "Hingurakgoda",
    "Lankapura",
    "Medirigiriya",
    "Polonnaruwa",
    "Thamankaduwa",
    "Welikanda"
  ],
  Puttalam: [
    "Anamaduwa",
    "Arachchikattuwa",
    "Chilaw",
    "Dankotuwa",
    "Kalpitiya",
    "Karuwalagaswewa",
    "Madampe",
    "Mahakumbukkadawala",
    "Mahawewa",
    "Mundalama",
    "Nattandiya",
    "Nawagattegama",
    "Pallama",
    "Puttalam",
    "Wanathavilluwa",
    "Wennappuwa"
  ],
  Ratnapura: [
    "Ayagama",
    "Balangoda",
    "Eheliyagoda",
    "Elapatha",
    "Embilipitiya",
    "Godakawela",
    "Imbulpe",
    "Kahawatta",
    "Kuruwita",
    "Kiriella",
    "Kolonne",
    "Nivithigala",
    "Opanayaka",
    "Pelmadulla",
    "Ratnapura",
    "Weligepola"
  ],
  Trincomalee: [
    "Gomarankadawala",
    "Kantalai",
    "Kinniya",
    "Kuchchaveli",
    "Morawewa",
    "Muttur",
    "Padavi Sri Pura",
    "Seruvila",
    "Thampalakamam",
    "Trincomalee Town and Gravets",
    "Verugal"
  ],
  Vavuniya: [
    "Vavuniya",
    "Vavuniya North",
    "Vavuniya South",
    "Vengalacheddikulam"
  ]
};

const SetupYourLocationPage = () => {
  const navigate = useNavigate();
  const { updateServiceProviderData, serviceProviderData } = useSignup();
  
  const [localData, setLocalData] = useState<{
    username: string;
    country: string;
    district: string;
    division: string;
    postalCode: string;
  }>({
    username: serviceProviderData.firstName || "",
    country: serviceProviderData.address?.country || "Sri Lanka",
    district: serviceProviderData.address?.state || "",
    division: serviceProviderData.address?.city || "",
    postalCode: serviceProviderData.address?.postalCode || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = () => {
    let newErrors: Record<string, string> = {};
    if (!localData.username.trim()) newErrors.username = "Username is required";
    if (!localData.country) newErrors.country = "Country is required";
    if (!localData.district) newErrors.district = "District is required";
    if (!localData.division) newErrors.division = "Division is required";
    if (!localData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }
    else if (
      localData.country === "Sri Lanka" &&
      !/^\d{5}$/.test(localData.postalCode)
    ) {
      newErrors.postalCode = "Enter valid 5-digit code";
    }
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocalData({ ...localData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalData({
      ...localData,
      country: e.target.value,
      district: "",
      division: ""
    });
    setErrors({ ...errors, country: "", district: "", division: "" });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalData({ ...localData, district: e.target.value, division: "" });
    setErrors({ ...errors, district: "", division: "" });
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => setTouched({ ...touched, [e.target.name]: true });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched(
      Object.keys(localData).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );

    if (Object.keys(validationErrors).length === 0) {
      // Save data to context and navigate to next step
      updateServiceProviderData({
        firstName: localData.username,
        address: {
          street: serviceProviderData.address?.street || "",
          city: localData.division,
          state: localData.district,
          postalCode: localData.postalCode,
          country: localData.country
        }
      });
      
      // Navigate to next step
      navigate('/signup/verify-id');
    }
  };

  const getStyle = (name: string) => {
    const isError = errors[name] && touched[name];
    return `w-full mt-2 p-3 rounded-2xl border-2 transition-all focus:outline-none ${
      isError
        ? "border-red-500 focus:border-red-500"
        : "border-[#0072D1]/30 focus:border-[#0072D1]"
    }`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="p-6 md:p-12 lg:p-30 flex flex-col lg:flex-row gap-10 lg:gap-20 relative z-10 min-h-screen items-center">
        {/* Left Side Header */}
        <div className="flex-1 flex items-start justify-center lg:items-end lg:justify-start max-w-lg text-center lg:text-left">
          <div className="mb-0 lg:mb-10 animate-fadeInUp">
            <h1 className="font-rostex text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] text-white leading-[1.1] uppercase italic tracking-tighter">
              SETUP <br /> <span className="text-white">LOCATION</span>
            </h1>
            <p className="font-poppins font-bold text-white text-sm mt-2">
              Setup your location details
            </p>
          </div>
        </div>

        {/* Right Side Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 sm:p-12 w-full lg:w-[600px] border border-white/30 animate-slideInRight">
          <form onSubmit={handleSubmit} className="relative z-10 w-full">
            {/* Username */}
            <div className="mb-4">
              <label className="text-sm font-bold">Username</label>
              <input
                type="text"
                name="username"
                value={localData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getStyle("username")}
                placeholder="Enter username"
              />
              {errors.username && touched.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Country */}
            <div className="mb-4">
              <label className="text-sm font-bold">Country</label>
              <div className="relative">
                <select
                  name="country"
                  value={localData.country}
                  onChange={handleCountryChange}
                  onBlur={handleBlur}
                  className={
                    getStyle("country") + " cursor-pointer appearance-none"
                  }
                >
                  <option value="" disabled hidden>
                    Select Country
                  </option>
                  {countries.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-gray-500 pointer-events-none w-5 h-5" />
              </div>
              {errors.country && touched.country && (
                <p className="text-red-500 text-xs mt-1">{errors.country}</p>
              )}
            </div>

            {/* District */}
            {localData.country && (
              <div className="mb-4 animate-fadeInUp">
                <label className="text-sm font-bold">District</label>
                <div className="relative">
                  {localData.country === "Sri Lanka" ? (
                    <select
                      name="district"
                      value={localData.district}
                      onChange={handleDistrictChange}
                      onBlur={handleBlur}
                      className={
                        getStyle("district") + " cursor-pointer appearance-none"
                      }
                    >
                      <option value="" disabled hidden>
                        Select District
                      </option>
                      {Object.keys(sriLankaLocations)
                        .sort()
                        .map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="district"
                      value={localData.district}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getStyle("district")}
                      placeholder="Enter district"
                    />
                  )}
                  {localData.country === "Sri Lanka" && (
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-gray-500 pointer-events-none w-5 h-5" />
                  )}
                </div>
                {errors.district && touched.district && (
                  <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                )}
              </div>
            )}

            {/* Division */}
            {localData.district && (
              <div className="mb-4 animate-fadeInUp">
                <label className="text-sm font-bold">Division</label>
                <div className="relative">
                  {localData.country === "Sri Lanka" &&
                  sriLankaLocations[
                    localData.district as keyof typeof sriLankaLocations
                  ] ? (
                    <select
                      name="division"
                      value={localData.division}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={
                        getStyle("division") + " cursor-pointer appearance-none"
                      }
                    >
                      <option value="" disabled hidden>
                        Select Division
                      </option>
                      {sriLankaLocations[
                        localData.district as keyof typeof sriLankaLocations
                      ]?.map((div: string) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="division"
                      value={localData.division}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getStyle("division")}
                      placeholder="Enter division"
                    />
                  )}
                  {localData.country === "Sri Lanka" && (
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-gray-500 pointer-events-none w-5 h-5" />
                  )}
                </div>
                {errors.division && touched.division && (
                  <p className="text-red-500 text-xs mt-1">{errors.division}</p>
                )}
              </div>
            )}

            {/* Postal Code */}
            <div className="mb-6">
              <label className="text-sm font-bold">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={localData.postalCode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getStyle("postalCode")}
                placeholder="Enter postal code"
              />
              {errors.postalCode && touched.postalCode && (
                <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <button 
                type="button"
                onClick={() => navigate('/signup/setup-account')}
                className="relative overflow-hidden w-full bg-[#FF5A00] hover:bg-[#000000] text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4">
                <span className="relative z-10">Previous</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button 
                type="submit"
                className="relative overflow-hidden w-full bg-[#0072D1] hover:bg-[#000000] text-white py-3 sm:py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group mb-4">
                <span className="relative z-10">Next Page</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>

            {/* Back to login */}
            <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => navigate('/getstarted')}
                className="text-[#000000] font-semibold hover:text-[#0072D1] transition-colors duration-300">
                ← Back to SignUp
              </button>
            </div>

            {/* Pagination Dots - Requested Placement */}
            <div className="flex justify-center gap-2 mt-5">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-700"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            </div>
          </form>
        </div>
      </div>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={locationBackground}
          alt="BG"
          className="object-cover w-full h-full"
        />
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out 0.2s forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default SetupYourLocationPage;
