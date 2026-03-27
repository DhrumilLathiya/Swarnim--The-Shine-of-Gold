import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Truck, CreditCard, ShieldCheck, ArrowRight, MapPin, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import axios from "axios";

interface Address {
    id: string;
    full_name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    is_default: boolean;
}

const CheckoutPage = () => {
    const { cart, cartTotal, refreshCart } = useCart();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

    // New address form
    const [newAddress, setNewAddress] = useState({
        full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: ""
    });

    // Get coupon from localStorage (passed from CartPage)
    const appliedCoupon = localStorage.getItem("appliedCouponCode") || "";

    const token = localStorage.getItem("token");

    // Fetch saved addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!token) { setIsLoadingAddresses(false); return; }
            try {
                const res = await axios.get("http://localhost:3000/addresses", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data.data || [];
                setAddresses(data);
                // Auto-select default address
                const def = data.find((a: Address) => a.is_default);
                if (def) setSelectedAddressId(def.id);
                else if (data.length > 0) setSelectedAddressId(data[0].id);
            } catch (err) {
                console.error("Failed to load addresses:", err);
            } finally {
                setIsLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, [token]);

    // Add new address
    const handleAddAddress = async () => {
        if (!newAddress.full_name || !newAddress.phone || !newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
            toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }
        try {
            const res = await axios.post("http://localhost:3000/addresses", {
                ...newAddress,
                country: "India",
                is_default: addresses.length === 0
            }, { headers: { Authorization: `Bearer ${token}` } });

            const created = res.data.data;
            setAddresses(prev => [...prev, created]);
            setSelectedAddressId(created.id);
            setShowAddForm(false);
            setNewAddress({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: "" });
            toast({ title: "Address Saved", description: "Your address has been added." });
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to save address.", variant: "destructive" });
        }
    };

    // Place order
    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast({ title: "Select Address", description: "Please select or add a shipping address.", variant: "destructive" });
            return;
        }
        if (cart.length === 0) {
            toast({ title: "Empty Cart", description: "Your cart is empty.", variant: "destructive" });
            return;
        }

        setIsPlacingOrder(true);
        try {
            const res = await axios.post("http://localhost:3000/orders/checkout", {
                shipping_address_id: selectedAddressId,
                coupon_code: appliedCoupon || undefined
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                // Clear coupon from localStorage
                localStorage.removeItem("appliedCouponCode");
                // Refresh cart to show it's empty
                await refreshCart();
                // Navigate to success with order data
                navigate("/order-success", { state: { order: res.data.order } });
            }
        } catch (err: any) {
            toast({
                title: "Checkout Failed",
                description: err.response?.data?.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
    };

    const getFullImageUrl = (url: string) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `http://localhost:3000${url}`;
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-40 pb-20 text-center">
                    <h1 className="text-2xl font-semibold mb-4">Please Login First</h1>
                    <Button variant="gold" onClick={() => navigate("/account")}>Go to Login</Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-40 pb-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="font-display text-4xl font-semibold mb-10 text-center">Checkout</h1>

                        <div className="grid lg:grid-cols-5 gap-10">
                            {/* Left: Address + Payment */}
                            <div className="lg:col-span-3 space-y-8">

                                {/* Address Section */}
                                <section>
                                    <h2 className="flex items-center gap-2 text-xl font-semibold mb-6">
                                        <Truck className="h-5 w-5 text-gold" />
                                        Shipping Address
                                    </h2>

                                    {isLoadingAddresses ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            Loading addresses...
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {addresses.map((addr) => (
                                                <motion.div
                                                    key={addr.id}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                        selectedAddressId === addr.id
                                                            ? "border-gold bg-gold/5 shadow-sm"
                                                            : "border-border hover:border-muted-foreground/30"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="font-semibold">{addr.full_name}</p>
                                                            <p className="text-sm text-muted-foreground">{addr.phone}</p>
                                                            <p className="text-sm mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                                                            <p className="text-sm">{addr.city}, {addr.state} — {addr.postal_code}</p>
                                                        </div>
                                                        {selectedAddressId === addr.id && (
                                                            <div className="p-1.5 bg-gold rounded-full">
                                                                <Check className="h-4 w-4 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {/* Add New Address */}
                                            {!showAddForm ? (
                                                <button
                                                    onClick={() => setShowAddForm(true)}
                                                    className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-gold transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-gold"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    Add New Address
                                                </button>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-6 rounded-xl border border-border bg-card space-y-4"
                                                >
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-gold" /> New Address
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs">Full Name *</Label>
                                                            <Input value={newAddress.full_name} onChange={e => setNewAddress({...newAddress, full_name: e.target.value})} className="h-10 mt-1" />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Phone *</Label>
                                                            <Input value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="h-10 mt-1" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Address Line 1 *</Label>
                                                        <Input value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} className="h-10 mt-1" placeholder="House No, Street" />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Address Line 2</Label>
                                                        <Input value={newAddress.line2} onChange={e => setNewAddress({...newAddress, line2: e.target.value})} className="h-10 mt-1" placeholder="Landmark (Optional)" />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <Label className="text-xs">City *</Label>
                                                            <Input value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="h-10 mt-1" />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">State *</Label>
                                                            <Input value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="h-10 mt-1" />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">PIN Code *</Label>
                                                            <Input value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} className="h-10 mt-1" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 pt-2">
                                                        <Button variant="gold" className="flex-1" onClick={handleAddAddress}>Save Address</Button>
                                                        <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </section>

                                {/* Payment Section */}
                                <section>
                                    <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                                        <CreditCard className="h-5 w-5 text-gold" />
                                        Payment Method
                                    </h2>
                                    <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gold rounded-xl bg-gold/5">
                                            <span className="font-medium">Cash on Delivery / Online Payment</span>
                                            <ShieldCheck className="h-5 w-5 text-gold" />
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">Secure 256-bit SSL Encrypted Payment</p>
                                    </div>
                                </section>
                            </div>

                            {/* Right: Order Summary */}
                            <div className="lg:col-span-2">
                                <div className="sticky top-40 bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
                                    <h3 className="text-xl font-semibold mb-2">Order Summary</h3>

                                    {/* Cart Items Preview */}
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex gap-3">
                                                <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={getFullImageUrl(item.jewellery_products.image_url)} alt={item.jewellery_products.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.jewellery_products.title}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-semibold">{formatPrice(item.price_snapshot * item.quantity)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-border pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatPrice(cartTotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span className="text-green-600 font-medium">FREE</span>
                                        </div>
                                        {appliedCoupon && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Coupon: {appliedCoupon}</span>
                                                <span>Applied ✓</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-border pt-4">
                                        <div className="flex justify-between items-end mb-6">
                                            <span className="text-base font-medium">Total</span>
                                            <span className="text-2xl font-bold text-accent">{formatPrice(cartTotal)}</span>
                                        </div>
                                        <Button
                                            variant="gold"
                                            className="w-full h-14 text-lg font-bold shadow-lg"
                                            onClick={handlePlaceOrder}
                                            disabled={isPlacingOrder || !selectedAddressId || cart.length === 0}
                                        >
                                            {isPlacingOrder ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Placing Order...
                                                </>
                                            ) : (
                                                <>
                                                    Place Your Order
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </>
                                            )}
                                        </Button>
                                        <p className="mt-3 text-[10px] text-muted-foreground text-center">
                                            By placing your order, you agree to our Terms of Service.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CheckoutPage;
