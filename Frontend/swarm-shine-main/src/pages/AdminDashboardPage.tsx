// AdminDashboardPage.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Package, LogOut, Upload, X, Plus, Trash2, ToggleLeft as ToggleOff, ToggleRight as ToggleOn, Calendar } from "lucide-react";
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
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductList from "@/components/admin/ProductList";
import { updateProduct, uploadCatalogImage } from "@/api/productApi";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mode state
  const [activeTab, setActiveTab] = useState("add");
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

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
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [liveGoldRate, setLiveGoldRate] = useState<number>(0);
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  // Coupon State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isFetchingCoupons, setIsFetchingCoupons] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_percent: "",
    expiry_date: "",
    is_active: true,
    min_order_amount: ""
  });

  const fetchCoupons = async () => {
    setIsFetchingCoupons(true);
    try {
      const res = await axios.get("http://localhost:3000/admin/coupons/admin/list");
      setCoupons(res.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setIsFetchingCoupons(false);
    }
  };

  useEffect(() => {
    if (activeTab === "coupons") {
      fetchCoupons();
    }
  }, [activeTab]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/admin/coupons/admin/create", newCoupon);
      toast({ title: "Coupon Created", description: "Your new coupon is live." });
      setIsAddingCoupon(false);
      setNewCoupon({ code: "", discount_percent: "", expiry_date: "", is_active: true, min_order_amount: "" });
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create coupon",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/admin/coupons/admin/delete/${id}`);
      toast({ title: "Coupon Deleted" });
      fetchCoupons();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" });
    }
  };

  const handleToggleCoupon = async (coupon: any) => {
    try {
      await axios.put(`http://localhost:3000/admin/coupons/admin/update/${coupon.id}`, {
        ...coupon,
        is_active: !coupon.is_active
      });
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update coupon",
        variant: "destructive"
      });
    }
  };

  // Calculate Final Price
  const calculateFinalPrice = () => {
    const rate = metalType.toLowerCase() === "gold" ? liveGoldRate : (metalPrice as number || 0);

    if (rate === 0 || makingCharges === "" || metalWeight === "") {
      return 0;
    }
    const basePrice =
      rate * (metalWeight as number) +
      (makingCharges as number);
    const discountAmount = basePrice * ((discount as number || 0) / 100);
    return Math.round(basePrice - discountAmount);
  };

  // Auto-fetch Gold Rate
  useEffect(() => {
    const fetchRate = async () => {
      if (metalType.toLowerCase() === "gold" && purity) {
        setIsFetchingRate(true);
        try {
          const res = await axios.get(`http://localhost:3000/rates/metal/gold?purity=${purity}`);
          setLiveGoldRate(res.data.price_per_gram);
          setMetalPrice(res.data.price_per_gram); // Keep for backend compat if needed
        } catch (error) {
          console.error("Error fetching gold rate:", error);
          toast({
            title: "Rate Fetch Failed",
            description: "Could not get live gold rate. Please check connection.",
            variant: "destructive",
          });
        } finally {
          setIsFetchingRate(false);
        }
      } else {
        setLiveGoldRate(0);
      }
    };

    fetchRate();
  }, [metalType, purity]);

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
    if (isEditing) {
      setExistingImageUrl(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/account");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const handleEditClick = (product: any) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    setProductName(product.name || "");
    setCategory(product.category || "");
    setCollectionTag(product.collection_tag || "");
    setDescription(product.description || "");
    setSku(product.sku || "");
    setMetalPrice(product.metal_price_per_gram || "");
    setMakingCharges(product.making_charges || "");
    setMetalWeight(product.metal_weight || "");
    setDiscount(product.discount || 0);
    setMetalType(product.metal_type || "");
    setPurity(product.purity || "");
    setStonePresent(product.diamond_weight > 0 ? "yes" : "no");
    setStockQuantity(product.stock_quantity || "");
    setAvailability(product.availability || "");
    setExistingImageUrl(product.image || null);
    setImagePreview(product.image || null);
    setActiveTab("add"); // Switch to form tab
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProductId(null);
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
    setExistingImageUrl(null);
    setLiveGoldRate(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName || !category || !collectionTag || !description || !sku) {
      toast({
        title: "Missing Product Details",
        description: "Please fill in all product detail fields.",
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

    if (makingCharges === "" || metalWeight === "") {
      toast({
        title: "Missing Pricing Details",
        description: "Please fill in all pricing detail fields.",
        variant: "destructive",
      });
      return;
    }

    if (stonePresent === "yes" && !stoneType && !isEditing) {
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

    if (!productImage && !existingImageUrl) {
      toast({
        title: "Missing Product Image",
        description: "Please upload a product image.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let imageUrl = existingImageUrl;

      // 1. UPLOAD IMAGE IF NEW ONE SELECTED
      if (productImage) {
        const uploadRes = await uploadCatalogImage(productImage);
        imageUrl = uploadRes.imageUrl;
      }

      // 2. PREPARE PRODUCT DATA
      const productData: any = {
        product_name: productName,
        category,
        collection_tag: collectionTag,
        sku,
        metal_type: metalType,
        purity,
        metal_weight: metalWeight,
        making_charges: makingCharges,
        stock_quantity: stockQuantity,
        availability,
        description,
        image_url: imageUrl,
        metal_price: metalType.toLowerCase() === "gold" ? liveGoldRate : Number(metalPrice),
        discount: discount || 0,
      };

      if (isEditing && editingProductId) {
        // 3a. UPDATE EXISTING PRODUCT
        await updateProduct(editingProductId, productData);
        toast({
          title: "Product Updated Successfully!",
          description: `${productName} has been updated.`,
        });
      } else {
        // 3b. CREATE NEW PRODUCT
        productData.diamond_weight = 0;
        productData.diamond_quality = "VVS1";

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
      }

      resetForm();
      if (isEditing) {
        setActiveTab("manage");
      }

    } catch (error: any) {
      console.error("Submit Error:", error);
      const backendError = error?.response?.data;
      const errorMsg = backendError?.detail || backendError?.message || backendError?.error || "Backend error";

      toast({
        title: isEditing ? "Error Updating Product" : "Error Adding Product",
        description: errorMsg,
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-10 h-14 p-1">
                <TabsTrigger value="add" className="text-lg">
                  {isEditing ? "Edit Product" : "Add New Product"}
                </TabsTrigger>
                <TabsTrigger value="manage" className="text-lg" onClick={() => { resetForm(); setActiveTab("manage"); }}>
                  Manage Products
                </TabsTrigger>
                <TabsTrigger value="coupons" className="text-lg">
                  Discount Coupons
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add">
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Cancel Edit Button */}
                  {isEditing && (
                    <div className="flex justify-end mb-4">
                      <Button type="button" variant="outline" onClick={() => {
                        resetForm();
                        setActiveTab("manage");
                      }}>
                        Cancel Editing
                      </Button>
                    </div>
                  )}

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

                  {/* B. Material Details (Swapped from C) */}
                  <div className="bg-card rounded-xl p-8 border border-border">
                    <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                      B. Material Details
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

                  {/* C. Pricing Details (Swapped from B) */}
                  <div className="bg-card rounded-xl p-8 border border-border">
                    <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                      C. Pricing Details
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Live Metal Price Display */}
                      <div className="md:col-span-2">
                        <Label className="text-base">Metal Price (Per Gram) ₹</Label>
                        <div className="mt-2 h-12 flex items-center justify-between px-4 rounded-md bg-muted/50 border border-border italic">
                          <span>
                            {metalType.toLowerCase() === "gold" ? `Live ${purity.toUpperCase()} Rate` : "Metal Price"}
                          </span>
                          <span className="font-semibold text-foreground">
                            {isFetchingRate ? "Fetching..." : `₹${(liveGoldRate || metalPrice || 0).toLocaleString("en-IN")}`}
                          </span>
                        </div>
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
                      {isEditing ? "Update Product" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="manage">
                <ProductList onEdit={handleEditClick} />
              </TabsContent>

              <TabsContent value="coupons">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Manage Discount Coupons</h2>
                      <p className="text-muted-foreground mt-1">
                        Active Coupons: <span className="font-bold text-gold">{coupons.filter(c => c.is_active).length} / 10</span>
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsAddingCoupon(!isAddingCoupon)}
                      variant={isAddingCoupon ? "outline" : "gold"}
                      className="gap-2"
                      disabled={!isAddingCoupon && coupons.filter(c => c.is_active).length >= 10}
                    >
                      {isAddingCoupon ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {isAddingCoupon ? "Cancel" : "Create New Coupon"}
                    </Button>
                  </div>

                  {isAddingCoupon && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-card rounded-xl p-8 border border-border"
                    >
                      <form onSubmit={handleCreateCoupon} className="grid md:grid-cols-3 gap-6">
                        <div>
                          <Label>Coupon Code *</Label>
                          <Input
                            placeholder="e.g., WELCOME10"
                            value={newCoupon.code}
                            onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Discount Percentage (%) *</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 10"
                            value={newCoupon.discount_percent}
                            onChange={e => setNewCoupon({ ...newCoupon, discount_percent: e.target.value })}
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Expiry Date (Optional)</Label>
                          <Input
                            type="date"
                            value={newCoupon.expiry_date}
                            onChange={e => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Min Order Amount (₹)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newCoupon.min_order_amount}
                            onChange={e => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button type="submit" variant="gold" className="w-full h-10">
                            Create Coupon
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold">Code</th>
                          <th className="px-6 py-4 text-left font-semibold">Discount</th>
                          <th className="px-6 py-4 text-left font-semibold">Status</th>
                          <th className="px-6 py-4 text-left font-semibold">Expiry</th>
                          <th className="px-6 py-4 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {isFetchingCoupons ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading coupons...</td></tr>
                        ) : coupons.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No coupons created yet.</td></tr>
                        ) : coupons.map((coupon) => (
                          <tr key={coupon.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-gold">{coupon.code}</td>
                            <td className="px-6 py-4 font-semibold">{coupon.discount_percent}% OFF</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleCoupon(coupon)}
                                className={`flex items-center gap-2 ${coupon.is_active ? 'text-green-600' : 'text-muted-foreground'}`}
                              >
                                {coupon.is_active ? <ToggleOn className="h-6 w-6" /> : <ToggleOff className="h-6 w-6" />}
                                {coupon.is_active ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
