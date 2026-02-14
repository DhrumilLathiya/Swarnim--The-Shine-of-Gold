import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraint() {
    console.log("Checking DB constraints...");

    // Try to insert valid rows to guess, or if possible query metadata.
    // Since we can't easily query information_schema with supabase-js directly unless using rpc,
    // we will try to insert a dummy product with different availability values until one works or we get a specific error.

    const testValues = ["in_stock", "In Stock", "IN STOCK", "in-stock", "made_to_order", "Made to Order"];

    for (const val of testValues) {
        console.log(`Testing availability: '${val}'`);
        const { data, error } = await supabase
            .from("jewellery_products")
            .insert({
                product_name: "Test Constraint " + val,
                category: "Ring",
                sku: "TEST-" + Math.random(),
                metal_type: "Gold",
                purity: "22K",
                metal_weight: 10,
                making_charges: 100,
                stock_quantity: 1,
                availability: val,
                metal_price_per_gram: 5000,
                final_price: 10000,
                created_by: "c17309a0-739e-45ef-b4a4-27255d43301b" // Admin ID from previous step
            })
            .select();

        if (error) {
            console.log(`❌ Failed: ${error.message}`);
        } else {
            console.log(`✅ SUCCESS! Valid value is: '${val}'`);
            // Clean up
            await supabase.from("jewellery_products").delete().eq("id", data[0].id);
            break;
        }
    }
}

checkConstraint();
