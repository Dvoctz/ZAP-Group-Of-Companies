import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Product, Order, CartItem } from './types';

// These environment variables should be configured in your deployment environment (e.g., Vercel).
// They are not hardcoded for security reasons.
const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;

// A fallback for local development if environment variables are not set.
// In a real production scenario, you would want to ensure these are always set.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables not set. App may not connect to the database.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


/**
 * Uploads a product image to Supabase Storage.
 * IMPORTANT: In your Supabase project, you must create a Storage bucket named 'product-images'
 * and set its access policy to be public. This allows the image URLs to be displayed in your app.
 * @param file The image file to upload.
 * @returns An object with the public URL of the uploaded image or an error object.
 */
export const uploadProductImage = async (file: File): Promise<{ publicUrl: string | null; error: Error | null }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName; // Corrected: Removed 'public/' prefix

    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { publicUrl: null, error: new Error(uploadError.message) };
    }

    const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    if (!data.publicUrl) {
        return { publicUrl: null, error: new Error('Could not get public URL for the uploaded image.') };
    }

    return { publicUrl: data.publicUrl, error: null };
};


// Define Supabase-specific types if they differ from your app's internal types.
// This can be useful for type-checking data coming from the database.

// Type for the 'products' table row
export type ProductRow = {
  id: number;
  created_at: string;
  company_slug: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

// Type for the 'orders' table row
export type OrderRow = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_contact: string;
  customer_location: string;
  items: CartItem[];
  total_price: number;
  status: 'New' | 'Processing' | 'Completed' | 'Cancelled';
};