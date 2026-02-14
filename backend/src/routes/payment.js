import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { supabase } from "../config/database.js";
import { createPaymentOrder } from "../services/paymentService.js";

const router = express.Router();

router.post("/create-order", authenticateToken, async (req, res) => {
  try {
    const { order_id } = req.body;

    const { data: order } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("id", order_id)
      .single();

    const paymentOrder = await createPaymentOrder(
      order.total_amount,
      order_id
    );

    res.json(paymentOrder);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/webhook", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  const isValid = verifyPaymentSignature(
    JSON.stringify(req.body),
    signature
  );

  if (!isValid) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const orderId = req.body.payload.payment.entity.notes.receipt;

  await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_new_status: "paid"
  });

  res.json({ status: "ok" });
});


export default router;
