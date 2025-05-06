import { createContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { getToken } from '../config/localstorage';
import { getUserInfo, getUserIdFromToken } from '../utils/jwtDecoder';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartState, setCartState] = useState({
    items: [],
    count: 0,
    loading: true,
    userId: null
  });

  const updateCartState = useCallback(async () => {
    try {
      const token = getToken();
      const userId = token ? getUserIdFromToken(token) : null;
      
      if (!userId) {
        setCartState(prev => ({ ...prev, items: [], count: 0, loading: false, userId: null }));
        return;
      }

      // Si l'utilisateur a changé, réinitialiser le panier
      if (userId !== cartState.userId) {
        setCartState(prev => ({
          ...prev,
          items: [],
          count: 0,
          loading: true,
          userId
        }));
      }

      console.log('Fetching cart for user:', userId);
      const data = await cartService.getCart();
      console.log('Received cart data:', data);

      setCartState({
        items: data.items || [],
        count: data.items?.length || 0,
        loading: false,
        userId
      });
    } catch (error) {
      console.error('Cart update failed:', error);
      setCartState(prev => ({ ...prev, loading: false }));
    }
  }, [cartState.userId]);

  const updateQuantity = async (productId, quantity) => {
    try {
      setCartState(prev => ({ ...prev, loading: true }));
      await cartService.updateQuantity(productId, quantity);
      await updateCartState();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setCartState(prev => ({ ...prev, loading: false }));
    }
  };

  const removeItem = async (productId) => {
    try {
      setCartState(prev => ({ ...prev, loading: true }));
      await cartService.removeFromCart(productId);
      await updateCartState();
    } catch (error) {
      console.error('Failed to remove item:', error);
      setCartState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    updateCartState();
  }, [updateCartState]);

  return (
    <CartContext.Provider value={{
      cartItems: cartState.items,
      cartCount: cartState.count,
      loading: cartState.loading,
      updateCart: updateCartState,
      updateQuantity,
      removeItem
    }}>
      {children}
    </CartContext.Provider>
  );
}
