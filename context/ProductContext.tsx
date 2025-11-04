import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, StoreData } from '../types';
import { supabase, ProductRow } from '../supabaseClient';
import { COMPANIES } from '../constants';

interface ProductContextType {
  stores: StoreData;
  addProduct: (companySlug: string, product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (companySlug: string, updatedProduct: Product) => Promise<void>;
  deleteProduct: (companySlug: string, productId: number) => Promise<void>;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<StoreData>({});
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    
    if (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
      return;
    }

    if (data) {
      const groupedStores: StoreData = {};

      // Initialize all stores from constants to ensure they appear even if empty
      COMPANIES.forEach(company => {
        if (!company.isExternal) {
          groupedStores[company.slug] = {
            companyName: company.name,
            products: [],
          };
        }
      });

      // Populate stores with products from the database
      data.forEach((product: ProductRow) => {
        const slug = product.company_slug;
        if (groupedStores[slug]) {
          groupedStores[slug].products.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.image_url,
            description: product.description,
          });
        }
      });

      setStores(groupedStores);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (companySlug: string, productData: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('products').insert([
      {
        company_slug: companySlug,
        name: productData.name,
        price: productData.price,
        image_url: productData.imageUrl,
        description: productData.description,
      },
    ]);

    if (error) {
      console.error('Error adding product:', error);
    } else {
      await fetchProducts(); // Refresh data
    }
  };

  const updateProduct = async (companySlug: string, updatedProduct: Product) => {
    const { error } = await supabase
      .from('products')
      .update({
        name: updatedProduct.name,
        price: updatedProduct.price,
        image_url: updatedProduct.imageUrl,
        description: updatedProduct.description,
      })
      .eq('id', updatedProduct.id);
    
    if (error) {
        console.error('Error updating product:', error);
    } else {
        await fetchProducts(); // Refresh data
    }
  };

  const deleteProduct = async (companySlug: string, productId: number) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    
    if(error) {
        console.error('Error deleting product:', error);
    } else {
        await fetchProducts(); // Refresh data
    }
  };

  return (
    <ProductContext.Provider value={{ stores, addProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
