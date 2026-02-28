import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import modelHero from "@/assets/model-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/30 -skew-x-12 transform origin-top-right" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <span className="inline-block text-sm font-semibold tracking-[0.3em] uppercase text-accent mb-6">
              Handcrafted Elegance
            </span>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-semibold leading-[1.1] mb-6">
              The Shine
              <br />
              <span className="text-gradient-gold">of Gold</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
              Discover exquisite gold jewelry that celebrates tradition with a modern touch. Each piece tells a story of elegance and craftsmanship.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="group text-base px-8 py-6">
                <Link to="/collections">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/collections?filter=new-arrivals">New Arrivals</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-14 mt-14 pt-10 border-t border-border">
              <div>
                <p className="font-display text-5xl font-semibold text-foreground">25+</p>
                <p className="text-base text-muted-foreground mt-1">Years Legacy</p>
              </div>
              <div>
                <p className="font-display text-5xl font-semibold text-foreground">10K+</p>
                <p className="text-base text-muted-foreground mt-1">Happy Customers</p>
              </div>
              <div>
                <p className="font-display text-5xl font-semibold text-foreground">500+</p>
                <p className="text-base text-muted-foreground mt-1">Unique Designs</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-sm overflow-hidden shadow-elegant">
              <img
                src={modelHero}
                alt="Elegant woman wearing Swarnim gold jewelry collection"
                className="w-full h-full object-cover object-center"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
            </div>

            {/* Floating Badge */}
            <Link to="/collections?collection=bridal">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-background p-6 shadow-elegant rounded-sm hover:shadow-lg transition-shadow cursor-pointer"
              >
                <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-1">Featured</p>
                <p className="font-display text-xl font-medium">Bridal Collection</p>
                <p className="text-sm text-muted-foreground">Starting ₹45,000</p>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
