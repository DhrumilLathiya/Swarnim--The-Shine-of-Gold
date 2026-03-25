import fs from "fs";
import path from "path";
import supabase from "./supabaseClient.js";

/**
 * Uploads a local file to a Supabase bucket
 * @param {string} filePath - Local path to the file
 * @param {string} bucketName - Name of the Supabase bucket
 * @param {string} destPath - Optional destination path/filename in the bucket
 */
export const uploadFileToSupabase = async (filePath, bucketName = "designs", destPath = null) => {
  try {
    const fileName = destPath || path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: getMimeType(fileName),
        upsert: true,
      });

    if (error) throw error;

    // Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Supabase Upload Error:", err.message);
    throw err;
  }
};

/**
 * Saves design metadata to the jewelry_designs table
 */
export const saveDesignMetadata = async (metadata) => {
  try {
    const { data, error } = await supabase
      .from("jewelry_designs")
      .insert([metadata])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error("Supabase DB Error:", err.message);
    throw err;
  }
};

const getMimeType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
};
