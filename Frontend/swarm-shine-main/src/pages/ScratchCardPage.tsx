import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft, Ticket, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScratchCardGridItem from '@/components/promo/ScratchCardGridItem';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const ScratchCardPage = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeScratchId, setActiveScratchId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const getStorageKey = () => {
        const userId = localStorage.getItem('userId');
        return userId ? `lastScratchedCouponId_${userId}` : 'lastScratchedCouponId';
    };

    useEffect(() => {
        // Load persisted scratch state
        const savedId = localStorage.getItem(getStorageKey());
        if (savedId) {
            setActiveScratchId(savedId);
        }

        const fetchAllActiveCoupons = async () => {
            try {
                const res = await axios.get("http://localhost:3000/coupons/all-active");
                // Shuffle coupons to randomize positions
                const shuffled = [...res.data].sort(() => Math.random() - 0.5);
                setCoupons(shuffled);
            } catch (error) {
                console.error("Error fetching coupons:", error);
                toast({
                    title: "Could not load coupons",
                    description: "Please try again later.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllActiveCoupons();
    }, []);

    const handleScratchInitiated = (id: string) => {
        if (!activeScratchId) {
            setActiveScratchId(id);
            localStorage.setItem(getStorageKey(), id);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Gift className="h-12 w-12 text-gold animate-bounce mx-auto mb-4" />
                        <p className="text-muted-foreground animate-pulse font-medium">Preparing your rewards grid...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            
            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold font-bold text-sm mb-6 border border-gold/20">
                            <Sparkles className="h-4 w-4" />
                            {activeScratchId ? "SELECTION MADE" : "EXCLUSIVE REWARDS"}
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                            {activeScratchId ? "Your Secret Reward is Reveal!" : "Golden Rewards Await!"}
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                            {activeScratchId 
                                ? "You've chosen this reward! Scratch it fully to see your exclusive discount code."
                                : "We love our customers! Choose any one of the cards below to scratch. You can only claim one reward, so pick carefully!"}
                        </p>
                    </motion.div>

                    {coupons.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                            {coupons.map((coupon, index) => (
                                <ScratchCardGridItem 
                                    key={coupon.id || index}
                                    code={coupon.code}
                                    discount={coupon.discount_percent}
                                    minOrder={coupon.min_order_amount}
                                    expiry={coupon.expiry_date}
                                    startRevealed={activeScratchId === (coupon.id || String(index))}
                                    onScratch={() => handleScratchInitiated(coupon.id || String(index))}
                                    disabled={activeScratchId !== null && activeScratchId !== (coupon.id || String(index))}
                                    isLocked={activeScratchId !== null && activeScratchId !== (coupon.id || String(index))}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-card rounded-[2.5rem] border border-border shadow-sm max-w-2xl mx-auto">
                            <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                            <h2 className="text-2xl font-semibold mb-2 text-foreground">No Offers Today</h2>
                            <p className="text-muted-foreground mb-8">All our secret coupons have been claimed. Check back soon for more sparkle!</p>
                            <Button variant="gold" onClick={() => navigate('/cart')} className="h-12 px-8">
                                Return to Cart
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-center mt-12">
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate('/cart')} 
                            className="gap-2 hover:bg-gold/5 text-muted-foreground hover:text-gold transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Shopping Bag
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ScratchCardPage;
