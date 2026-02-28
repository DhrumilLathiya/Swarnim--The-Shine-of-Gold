export const createCategory = async (supabase, data) => {
  return await supabase
    .from("categories")
    .insert([data])
    .select()
    .single();
};

export const getAllCategories = async (supabase) => {
  return await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });
};