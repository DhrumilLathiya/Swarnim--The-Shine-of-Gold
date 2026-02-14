import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string;
  label: string;
}

interface CategoryFiltersProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  productCount: number;
}

const sortOptions = [
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest First" },
  { id: "bestseller", label: "Bestsellers" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
];

const CategoryFilters = ({
  filters,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  productCount,
}: CategoryFiltersProps) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const activeFilterLabel = filters.find((f) => f.id === activeFilter)?.label || "All";
  const activeSortLabel = sortOptions.find((s) => s.id === sortBy)?.label || "Popular";

  return (
    <div className="space-y-4">
      {/* Filter Chips - Desktop */}
      <div className="hidden md:flex flex-wrap gap-2 pb-4">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
              activeFilter === filter.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-foreground border-border hover:border-primary hover:text-primary"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {filter.label}
            {activeFilter === filter.id && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-2 inline-flex"
              >
                <Check className="h-3.5 w-3.5" />
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Button */}
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="default" className="md:hidden flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilter !== "all" && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      onFilterChange(filter.id);
                      setIsMobileFilterOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-all duration-200",
                      activeFilter === filter.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="flex items-center justify-between">
                      {filter.label}
                      {activeFilter === filter.id && <Check className="h-4 w-4" />}
                    </span>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Active Filter Badge - Mobile */}
          {activeFilter !== "all" && (
            <div className="md:hidden flex items-center gap-2">
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2">
                {activeFilterLabel}
                <button
                  onClick={() => onFilterChange("all")}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}

          {/* Product Count */}
          <span className="text-muted-foreground text-sm">
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="default" className="flex items-center gap-2">
              Sort by: {activeSortLabel}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => onSortChange(option.id)}
                className={cn(
                  "flex items-center justify-between",
                  sortBy === option.id && "bg-muted"
                )}
              >
                {option.label}
                {sortBy === option.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CategoryFilters;
