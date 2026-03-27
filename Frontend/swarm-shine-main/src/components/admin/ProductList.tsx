import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProducts, deleteProduct } from "@/api/productApi";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CameraOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductListProps {
    onEdit: (product: any) => void;
}

const ProductList = ({ onEdit }: ProductListProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ["admin-products"],
        queryFn: getAllProducts,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            toast({
                title: "Product Deleted",
                description: "The product has been removed successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete product.",
                variant: "destructive",
            });
        },
    });

    if (isLoading) return <div className="text-center py-10">Loading products...</div>;
    if (isError) return <div className="text-center py-10 text-red-500">Error loading products.</div>;

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="p-4 font-semibold">Image</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Category</th>
                            <th className="p-4 font-semibold">Price</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product: any) => (
                            <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                <td className="p-4">
                                    <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    target.parentElement!.innerHTML = '<div class="text-xs text-muted-foreground"><CameraOff size={16}/></div>';
                                                }}
                                            />
                                        ) : (
                                            <CameraOff size={16} className="text-muted-foreground" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 font-medium">{product.name}</td>
                                <td className="p-4 capitalize">{product.category}</td>
                                <td className="p-4">₹{product.price.toLocaleString("en-IN")}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onEdit(product)}
                                            title="Edit Product"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                                                    deleteMutation.mutate(product.id);
                                                }
                                            }}
                                            title="Delete Product"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;
