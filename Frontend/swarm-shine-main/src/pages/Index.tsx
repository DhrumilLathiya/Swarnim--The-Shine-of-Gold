import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Newsletter from "@/components/home/Newsletter";
import SplashScreen from "@/components/home/SplashScreen";

const SPLASH_SHOWN_KEY = "swarnim_splash_shown";

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash was already shown in this session
    return !sessionStorage.getItem(SPLASH_SHOWN_KEY);
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem(SPLASH_SHOWN_KEY, "true");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
      
      <motion.div 
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Navbar />
        <main>
          <HeroSection />
          <FeaturedProducts />
          <CategoriesSection />
          <WhyChooseUs />
          <Newsletter />
        </main>
        <Footer />
      </motion.div>
    </>
  );
};

export default Index;
