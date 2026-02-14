import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SubCategory {
  name: string;
  href: string;
}

interface NavCategory {
  name: string;
  href: string;
  subcategories?: {
    featured?: SubCategory[];
    byStyle?: SubCategory[];
    byMetal?: SubCategory[];
    byPrice?: SubCategory[];
  };
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navLinks: NavCategory[] = [
    {
      name: "Rings",
      href: "/rings",
      subcategories: {
        featured: [
          { name: "Latest Designs", href: "/rings?filter=latest" },
          { name: "Bestsellers", href: "/rings?filter=bestseller" },
          { name: "Special Deals", href: "/rings?filter=deals" },
        ],
        byStyle: [
          { name: "All Rings", href: "/rings" },
          { name: "Engagement", href: "/rings?filter=engagement" },
          { name: "Dailywear", href: "/rings?filter=dailywear" },
          { name: "Solitaire", href: "/rings?filter=solitaire" },
          { name: "Couple Rings", href: "/rings?filter=couple" },
        ],
        byMetal: [
          { name: "Diamond", href: "/rings?filter=diamond" },
          { name: "Gold", href: "/rings?filter=gold" },
          { name: "Rose Gold", href: "/rings?filter=rose-gold" },
        ],
        byPrice: [
          { name: "Under ₹30,000", href: "/rings?filter=under-30k" },
          { name: "₹30,000 - ₹50,000", href: "/rings?filter=30k-50k" },
          { name: "₹50,000 - ₹80,000", href: "/rings?filter=50k-80k" },
          { name: "Above ₹80,000", href: "/rings?filter=above-80k" },
        ],
      },
    },
    {
      name: "Earrings",
      href: "/earrings",
      subcategories: {
        featured: [
          { name: "Latest Designs", href: "/earrings?filter=latest" },
          { name: "Bestsellers", href: "/earrings?filter=bestseller" },
          { name: "Fast Delivery", href: "/earrings?filter=fast-delivery" },
        ],
        byStyle: [
          { name: "All Earrings", href: "/earrings" },
          { name: "Studs", href: "/earrings?style=studs" },
          { name: "Drops", href: "/earrings?style=drops" },
          { name: "Jhumkas", href: "/earrings?style=jhumkas" },
          { name: "Hoops", href: "/earrings?style=hoops" },
          { name: "Chandbali", href: "/earrings?style=chandbali" },
        ],
        byMetal: [
          { name: "Diamond", href: "/earrings?metal=diamond" },
          { name: "Gold", href: "/earrings?metal=gold" },
          { name: "Pearl", href: "/earrings?metal=pearl" },
          { name: "Rose Gold", href: "/earrings?metal=rose-gold" },
        ],
        byPrice: [
          { name: "Under ₹10k", href: "/earrings?price=under-10k" },
          { name: "₹10k - ₹30k", href: "/earrings?price=10k-30k" },
          { name: "₹30k & Above", href: "/earrings?price=above-30k" },
        ],
      },
    },
    {
      name: "Necklaces",
      href: "/necklaces",
      subcategories: {
        featured: [
          { name: "Latest Designs", href: "/necklaces?filter=latest" },
          { name: "Bestsellers", href: "/necklaces?filter=bestseller" },
        ],
        byStyle: [
          { name: "All Necklaces", href: "/necklaces" },
          { name: "Chains", href: "/necklaces?style=chains" },
          { name: "Chokers", href: "/necklaces?style=chokers" },
          { name: "Layered", href: "/necklaces?style=layered" },
          { name: "Temple", href: "/necklaces?style=temple" },
        ],
        byMetal: [
          { name: "Diamond", href: "/necklaces?metal=diamond" },
          { name: "Gold", href: "/necklaces?metal=gold" },
          { name: "Pearl", href: "/necklaces?metal=pearl" },
        ],
        byPrice: [
          { name: "Under ₹20k", href: "/necklaces?price=under-20k" },
          { name: "₹20k - ₹50k", href: "/necklaces?price=20k-50k" },
          { name: "₹50k & Above", href: "/necklaces?price=above-50k" },
        ],
      },
    },
    {
      name: "Bangles",
      href: "/bangles",
      subcategories: {
        featured: [
          { name: "Latest Designs", href: "/bangles?filter=latest" },
          { name: "Bestsellers", href: "/bangles?filter=bestseller" },
          { name: "Fast Delivery", href: "/bangles?filter=fast-delivery" },
        ],
        byStyle: [
          { name: "All Bangles", href: "/bangles" },
          { name: "Traditional", href: "/bangles?style=traditional" },
          { name: "Modern", href: "/bangles?style=modern" },
          { name: "Kada", href: "/bangles?style=kada" },
          { name: "Stacking", href: "/bangles?style=stacking" },
          { name: "Wedding", href: "/bangles?style=wedding" },
        ],
        byMetal: [
          { name: "Diamond", href: "/bangles?metal=diamond" },
          { name: "Gold", href: "/bangles?metal=gold" },
          { name: "Rose Gold", href: "/bangles?metal=rose-gold" },
          { name: "Platinum", href: "/bangles?metal=platinum" },
        ],
        byPrice: [
          { name: "Under ₹20k", href: "/bangles?price=under-20k" },
          { name: "₹20k - ₹50k", href: "/bangles?price=20k-50k" },
          { name: "₹50k & Above", href: "/bangles?price=above-50k" },
        ],
      },
    },
    { name: "Collections", href: "/collections" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center py-2.5 text-sm tracking-widest uppercase">
        Free Shipping on Orders Above ₹10,000 | Use Code: SHINE20
      </div>

      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between h-24">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="logo-golden">
              <div className="logo-golden-aura" />
              <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-none logo-golden-text">
                <span className="logo-golden-swar">Swar</span>
                <span className="logo-golden-nim italic font-semibold">nim</span>
              </h1>
              <div className="logo-golden-bar" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 space-x-10">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.href}
                  className="flex items-center gap-1.5 text-lg font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors py-6"
                >
                  {link.name}
                  {link.subcategories && <ChevronDown className="h-5 w-5" />}
                </Link>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {link.subcategories && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[700px] bg-wine border border-wine-light/30 rounded-lg shadow-2xl p-6"
                    >
                      <div className="grid grid-cols-4 gap-8">
                        {/* Featured */}
                        {link.subcategories.featured && (
                          <div>
                            <h4 className="text-gold font-semibold text-sm mb-3 uppercase tracking-wide">Featured</h4>
                            <ul className="space-y-2">
                              {link.subcategories.featured.map((item) => (
                                <li key={item.name}>
                                  <Link
                                    to={item.href}
                                    className="text-sm text-ivory/80 hover:text-ivory transition-colors"
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* By Style */}
                        {link.subcategories.byStyle && (
                          <div>
                            <h4 className="text-gold font-semibold text-sm mb-3 uppercase tracking-wide">By Style</h4>
                            <ul className="space-y-2">
                              {link.subcategories.byStyle.map((item) => (
                                <li key={item.name}>
                                  <Link
                                    to={item.href}
                                    className="text-sm text-ivory/80 hover:text-ivory transition-colors"
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* By Metal */}
                        {link.subcategories.byMetal && (
                          <div>
                            <h4 className="text-gold font-semibold text-sm mb-3 uppercase tracking-wide">By Metal & Stone</h4>
                            <ul className="space-y-2">
                              {link.subcategories.byMetal.map((item) => (
                                <li key={item.name}>
                                  <Link
                                    to={item.href}
                                    className="text-sm text-ivory/80 hover:text-ivory transition-colors"
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* By Price */}
                        {link.subcategories.byPrice && (
                          <div>
                            <h4 className="text-gold font-semibold text-sm mb-3 uppercase tracking-wide">By Price</h4>
                            <ul className="space-y-2">
                              {link.subcategories.byPrice.map((item) => (
                                <li key={item.name}>
                                  <Link
                                    to={item.href}
                                    className="text-sm text-ivory/80 hover:text-ivory transition-colors"
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="hidden sm:flex h-12 w-12" asChild>
              <Link to="/search">
                <Search className="h-[22px] w-[22px]" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex h-12 w-12" asChild>
              <Link to="/account">
                <User className="h-[22px] w-[22px]" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12" asChild>
              <Link to="/wishlist">
                <Heart className="h-[22px] w-[22px]" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative h-12 w-12" asChild>
              <Link to="/cart">
                <ShoppingBag className="h-[22px] w-[22px]" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  0
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  <Link
                    to={link.href}
                    className="block text-base font-medium text-foreground py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
              <div className="flex items-center space-x-4 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/search" onClick={() => setIsOpen(false)}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/account" onClick={() => setIsOpen(false)}>
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
