import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import modelHero from "@/assets/model-hero.jpg";

const ModelVideoSection = () => {
  return (
    <section className="relative py-0">
      <div className="relative h-[80vh] md:h-[90vh] overflow-hidden">
        {/* Background Image */}
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={modelHero}
            alt="Model wearing luxury jewelry"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-gold/20 rounded-full animate-pulse opacity-50" />
        <div className="absolute bottom-32 right-20 w-48 h-48 border border-gold/10 rounded-full animate-pulse opacity-30 hidden md:block" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
              >
                <Sparkles className="h-4 w-4 text-gold" />
                <span className="text-gold text-xs font-semibold tracking-widest uppercase">
                  Signature Collection
                </span>
              </motion.div>

              <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-4 leading-tight">
                Elegance
                <br />
                <span className="text-gold">Redefined</span>
              </h2>
              
              <p className="text-white/80 text-lg md:text-xl mb-8 max-w-md leading-relaxed">
                Experience the artistry of our master craftsmen. Each piece tells a story of heritage, elegance, and timeless beauty.
              </p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex gap-8 mb-10"
              >
                <div>
                  <span className="font-display text-3xl md:text-4xl font-bold text-gold">500+</span>
                  <p className="text-white/60 text-sm mt-1">Exclusive Designs</p>
                </div>
                <div>
                  <span className="font-display text-3xl md:text-4xl font-bold text-gold">25+</span>
                  <p className="text-white/60 text-sm mt-1">Years Legacy</p>
                </div>
                <div>
                  <span className="font-display text-3xl md:text-4xl font-bold text-gold">100%</span>
                  <p className="text-white/60 text-sm mt-1">BIS Certified</p>
                </div>
              </motion.div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gold hover:bg-gold-light text-foreground group"
                >
                  <Link to="/collections" className="flex items-center gap-2">
                    Explore Collection
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white hover:text-foreground backdrop-blur-sm"
                >
                  <Link to="/story">Our Story</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/50 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
          >
            <motion.div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModelVideoSection;
