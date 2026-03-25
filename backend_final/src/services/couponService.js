export const validateAndApplyCoupon = async (supabase, code, orderAmount) => {
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !coupon) {
    throw new Error("Invalid coupon code");
  }

  const now = new Date();
  if (new Date(coupon.expiry_date) < now) {
    throw new Error("Coupon expired");
  }

  if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
    throw new Error("Coupon usage limit exceeded");
  }

  if (orderAmount < coupon.min_order_amount) {
    throw new Error(
      `Minimum order amount is ₹${coupon.min_order_amount}`
    );
  }

  let discount = 0;

  if (coupon.discount_type === "percentage") {
    discount = (orderAmount * coupon.discount_value) / 100;

    if (coupon.max_discount) {
      discount = Math.min(discount, coupon.max_discount);
    }
  }

  if (coupon.discount_type === "flat") {
    discount = coupon.discount_value;
  }

  return { coupon, discount };
};