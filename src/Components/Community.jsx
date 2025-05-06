import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import baseUrl from '../config/Baseurl';
import { getToken } from '../config/localstorage';
import CouponCheckModal from './CouponCheckModal';

function Community() {
  const [hasCoupons, setHasCoupons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkCoupons = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${baseUrl}/api/Product/my-products`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        
        // Vérifie si au moins un produit a des coupons
        const hasAnyCoupons = products.some(product => product.coupons && product.coupons.length > 0);
        setHasCoupons(hasAnyCoupons);

        // Vérifie le localStorage pour voir si c'est la première visite
        const hasVisitedCommunity = localStorage.getItem('hasVisitedCommunity');
        if (!hasAnyCoupons && !hasVisitedCommunity) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking coupons:', error);
      }
    };

    checkCoupons();
  }, [navigate]);

  const handleCloseModal = () => {
    setShowModal(false);
    localStorage.setItem('hasVisitedCommunity', 'true');
    if (!hasCoupons) {
      navigate('/my-market');
    }
  };

  return (
    <div className="relative w-full font-sans bg-gray-950 flex flex-col min-h-screen">
      <Helmet>
        <title>Community - VenturesRoom</title>
        <meta name="description" content="Join our startup community on VenturesRoom" />
      </Helmet>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp"
          alt="Abstract background"
          className="h-full w-full object-cover filter blur-xl scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80"></div>
      </div>

      <div className="relative z-10 flex flex-col text-white pt-16 sm:pt-20 flex-1">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-6">Bienvenue dans la Communauté</h1>
          {/* Add your community content here */}
        </main>
      </div>

      <CouponCheckModal isOpen={showModal} onClose={handleCloseModal} />
    </div>
  );
}

export default Community;
