import baseUrl from '../config/Baseurl';
import { getToken } from '../config/localstorage';
import { getUserInfo, getUserIdFromToken } from '../utils/jwtDecoder';

const cartService = {
    async getCart() {
        try {
            const token = getToken();
            if (!token) {
                console.log("No token found");
                return { items: [] };
            }

            const userInfo = getUserInfo(token);
            if (!userInfo || !userInfo.id) {
                console.log("No user ID found in token");
                return { items: [] };
            }

            const userId = userInfo.id;
            console.log(`Fetching cart for user ID: ${userId}`);

            const response = await fetch(`${baseUrl}/api/Cart/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
                throw new Error('Failed to fetch cart');
            }

            const data = await response.json();
            console.log("Cart data from API:", data);
            return data;
        } catch (error) {
            console.error('Error fetching cart:', error);
            return { items: [], subtotal: 0 };
        }
    },

    async addToCart(productId, quantity) {
        try {
            const token = getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${baseUrl}/api/Cart`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });

            if (!response.ok) throw new Error('Failed to add to cart');
            return this.getCart();
        } catch (error) {
            console.error('Add to cart error:', error);
            throw error;
        }
    },

    async updateQuantity(productId, quantity) {
        try {
            const token = getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${baseUrl}/api/Cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });

            if (!response.ok) throw new Error('Failed to update quantity');
            return this.getCart();
        } catch (error) {
            console.error('Update quantity error:', error);
            throw error;
        }
    },

    async removeFromCart(productId) {
        try {
            const token = getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${baseUrl}/api/Cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to remove item');
            return this.getCart();
        } catch (error) {
            console.error('Remove from cart error:', error);
            throw error;
        }
    },

    async clearCart() {
        try {
            const token = getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${baseUrl}/api/Cart`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to clear cart');
            return { items: [] };
        } catch (error) {
            console.error('Clear cart error:', error);
            throw error;
        }
    }
};

export default cartService;
