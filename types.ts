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
  id: string;
  timestamp: number;
  customer: {
    name: string;
    contact: string;
    location: string;
  };
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
}