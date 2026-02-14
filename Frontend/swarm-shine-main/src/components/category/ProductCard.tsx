import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

// ✅ Local Product Type (Since data/products removed)
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

// ✅ Local Price Formatter
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-card mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-accent text-accent-foreground text-sm px-3 py-1.5 rounded font-medium">
                NEW
              </span>
            )}

            {product.isBestseller && (
              <span className="bg-primary text-primary-foreground text-sm px-3 py-1.5 rounded font-medium">
                BESTSELLER
              </span>
            )}

            {product.originalPrice && (
              <span className="bg-green-600 text-white text-sm px-3 py-1.5 rounded font-medium">
                SALE
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 w-11 h-11 bg-background/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            {product.category}
          </p>

          <h3 className="font-medium text-base group-hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {formatPrice(product.price)}
            </span>

            {product.originalPrice && (
              <span className="text-muted-foreground text-base line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;