import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { toast } from 'react-hot-toast';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateCart } = useCart();
  const { orderId, totalAmount } = location.state || {};

  const handlePaymentSuccess = async () => {
    try {
      // Simuler le paiement (à remplacer par votre logique de paiement réelle)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vider le panier seulement après le paiement réussi
      await cartService.clearCart();
      await updateCart();
      
      toast.success('Payment successful!');
      navigate('/dashboard/products');
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  if (!orderId || !totalAmount) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Payment Session</h1>
          <button
            onClick={() => navigate('/order')}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>
        <div className="mb-6">
          <p className="text-gray-400">Order ID: {orderId}</p>
          <p className="text-xl font-semibold">Total Amount: ${totalAmount}</p>
        </div>
        <button
          onClick={handlePaymentSuccess}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
        >
          Proceed with Payment
        </button>
      </div>
    </div>
  );
}

export default Payment;
