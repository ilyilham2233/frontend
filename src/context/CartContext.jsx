import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCart } from '../api/catalogue';
import { useAuth } from './AuthContext';
import { normalizeCartItems } from '../utils/cart';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  const syncCartItems = useCallback((items) => {
    setCartItems(items);
    setCartCount(items.reduce((sum, item) => sum + Number(item.quantite || 0), 0));
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      syncCartItems([]);
      return [];
    }

    setCartLoading(true);
    try {
      const res = await getCart();
      const items = normalizeCartItems(res);
      syncCartItems(items);
      return items;
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, syncCartItems]);

  const incrementCartCount = useCallback((quantity = 1) => {
    setCartCount((count) => count + Number(quantity || 1));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart().catch(() => {});
    } else {
      syncCartItems([]);
    }
  }, [isAuthenticated, refreshCart, syncCartItems]);

  const value = useMemo(() => ({
    cartItems,
    cartCount,
    cartLoading,
    refreshCart,
    setCartItems: syncCartItems,
    incrementCartCount,
  }), [cartItems, cartCount, cartLoading, refreshCart, syncCartItems, incrementCartCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
