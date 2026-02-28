import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.post(
                "http://localhost:3000/auth/register",
                {
                    name,
                    email,
                    password,
                }
            );

            toast({
                title: "Registration Successful",
                description: "Please check your email to verify your account.",
            });

            // Redirect to login page (AccountPage) or stay here?
            // User said: "In That Email First User Need to Click On Link and Verify Its Email ... Then User Need TO Reenter All Details"
            // So redirecting to login seems appropriate.
            navigate("/account");

        } catch (err: any) {
            toast({
                title: "Registration Failed",
                description:
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    "An error occurred during registration",
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
                            Create Account
                        </h1>

                        <div className="max-w-md mx-auto">
                            <div className="bg-card rounded-xl p-8 shadow-sm border">
                                <h2 className="font-semibold text-2xl mb-6 text-center">
                                    Register
                                </h2>

                                <form onSubmit={handleRegister} className="space-y-5">
                                    <div>
                                        <Label htmlFor="name" className="text-base">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="mt-2 h-12 text-base"
                                            required
                                        />
                                    </div>

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
                                            placeholder="Create a strong password"
                                            className="mt-2 h-12 text-base"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="gold"
                                        className="w-full h-12 text-base mt-4"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Creating Account..." : "Register"}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-muted-foreground text-base">
                                        Already have an account?{" "}
                                        <Link to="/account" className="text-accent hover:underline">
                                            Login here
                                        </Link>
                                    </p>
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

export default RegisterPage;
