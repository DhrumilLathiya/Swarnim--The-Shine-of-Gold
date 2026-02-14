import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-base text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Contact Us</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-4">Contact Us</h1>
            <p className="text-muted-foreground text-lg mb-12">We'd love to hear from you. Reach out to us anytime.</p>
            
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-muted/30 rounded-lg p-8">
                <h2 className="font-display text-2xl font-medium mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder="Your Name" className="bg-background h-12 text-base" />
                    <Input type="email" placeholder="Email Address" className="bg-background h-12 text-base" />
                  </div>
                  <Input placeholder="Subject" className="bg-background h-12 text-base" />
                  <Textarea placeholder="Your Message" rows={5} className="bg-background text-base" />
                  <Button type="submit" size="lg" className="text-base">Send Message</Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                {[
                  { icon: MapPin, title: "Visit Our Store", content: "123 Jewelry Lane, Mumbai, Maharashtra 400001" },
                  { icon: Phone, title: "Call Us", content: "+91 22 1234 5678" },
                  { icon: Mail, title: "Email Us", content: "hello@swarnim.com" },
                  { icon: Clock, title: "Business Hours", content: "Mon - Sat: 10 AM - 8 PM" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-base">{item.content}</p>
                    </div>
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

export default ContactPage;
