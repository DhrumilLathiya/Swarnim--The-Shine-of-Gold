import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import ModifyJewelryPage from "./pages/ModifyJewelryPage";
import SearchPage from "./pages/SearchPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import AccountPage from "./pages/AccountPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import ShippingPage from "./pages/ShippingPage";
import StoryPage from "./pages/StoryPage";
import CareersPage from "./pages/CareersPage";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import ScratchCardPage from "./pages/ScratchCardPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import AddressesPage from "./pages/AddressesPage";

import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WishlistProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Category Routes */}
              <Route path="/rings" element={<CategoryPage />} />
              <Route path="/earrings" element={<CategoryPage />} />
              <Route path="/necklaces" element={<CategoryPage />} />
              <Route path="/bangles" element={<CategoryPage />} />
              <Route path="/collections" element={<CategoryPage />} />

              {/* Product Detail */}
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/product/:id/modify" element={<ModifyJewelryPage />} />

              {/* Utility Pages */}
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/scratch-card" element={<ScratchCardPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/addresses" element={<AddressesPage />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

              {/* Info Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faqs" element={<FAQPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/story" element={<StoryPage />} />
              <Route path="/careers" element={<CareersPage />} />

              {/* User Auth */}
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<OTPVerificationPage />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </WishlistProvider>
  </QueryClientProvider>
);

export default App;
