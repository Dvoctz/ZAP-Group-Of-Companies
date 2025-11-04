import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, StoreData } from '../types';
import { STORE_DATA as initialStoreData } from '../data/products';

interface ProductContextType {
  stores: StoreData;
  addProduct: (companySlug: string, product: Omit<Product, 'id'>) => void;
  updateProduct: (companySlug: string, updatedProduct: Product) => void;
  deleteProduct: (companySlug: string, productId: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const getStoredProducts = (): StoreData => {
  try {
    const storedData = localStorage.getItem('products');
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Failed to parse products from localStorage", error);
  }
  // If nothing in storage or parsing fails, return initial data
  localStorage.setItem('products', JSON.stringify(initialStoreData));
  return initialStoreData;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<StoreData>(getStoredProducts);

  useEffect(() => {
    // This effect can be used to listen to storage changes from other tabs,
    // but for now, we primarily save on update.
  }, []);

  const addProduct = (companySlug: string, productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now(), // Simple unique ID
    };

    setStores(prevStores => {
      const updatedStores = { ...prevStores };
      if (updatedStores[companySlug]) {
        updatedStores[companySlug] = {
          ...updatedStores[companySlug],
          products: [newProduct, ...updatedStores[companySlug].products],
        };
        localStorage.setItem('products', JSON.stringify(updatedStores));
        return updatedStores;
      }
      return prevStores; // Return previous state if company slug is invalid
    });
  };

  const updateProduct = (companySlug: string, updatedProduct: Product) => {
    setStores(prevStores => {
        const updatedStores = { ...prevStores };
        if (updatedStores[companySlug]) {
            const productIndex = updatedStores[companySlug].products.findIndex(p => p.id === updatedProduct.id);
            if (productIndex !== -1) {
                const newProducts = [...updatedStores[companySlug].products];
                newProducts[productIndex] = updatedProduct;
                updatedStores[companySlug] = {
                    ...updatedStores[companySlug],
                    products: newProducts,
                };
                localStorage.setItem('products', JSON.stringify(updatedStores));
                return updatedStores;
            }
        }
        return prevStores;
    });
  };

  const deleteProduct = (companySlug: string, productId: number) => {
      setStores(prevStores => {
          const updatedStores = { ...prevStores };
          if(updatedStores[companySlug]) {
              updatedStores[companySlug] = {
                  ...updatedStores[companySlug],
                  products: updatedStores[companySlug].products.filter(p => p.id !== productId),
              };
              localStorage.setItem('products', JSON.stringify(updatedStores));
              return updatedStores;
          }
          return prevStores;
      });
  };

  return (
    <ProductContext.Provider value={{ stores, addProduct, updateProduct, deleteProduct }}>
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