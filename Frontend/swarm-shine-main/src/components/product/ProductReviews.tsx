import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Send, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_BASE = "https://swarnim-the-shine-of-gold.onrender.com";

const getToken = () => localStorage.getItem("token");
const getUserId = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
};

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  users: { name: string } | null;
  user_id?: string;
}

interface ReviewsResponse {
  count: number;
  average_rating: number;
  reviews: Review[];
}

const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-muted stroke-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviews = ({ productId }: { productId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = getUserId();
  const isLoggedIn = !!getToken();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/reviews/${productId}`);
      return res.data;
    },
    enabled: !!productId,
  });

  const reviews = data?.reviews ?? [];
  const avgRating = data?.average_rating ?? 0;
  const totalCount = data?.count ?? 0;

  const myReview = reviews.find((r) => {
    try {
      const token = getToken();
      if (!token) return false;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return r.users?.name && payload.user_id === userId;
    } catch {
      return false;
    }
  });

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (isEditing) {
        await axios.put(
          `${API_BASE}/reviews/${productId}`,
          { rating, comment },
          authHeaders()
        );
      } else {
        await axios.post(
          `${API_BASE}/reviews`,
          { product_id: productId, rating, comment },
          authHeaders()
        );
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Review Updated!" : "Review Submitted!",
        description: "Thank you for sharing your experience.",
      });
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setRating(0);
      setComment("");
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.response?.data?.error ?? "Could not submit review.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`${API_BASE}/reviews/${productId}`, authHeaders());
    },
    onSuccess: () => {
      toast({ title: "Review Deleted", description: "Your review has been removed." });
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete review.", variant: "destructive" });
    },
  });

  const handleEdit = () => {
    if (!myReview) return;
    setRating(myReview.rating);
    setComment(myReview.comment ?? "");
    setIsEditing(true);
    document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    submitMutation.mutate();
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-semibold mb-10 flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-accent" />
            Customer Reviews
          </h2>

          {/* Summary Row */}
          <div className="grid md:grid-cols-2 gap-10 mb-12 p-8 bg-card rounded-2xl border border-border">
            {/* Average */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="font-display text-7xl font-bold text-foreground mb-2">
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </span>
              <StarRating value={Math.round(avgRating)} readonly size="lg" />
              <p className="text-muted-foreground mt-2">{totalCount} {totalCount === 1 ? "review" : "reviews"}</p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 justify-center flex flex-col">
              {ratingBreakdown.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm w-4 text-muted-foreground">{star}</span>
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: totalCount > 0 ? `${(count / totalCount) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-5">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Form */}
          {isLoggedIn ? (
            <div id="review-form" className="mb-12 p-6 bg-card rounded-2xl border border-border">
              <h3 className="font-semibold text-xl mb-4">
                {isEditing ? "Edit Your Review" : myReview ? "Your Review" : "Write a Review"}
              </h3>

              {myReview && !isEditing ? (
                <div className="space-y-3">
                  <StarRating value={myReview.rating} readonly />
                  <p className="text-muted-foreground">{myReview.comment}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={handleEdit}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your Rating *</p>
                    <StarRating value={rating} onChange={setRating} size="lg" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your Comment (optional)</p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="Share your experience with this product..."
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" variant="gold" disabled={submitMutation.isPending}>
                      <Send className="h-4 w-4 mr-2" />
                      {submitMutation.isPending ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
                    </Button>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => { setIsEditing(false); setRating(0); setComment(""); }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="mb-10 p-6 bg-card rounded-2xl border border-dashed border-border text-center">
              <p className="text-muted-foreground">
                <a href="/account" className="text-accent hover:underline font-medium">Sign in</a> to leave a review
              </p>
            </div>
          )}

          {/* Reviews List */}
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 bg-card rounded-2xl border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{review.users?.name ?? "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "long", year: "numeric"
                          })}
                        </p>
                      </div>
                      <StarRating value={review.rating} readonly size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductReviews;
