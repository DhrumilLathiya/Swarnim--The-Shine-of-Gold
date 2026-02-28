import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import modelRings from "@/assets/model-rings.jpg";
import collectionNecklaces from "@/assets/collection-necklaces.jpg";
import modelEarrings from "@/assets/model-earrings.jpg";

const categories = [
  {
    name: "Rings",
    description: "Elegant bands & statement pieces",
    image: modelRings,
    href: "/rings",
    count: "120+ Designs",
  },
  {
    name: "Necklaces",
    description: "Timeless chains & pendants",
    image: collectionNecklaces,
    href: "/necklaces",
    count: "200+ Designs",
  },
  {
    name: "Earrings",
    description: "Studs, drops & chandeliers",
    image: modelEarrings,
    href: "/earrings",
    count: "180+ Designs",
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-accent">
            Shop By Category
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-medium mt-4">
            Find Your Style
          </h2>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link to={category.href} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                  <img
                    src={category.image}
                    alt={`${category.name} collection`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <p className="text-sm font-medium tracking-widest uppercase text-gold-light mb-2">
                      {category.count}
                    </p>
                    <h3 className="font-display text-4xl text-background mb-1">
                      {category.name}
                    </h3>
                    <p className="text-background/80 text-base">
                      {category.description}
                    </p>
                    
                    {/* Arrow */}
                    <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                      <ArrowUpRight className="h-6 w-6 text-background group-hover:text-accent-foreground" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
