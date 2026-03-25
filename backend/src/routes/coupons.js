<<<<<<< dhrumil
/**
 * DISCOUNT COUPON ROUTES
 * 
 * PURPOSE: Manages promotional codes, including public verification and administrative CRUD logic.
 * USAGE: Handled by checkout for discounts and the admin dashboard for marketing management.
 */
import express from 'express';
import { createClient } from '@supabase/supabase-js'; // Separate client for specific coupon interactions
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
// INITIALIZATION: Dedicated Supabase client using Anon Key for public coupon lookups
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- PUBLIC ROUTES ---

// 1. Get all active and unexpired coupons for the Scratch Card Grid
router.get('/all-active', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('is_active', true)
            .or(`expiry_date.is.null,expiry_date.gt.${new Date().toISOString()}`);

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching all active coupons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Get a random active and unexpired coupon (Legacy - keeping for compatibility)
router.get('/random', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('is_active', true)
            .or(`expiry_date.is.null,expiry_date.gt.${new Date().toISOString()}`);

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'No active coupons available' });
        }

        // Return a random one
        const randomIndex = Math.floor(Math.random() * data.length);
        res.json(data[randomIndex]);
    } catch (error) {
        console.error('Error fetching random coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// VERIFY COUPON: Checks if a code is valid, active, and meets the minimum order value
router.post('/verify', async (req, res) => {
    const { code, cartTotal } = req.body;

    // VALIDATION: Code is required for verification
    if (!code) {
        return res.status(400).json({ valid: false, message: 'Coupon code is required' });
    }

    try {
        // LOOKUP: Find an active coupon with the matching case-insensitive code
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !coupon) {
            return res.status(404).json({ valid: false, message: 'Invalid or inactive coupon code' });
        }

        // EXPIRY CHECK: Compare current date with the coupon's designated end date
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return res.status(400).json({ valid: false, message: 'Coupon has expired' });
        }

        // MIN ORDER CHECK: Ensure the shopper's cart total meets the promotional threshold
        const currentCartTotal = Number(cartTotal || 0);
        const minRequired = Number(coupon.min_order_amount || 0);

        if (currentCartTotal < minRequired) {
            return res.status(400).json({
                valid: false,
                message: `Minimum order amount for this coupon is ₹${minRequired.toLocaleString('en-IN')}`
            });
        }

        res.json({
            valid: true,
            code: coupon.code,
            discount_percent: coupon.discount_percent,
            min_order_amount: coupon.min_order_amount,
            message: 'Coupon applied successfully!'
        });
    } catch (error) {
        console.error('Error verifying coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- ADMIN ROUTES ---

// 3. Get all coupons
router.get('/admin/list', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching admin coupons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Create a new coupon (with 10-coupon limit)
router.post('/admin/create', async (req, res) => {
    const { code, discount_percent, expiry_date, is_active, min_order_amount } = req.body;

    try {
        // Enforce 10 active coupon limit
        const { count, error: countError } = await supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        if (countError) throw countError;

        if (is_active !== false && count >= 10) {
            return res.status(400).json({
                error: 'Limit reached. You can only have a maximum of 10 active coupons.'
            });
        }

        const { data, error } = await supabase
            .from('coupons')
            .insert([{
                code: code.toUpperCase(),
                discount_percent: Number(discount_percent),
                expiry_date: expiry_date || null,
                is_active: is_active ?? true,
                min_order_amount: Number(min_order_amount || 0)
            }])
            .select();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Coupon code already exists' });
            }
            throw error;
        }
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. Update a coupon
router.put('/admin/update/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // If they are trying to activate a coupon, check the limit
        if (updates.is_active === true) {
            const { count, error: countError } = await supabase
                .from('coupons')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true)
                .neq('id', id);

            if (countError) throw countError;

            if (count >= 10) {
                return res.status(400).json({
                    error: 'Limit reached. You cannot activate more than 10 coupons.'
                });
            }
        }

        const { data, error } = await supabase
            .from('coupons')
            .update({
                code: updates.code?.toUpperCase(),
                discount_percent: Number(updates.discount_percent),
                expiry_date: updates.expiry_date || null,
                is_active: updates.is_active,
                min_order_amount: Number(updates.min_order_amount)
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 6. Delete a coupon
router.delete('/admin/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
=======
import express from "express";
import { supabase } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management system
 */

/**
 * ======================================================
 * CREATE COUPON (ADMIN)
 * ======================================================
 */

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create new coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount_type
 *               - discount_value
 *               - expiry_date
 *             properties:
 *               code:
 *                 type: string
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, flat]
 *               discount_value:
 *                 type: number
 *               max_usage:
 *                 type: integer
 *               expiry_date:
 *                 type: string
 *                 format: date-time
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        code,
        discount_type,
        discount_value,
        max_usage,
        expiry_date,
      } = req.body;

      if (!code || !discount_type || !discount_value || !expiry_date) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const couponData = {
        code: code.toUpperCase(),
        discount_type,
        discount_value,
        max_usage: max_usage || null,
        expiry_date,
        usage_count: 0,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("coupons")
        .insert([couponData])
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        data,
      });

    } catch (err) {
      console.error("Coupon Create Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

/**
 * ======================================================
 * GET COUPONS (PUBLIC / ADMIN)
 * ======================================================
 */

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Get available coupons
 *     tags: [Coupons]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter active coupons only
 */
router.get("/", async (req, res) => {
  try {
    const active = req.query.active === "true";

    let query = supabase.from("coupons").select("*");

    if (active) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("Coupon Fetch Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
>>>>>>> main
});

export default router;