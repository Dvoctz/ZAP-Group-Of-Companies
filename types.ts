import React from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Company {
  name: string;
  slug: string;
  description: string;
  icon: React.ReactNode;
  isExternal: boolean;
  externalLink?: string;
}

export interface StoreData {
    [key: string]: {
        companyName: string;
        products: Product[];
    }
}

export type OrderStatus = 'New' | 'Processing' | 'Completed' | 'Cancelled';

export interface Order {
  id: string; // UUID from supabase
  created_at: string; // timestamptz from supabase
  customer: {
    name: string;
    contact: string;
    location: string;
  };
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
}

// Represents an order created offline, before it's sent to the backend.
// FIX: Redefined PendingOrder to have a flat structure matching what's sent to Supabase.
// The previous definition using Omit<Order,...> was incorrect and caused type errors.
export type PendingOrder = {
    customer_name: string;
    customer_contact: string;
    customer_location: string;
    items: CartItem[];
    total_price: number;
    status: OrderStatus;
    clientId: string; // A unique ID generated on the client
};
