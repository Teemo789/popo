import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Home, Building2, Mail, Globe } from 'lucide-react';
import baseUrl from '../config/Baseurl';
import { toast } from 'react-hot-toast';
import orderService from '../services/orderService';

function Order() {
  const navigate = useNavigate();
  const { cartItems, cartCount } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
    shippingCountry: ''
  });

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      return total + (item.discountedPricePerItem * item.quantity);
    }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = await orderService.createOrder(formData);
      toast.success('Order created successfully!');
      navigate('/payment', { 
        state: { 
          orderId: orderData.id,
          totalAmount: calculateTotal(cartItems)
        } 
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!cartCount) {
    return (
      <div className="relative w-full min-h-screen font-sans bg-gray-950 flex flex-col">
        <div className="min-h-screen bg-gray-950 text-white p-8 flex flex-col items-center justify-center">
          <p className="text-xl">Your cart is empty</p>
          <button
            onClick={() => navigate('/dashboard/products')}
            className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen font-sans bg-gray-950 flex flex-col">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp"
          alt="Abstract background"
          className="h-full w-full object-cover filter blur-xl scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80"></div>
      </div>

      <div className="relative z-10 flex flex-col text-white pt-28 flex-grow">
        <main className="p-5 md:p-8 lg:p-10 w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-400 hover:text-white transition-colors mb-4 hover:bg-white/10 py-2 px-4 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </button>
            <h1 className="text-3xl font-bold">Complete Your Order</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6"
              >
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="flex items-center space-x-4">
                      <img
                        src={`${baseUrl}${item.imageUrl}`}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="text-sm text-gray-400">
                          Quantity: {item.quantity} × {formatPrice(item.discountedPricePerItem)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.quantity * item.discountedPricePerItem)}
                      </p>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(calculateTotal(cartItems))}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Shipping Form */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="shippingStreet"
                      value={formData.shippingStreet}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="shippingState"
                        value={formData.shippingState}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="State"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Postal Code
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="shippingPostalCode"
                        value={formData.shippingPostalCode}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Postal Code"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="shippingCountry"
                        value={formData.shippingCountry}
                        onChange={handleInputChange}
                        className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Country"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    loading
                      ? 'bg-blue-600/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25'
                  }`}
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </form>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Order;
