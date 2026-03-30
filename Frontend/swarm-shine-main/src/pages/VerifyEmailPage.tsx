import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus("error");
                setMessage("Verification token is missing.");
                return;
            }

            try {
                const response = await axios.get(`https://swarnim-the-shine-of-gold.onrender.com/auth/verify-email?token=${token}`);
                setStatus("success");
                setMessage(response.data.message || "Your email has been successfully verified!");
            } catch (error: any) {
                console.error("Verification error:", error);
                setStatus("error");
                setMessage(error.response?.data?.error || "Invalid or expired verification token.");
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />
            <main className="pt-40 pb-20">
                <div className="container mx-auto px-4 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card p-10 rounded-2xl border border-border text-center shadow-lg"
                    >
                        {status === "loading" && (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-16 w-16 text-gold animate-spin" />
                                <h1 className="text-3xl font-display font-semibold">Verifying Email</h1>
                                <p className="text-muted-foreground">Please wait while we verify your email address...</p>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="flex flex-col items-center gap-4">
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                                <h1 className="text-3xl font-display font-semibold">Success!</h1>
                                <p className="text-muted-foreground">{message}</p>
                                <Button className="mt-6 w-full h-12 text-lg" variant="gold" asChild>
                                    <Link to="/account">Login Now</Link>
                                </Button>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="flex flex-col items-center gap-4">
                                <XCircle className="h-16 w-16 text-red-500" />
                                <h1 className="text-3xl font-display font-semibold">Verification Failed</h1>
                                <p className="text-muted-foreground">{message}</p>
                                <div className="flex flex-col gap-3 mt-6 w-full">
                                    <Button className="h-12 text-lg" variant="gold" asChild>
                                        <Link to="/register">Back to Register</Link>
                                    </Button>
                                    <Button className="h-12 text-lg" variant="outline" asChild>
                                        <Link to="/account">Try Login</Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default VerifyEmailPage;
