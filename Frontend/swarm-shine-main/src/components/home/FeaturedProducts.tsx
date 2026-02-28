import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import FeaturedPromoSlider from "./FeaturedPromoSlider";
import { getAllProducts } from "@/api/productApi";

// ✅ Local price formatter (since we removed data/products)
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const FeaturedProducts = () => {

  // ✅ Fetch All Products From Backend
  const {
    data: allProducts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: getAllProducts,
  });

  // ✅ Pick 4 Featured Products (Can later change to isFeatured flag)
  const products = allProducts.slice(0, 4);

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">

        {/* Promo Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <FeaturedPromoSlider />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
        >
          <div>
            <span className="text-sm font-semibold tracking-[0.3em] uppercase text-accent">
              Curated For You
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-medium mt-4">
              Bestselling Pieces
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/collections">View All Products</Link>
          </Button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">
              Failed to load featured products
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product: any, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="relative aspect-square bg-card rounded-sm overflow-hidden mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.isNew && (
                        <span className="px-3 py-1.5 bg-accent text-accent-foreground text-sm font-semibold tracking-wide rounded-sm">
                          NEW
                        </span>
                      )}

                      {product.isBestseller && (
                        <span className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-semibold tracking-wide rounded-sm">
                          BESTSELLER
                        </span>
                      )}

                      {product.originalPrice && (
                        <span className="px-3 py-1.5 bg-foreground text-background text-sm font-semibold tracking-wide rounded-sm">
                          SALE
                        </span>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      <Link
                        to="/wishlist"
                        className="w-11 h-11 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart className="h-5 w-5" />
                      </Link>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                      <Button
                        asChild
                        className="w-full gap-2"
                        size="default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to="/cart">
                          <ShoppingBag className="h-5 w-5" />
                          Add to Bag
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Link
                      to={`/${product.category?.toLowerCase()}`}
                      className="text-sm text-muted-foreground tracking-wide uppercase mb-1 hover:text-accent transition-colors"
                    >
                      {product.category}
                    </Link>

                    <h3 className="font-medium text-base text-foreground mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg text-foreground">
                        {formatPrice(product.price)}
                      </span>

                      {product.originalPrice && (
                        <span className="text-base text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          !isLoading &&
          !isError && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Products will appear here once added by the admin.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;