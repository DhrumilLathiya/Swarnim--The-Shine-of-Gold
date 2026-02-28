import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Users, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-base text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">About Us</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-8">About Swarnim</h1>
            
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              <div>
                <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                  For over 25 years, Swarnim has been crafting exquisite gold jewelry that celebrates 
                  the rich heritage of Indian craftsmanship while embracing contemporary design sensibilities.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Our journey began with a simple vision: to create timeless pieces that become 
                  treasured heirlooms, passed down through generations. Today, we continue to uphold 
                  that vision with every piece we craft.
                </p>
                <Button asChild size="lg" className="text-base">
                  <Link to="/collections">Explore Our Collection</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Award, title: "25+ Years", subtitle: "Of Excellence" },
                  { icon: Users, title: "10,000+", subtitle: "Happy Customers" },
                  { icon: MapPin, title: "50+", subtitle: "Stores Nationwide" },
                  { icon: Clock, title: "24/7", subtitle: "Customer Support" },
                ].map((stat, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-6 text-center">
                    <stat.icon className="h-10 w-10 text-accent mx-auto mb-3" />
                    <p className="font-display text-3xl font-semibold">{stat.title}</p>
                    <p className="text-base text-muted-foreground">{stat.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
