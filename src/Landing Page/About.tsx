import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// Images
import MainImage from "../assets/About Section/mainimg.webp";
import Image1 from "../assets/About Section/img1.webp";
import Image2 from "../assets/About Section/img2.webp";
import Image3 from "../assets/About Section/img3.webp";
import Image4 from "../assets/About Section/img4.webp";
import Image5 from "../assets/About Section/mainimg.webp";

const cardsData = [
  {
    id: 1,
    title: "Geo Specific Smart Filtering",
    img: Image1,
    bgColor: "bg-[#0072D1]"
  },
  {
    id: 2,
    title: "Professional Portfolio",
    img: Image2,
    bgColor: "bg-[#FF5A00]"
  },
  {
    id: 3,
    title: "Direct Communication",
    img: Image3,
    bgColor: "bg-[#0072D1]"
  },
  {
    id: 4,
    title: "Visual Portfolio Gallery",
    img: Image4,
    bgColor: "bg-[#FF5A00]"
  },
  {
    id: 5,
    title: "Multimedia Portfolio Upload",
    img: Image5,
    bgColor: "bg-[#0072D1]"
  }
];

const About = () => {
  const [currentCard, setCurrentCard] = useState(0);

  const nextCard = () =>
    setCurrentCard((prev) => (prev === cardsData.length - 1 ? 0 : prev + 1));
  const prevCard = () =>
    setCurrentCard((prev) => (prev === 0 ? cardsData.length - 1 : prev - 1));

  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 py-12 md:py-20 font-sans">
      {/* --- TOP SECTION --- */}
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-16">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="font-rostex text-4xl sm:text-5xl md:text-[70px]  uppercase tracking-wide leading-[1.1] mb-6">
            <span className="text-[#0072D1]">WHO WE</span>
            <br className="hidden md:block" />
            <span className="text-[#FF5A00]"> ARE ?</span>
          </h2>

          <p className="text-gray-800 text-sm md:text-[15px] leading-relaxed font-medium mb-10 max-w-2xl">
            FixItNow was born from a simple observation: our neighborhoods are
            full of incredible talent plumbers, electricians, and carpenters yet
            finding them when you're in a pinch is often a matter of luck. We've
            replaced that luck with a streamlined, digital directory.
            <br />
            <br />
            Our platform is a dedicated space where skilled service providers
            can showcase their expertise through professional profiles and
            advertisements, and where householders can find exactly who they
            need, exactly where they need them. We don't believe in being a
            middleman; we believe in being the bridge. By providing a smart
            filtering engine based on service category and geographic area, we
            enable direct, personal communication between you and the experts in
            your community.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Contact Button — border blue, hover bg black */}
            <button className="relative overflow-hidden flex items-center justify-center gap-3 px-8 py-3.5 rounded-full border-2 border-[#0072D1] bg-white text-[#0072D1] font-bold text-lg transition-all duration-300 hover:bg-black hover:text-white hover:border-black hover:scale-105 w-full sm:w-auto group">
              <div className="bg-[#0072D1] text-white rounded-full p-1 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                <ArrowRight className="w-5 h-5" strokeWidth={3} />
              </div>
              Contact
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full" />
            </button>

            {/* Find Services Button — orange bg, hover bg black */}
            <button className="relative overflow-hidden flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-[#FF5A00] text-white font-bold text-lg shadow-lg transition-all duration-300 hover:bg-black hover:scale-105 w-full sm:w-auto group">
              <Search className="w-6 h-6" strokeWidth={2.5} />
              Find Services
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full" />
            </button>
          </div>
        </div>

        {/* Right: Main Image */}
        <div className="flex-1 w-full max-w-md md:max-w-none">
          <img
            src={MainImage}
            alt="Service Professional"
            className="w-full h-auto object-cover rounded-[2.5rem] shadow-xl"
          />
        </div>
      </div>

      {/* --- BOTTOM SECTION: FEATURE CARDS --- */}

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-5 gap-4 lg:gap-6">
        {cardsData.map((card) => (
          <div
            key={card.id}
            className="flex flex-col rounded-2xl overflow-hidden shadow-lg h-72 lg:h-80 transform hover:-translate-y-2 transition-transform duration-300 group"
          >
            <div className="h-1/2 w-full">
              <img
                src={card.img}
                alt={card.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Card bottom: colored bg → white on hover, text white → black on hover */}
            <div
              className={`relative overflow-hidden h-1/2 ${card.bgColor} p-4 lg:p-6 flex items-center transition-colors duration-300 group-hover:bg-white`}
            >
              <h3 className="text-white font-bold text-base lg:text-xl leading-snug transition-colors duration-300 group-hover:text-black relative z-10">
                {card.title}
              </h3>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden flex items-center justify-between gap-4 w-full max-w-sm mx-auto">
        <button
          onClick={prevCard}
          className="text-[#0072D1] p-2 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-10 h-10" strokeWidth={2} />
        </button>

        <div className="flex-1 flex flex-col rounded-3xl overflow-hidden shadow-xl h-80 w-full animate-fadeIn group">
          <div className="h-1/2 w-full">
            <img
              src={cardsData[currentCard].img}
              alt={cardsData[currentCard].title}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={`relative overflow-hidden h-1/2 ${cardsData[currentCard].bgColor} p-6 flex items-center justify-center text-center transition-colors duration-300 group-hover:bg-white`}
          >
            <h3 className="text-white font-bold text-2xl leading-snug transition-colors duration-300 group-hover:text-black relative z-10">
              {cardsData[currentCard].title}
            </h3>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </div>
        </div>

        <button
          onClick={nextCard}
          className="text-[#0072D1] p-2 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
        >
          <ChevronRight className="w-10 h-10" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
};

export default About;
