// AdminDashboardPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Package, LogOut, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";   // ✅ ADDED ONLY THIS

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Product Details
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [collectionTag, setCollectionTag] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");

  // Pricing Details
  const [metalPrice, setMetalPrice] = useState<number | "">("");
  const [makingCharges, setMakingCharges] = useState<number | "">("");
  const [metalWeight, setMetalWeight] = useState<number | "">("");
  const [discount, setDiscount] = useState<number | "">(0);

  // Material Details
  const [metalType, setMetalType] = useState("");
  const [purity, setPurity] = useState("");
  const [stonePresent, setStonePresent] = useState("no");
  const [stoneType, setStoneType] = useState("");

  // Inventory Details
  const [stockQuantity, setStockQuantity] = useState<number | "">("");
  const [availability, setAvailability] = useState("");

  // Media Upload
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Calculate Final Price
  const calculateFinalPrice = () => {
    if (metalPrice === "" || makingCharges === "" || metalWeight === "") {
      return 0;
    }
    const basePrice =
      (metalPrice as number) * (metalWeight as number) +
      (makingCharges as number);
    const discountAmount = basePrice * ((discount as number || 0) / 100);
    return Math.round(basePrice - discountAmount);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProductImage(null);
    setImagePreview(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/account");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  // ✅ ONLY THIS FUNCTION MODIFIED (Backend Added)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ===== ORIGINAL VALIDATION (UNCHANGED) =====
    if (!productName || !category || !collectionTag || !description || !sku) {
      toast({
        title: "Missing Product Details",
        description: "Please fill in all product detail fields.",
        variant: "destructive",
      });
      return;
    }

    if (metalPrice === "" || makingCharges === "" || metalWeight === "") {
      toast({
        title: "Missing Pricing Details",
        description: "Please fill in all pricing detail fields.",
        variant: "destructive",
      });
      return;
    }

    if (!metalType || !purity) {
      toast({
        title: "Missing Material Details",
        description: "Please fill in all material detail fields.",
        variant: "destructive",
      });
      return;
    }

    if (stonePresent === "yes" && !stoneType) {
      toast({
        title: "Missing Stone Type",
        description: "Please select the stone type.",
        variant: "destructive",
      });
      return;
    }

    if (stockQuantity === "" || !availability) {
      toast({
        title: "Missing Inventory Details",
        description: "Please fill in all inventory detail fields.",
        variant: "destructive",
      });
      return;
    }

    if (!productImage) {
      toast({
        title: "Missing Product Image",
        description: "Please upload a product image.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 1. UPLOAD IMAGE FIRST
      const formData = new FormData();
      formData.append("image", productImage);

      const uploadRes = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = uploadRes.data.imageUrl;

      // 2. PREPARE PRODUCT DATA
      // Map frontend fields to backend expected fields
      const productData = {
        product_name: productName,
        category,
        collection_tag: collectionTag, // Added missing field
        sku,
        metal_type: metalType,
        purity,
        metal_weight: metalWeight,
        making_charges: makingCharges,
        stock_quantity: stockQuantity,
        availability,
        description,
        image_url: imageUrl,

        // Manual Price Override fields
        final_price: calculateFinalPrice(),
        metal_price: Number(metalPrice), // Sending manual metal price to backend
        discount: discount || 0,

        // Extra fields implicit in frontend but needed for backend schema
        diamond_weight: 0, // Default if not captured
        diamond_quality: "VVS1", // Default
      };

      // 3. SEND TO ADMIN ENDPOINT
      await axios.post(
        "http://localhost:3000/admin/jewellery",
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Product Added Successfully!",
        description: `${productName} has been added to the catalog.`,
      });

      // ===== ORIGINAL RESET (UNCHANGED) =====
      setProductName("");
      setCategory("");
      setCollectionTag("");
      setDescription("");
      setSku("");
      setMetalPrice("");
      setMakingCharges("");
      setMetalWeight("");
      setDiscount(0);
      setMetalType("");
      setPurity("");
      setStonePresent("no");
      setStoneType("");
      setStockQuantity("");
      setAvailability("");
      setProductImage(null);
      setImagePreview(null);

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error Adding Product",
        description: error?.response?.data?.detail || error?.response?.data?.error || "Backend error",
        variant: "destructive",
      });
    }
  };

  return (
    // ⭐ YOUR FULL JSX EXACT SAME — NOT TOUCHED
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-gold">
                  <Package className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-semibold">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Add new jewelry products to your catalog</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-10">
              {/* A. Product Details */}
              <div className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                  A. Product Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <Label htmlFor="productName" className="text-base">Product Name *</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g., 22K Gold Bridal Necklace"
                      className="mt-2 h-12"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <Label className="text-base">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="necklace">Necklace</SelectItem>
                        <SelectItem value="ring">Ring</SelectItem>
                        <SelectItem value="bracelet">Bracelet</SelectItem>
                        <SelectItem value="earrings">Earrings</SelectItem>
                        <SelectItem value="bangles">Bangles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Collection Tag */}
                  <div>
                    <Label className="text-base">Collection Tag *</Label>
                    <Select value={collectionTag} onValueChange={setCollectionTag}>
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-arrival">New Arrival</SelectItem>
                        <SelectItem value="bestseller">Bestseller</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="couple-rings">Couple Rings</SelectItem>
                        <SelectItem value="dailywear">Dailywear</SelectItem>
                        <SelectItem value="special-deals">Special Deals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-base">Product Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter detailed product description..."
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <Label htmlFor="sku" className="text-base">Product SKU / Code *</Label>
                    <Input
                      id="sku"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g., NECK-22K-001"
                      className="mt-2 h-12"
                    />
                  </div>
                </div>
              </div>

              {/* B. Pricing Details */}
              <div className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                  B. Pricing Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Metal Price */}
                  <div>
                    <Label htmlFor="metalPrice" className="text-base">Metal Price (Per Gram) ₹ *</Label>
                    <Input
                      id="metalPrice"
                      type="number"
                      value={metalPrice}
                      onChange={(e) => setMetalPrice(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g., 5500"
                      className="mt-2 h-12"
                    />
                  </div>

                  {/* Making Charges */}
                  <div>
                    <Label htmlFor="makingCharges" className="text-base">Making Charges ₹ *</Label>
                    <Input
                      id="makingCharges"
                      type="number"
                      value={makingCharges}
                      onChange={(e) => setMakingCharges(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g., 3000"
                      className="mt-2 h-12"
                    />
                  </div>

                  {/* Metal Weight */}
                  <div>
                    <Label htmlFor="metalWeight" className="text-base">Metal Weight (grams) *</Label>
                    <Input
                      id="metalWeight"
                      type="number"
                      step="0.01"
                      value={metalWeight}
                      onChange={(e) => setMetalWeight(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g., 15.5"
                      className="mt-2 h-12"
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <Label htmlFor="discount" className="text-base">Discount %</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : 0)}
                      placeholder="e.g., 10"
                      className="mt-2 h-12"
                    />
                  </div>

                  {/* Final Price */}
                  <div className="md:col-span-2">
                    <Label className="text-base">Final Price (Auto Calculated)</Label>
                    <div className="mt-2 h-12 flex items-center px-4 rounded-md bg-muted border border-border">
                      <span className="text-2xl font-semibold text-gold">
                        ₹{calculateFinalPrice().toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* C. Material Details */}
              <div className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                  C. Material Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Metal Type */}
                  <div>
                    <Label className="text-base">Metal Type *</Label>
                    <Select value={metalType} onValueChange={setMetalType}>
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue placeholder="Select metal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="diamond-jewelry">Diamond Jewelry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Purity */}
                  <div>
                    <Label className="text-base">Purity *</Label>
                    <Select value={purity} onValueChange={setPurity}>
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue placeholder="Select purity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24k">24K</SelectItem>
                        <SelectItem value="22k">22K</SelectItem>
                        <SelectItem value="20k">20K</SelectItem>
                        <SelectItem value="18k">18K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stone Present */}
                  <div className="md:col-span-2">
                    <Label className="text-base mb-3 block">Stone Present *</Label>
                    <RadioGroup
                      value={stonePresent}
                      onValueChange={setStonePresent}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="stone-yes" />
                        <Label htmlFor="stone-yes" className="cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="stone-no" />
                        <Label htmlFor="stone-no" className="cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Stone Type (Conditional) */}
                  {stonePresent === "yes" && (
                    <div className="md:col-span-2">
                      <Label className="text-base">Stone Type *</Label>
                      <Select value={stoneType} onValueChange={setStoneType}>
                        <SelectTrigger className="mt-2 h-12">
                          <SelectValue placeholder="Select stone type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diamond">Diamond</SelectItem>
                          <SelectItem value="ruby">Ruby</SelectItem>
                          <SelectItem value="emerald">Emerald</SelectItem>
                          <SelectItem value="sapphire">Sapphire</SelectItem>
                          <SelectItem value="pearl">Pearl</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* D. Inventory Details */}
              <div className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                  D. Inventory Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Stock Quantity */}
                  <div>
                    <Label htmlFor="stockQuantity" className="text-base">Stock Quantity *</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g., 10"
                      className="mt-2 h-12"
                    />
                  </div>

                  {/* Availability */}
                  <div>
                    <Label className="text-base">Availability *</Label>
                    <Select value={availability} onValueChange={setAvailability}>
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        <SelectItem value="made_to_order">Made to Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* E. Media Upload */}
              <div className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                  E. Media Upload
                </h2>
                <div>
                  <Label className="text-base">Product Image *</Label>
                  {!imagePreview ? (
                    <label
                      htmlFor="productImage"
                      className="mt-2 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG or WEBP (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        id="productImage"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  ) : (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full max-h-80 object-contain rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" variant="gold" size="lg" className="px-12">
                  Add Product
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
