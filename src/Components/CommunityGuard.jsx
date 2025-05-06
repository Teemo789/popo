import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import baseUrl from '../config/Baseurl';
import { getToken, getUserRole } from '../config/localstorage';
import CouponCheckModal from './CouponCheckModal';

function CommunityGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = getToken();
        const userRole = getUserRole();

        if (!token || userRole !== 'startup') {
          navigate('/login');
          return;
        }

        const response = await fetch(`${baseUrl}/api/Product/my-products`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        console.log('Raw products data:', products);

        // Nouvelle logique - vérifier si au moins un produit a un prix réduit
        const hasActiveCoupons = products.some(product => {
          // Vérifier si le produit a un prix original et un prix réduit différents
          const hasDiscountedPrice = product.originalPrice !== product.discountedPrice;
          console.log(`Product ${product?.id || 'unknown'}:`, {
            originalPrice: product.originalPrice,
            discountedPrice: product.discountedPrice,
            hasDiscount: hasDiscountedPrice
          });
          return hasDiscountedPrice;
        });

        console.log('Final check - Has products with discounts:', hasActiveCoupons);

        if (!hasActiveCoupons) {
          setShowModal(true);
        } else {
          setLoading(false);
          setShowModal(false);
        }

      } catch (error) {
        console.error('Detailed access check error:', error);
        setShowModal(true);
      }
    };

    checkAccess();
  }, [navigate]);

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/my-market');
  };

  if (showModal) {
    return <CouponCheckModal isOpen={true} onClose={handleCloseModal} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return children;
}

export default CommunityGuard;
