import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, MapPin, Truck, Check, Loader2, ArrowLeft, User, Package, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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

const AddressesPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newAddress, setNewAddress] = useState({
        full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: ""
    });

    const token = localStorage.getItem("token");

    const fetchAddresses = async () => {
        if (!token) { navigate("/account"); return; }
        setIsLoading(true);
        try {
            const res = await axios.get("https://swarnim-the-shine-of-gold.onrender.com/addresses", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch addresses:", err);
            toast({ title: "Error", description: "Failed to load addresses", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [token]);

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        const { full_name, phone, line1, city, state, postal_code } = newAddress;
        if (!full_name || !phone || !line1 || !city || !state || !postal_code) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post("https://swarnim-the-shine-of-gold.onrender.com/addresses", {
                ...newAddress,
                country: "India",
                is_default: addresses.length === 0
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast({ title: "Success", description: "Address added successfully" });
            setAddresses([...addresses, res.data.data]);
            setShowAddForm(false);
            setNewAddress({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: "" });
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to add address", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        try {
            await axios.delete(`https://swarnim-the-shine-of-gold.onrender.com/addresses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(addresses.filter(a => a.id !== id));
            toast({ title: "Deleted", description: "Address removed" });
        } catch (err) {
            toast({ title: "Error", description: "Failed to delete address", variant: "destructive" });
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await axios.patch(`https://swarnim-the-shine-of-gold.onrender.com/addresses/${id}/default`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(addresses.map(a => ({ ...a, is_default: a.id === id })));
            toast({ title: "Updated", description: "Default address updated" });
        } catch (err) {
            toast({ title: "Error", description: "Failed to update default address", variant: "destructive" });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-40 pb-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <Button variant="ghost" size="icon" onClick={() => navigate("/account")}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="font-display text-4xl font-semibold">My Addresses</h1>
                        </div>

                        <div className="grid lg:grid-cols-4 gap-8">
                            {/* Sidebar - Consistent with AccountPage */}
                            <div className="lg:col-span-1 space-y-2">
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base" onClick={() => navigate("/account")}>
                                    <User className="h-5 w-5" /> Profile
                                </Button>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base" onClick={() => navigate("/orders")}>
                                    <Package className="h-5 w-5" /> My Orders
                                </Button>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base" onClick={() => navigate("/wishlist")}>
                                    <Heart className="h-5 w-5" /> Wishlist
                                </Button>
                                <Button variant="gold" className="w-full justify-start gap-3 h-12 text-base">
                                    <MapPin className="h-5 w-5" /> Addresses
                                </Button>
                                <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-lg w-full text-left hover:bg-card transition-colors text-red-500 text-base mt-2">
                                    <LogOut className="h-5 w-5" /> Logout
                                </button>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border">
                                        <Loader2 className="h-10 w-10 animate-spin text-gold mb-4" />
                                        <p className="text-muted-foreground">Loading your addresses...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {!showAddForm && (
                                            <Button 
                                                variant="outline" 
                                                className="w-full py-8 border-dashed border-2 rounded-2xl flex flex-col gap-2 hover:border-gold hover:bg-gold/5 group"
                                                onClick={() => setShowAddForm(true)}
                                            >
                                                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-gold" />
                                                <span className="font-medium group-hover:text-gold">Add New Address</span>
                                            </Button>
                                        )}

                                        <AnimatePresence>
                                            {showAddForm && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden"
                                                >
                                                    <h2 className="text-xl font-semibold mb-6">Enter New Address</h2>
                                                    <form onSubmit={handleAddAddress} className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Full Name *</Label>
                                                                <Input value={newAddress.full_name} onChange={e => setNewAddress({...newAddress, full_name: e.target.value})} required placeholder="John Doe" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Phone Number *</Label>
                                                                <Input value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} required placeholder="+91 XXXXX XXXXX" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Address Line 1 *</Label>
                                                            <Input value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} required placeholder="House No, Street, Area" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Address Line 2 (Optional)</Label>
                                                            <Input value={newAddress.line2} onChange={e => setNewAddress({...newAddress, line2: e.target.value})} placeholder="Landmark, Apartment, etc." />
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>City *</Label>
                                                                <Input value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>State *</Label>
                                                                <Input value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} required />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>PIN Code *</Label>
                                                                <Input value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} required />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4 pt-4">
                                                            <Button type="submit" variant="gold" className="flex-1 h-12" disabled={isSubmitting}>
                                                                {isSubmitting ? "Saving..." : "Save Address"}
                                                            </Button>
                                                            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setShowAddForm(false)}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {addresses.map((addr) => (
                                                <div 
                                                    key={addr.id}
                                                    className={`p-6 rounded-2xl border-2 transition-all relative group ${
                                                        addr.is_default ? "border-gold bg-gold/5 shadow-md" : "border-border hover:border-muted-foreground/30"
                                                    }`}
                                                >
                                                    {addr.is_default && (
                                                        <span className="absolute top-4 right-4 bg-gold text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Default</span>
                                                    )}
                                                    <p className="font-bold text-lg mb-1">{addr.full_name}</p>
                                                    <p className="text-muted-foreground text-sm mb-3">{addr.phone}</p>
                                                    <p className="text-sm leading-relaxed mb-4">
                                                        {addr.line1}
                                                        {addr.line2 && <br />}
                                                        {addr.line2}
                                                        <br />
                                                        {addr.city}, {addr.state} — {addr.postal_code}
                                                    </p>

                                                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                                                        {!addr.is_default && (
                                                            <button 
                                                                onClick={() => handleSetDefault(addr.id)}
                                                                className="text-xs font-semibold text-accent hover:underline"
                                                            >
                                                                Set as Default
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDeleteAddress(addr.id)}
                                                            className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1"
                                                        >
                                                            <Trash2 className="h-3 w-3" /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {addresses.length === 0 && !showAddForm && (
                                            <div className="text-center py-20 bg-card rounded-2xl border border-border">
                                                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <MapPin className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-xl font-semibold mb-2">No addresses saved</h3>
                                                <p className="text-muted-foreground mb-6">Add a shipping address for a faster checkout experience.</p>
                                                <Button variant="gold" onClick={() => setShowAddForm(true)}>Add Your First Address</Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AddressesPage;
