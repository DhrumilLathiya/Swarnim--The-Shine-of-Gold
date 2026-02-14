import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import promoDiwali from "@/assets/promo-diwali.jpg";
import promoFlashSale from "@/assets/promo-flash-sale.jpg";
import promoNewArrivals from "@/assets/promo-new-arrivals.jpg";

interface PromoSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  ctaText: string;
}

const slides: PromoSlide[] = [
  {
    id: 1,
    title: "Festive Collection",
    subtitle: "Celebrate with Gold",
    image: promoDiwali,
    link: "/collections",
    ctaText: "Shop Festive",
  },
  {
    id: 2,
    title: "Flash Sale",
    subtitle: "Up to 30% Off",
    image: promoFlashSale,
    link: "/collections",
    ctaText: "Shop Now",
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Latest Designs",
    image: promoNewArrivals,
    link: "/collections",
    ctaText: "Explore",
  },
];

const FeaturedPromoSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden group shadow-elegant">
      {/* Decorative Border */}
      <div className="absolute inset-0 rounded-lg border border-gold/20 z-10 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          
          {/* Elegant Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-wine-dark/90 via-wine-dark/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 md:px-16 lg:px-20 max-w-2xl">
              {/* Decorative Line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "3rem" }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="h-0.5 bg-gradient-to-r from-gold to-gold-light mb-4"
              />
              
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-block text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-gold-light mb-2"
              >
                {slides[currentSlide].subtitle}
              </motion.span>
              
              <motion.h3
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="font-display text-3xl md:text-5xl lg:text-6xl font-medium text-ivory mt-1 mb-5 leading-tight"
              >
                {slides[currentSlide].title}
              </motion.h3>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Link
                  to={slides[currentSlide].link}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold text-wine-dark text-sm font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-light transition-all duration-300 shadow-gold hover:shadow-lg"
                >
                  {slides[currentSlide].ctaText}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Elegant Style */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-wine-dark/60 backdrop-blur-md border border-gold/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-wine-dark hover:border-gold/50 hover:scale-105"
      >
        <ChevronLeft className="h-5 w-5 text-gold-light" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-wine-dark/60 backdrop-blur-md border border-gold/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-wine-dark hover:border-gold/50 hover:scale-105"
      >
        <ChevronRight className="h-5 w-5 text-gold-light" />
      </button>

      {/* Dots Indicator - Elegant Style */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 bg-wine-dark/40 backdrop-blur-sm px-4 py-2 rounded-full border border-gold/20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-gold w-7"
                : "bg-ivory/40 w-2 hover:bg-ivory/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedPromoSlider;
