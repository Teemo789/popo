import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function CouponCheckModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 max-w-md w-full"
      >
        <div className="text-right mb-2">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold text-white mb-4">Accès Restreint</h2>
          <p className="text-gray-300 mb-6">
            Pour accéder à la communauté, vous devez d'abord créer un produit et lui appliquer un coupon de réduction.
          </p>
          <Link
            to="/my-market"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Aller à My Market
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default CouponCheckModal;
