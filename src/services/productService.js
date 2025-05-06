import baseUrl from '../config/Baseurl';
import { getToken } from '../config/localstorage';

export const productService = {
  // Récupérer tous les produits de la startup
  getMyProducts: async () => {
    const response = await fetch(`${baseUrl}/api/Product/my-products`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // Supprimer un produit
  deleteProduct: async (productId) => {
    const response = await fetch(`${baseUrl}/api/Product/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  // Mettre à jour un produit
  updateProduct: async (productId, productData) => {
    const response = await fetch(`${baseUrl}/api/Product/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: productData // FormData object
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  // Supprimer un coupon d'un produit
  deleteCoupon: async (productId, couponId) => {
    const response = await fetch(`${baseUrl}/api/Product/${productId}/coupons/${couponId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete coupon');
    }
    
    return await response.json();
  }
};
