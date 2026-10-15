import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Info, Ticket, X as XIcon, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, isLoading } = useCart();
  const navigate = useNavigate();

  // Fetch current gold rate from backend
  const { data: rateData } = useQuery({
    queryKey: ["gold-rate"],
    queryFn: async () => {
      const res = await axios.get("https://swarnim-the-shine-of-gold.onrender.com/rates/metal/gold");
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });

  const goldRatePerGram: number = rateData?.price_per_gram ?? 0;

  // GST Formula per Indian jewellery rules:
  // - Gold GST: (metal_weight × gold_rate) × 3%
  // - Making GST: making_charges × 5% (if available)
  const estimatedGST = cart.reduce((total, item) => {
    const metalWeight = item.jewellery_products.metal_weight ?? 0;
    const makingCharges = item.jewellery_products.making_charges ?? 0;
    const qty = item.quantity;

    const goldCost = metalWeight * goldRatePerGram;
    const itemGST = (goldCost * 0.03) + (makingCharges * 0.05);
    return total + itemGST * qty;
  }, 0);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    console.log('Sending Coupon Verification:', { code: couponCode, cartTotal: cartTotal });
    try {
      const res = await axios.post("https://swarnim-the-shine-of-gold.onrender.com/coupons/verify", {
        code: couponCode,
        cartTotal: cartTotal
      });
      console.log('Coupon Response:', res.data);
      if (res.data.valid) {
        setAppliedCoupon(res.data);
        localStorage.setItem("appliedCouponCode", couponCode);
        toast({ title: "Coupon Applied!", description: res.data.message });
      }
    } catch (error: any) {
      toast({
        title: "Coupon Error",
        description: error.response?.data?.message || "Invalid coupon code",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    localStorage.removeItem("appliedCouponCode");
  };

  // Real-time validation: If cart changes and drops below min amount, remove coupon
  useEffect(() => {
    if (appliedCoupon && cartTotal < Number(appliedCoupon.min_order_amount || 0)) {
      removeCoupon();
      toast({
        title: "Coupon Removed",
        description: `Minimum order amount for ${appliedCoupon.code} is ₹${(appliedCoupon.min_order_amount || 0).toLocaleString('en-IN')}`,
        variant: "destructive"
      });
    }
  }, [cartTotal, appliedCoupon]);

  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = (cartTotal * appliedCoupon.discount_percent) / 100;
  }

  const estimatedTotal = cartTotal + estimatedGST - discountAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://swarnim-the-shine-of-gold.onrender.com/${url}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-40 flex justify-center">
          <p className="text-muted-foreground animate-pulse">Loading your bag...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-display text-4xl font-semibold mb-10">Shopping Bag</h1>

            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-card rounded-3xl border border-border"
              >
                <div className="w-24 h-24 mx-auto mb-8 bg-background rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Your Bag is Empty</h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Looks like you haven't added anything to your bag yet.
                  Start shopping to find something special.
                </p>
                <Button variant="gold" size="lg" asChild className="px-10 h-14 text-lg">
                  <Link to="/">Start Shopping</Link>
                </Button>
              </motion.div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-6">
                  <AnimatePresence mode="popLayout">
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-6 p-6 bg-card rounded-2xl border border-border group"
                      >
                        {/* Image */}
                        <div className="w-32 h-32 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={getFullImageUrl(item.jewellery_products.image_url)}
                            alt={item.jewellery_products.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="text-xl font-semibold mb-1">{item.jewellery_products.title}</h3>
                                <p className="text-sm text-muted-foreground uppercase tracking-widest">
                                  {item.jewellery_products.category}
                                </p>
                              </div>
                              <p className="text-xl font-semibold">{formatPrice(item.price_snapshot * item.quantity)}</p>
                            </div>
                            <p className="text-accent text-sm font-medium">Unit Price: {formatPrice(item.price_snapshot)}</p>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-background rounded-lg border border-border p-1">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="p-1 hover:text-accent transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:text-accent transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Remove */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <Trash2 className="h-5 w-5" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-40 bg-card rounded-2xl sm:rounded-3xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

                    <div className="space-y-4 text-muted-foreground pt-4">
                      <div className="flex justify-between text-base">
                        <span>Subtotal</span>
                        <span className="text-foreground">{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span>Shipping</span>
                        <span className="text-green-600 font-medium">FREE</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="flex items-center gap-1">
                          Tax (Estimated GST)
                          <span title="Gold: 3% on gold value, Making: 5% on making charges" className="cursor-help">
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </span>
                        </span>
                        <span className="text-foreground">
                          {goldRatePerGram > 0
                            ? formatPrice(estimatedGST)
                            : <span className="text-muted-foreground text-sm">Calculating...</span>
                          }
                        </span>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-base text-green-600 font-medium bg-green-50 p-2 rounded-lg border border-green-100">
                          <span className="flex items-center gap-2">
                            <Ticket className="h-4 w-4" />
                            Discount ({appliedCoupon.discount_percent}%)
                          </span>
                          <span>-{formatPrice(discountAmount)}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      {!appliedCoupon ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Coupon Code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="h-12 uppercase font-mono"
                          />
                          <Button
                            variant="outline"
                            className="h-12 px-6"
                            onClick={handleApplyCoupon}
                            disabled={isApplying || !couponCode}
                          >
                            {isApplying ? "..." : "Apply"}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gold/10">
                              <Ticket className="h-4 w-4 text-gold" />
                            </div>
                            <span className="font-mono font-bold">{appliedCoupon.code || couponCode}</span>
                          </div>
                          <button
                            onClick={removeCoupon}
                            className="p-1 hover:bg-muted rounded-full transition-colors"
                          >
                            <XIcon className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => {
                            const userId = localStorage.getItem('userId');
                            const storageKey = userId ? `lastScratchedCouponId_${userId}` : 'lastScratchedCouponId';
                            const lastScratched = localStorage.getItem(storageKey);
                            if (lastScratched) {
                              toast({
                                title: "One Coupon Per User",
                                description: "You have already scratched a coupon. You can only use one at a time!",
                              });
                            }
                            navigate("/scratch-card");
                          }}
                          className="text-gold font-bold text-sm hover:underline flex items-center justify-center gap-2 group mx-auto"
                        >
                          <Gift className="h-4 w-4 group-hover:animate-bounce" />
                          Want to apply Coupons?
                        </button>
                        <p className="text-[10px] text-muted-foreground mt-1">Scratch & reveal your secret discount!</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border mt-6">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-lg font-medium">Estimated Total</span>
                        <span className="text-3xl font-bold text-accent">{formatPrice(estimatedTotal)}</span>
                      </div>
                      {goldRatePerGram > 0 && (
                        <p className="text-xs text-muted-foreground mb-6">
                          Includes ₹{Math.round(estimatedGST).toLocaleString("en-IN")} GST (Gold 3% + Making 5%)
                        </p>
                      )}
                      <Button variant="gold" className="w-full h-16 text-lg font-bold shadow-lg" asChild>
                        <Link to="/checkout" className="flex items-center justify-center gap-2">
                          Proceed to Pay
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </Button>

                      <div className="mt-8 flex items-center justify-center gap-6">
                        <img
                          src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png"
                          alt="Visa"
                          className="h-5 w-auto object-contain cursor-pointer drop-shadow-sm hover:scale-105 transition-transform"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
                          alt="Mastercard"
                          className="h-7 w-auto object-contain cursor-pointer drop-shadow-sm hover:scale-105 transition-transform"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg"
                          alt="UPI"
                          className="h-6 w-auto object-contain cursor-pointer drop-shadow-sm hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
