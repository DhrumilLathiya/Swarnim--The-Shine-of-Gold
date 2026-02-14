import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import promoFlashSale from "@/assets/promo-flash-sale.jpg";
import promoDiwali from "@/assets/promo-diwali.jpg";
import promoValentine from "@/assets/promo-valentine.jpg";
import promoNewArrivals from "@/assets/promo-new-arrivals.jpg";

interface PromoSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  href: string;
  theme: "dark" | "light";
  countdown?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

const promoSlides: PromoSlide[] = [
  {
    id: 1,
    title: "Flash Sale",
    subtitle: "Up to 40% OFF",
    description: "Limited time offer on selected gold jewelry",
    image: promoFlashSale,
    cta: "Shop Now",
    href: "/collections?sale=flash",
    theme: "dark",
    countdown: {
      days: 2,
      hours: 14,
      minutes: 35,
      seconds: 42,
    },
  },
  {
    id: 2,
    title: "Diwali Collection",
    subtitle: "Festival Special",
    description: "Celebrate with our exclusive festive jewelry",
    image: promoDiwali,
    cta: "Explore Collection",
    href: "/collections?collection=diwali",
    theme: "dark",
  },
  {
    id: 3,
    title: "Valentine's Day",
    subtitle: "Love in Gold",
    description: "Pre-book with 20% early bird discount",
    image: promoValentine,
    cta: "Pre-Book Now",
    href: "/collections?collection=valentine",
    theme: "light",
  },
  {
    id: 4,
    title: "New Arrivals",
    subtitle: "Winter Collection 2024",
    description: "Discover our latest contemporary designs",
    image: promoNewArrivals,
    cta: "View Collection",
    href: "/collections?filter=new-arrivals",
    theme: "light",
  },
];

const PromoSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState(promoSlides[0].countdown);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!countdown) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (!prev) return prev;
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          return prev;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
  };

  const slide = promoSlides[currentSlide];
  const textColor = slide.theme === "dark" ? "text-white" : "text-foreground";
  const subtextColor = slide.theme === "dark" ? "text-white/80" : "text-foreground/70";

  return (
    <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 ${
            slide.theme === "dark" 
              ? "bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" 
              : "bg-gradient-to-r from-background/70 via-background/40 to-transparent"
          }`} />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 md:px-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-xl"
              >
                <span className={`inline-block text-gold text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3`}>
                  {slide.subtitle}
                </span>
                <h2 className={`font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold ${textColor} mb-4 leading-tight`}>
                  {slide.title}
                </h2>
                <p className={`${subtextColor} text-base md:text-lg mb-8 max-w-md`}>
                  {slide.description}
                </p>

                {/* Countdown Timer */}
                {slide.countdown && countdown && currentSlide === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3 md:gap-4 mb-8"
                  >
                    {[
                      { value: countdown.days, label: "Days" },
                      { value: countdown.hours, label: "Hrs" },
                      { value: countdown.minutes, label: "Min" },
                      { value: countdown.seconds, label: "Sec" },
                    ].map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`${slide.theme === "dark" ? "bg-white/20" : "bg-foreground/10"} backdrop-blur-sm rounded-lg px-3 md:px-4 py-2 md:py-3 min-w-[50px] md:min-w-[60px]`}>
                          <span className={`font-display text-xl md:text-2xl lg:text-3xl font-bold ${textColor}`}>
                            {item.value.toString().padStart(2, "0")}
                          </span>
                        </div>
                        <span className={`${subtextColor} text-[10px] md:text-xs mt-1 block`}>{item.label}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                <Button
                  asChild
                  size="lg"
                  className={`${
                    slide.theme === "dark"
                      ? "bg-white text-foreground hover:bg-white/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  } text-sm md:text-base px-8 md:px-10`}
                >
                  <Link to={slide.href}>{slide.cta}</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Progress Dots */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
        {promoSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8 md:w-10"
                : "bg-white/40 w-1.5 md:w-2 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PromoSlider;
