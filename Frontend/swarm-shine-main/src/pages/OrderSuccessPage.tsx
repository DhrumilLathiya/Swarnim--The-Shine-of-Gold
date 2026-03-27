import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Gift, Package, MapPin, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const OrderSuccessPage = () => {
    const location = useLocation();
    const { toast } = useToast();
    const order = location.state?.order;

    useEffect(() => {
        // RESET SCRATCH CARD STATUS AFTER SUCCESSFUL ORDER
        const userId = localStorage.getItem('userId');
        const storageKey = userId ? `lastScratchedCouponId_${userId}` : 'lastScratchedCouponId';
        localStorage.removeItem(storageKey);
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
    };

    const copyOrderId = () => {
        if (order?.id) {
            navigator.clipboard.writeText(order.id);
            toast({ title: "Copied!", description: "Order ID copied to clipboard." });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-40 pb-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto text-center">

                        {/* Success Icon */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
                        >
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="font-display text-4xl md:text-5xl font-bold mb-4"
                        >
                            Order Placed! 🎉
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-muted-foreground mb-8"
                        >
                            Thank you for your purchase. Your order is confirmed and will be processed shortly.
                        </motion.p>

                        {/* Order Details Card */}
                        {order && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-card rounded-2xl border border-border p-6 mb-8 text-left space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5 text-gold" />
                                        Order Details
                                    </h3>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                                        {order.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Order ID</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-bold text-xs truncate">{order.id}</p>
                                            <button onClick={copyOrderId} className="text-gold hover:text-gold/80">
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Date</p>
                                        <p className="font-medium">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total</p>
                                        <p className="font-bold text-lg text-accent">{formatPrice(order.final_amount)}</p>
                                    </div>
                                    {order.discount_amount > 0 && (
                                        <div>
                                            <p className="text-muted-foreground">Savings</p>
                                            <p className="font-bold text-green-600">{formatPrice(order.discount_amount)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Address */}
                                {order.shipping_address && (
                                    <div className="pt-3 border-t border-border">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                            <MapPin className="h-3 w-3" /> Delivering To
                                        </p>
                                        <p className="text-sm font-medium">{order.shipping_address.full_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.shipping_address.line1}, {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.postal_code}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Scratch Card Reset Banner */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gold/5 border border-gold/20 rounded-2xl p-5 mb-8 text-left"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gold/10 rounded-xl">
                                    <Gift className="h-6 w-6 text-gold" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-1">New Scratch Chance!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your scratch card has been reset. Scratch a new card for your next purchase!
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="gold" size="lg" className="h-14 px-10 text-lg w-full sm:w-auto" asChild>
                                <Link to="/orders">
                                    View My Orders
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-10 text-lg w-full sm:w-auto" asChild>
                                <Link to="/">Continue Shopping</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderSuccessPage;
