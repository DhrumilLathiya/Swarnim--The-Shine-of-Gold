//AccountPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, CreditCard, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios"; // ✅ ONLY NEW IMPORT

const AccountPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ ONLY THIS FUNCTION CHANGED
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/login",
        {
          email,
          password,
        }
      );

      // Save JWT Token
      localStorage.setItem("token", res.data.access_token);

    if (res.data.user?.role === "ADMIN") {
      localStorage.setItem("isAdminLoggedIn", "true");
    }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      navigate("/admin/dashboard");

    } catch (err: any) {
      toast({
        title: "Login Failed",
        description:
          err?.response?.data?.message ||
          "Invalid email or password",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-semibold mb-8 text-center">
              My Account
            </h1>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">

                {/* Sidebar — UNCHANGED */}
                <div className="space-y-2">
                  <Link to="/account" className="flex items-center gap-3 p-4 rounded-lg bg-card hover:bg-accent transition-colors text-base">
                    <User className="h-6 w-6" />
                    <span>Profile</span>
                  </Link>

                  <Link to="/account/orders" className="flex items-center gap-3 p-4 rounded-lg hover:bg-card transition-colors text-base">
                    <Package className="h-6 w-6" />
                    <span>My Orders</span>
                  </Link>

                  <Link to="/wishlist" className="flex items-center gap-3 p-4 rounded-lg hover:bg-card transition-colors text-base">
                    <Heart className="h-6 w-6" />
                    <span>Wishlist</span>
                  </Link>

                  <Link to="/account/addresses" className="flex items-center gap-3 p-4 rounded-lg hover:bg-card transition-colors text-base">
                    <MapPin className="h-6 w-6" />
                    <span>Addresses</span>
                  </Link>

                  <Link to="/account/payment" className="flex items-center gap-3 p-4 rounded-lg hover:bg-card transition-colors text-base">
                    <CreditCard className="h-6 w-6" />
                    <span>Payment Methods</span>
                  </Link>

                  <Link to="/account/settings" className="flex items-center gap-3 p-4 rounded-lg hover:bg-card transition-colors text-base">
                    <Settings className="h-6 w-6" />
                    <span>Settings</span>
                  </Link>

                  <button className="flex items-center gap-3 p-4 rounded-lg w-full text-left hover:bg-card transition-colors text-red-500 text-base">
                    <LogOut className="h-6 w-6" />
                    <span>Logout</span>
                  </button>
                </div>

                {/* Main Content — UNCHANGED */}
                <div className="md:col-span-2">
                  <div className="bg-card rounded-xl p-8">
                    <h2 className="font-semibold text-2xl mb-6">
                      Login to Your Account
                    </h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <Label htmlFor="email" className="text-base">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="mt-2 h-12 text-base"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-base">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="mt-2 h-12 text-base"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Link to="/forgot-password" className="text-base text-accent hover:underline">
                          Forgot Password?
                        </Link>
                      </div>

                      <Button
                        type="submit"
                        variant="gold"
                        className="w-full h-12 text-base"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground text-base">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-accent hover:underline">
                          Register here
                        </Link>
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountPage;