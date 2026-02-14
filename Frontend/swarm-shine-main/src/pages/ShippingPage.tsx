import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, Shield, Clock, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ShippingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-base text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Shipping Information</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-8">
              Shipping Information
            </h1>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { icon: Truck, title: "Free Shipping", desc: "On orders above ₹10,000" },
                { icon: Shield, title: "Insured Delivery", desc: "100% secure packaging" },
                { icon: Clock, title: "Fast Delivery", desc: "3-7 business days" },
                { icon: MapPin, title: "Pan India", desc: "Delivery across India" },
              ].map((item, i) => (
                <div key={i} className="bg-muted/30 rounded-lg p-6 text-center">
                  <item.icon className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                  <p className="text-base text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="prose prose-neutral max-w-none">
              <h2 className="font-display text-2xl font-medium mb-4">Delivery Timeline</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Standard delivery takes 3-7 business days for metro cities and 7-10 business days 
                for other locations. Express delivery options are available at checkout.
              </p>

              <h2 className="font-display text-2xl font-medium mb-4 mt-8">Shipping Charges</h2>
              <ul className="text-muted-foreground text-lg space-y-2 mb-6">
                <li>• Free shipping on orders above ₹10,000</li>
                <li>• ₹199 flat rate for orders below ₹10,000</li>
                <li>• Express delivery: Additional ₹299</li>
              </ul>

              <h2 className="font-display text-2xl font-medium mb-4 mt-8">International Shipping</h2>
              <p className="text-muted-foreground text-lg">
                Currently, we ship within India only. International shipping will be available soon.
                Please contact us for special arrangements.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPage;
