import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  Heart,
  Share2,
  ShoppingBag,
  Star,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

import { getProductById } from "@/api/productApi";
import ProductReviews from "@/components/product/ProductReviews";
import axios from "axios";

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  // ✅ Backend Fetch
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id || ""),
    enabled: !!id,
  });

  // Live review summary
  const { data: reviewData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:3000/reviews/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const avgRating = reviewData?.average_rating ?? 0;
  const reviewCount = reviewData?.count ?? 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  // ✅ Error State
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-red-500">Failed to load product</p>
      </div>
    );
  }

  // ✅ Safe Image Handling
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">

          {/* Breadcrumb */}
          <nav className="text-base mb-8">
            <ol className="flex items-center space-x-2 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  to={`/${product.category?.toLowerCase()}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.category}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">

            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-card">
                <img
                  src={productImages[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <p className="text-base text-accent uppercase tracking-wide mb-2">
                  {product.category}
                </p>

                <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-semibold mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.round(avgRating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted"
                          }`}
                      />
                    ))}
                    <span className="text-base text-muted-foreground ml-2">
                      {avgRating > 0 ? avgRating.toFixed(1) : "No"} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-semibold">
                    {formatPrice(product.price)}
                  </span>

                  {product.originalPrice && (
                    <>
                      <span className="text-2xl text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="text-green-600 font-medium text-lg">
                        {Math.round(
                          (1 - product.price / product.originalPrice) * 100
                        )}
                        % OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
                <div>
                  <p className="text-base text-muted-foreground">Metal</p>
                  <p className="font-medium text-lg">{product.metal}</p>
                </div>

                <div>
                  <p className="text-base text-muted-foreground">Stone</p>
                  <p className="font-medium text-lg">{product.stone}</p>
                </div>

                <div>
                  <p className="text-base text-muted-foreground">Weight</p>
                  <p className="font-medium text-lg">{product.weight}</p>
                </div>

                <div>
                  <p className="text-base text-muted-foreground">Availability</p>
                  <p
                    className={`font-medium text-lg ${product.inStock ? "text-green-600" : "text-red-500"
                      }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="gold"
                    size="lg"
                    className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-md rounded-xl"
                    onClick={() => addToCart(product.id)}
                    disabled={!product.inStock}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    {product.inStock ? "Add to Bag" : "Out of Stock"}
                  </Button>

                  <Link to={`/product/${id}/modify`} className="flex-1">
                    <Button
                      variant="goldOutline"
                      size="lg"
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl"
                    >
                      <Pencil className="h-5 w-5 mr-2" />
                      Modify Jewelry
                    </Button>
                  </Link>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="goldOutline"
                    size="lg"
                    className="flex-1 h-12"
                    onClick={() => {
                      if (isInWishlist(product.id)) {
                        removeFromWishlist(product.id);
                      } else {
                        addToWishlist(product.id);
                      }
                    }}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isInWishlist(product.id) ? "fill-accent text-accent" : ""}`} />
                    {isInWishlist(product.id) ? "In Wishlist" : "Wishlist"}
                  </Button>

                  <Button variant="goldOutline" size="lg" className="flex-1 h-12">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Reviews Section */}
      {id && <ProductReviews productId={id} />}

      <Footer />
    </div>
  );
};

export default ProductPage;
