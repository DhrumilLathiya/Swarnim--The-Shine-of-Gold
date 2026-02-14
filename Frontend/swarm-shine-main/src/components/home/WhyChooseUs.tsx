import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Award, Truck, RotateCcw } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "BIS Hallmarked",
    description: "Every piece is certified for purity with BIS hallmark guarantee",
    href: "/about#quality",
  },
  {
    icon: Award,
    title: "25+ Years Legacy",
    description: "Trusted by generations for quality craftsmanship and design",
    href: "/story",
  },
  {
    icon: Truck,
    title: "Insured Delivery",
    description: "Free insured shipping across India with secure packaging",
    href: "/shipping",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day hassle-free returns with lifetime exchange policy",
    href: "/faq#returns",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-gold-light">
            Our Promise
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-medium mt-4">
            Why Choose Swarnim
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                to={feature.href}
                className="block text-center group"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-foreground/10 flex items-center justify-center transition-all duration-300 group-hover:bg-gold/20 group-hover:scale-110">
                  <feature.icon className="h-9 w-9 text-gold-light transition-colors group-hover:text-gold" />
                </div>
                <h3 className="font-display text-2xl font-medium mb-3 transition-colors group-hover:text-gold">
                  {feature.title}
                </h3>
                <p className="text-primary-foreground/70 text-base leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
