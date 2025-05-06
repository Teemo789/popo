import baseUrl from '../config/Baseurl';
import { getToken } from '../config/localstorage';

export const couponService = {
  // Ajouter un coupon à un produit
  addCoupon: async (productId, couponData) => {
    try {
      const apiCouponData = {
        code: couponData.code,
        discountType: couponData.discountType, // Use the selected type
        discountValue: parseFloat(couponData.discountPercent),
        expiryDate: new Date(couponData.expiryDate).toISOString(), // Format date properly
        isActive: true
      };

      const response = await fetch(`${baseUrl}/api/Product/${productId}/coupons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiCouponData)
      });
      
      // Try to parse response as JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, get text content
        const textError = await response.text();
        throw new Error(textError || 'Failed to add coupon');
      }

      if (!response.ok) {
        throw new Error(errorData.message || 'Failed to create coupon');
      }
      
      return errorData;
    } catch (error) {
      console.error('Coupon creation error:', error);
      throw error;
    }
  },

  // Obtenir les coupons d'un produit
  getCoupons: async (productId) => {
    const response = await fetch(`${baseUrl}/api/Product/${productId}/coupons`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch coupons');
    return response.json();
  },

  // Mettre à jour un coupon
  updateCoupon: async (productId, couponId, couponData) => {
    const response = await fetch(`${baseUrl}/api/Product/${productId}/coupons/${couponId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(couponData)
    });
    if (!response.ok) throw new Error('Failed to update coupon');
    return response.json();
  },

  // Supprimer un coupon
  deleteCoupon: async (productId, couponId) => {
    const response = await fetch(`${baseUrl}/api/Product/${productId}/coupons/${couponId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete coupon');
    return response.json();
  }
};
