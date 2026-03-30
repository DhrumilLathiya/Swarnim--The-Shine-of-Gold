import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronDown, ChevronUp, MapPin, Loader2, XCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface OrderItem {
    id: string;
    quantity: number;
    price_snapshot: number;
    jewellery_products: {
        id: string;
        title: string;
        category: string;
        image_url: string;
    };
}

interface Order {
    id: string;
    total_amount: number;
    discount_amount: number;
    final_amount: number;
    coupon_code: string | null;
    status: string;
    created_at: string;
    items: OrderItem[];
    shipping_address?: {
        full_name: string;
        phone: string;
        line1: string;
        city: string;
        state: string;
        postal_code: string;
    };
}

const statusColors: Record<string, string> = {
    pending: "bg-blue-100 text-blue-700",
    confirmed: "bg-green-100 text-green-700",
    shipped: "bg-yellow-100 text-yellow-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const { toast } = useToast();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        if (!token) { setIsLoading(false); return; }
        try {
            const res = await axios.get("https://swarnim-the-shine-of-gold.onrender.com/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data.data || []);
        } catch (err) {
            console.error("Failed to load orders:", err);
            toast({ title: "Error", description: "Failed to load orders.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (orderId: string) => {
        setCancellingId(orderId);
        try {
            await axios.post(`https://swarnim-the-shine-of-gold.onrender.com/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "Order Cancelled", description: "Your order has been cancelled." });
            await fetchOrders();
        } catch (err: any) {
            toast({
                title: "Cancel Failed",
                description: err.response?.data?.message || "Could not cancel order.",
                variant: "destructive"
            });
        } finally {
            setCancellingId(null);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
    };

    const getFullImageUrl = (url: string) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `https://swarnim-the-shine-of-gold.onrender.com${url}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-40 pb-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="font-display text-4xl font-semibold mb-10 text-center">My Orders</h1>

                        {isLoading ? (
                            <div className="text-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">Loading your orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-20 bg-card rounded-3xl border border-border"
                            >
                                <div className="w-24 h-24 mx-auto mb-8 bg-background rounded-full flex items-center justify-center">
                                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h2 className="text-2xl font-semibold mb-4">No Orders Yet</h2>
                                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                                    You haven't placed any orders yet. Start shopping to find something special.
                                </p>
                                <Button variant="gold" size="lg" asChild className="px-10 h-14 text-lg">
                                    <Link to="/">Start Shopping</Link>
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-card rounded-2xl border border-border overflow-hidden"
                                    >
                                        {/* Order Header */}
                                        <div
                                            className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                                            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="p-2 sm:p-2.5 bg-muted rounded-xl">
                                                        <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm sm:text-base">Order #{order.id.slice(-8).toUpperCase()}</p>
                                                        <p className="text-[10px] sm:text-xs text-muted-foreground">{formatDate(order.created_at)} · {order.items.length} item(s)</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                                                    <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full uppercase ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                                                        {order.status}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-bold text-base sm:text-lg">{formatPrice(order.final_amount)}</p>
                                                        {expandedId === order.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        <AnimatePresence>
                                            {expandedId === order.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                                                        {/* Items */}
                                                        <div className="space-y-3">
                                                            {order.items.map((item) => (
                                                                <div key={item.id} className="flex gap-4 items-center">
                                                                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                                                        <img
                                                                            src={getFullImageUrl(item.jewellery_products?.image_url)}
                                                                            alt={item.jewellery_products?.title}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-sm truncate">{item.jewellery_products?.title || "Product"}</p>
                                                                        <p className="text-xs text-muted-foreground uppercase">{item.jewellery_products?.category}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-semibold text-sm">{formatPrice(item.price_snapshot * item.quantity)}</p>
                                                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Summary */}
                                                        <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
                                                            {order.discount_amount > 0 && (
                                                                <div className="flex justify-between text-green-600">
                                                                    <span>Coupon Savings ({order.coupon_code})</span>
                                                                    <span>-{formatPrice(order.discount_amount)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between font-bold text-base">
                                                                <span>Total Paid</span>
                                                                <span>{formatPrice(order.final_amount)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Shipping Address */}
                                                        {order.shipping_address && (
                                                            <div className="text-sm">
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                                                    <MapPin className="h-3 w-3" /> Shipped To
                                                                </p>
                                                                <p className="font-medium">{order.shipping_address.full_name} · {order.shipping_address.phone}</p>
                                                                <p className="text-muted-foreground">{order.shipping_address.line1}, {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.postal_code}</p>
                                                            </div>
                                                        )}

                                                        {/* Cancel Button */}
                                                        {(order.status === "pending" || order.status === "confirmed") && (
                                                            <Button
                                                                variant="outline"
                                                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                                                onClick={() => handleCancel(order.id)}
                                                                disabled={cancellingId === order.id}
                                                            >
                                                                {cancellingId === order.id ? (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                )}
                                                                Cancel Order
                                                            </Button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderHistoryPage;
