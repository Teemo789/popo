import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../hooks/useCart';
import baseUrl from '../config/Baseurl';
import { useNavigate } from 'react-router-dom';

// Ajout de la fonction formatPrice
const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "$ N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0
  }).format(numericPrice);
};

function Cart({ isOpen, onClose }) {
  const { cartItems, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();

  console.log('Current cart items:', cartItems); // Debug log

  const calculateItemTotal = (item) => {
    return item.quantity * (item.discountedPricePerItem || item.originalPricePerItem);
  };

  const calculateCartTotal = (items) => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await handleRemoveItem(productId);
        return;
      }
      await updateQuantity(productId, newQuantity);
      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Cart panel */}
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-900/95 shadow-xl z-50 backdrop-blur-md border-l border-white/10"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto py-4 px-4">
            {(!cartItems || cartItems.length === 0) && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 bg-white/5 p-4 rounded-lg">
                    <img 
                      src={`${baseUrl}${item.imageUrl?.startsWith('/') ? '' : '/'}${item.imageUrl}`} 
                      alt={item.productName} 
                      className="w-20 h-20 object-cover rounded"
                      loading="eager"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.svg';
                        e.target.classList.add('img-error');
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.productName}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-blue-400 font-medium">
                            {formatPrice(item.discountedPricePerItem)}
                          </span>
                          {item.originalPricePerItem > item.discountedPricePerItem && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              {formatPrice(item.originalPricePerItem)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-400">
                          Total: {formatPrice(calculateItemTotal(item))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="ml-auto p-1 hover:bg-red-500/20 rounded text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg">Total:</span>
                <span className="text-lg font-bold text-blue-400">
                  {formatPrice(calculateCartTotal(cartItems))}
                </span>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  navigate('/order');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// Replace style jsx with regular style tag
const cartStyles = `
  .cart-item {
    /* your styles */
  }
  /* other styles */
`;

// Add this before the export
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = cartStyles;
document.head.appendChild(styleSheet);

export default Cart;
