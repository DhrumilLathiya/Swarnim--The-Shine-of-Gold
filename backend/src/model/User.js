import { v4 as uuidv4 } from "uuid";
import supabase from "../config/database.js";

/**
 * Get a user by ID
 */
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;   
};

/**
 * Get a user by email
 */
export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  // PGRST116 = No rows found (not an actual error)
  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data || null;
};

/**
 * Create a new user
 */
export const createUser = async (name, email, passwordHash) => {
  const userId = uuidv4();

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        id: userId,
        name,
        email,
        password: passwordHash,
        role: "USER",
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data;
};

/**
 * Update user profile
 */
export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return data;
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, created_at");

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data;
};
