import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import { Product, CartItem } from '../types';

// State and Context Types
interface CartState {
  cartItems: CartItem[];
  isCartOpen: boolean;
}

interface CartContextType extends CartState {
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Actions for reducer
type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' };

// Reducer function to manage cart state logic
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItemIndex = state.cartItems.findIndex(item => item.id === action.payload.id);
      if (existingItemIndex > -1) {
        // Item exists, increment quantity
        const updatedCartItems = state.cartItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
        return { ...state, cartItems: updatedCartItems };
      } else {
        // New item, add to cart with quantity 1
        const newItem: CartItem = { ...action.payload, quantity: 1 };
        return { ...state, cartItems: [...state.cartItems, newItem] };
      }
    }
    case 'REMOVE_FROM_CART': {
      const updatedCartItems = state.cartItems.filter(item => item.id !== action.payload.id);
      return { ...state, cartItems: updatedCartItems };
    }
    case 'UPDATE_QUANTITY': {
      // If quantity is 0 or less, remove the item
      if (action.payload.quantity <= 0) {
        const updatedCartItems = state.cartItems.filter(item => item.id !== action.payload.id);
        return { ...state, cartItems: updatedCartItems };
      }
      const updatedCartItems = state.cartItems.map(item =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
      return { ...state, cartItems: updatedCartItems };
    }
    case 'CLEAR_CART':
      return { ...state, cartItems: [] };
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: !state.isCartOpen };
    default:
      return state;
  }
};

// Initial State
const initialState: CartState = {
  cartItems: [],
  isCartOpen: false,
};

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider Component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    const totalItems = useMemo(() => state.cartItems.reduce((sum, item) => sum + item.quantity, 0), [state.cartItems]);
    const totalPrice = useMemo(() => state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [state.cartItems]);

    const addToCart = (product: Product) => dispatch({ type: 'ADD_TO_CART', payload: product });
    const removeFromCart = (productId: number) => dispatch({ type: 'REMOVE_FROM_CART', payload: { id: productId } });
    const updateQuantity = (productId: number, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    const clearCart = () => dispatch({ type: 'CLEAR_CART' });
    const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });

    const value = {
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        totalItems,
        totalPrice
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook for easy context consumption
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
