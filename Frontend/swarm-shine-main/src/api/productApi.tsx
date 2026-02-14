import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", // Fixed port to 3000
  withCredentials: true,
});

// Map frontend routes (plural) to backend values (singular/specific)
const categoryMapping: { [key: string]: string } = {
  rings: "ring",
  necklaces: "necklace",
  bracelets: "bracelet",
  earrings: "earrings", // Admin saves as "earrings"
  bangles: "bangles",   // Admin saves as "bangles"
};

// Helper to transform backend product to frontend model
const transformProduct = (product: any) => ({
  ...product,
  id: product.id,
  name: product.product_name,
  price: product.final_price,
  image: product.image_url,
  images: [product.image_url], // Ensure images array exists
  category: product.category,
  tags: product.collection_tag ? [product.collection_tag] : [],

  // Details Page Fields
  description: product.description || "No description available.",
  metal: `${product.metal_type || ""} ${product.purity || ""}`.trim(),
  stone: product.diamond_weight > 0 ? `Diamond ${product.diamond_weight}ct` : "None",
  weight: `${product.metal_weight || 0}g`,
  inStock: product.availability === "in_stock",
  rating: 5, // Default/Placeholder
  reviews: 0, // Default/Placeholder
  originalPrice: product.discount > 0 ? Math.round(product.final_price / (1 - product.discount / 100)) : undefined,
});

// Get All Products
export const getAllProducts = async () => {
  const res = await API.get("/products?limit=50");
  return (res.data.data || []).map(transformProduct);
};

// Get Products By Category
export const getProductsByCategory = async (category: string) => {
  // Convert plural URL param to singular DB value if needed
  const dbCategory = categoryMapping[category.toLowerCase()] || category;

  // Use ilike logic in backend by sending simple string
  const res = await API.get(`/products?category=${dbCategory}&limit=50`);
  return (res.data.data || []).map(transformProduct);
};

// Get Single Product
export const getProductById = async (id: string) => {
  const res = await API.get(`/products/${id}`);
  return transformProduct(res.data);
};