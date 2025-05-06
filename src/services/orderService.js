import baseUrl from '../config/Baseurl';
import { getToken } from '../config/localstorage';

const orderService = {
  async createOrder(shippingData) {
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${baseUrl}/api/Order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shippingData)
      });

      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  async getUserOrders(userId) {
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${baseUrl}/api/Order/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      console.error('Fetch orders error:', error);
      throw error;
    }
  }
};

export default orderService;
