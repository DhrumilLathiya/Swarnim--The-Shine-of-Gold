import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add interceptor to include token in all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
const transformProduct = (product: any) => {
  // Extract primary variant data if available
  const primaryVariant = product.product_variants?.[0] || {};
  const primaryImage = product.product_images?.[0]?.image_url || product.image_url;

  return {
    ...product,
    id: product.id,
    name: product.product_name || product.title,
    price: product.final_price || primaryVariant.additional_price || 0,
    image: primaryImage && primaryImage.startsWith("http")
      ? primaryImage
      : `${API_BASE_URL}${primaryImage}`,
    images: product.product_images?.length
      ? product.product_images.map((img: any) => img.image_url)
      : [product.image_url],
    category: product.category,
    tags: product.collection_tag ? [product.collection_tag] : [],

    // Details Page Fields
    description: product.description || "No description available.",
    metal: `${product.metal_type || primaryVariant.metal_type || ""} ${product.purity || primaryVariant.purity || ""}`.trim() || "Gold 22K",
    stone: (product.diamond_weight || 0) > 0 ? `Diamond ${product.diamond_weight}ct` : "None",
    weight: `${product.metal_weight || primaryVariant.weight || 0}g`,
    inStock: product.availability
      ? (product.availability === "available" || product.availability === "in_stock")
      : (primaryVariant.stock_quantity > 0),
    rating: 5,
    reviews: 0,
    originalPrice: product.discount > 0 ? Math.round((product.final_price || primaryVariant.additional_price) / (1 - product.discount / 100)) : undefined,
  };
};

// Get All Products
export const getAllProducts = async () => {
  const res = await API.get("/products?limit=50");
  return (res.data.data || []).map(transformProduct);
};

// Get Products By Category
export const getProductsByCategory = async (category: string) => {
  const lowerCategory = category.toLowerCase();

  // If "collections", fetch all products (no category filter)
  if (lowerCategory === "collections") {
    return getAllProducts();
  }

  // Convert plural URL param to singular DB value if needed
  const dbCategory = categoryMapping[lowerCategory] || lowerCategory;

  // Use ilike logic in backend by sending simple string
  const res = await API.get(`/products?category=${dbCategory}&limit=50`);
  return (res.data.data || []).map(transformProduct);
};

// Get Single Product
export const getProductById = async (id: string) => {
  const res = await API.get(`/products/${id}`);
  return transformProduct(res.data);
};

// Update Product (Admin)
export const updateProduct = async (id: string, productData: any) => {
  const token = localStorage.getItem("token");
  const res = await API.put(`/admin/jewellery/${id}`, productData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Segment Image (Roboflow)
export const segmentImage = async (imageUrl: string, category?: string) => {
  const token = localStorage.getItem("token");
  const res = await API.post("/ai/segment", { image_url: imageUrl, category }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Upload Reference Image (Manually Segged)
export const uploadRefImage = async (blob: Blob) => {
  const formData = new FormData();
  formData.append("image", blob, `segmented-${Date.now()}.png`);
  const res = await API.post("/upload?bucket=segmented", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Upload Catalog Image (Admin)
export const uploadCatalogImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await API.post("/upload?bucket=catalog", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Generate New Design (Gemini AI - image + prompt)
export const generateDesign = async (prompt: string, referenceImageUrl?: string, originalImageUrl?: string) => {
  const res = await API.post("/ai/generate-design", {
    prompt,
    reference_image_url: referenceImageUrl || null,
    original_image_url: originalImageUrl || null,
  }, {
    timeout: 120000, // 2 minute timeout
  });
  return res.data;
};

// Delete Product (Admin)
export const deleteProduct = async (id: string) => {
  const token = localStorage.getItem("token");
  const res = await API.delete(`/admin/jewellery/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};