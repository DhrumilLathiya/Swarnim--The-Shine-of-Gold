import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface WishlistItem {
    id: string;
    jewellery_products: {
        id: string;
        product_name: string;
        category: string;
        image_url: string;
        final_price: number;
        stock_quantity: number;
        availability: string;
    };
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    refreshWishlist: () => Promise<void>;
    isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const fetchWishlist = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setWishlist([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:3000/wishlist", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWishlist(response.data);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const addToWishlist = async (productId: string) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast({
                title: "Login Required",
                description: "Please login to add items to your wishlist.",
                variant: "destructive",
            });
            return;
        }

        try {
            await axios.post(
                "http://localhost:3000/wishlist",
                { product_id: productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchWishlist();
            toast({
                title: "Added to Wishlist",
                description: "Item has been saved to your wishlist.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to add to wishlist.",
                variant: "destructive",
            });
        }
    };

    const removeFromWishlist = async (productId: string) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await axios.delete(`http://localhost:3000/wishlist/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchWishlist();
            toast({
                title: "Removed from Wishlist",
                description: "Item has been removed from your wishlist.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to remove from wishlist.",
                variant: "destructive",
            });
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some((item) => item.jewellery_products.id === productId);
    };

    return (
        <WishlistContext.Provider
            value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, refreshWishlist: fetchWishlist, isLoading }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
};
