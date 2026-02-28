export const filterCategories = {
  rings: {
    title: "Rings",
    description: "Beautiful rings collection",
    filters: [
      { id: "all", label: "All" },
      { id: "gold", label: "Gold" },
      { id: "diamond", label: "Diamond" },
    ],
  },

  necklaces: {
    title: "Necklaces",
    description: "Elegant necklaces collection",
    filters: [
      { id: "all", label: "All" },
      { id: "gold", label: "Gold" },
      { id: "diamond", label: "Diamond" },
    ],
  },
};

export const filterProductsByTag = (products: any[], filter: string) => {
  if (filter === "all") return products;
  return products.filter((p) => p.tags?.includes(filter));
};

export const sortProducts = (products: any[], sortBy: string) => {
  switch (sortBy) {
    case "price-low":
      return [...products].sort((a, b) => a.price - b.price);

    case "price-high":
      return [...products].sort((a, b) => b.price - a.price);

    case "newest":
      return [...products].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );

    default:
      return products;
  }
};