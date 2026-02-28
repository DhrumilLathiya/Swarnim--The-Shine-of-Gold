import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const StoryPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-base text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Our Story</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <h1 className="font-display text-4xl md:text-5xl font-semibold mb-8">Our Story</h1>
            
            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                In 1998, in the heart of Mumbai's bustling jewelry district, Swarnim was born from 
                a simple dream: to create jewelry that captures the essence of Indian tradition 
                while embracing modern elegance.
              </p>

              <p>
                Our founder, with decades of experience in goldsmithing, envisioned a brand that 
                would make premium gold jewelry accessible to every Indian household. Starting from 
                a small workshop, we grew through word-of-mouth recommendations from satisfied customers.
              </p>

              <p>
                Today, Swarnim stands as a testament to that vision. With over 50 stores across India 
                and thousands of happy customers, we continue to craft jewelry that becomes part of 
                your family's most cherished moments.
              </p>

              <p>
                Every piece of Swarnim jewelry carries with it our commitment to quality, 
                craftsmanship, and the belief that gold is more than just a metal – it's a 
                symbol of love, celebration, and tradition.
              </p>

              <div className="pt-8">
                <Link to="/collections" className="text-accent hover:underline font-medium">
                  Explore our collections →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StoryPage;
