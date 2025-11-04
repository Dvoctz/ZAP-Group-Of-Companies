import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Product, Order, CartItem } from './types';

// These environment variables should be configured in your deployment environment (e.g., Vercel).
// They are not hardcoded for security reasons.
// FIX: Changed from `import.meta.env` to `process.env` to fix TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;

// A fallback for local development if environment variables are not set.
// In a real production scenario, you would want to ensure these are always set.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables not set. App may not connect to the database.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
