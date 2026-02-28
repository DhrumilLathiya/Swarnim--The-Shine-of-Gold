import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; // Added useQuery
import { getProductById } from "@/api/productApi"; // Added API fetch
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import productRing from "@/assets/product-ring.jpg";

const stones = [
  { name: "Diamond", color: "bg-white border border-border" },
  { name: "Ruby", color: "bg-red-600" },
  { name: "Emerald", color: "bg-emerald-600" },
  { name: "Sapphire", color: "bg-blue-700" },
  { name: "Pearl", color: "bg-gray-100 border border-border" },
  { name: "Topaz", color: "bg-amber-400" },
  { name: "Amethyst", color: "bg-purple-600" },
  { name: "Opal", color: "bg-gradient-to-br from-pink-200 via-blue-200 to-green-200" },
  { name: "Garnet", color: "bg-red-900" },
  { name: "Turquoise", color: "bg-cyan-500" },
];

const designs = [
  "Classic Solitaire",
  "Halo Setting",
  "Vintage Filigree",
  "Modern Minimalist",
  "Floral Motif",
  "Art Deco",
  "Cathedral",
  "Cluster",
  "Pavé Band",
  "Three Stone",
  "Toi et Moi", // Added trending
  "Bezel Set",
];

const ModifyJewelryPage = () => {
  const { id } = useParams();

  // Fetch Product Data
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id || ""),
    enabled: !!id,
  });

  // Use fetched image or fallback to default
  const displayImage = product?.image || productRing;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Back button */}
          <Link to={`/product/${id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-base">
            <ArrowLeft className="h-5 w-5" />
            Back to Product
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-14"
          >
            {/* Title */}
            <div className="text-center">
              <h1 className="font-display text-4xl md:text-6xl font-semibold mb-3">
                Modify Jewelry Design
              </h1>
              <p className="text-lg text-muted-foreground">Customize your perfect piece with stones, designs & more</p>
            </div>

            {/* Image Sections - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Jewelry */}
              <section>
                <h2 className="font-display text-xl md:text-2xl font-medium mb-5 text-accent">
                  Current Jewelry
                </h2>
                <div className="relative group rounded-2xl overflow-hidden shadow-elegant border-2 border-accent/20 bg-card">
                  <div className="aspect-[4/3]">
                    {isLoading ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p>Loading...</p>
                      </div>
                    ) : (
                      <img
                        src={displayImage}
                        alt={product?.name || "Current Jewelry"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <span className="text-sm font-medium bg-card/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-foreground">Original Design</span>
                  </div>
                </div>
              </section>

              {/* New Design Preview */}
              <section>
                <h2 className="font-display text-xl md:text-2xl font-medium mb-5 text-accent">
                  New Design
                </h2>
                <div className="relative rounded-2xl overflow-hidden shadow-elegant border-2 border-accent/20 border-dashed bg-card">
                  <div className="aspect-[4/3] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-accent" />
                    </div>
                    <p className="text-lg font-display font-medium">Your new design will appear here</p>
                    <p className="text-sm text-muted-foreground">Select options below & generate</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Section: Stones */}
            <section className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
              <h2 className="font-display text-xl md:text-2xl font-medium mb-6 text-accent">
                Choose Stones
              </h2>
              <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-4">
                {stones.map((stone) => (
                  <button
                    key={stone.name}
                    className="flex flex-col items-center gap-2.5 p-3 rounded-xl bg-secondary/60 hover:bg-secondary hover:shadow-md transition-all duration-200 cursor-pointer group border border-transparent hover:border-accent/30"
                  >
                    <div className={`w-14 h-14 rounded-lg ${stone.color} shadow-sm group-hover:scale-110 transition-transform duration-200`} />
                    <span className="text-xs md:text-sm text-foreground font-medium">{stone.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Section: Designs */}
            <section className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
              <h2 className="font-display text-xl md:text-2xl font-medium mb-6 text-accent">
                Choose Design Style
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {designs.map((design) => (
                  <button
                    key={design}
                    className="px-5 py-3.5 rounded-xl border border-border bg-secondary/60 text-foreground text-base font-medium hover:border-accent hover:bg-secondary hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {design}
                  </button>
                ))}
              </div>
            </section>

            {/* Section: Custom Prompt */}
            <section className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
              <h2 className="font-display text-xl md:text-2xl font-medium mb-5 text-accent">
                Custom Instructions
              </h2>
              <Textarea
                placeholder="Describe any custom changes you'd like... (e.g., 'Make it rose gold with a vintage feel and smaller diamond')"
                className="min-h-[140px] text-base bg-secondary/40 border-2 border-border focus:border-accent rounded-xl"
              />
            </section>

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <Button variant="gold" size="lg" className="text-lg px-12 py-4 h-auto rounded-xl shadow-gold">
                <Sparkles className="h-5 w-5 mr-2" />
                Generate New Design
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModifyJewelryPage;
