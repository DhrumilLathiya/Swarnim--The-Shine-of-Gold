import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleMoveToBag = async (productId: string) => {
    try {
      await addToCart(productId);
      await removeFromWishlist(productId);
      toast({
        title: "Moved to Bag",
        description: "The item has been moved from your wishlist to your bag.",
      });
    } catch (error) {
      console.error("Failed to move to bag", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://swarnim-the-shine-of-gold.onrender.com${url}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-medium">My Wishlist</h1>
            <p className="text-muted-foreground mt-4">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved for later
            </p>
          </motion.div>

          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your wishlist...</p>
            </div>
          ) : wishlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-8 bg-muted rounded-full flex items-center justify-center">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8">
                Save pieces you love to find them easily later and stay updated on availability.
              </p>
              <Button asChild variant="gold" size="lg">
                <Link to="/collections">
                  Explore Collections <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {wishlist.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-card mb-4">
                      <img
                        src={getFullImageUrl(item.jewellery_products.image_url)}
                        alt={item.jewellery_products.product_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={() => removeFromWishlist(item.jewellery_products.id)}
                        className="absolute top-4 right-4 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors shadow-sm"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <div className="absolute top-4 left-4">
                        <span className="px-2 py-1 bg-accent text-accent-foreground text-[10px] font-bold tracking-widest uppercase rounded">
                          {item.jewellery_products.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-lg mb-1 truncate">
                          {item.jewellery_products.product_name}
                        </h3>
                        <p className="font-semibold text-accent text-xl">
                          {formatPrice(item.jewellery_products.final_price)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1" variant="outline" asChild>
                          <Link to={`/product/${item.jewellery_products.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button 
                          className="flex-1 gap-2" 
                          variant="gold"
                          onClick={() => handleMoveToBag(item.jewellery_products.id)}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          To Bag
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
