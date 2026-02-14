import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", supabaseUrl);
// console.log("Key:", supabaseKey); 

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
    const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role");

    if (error) {
        console.error("Error fetching users:", error);
    } else {
        console.log("Users in DB:", data);
    }
}

listUsers();
    1