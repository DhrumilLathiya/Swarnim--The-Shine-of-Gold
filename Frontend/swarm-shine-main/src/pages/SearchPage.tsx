import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const popularSearches = [
  "Diamond Ring",
  "Gold Necklace",
  "Pearl Earrings",
  "Wedding Bands",
  "Engagement Rings",
  "Gold Bangles",
];

const categories = [
  { name: "Rings", href: "/rings" },
  { name: "Earrings", href: "/earrings" },
  { name: "Necklaces", href: "/necklaces" },
  { name: "Bangles", href: "/bangles" },
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-semibold mb-8">Search</h1>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for jewelry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-14 h-16 text-lg bg-card border-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="h-6 w-6 text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>

          <div className="space-y-12">
            {/* Popular Searches */}
            <div>
              <h2 className="font-medium text-xl mb-4">Popular Searches</h2>
              <div className="flex flex-wrap gap-3">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-5 py-2.5 bg-card rounded-full text-base hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse Categories */}
            <div>
              <h2 className="font-medium text-xl mb-4">Browse Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    className="p-6 bg-card rounded-lg text-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <span className="font-medium text-lg">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
