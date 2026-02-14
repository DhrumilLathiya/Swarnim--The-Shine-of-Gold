import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const faqs = [
  {
    question: "What is BIS Hallmarking?",
    answer: "BIS Hallmarking is a purity certification by the Bureau of Indian Standards that guarantees the quality and purity of gold jewelry. All Swarnim jewelry is BIS hallmarked."
  },
  {
    question: "Do you offer free shipping?",
    answer: "Yes, we offer free insured shipping on all orders above ₹10,000. For orders below this amount, a nominal shipping fee applies."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day hassle-free return policy. If you're not satisfied with your purchase, you can return it for a full refund or exchange."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can use this to track your order on our website or the courier's website."
  },
  {
    question: "Do you offer EMI options?",
    answer: "Yes, we offer easy EMI options on orders above ₹15,000. You can choose from various EMI plans during checkout."
  },
  {
    question: "Can I customize jewelry designs?",
    answer: "Yes, we offer customization services for select designs. Please contact our customer support team for more details."
  },
];

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-base text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">FAQs</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-4 text-center">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg text-center mb-12">
              Find answers to common questions about our products and services.
            </p>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-muted/30 rounded-lg px-6 border-0"
                >
                  <AccordionTrigger className="text-left font-medium text-lg hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground text-base mb-4">Still have questions?</p>
              <Link to="/contact" className="text-accent hover:underline font-medium text-lg">
                Contact our support team →
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
