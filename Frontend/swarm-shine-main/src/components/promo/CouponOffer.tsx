import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Ticket } from 'lucide-react';
import ScratchCard from './ScratchCard';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const DISCOUNT_POPUP_SHOWN = "swarnim_coupon_shown";

const CouponOffer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [couponData, setCouponData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Show the floating button after 3 seconds if not already shown this session
    const timer = setTimeout(() => {
      const shown = sessionStorage.getItem(DISCOUNT_POPUP_SHOWN);
      if (!shown) {
        setShowButton(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenScratchCard = async () => {
    try {
      // Fetch a random active coupon from backend
      const res = await axios.get("http://localhost:3000/coupons/random");
      setCouponData(res.data);
      setIsOpen(true);
      sessionStorage.setItem(DISCOUNT_POPUP_SHOWN, "true");
      setShowButton(false);
    } catch (error) {
      console.error("No active coupons found:", error);
      toast({
        title: "Offer Coming Soon!",
        description: "Stay tuned for exclusive rewards and discounts.",
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <button
              onClick={handleOpenScratchCard}
              className="group relative flex items-center gap-3 bg-gradient-gold p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 border-2 border-white/20"
            >
              <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-gold border border-white"></span>
              </div>
              <Gift className="h-6 w-6 text-foreground" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-foreground font-bold pr-2">
                Scratch for a Discount!
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && couponData && (
          <ScratchCard 
            code={couponData.code}
            discount={couponData.discount_percent}
            onClose={() => setIsOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CouponOffer;
