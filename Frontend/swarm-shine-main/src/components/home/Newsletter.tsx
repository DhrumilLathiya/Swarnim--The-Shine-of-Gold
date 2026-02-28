import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Newsletter = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-accent">
            Stay Connected
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-medium mt-4 mb-4">
            Join Our Inner Circle
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Be the first to know about new collections, exclusive offers, and styling inspirations.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-accent"
            />
            <Button size="lg" className="h-12 px-8 group">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6">
            By subscribing, you agree to our{" "}
            <Link to="/faqs" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            . Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
