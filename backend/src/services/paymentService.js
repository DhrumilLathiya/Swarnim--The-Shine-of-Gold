import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createPaymentOrder(amount, receipt) {
  return await razorpay.orders.create({
    amount: amount * 100, // paise
    currency: "INR",
    receipt
  });
}

export function verifyPaymentSignature(body, signature) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}
