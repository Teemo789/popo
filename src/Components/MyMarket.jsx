// "use client"; // Remove if not using Next.js App Router

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Zap,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  PlusCircle,
  Tag,
  Loader2,
  Eye,
  PackagePlus,
  X,
} from "lucide-react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import baseUrl from "../config/Baseurl";
import { getToken } from "../config/localstorage";
import { couponService } from "../services/couponService";
import { productService } from "../services/productService"; // Import productService

// --- Main MyMarket Component ---
function MyMarket() {
  // --- State Variables ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [couponError, setCouponError] = useState(null); // Add error state for coupon operations
  const [couponData, setCouponData] = useState({
    code: "",
    discountPercent: 0,
    expiryDate: "",
    discountType: "Percentage", // Ajout du type de réduction
  });

  // --- Helper Functions ---
  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return "$ N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(numericPrice);
  };

  const getProductIcon = (type, className = "h-4 w-4") => {
    if (type && typeof type === "string" && type.toLowerCase() === "service") return <Zap className={className} />;
    return <ShoppingBag className={className} />;
  };

  const getCategoryName = (categoryId) => {
    const categories = { e: "Electronics", s: "Software", c: "Consulting", f: "Fashion", h: "Health" };
    return categories[categoryId] || categoryId || "Other";
  };

  const getActiveCouponId = (product) => {
    // Si le prix original est différent du prix réduit, il y a un coupon actif
    if (product.originalPrice !== product.discountedPrice) {
      // On fetch le coupon actif
      return fetch(`${baseUrl}/api/Product/${product.id}/coupons`)
        .then(res => res.json())
        .then(coupons => {
          const activeCoupon = coupons.find(c => c.isActive);
          return activeCoupon?.id;
        })
        .catch(err => {
          console.error('Error fetching coupon:', err);
          return null;
        });
    }
    return Promise.resolve(null);
  };

  const handleAddCoupon = async (productId) => {
    setSelectedProduct(productId);
    setShowCouponModal(true);
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError(null); // Reset error state
    try {
      await couponService.addCoupon(selectedProduct, couponData);
      // Refresh products list after adding coupon
      fetchMyProducts();
      setShowCouponModal(false);
      // Reset form
      setCouponData({ code: "", discountPercent: 0, expiryDate: "", discountType: "Percentage" });
    } catch (error) {
      console.error("Error adding coupon:", error);
      setCouponError(error.message);
      // Don't close modal on error
    }
  };

  const handleDelete = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      // Refresh la liste après suppression
      fetchMyProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product");
    }
  };

  const handleDeleteCoupon = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      const couponId = await getActiveCouponId({ id: productId, originalPrice: product.originalPrice, discountedPrice: product.discountedPrice });
      if (!couponId) {
        console.error('No active coupon found');
        return;
      }
      
      await productService.deleteCoupon(productId, couponId);
      fetchMyProducts();
      toast.success('Coupon supprimé avec succès');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setCouponError('Erreur lors de la suppression du coupon');
    }
  };

  // --- Data Fetching ---
  const fetchMyProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Authentication required. Please log in.");
      const response = await fetch(`${baseUrl}/api/Product/my-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Invalid or expired token.");
        if (response.status === 404) {
          setProducts([]);
          setFilteredProducts([]);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const userProducts = Array.isArray(data) ? data : [];
      setProducts(userProducts);
      setFilteredProducts(userProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  // --- Search Filtering ---
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        getCategoryName(p.categoryId)?.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };
  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  // --- Component Return ---
  return (
    <div className="relative w-full font-sans bg-gray-950 flex flex-col flex-grow">
      <Helmet>
        <title>My Market - VenturesRoom</title>
        <meta name="description" content="Manage your products and services on VenturesRoom." />
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
        <main className="p-5 md:p-8 lg:p-10 pb-16 space-y-12 lg:space-y-16 w-full max-w-screen-xl mx-auto">
          

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 sm:p-8"
          >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative flex-grow w-full md:w-auto">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search your products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 shadow-sm"
                />
              </div>
              <Link
                to="/manage-products/new"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 w-full md:w-auto"
              >
                <PackagePlus className="h-5 w-5 mr-2" />
                Add New
              </Link>
            </div>
          </motion.section>

          <motion.section initial="hidden" animate="visible" variants={containerVariants}>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-gradient-to-br from-red-800/30 to-red-900/20 backdrop-blur-lg rounded-3xl border border-red-500/50 shadow-xl px-6">
                <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-red-200 mb-2">Failed to Load Your Products</h3>
                <p className="text-red-300 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-white/15 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/25 transition-all duration-300 border border-white/20 active:scale-95"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl px-6">
                <ShoppingBag className="h-16 w-16 text-gray-500 mx-auto mb-5" />
                <h3 className="text-2xl font-medium text-white mb-3">Your Market is Empty</h3>
                <p className="text-gray-300 max-w-md mx-auto mb-8">
                  You haven't added any products or services yet. Get started by adding your first listing!
                </p>
                <Link
                  to="/manage-products/new"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="h-5 w-5 mr-2" /> Add Your First Product
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl px-6">
                <Search className="h-16 w-16 text-gray-500 mx-auto mb-5" />
                <h3 className="text-2xl font-medium text-white mb-3">No Matches Found</h3>
                <p className="text-gray-300 max-w-md mx-auto mb-8">
                  Your search for "{searchTerm}" didn't return any results in your market.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-2.5 bg-white/15 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/25 transition-all duration-300 border border-white/20 active:scale-95"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    layout
                    className="bg-gradient-to-br from-white/15 to-white/5 rounded-2xl shadow-lg overflow-hidden border border-white/20 group transition-all duration-300 flex flex-col hover:border-white/30"
                    whileHover={{ y: -5, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 15 } }}
                  >
                    <div className="h-52 w-full relative overflow-hidden">
                      <Link to={`/product/${product.id}`} className="block w-full h-full group-hover:opacity-90 transition-opacity">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`${baseUrl}${product.images[0].startsWith("/") ? "" : "/"}${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = `/placeholder-product.svg`;
                              e.target.classList.add("img-error");
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                            {getProductIcon(product.type, "h-16 w-16 text-gray-500 opacity-50")}
                          </div>
                        )}
                      </Link>
                      <div
                        className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow ${
                          product.type?.toLowerCase() === "service"
                            ? "bg-purple-600/80 text-purple-100"
                            : "bg-blue-600/80 text-blue-100"
                        } backdrop-blur-sm`}
                      >
                        <span className="flex items-center gap-1">
                          {getProductIcon(product.type)} {product.type ? product.type.charAt(0).toUpperCase() + product.type.slice(1) : "Product"}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          to={`/manage-products/edit/${product.id}`}
                          title="Edit Product"
                          className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors transform hover:scale-110"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          title="Delete Product"
                          className="p-3 rounded-full bg-red-600/50 text-white hover:bg-red-600/70 backdrop-blur-sm transition-colors transform hover:scale-110"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <div>
                        <span className="inline-block text-xs font-medium text-cyan-300 mb-2">
                          <Tag className="inline-block h-3 w-3 mr-1 align-[-0.1em]" /> {getCategoryName(product.categoryId)}
                        </span>
                        <Link to={`/product/${product.id}`} className="block">
                          <h3 className="font-semibold text-lg text-white group-hover:text-blue-300 transition-colors mb-1 line-clamp-2">
                            {product.name || "Untitled Product"}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{product.description || "No description available."}</p>
                      </div>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-blue-300">{formatPrice(product.discountedPrice)}</span>
                          {product.originalPrice !== product.discountedPrice && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                              {/* Ajout du bouton de suppression du coupon */}
                              <button
                                onClick={() => handleDeleteCoupon(product.id)}
                                className="p-1.5 rounded-full bg-red-600/50 text-white hover:bg-red-600/70 backdrop-blur-sm transition-colors"
                                title="Supprimer le coupon"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddCoupon(product.id)}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 gap-2 transform hover:scale-105 active:scale-95"
                        >
                          <Tag className="h-4 w-4" />
                          Add Coupon
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </main>
      </div>

      {/* Coupon Modal avec design amélioré */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Ajouter un Coupon</h3>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Créez un coupon de réduction pour ce produit
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCouponSubmit} className="p-6 space-y-6">
              {couponError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-300 text-sm">
                  {couponError}
                </div>
              )}
              <div className="space-y-4">
                {/* Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Code du coupon
                  </label>
                  <input
                    type="text"
                    value={couponData.code}
                    onChange={(e) =>
                      setCouponData({ ...couponData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg 
                             text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 
                             focus:ring-blue-500 transition-colors"
                    placeholder="ex: SUMMER2024"
                    required
                  />
                </div>

                {/* Type de réduction Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Type de réduction
                  </label>
                  <select 
                    value={couponData.discountType}
                    onChange={(e) => setCouponData({ ...couponData, discountType: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg 
                             text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 
                             focus:ring-blue-500 transition-colors"
                    required
                  >
                    <option value="Percentage">Pourcentage (%)</option>
                    <option value="FixedAmount">Montant fixe ($)</option>
                  </select>
                </div>

                {/* Discount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {couponData.discountType === "Percentage" ? "Pourcentage de réduction" : "Montant de réduction"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={couponData.discountType === "Percentage" ? "100" : "999999"}
                      value={couponData.discountPercent}
                      onChange={(e) =>
                        setCouponData({
                          ...couponData,
                          discountPercent: Math.min(
                            couponData.discountType === "Percentage" ? 100 : 999999,
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg 
                               text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 
                               focus:ring-blue-500 transition-colors"
                      placeholder={couponData.discountType === "Percentage" ? "20" : "10"}
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {couponData.discountType === "Percentage" ? "%" : "$"}
                    </span>
                  </div>
                </div>

                {/* Date d'expiration Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={couponData.expiryDate}
                    onChange={(e) =>
                      setCouponData({ ...couponData, expiryDate: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg 
                             text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 
                             focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2.5 border border-white/10 rounded-lg text-gray-300 
                           hover:bg-white/5 hover:border-white/20 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           transition-colors flex items-center justify-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Créer le coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default MyMarket;