import { useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";

import CategoryFilters from "@/components/category/CategoryFilters";
import ProductCard from "@/components/category/ProductCard";

import { getProductsByCategory } from "@/api/productApi";

// ⚠ Keep your existing imports if these exist in your project
import { filterCategories, filterProductsByTag, sortProducts } from "@/lib/categoryUtils.ts"; // adjust path if different

const CategoryPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = location.pathname.slice(1);

  const activeFilter = searchParams.get("filter") || "all";
  const sortBy = searchParams.get("sort") || "popular";

  const categoryConfig =
    filterCategories[category as keyof typeof filterCategories] ||
    filterCategories.rings;

  // ✅ Backend Fetch Using React Query
  const {
    data: allProducts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", category],
    queryFn: () => getProductsByCategory(category),
  });

  // ✅ Filter + Sort (Your Existing Logic Kept)
  const filteredProducts = useMemo(() => {
    let products = filterProductsByTag(allProducts, activeFilter);
    products = sortProducts(products, sortBy);
    return products;
  }, [allProducts, activeFilter, sortBy]);

  const handleFilterChange = (filterId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (filterId === "all") {
      newParams.delete("filter");
    } else {
      newParams.set("filter", filterId);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (newSortBy: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newSortBy === "popular") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", newSortBy);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">

          {/* Breadcrumb */}
          <nav className="text-base mb-8">
            <ol className="flex items-center space-x-2 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">
                {categoryConfig.title}
              </li>
              {activeFilter !== "all" && (
                <>
                  <li>/</li>
                  <li className="text-foreground font-medium">
                    {
                      categoryConfig.filters.find(
                        (f) => f.id === activeFilter
                      )?.label
                    }
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-4">
              {categoryConfig.title}
            </h1>
            <p className="text-muted-foreground text-xl">
              {categoryConfig.description}
            </p>
          </motion.div>

          {/* Filters */}
          <CategoryFilters
            filters={categoryConfig.filters}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            productCount={filteredProducts.length}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Loading products...
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg">
                Failed to load products. Please try again.
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !isError && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter + sortBy}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8"
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <p className="text-muted-foreground text-lg">
                      No products found in this category.
                    </p>
                    <button
                      onClick={() => handleFilterChange("all")}
                      className="mt-4 text-primary hover:underline"
                    >
                      View all {categoryConfig.title.toLowerCase()}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;