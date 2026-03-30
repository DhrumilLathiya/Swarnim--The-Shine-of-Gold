import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";

const OTPVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Get email from navigation state (passed from RegisterPage)
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast({
                title: "Invalid OTP",
                description: "Please enter a 6-digit code.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.post("https://swarnim-the-shine-of-gold.onrender.com/auth/verify-otp", {
                email,
                otp,
            });

            toast({
                title: "Verification Successful!",
                description: res.data.message || "Your account has been verified. You can now login.",
            });

            navigate("/account");

        } catch (err: any) {
            toast({
                title: "Verification Failed",
                description: err?.response?.data?.error || "Invalid or expired OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />
            <main className="pt-40 pb-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="bg-card rounded-2xl p-10 shadow-lg border border-border">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-gold/10 rounded-full">
                                    <ShieldCheck className="h-12 w-12 text-gold" />
                                </div>
                            </div>

                            <h2 className="font-display font-semibold text-3xl mb-2 text-center">
                                Verify Your Email
                            </h2>
                            <p className="text-muted-foreground text-center mb-8">
                                Enter the 6-digit code we sent to your email address.
                            </p>

                            <form onSubmit={handleVerify} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        disabled
                                        className="h-12 bg-muted/50 border-border text-base opacity-70"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-sm font-medium">6-Digit OTP</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        className="h-14 text-center text-2xl font-bold tracking-[1em] border-gold/50 focus:border-gold"
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="gold"
                                    className="w-full h-14 text-lg font-semibold shadow-gold-sm hover:shadow-gold transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Verifying...</span>
                                        </div>
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </Button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    Didn't receive the code? Check your spam folder or try again.
                                </p>
                                <Button variant="ghost" className="text-gold hover:text-gold/80 flex items-center gap-2" asChild>
                                    <Link to="/register">
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back to Registration</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OTPVerificationPage;
