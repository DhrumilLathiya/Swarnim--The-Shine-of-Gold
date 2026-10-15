import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Interface for cart items as returned by the backend
interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    price_snapshot: number;
    jewellery_products: {
        id: string;
        title: string;
        category: string;
        image_url: string;
        metal_weight: number | null;
        making_charges: number | null;
    };
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    refreshCart: () => Promise<void>;
    cartCount: number;
    cartTotal: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = "https://swarnim-the-shine-of-gold.onrender.com";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Fetch the current user's cart from the backend
    const fetchCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCart([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (Array.isArray(response.data)) {
                setCart(response.data);
            } else {
                console.error("Cart data format error: Expected array", response.data);
                setCart([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch cart:", error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchCart();
    }, []);

    // Add a single product to the cart
    const addToCart = async (productId: string, quantity: number = 1) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast({
                title: "Login Required",
                description: "Please login to add items to your bag.",
                variant: "destructive",
            });
            // Optional: Redirect to login would happen in the UI component
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/cart`,
                { product_id: productId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Re-fetch to sync with backend
            await fetchCart();
            
            toast({
                title: "Added to Bag",
                description: "This item has been successfully added to your shopping bag.",
            });
        } catch (error: any) {
            toast({
                title: "Stock Alert",
                description: error.response?.data?.error || "We couldn't add this item to your bag.",
                variant: "destructive",
            });
        }
    };

    // Update quantity for a specific cart record ID
    const updateQuantity = async (itemId: string, quantity: number) => {
        const token = localStorage.getItem("token");
        if (!token || quantity < 1) return;

        try {
            await axios.patch(
                `${API_BASE_URL}/cart/${itemId}`,
                { quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchCart();
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.response?.data?.error || "Requested quantity might exceed stock.",
                variant: "destructive",
            });
        }
    };

    // Permanently remove an item from the cart
    const removeFromCart = async (itemId: string) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await axios.delete(`${API_BASE_URL}/cart/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchCart();
            toast({
                title: "Bag Updated",
                description: "Item removed from your shopping bag.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Could not remove item. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Derived state for the UI
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.price_snapshot * item.quantity), 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                updateQuantity,
                removeFromCart,
                refreshCart: fetchCart,
                cartCount,
                cartTotal,
                isLoading
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
