// --- START OF FILE Products.jsx ---

// "use client"; // Remove if not using Next.js App Router

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Zap,
  ChevronDown,
  Grid,
  List,
  X,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Star,
  Heart,
  Eye,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import baseUrl from "../config/Baseurl";
import { getToken } from "../config/localstorage";
import { toast } from 'react-hot-toast';
import { useCart } from "../hooks/useCart";
import SEO from './SEO';
import cartService from '../services/cartService';

// --- Main Products Component ---
function Products() {
  const { updateCart } = useCart();

  // --- State Variables ---
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    priceRange: [0, 10000],
    category: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("newest");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("productFavorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const filterPanelRef = useRef(null);
  const sortOptionsRef = useRef(null);

  // --- Constants & Config ---
  const MAX_PRICE = 10000;

  // --- Helper Functions ---
  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return "$ N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(numericPrice);
  };

  const getProductIcon = (type, className = "h-4 w-4") => {
    if (type && typeof type === 'string' && type.toLowerCase() === "service") return <Zap className={className} />;
    return <ShoppingBag className={className} />;
  };

  const getCategoryName = (categoryId) => {
    const categories = { e: "Electronics", s: "Software", c: "Consulting", f: "Fashion", h: "Health" };
    return categories[categoryId] || categoryId || "Other";
  };

  const getCategories = () => {
    const categoryMap = products.reduce((acc, product) => {
      if (product.categoryId) {
        acc[product.categoryId] = getCategoryName(product.categoryId);
      }
      return acc;
    }, {});
    return Object.entries(categoryMap).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB));
  };

  const resetFilters = () => {
    setFilters({ type: "all", priceRange: [0, MAX_PRICE], category: "all" });
    setSearchTerm("");
    setSortOption("newest");
    setShowFilters(false);
  };

  const toggleFavorite = (productId) => {
    let updatedFavorites;
    if (favorites.includes(productId)) {
      updatedFavorites = favorites.filter((id) => id !== productId);
    } else {
      updatedFavorites = [...favorites, productId];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("productFavorites", JSON.stringify(updatedFavorites));
  };

  const getRandomRating = (productId) => {
      if (!productId) return (3.5).toFixed(1);
      const seed = productId.toString().split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      return (3.5 + (seed % 16) / 10).toFixed(1); // Rating between 3.5 and 5.0
  };

  const handleAddToCart = async (event, productId) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please login to add items to cart');
        return;
      }

      await cartService.addToCart(productId, 1);
      await updateCart();
      toast.success('Added to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        if (!event.target.closest || !event.target.closest('#filter-toggle-button')) {
            setShowFilters(false);
        }
      }
       if (sortOptionsRef.current && !sortOptionsRef.current.contains(event.target)) {
         if (!event.target.closest || !event.target.closest('#sort-toggle-button')) {
             setShowSortOptions(false);
         }
       }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const response = await fetch(`${baseUrl}/api/Product`, {
          headers: { 
            Authorization: token ? `Bearer ${token}` : "",
            'accept': '*/*'
          }
        });

        if (!response.ok) {
           if (response.status === 404) { 
             setProducts([]); 
             setFilteredProducts([]); 
             setLoading(false); 
             return; 
           }
           throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const allProducts = Array.isArray(data) ? data.map(product => ({
          ...product,
          price: product.discountedPrice // Use discounted price as the display price
        })) : [];
        
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to fetch products.");
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Filtering & Sorting ---
  useEffect(() => {
    let result = [...products];

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter( p =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        getCategoryName(p.categoryId)?.toLowerCase().includes(term)
      );
    }

    // Type Filter
    if (filters.type !== "all") {
      result = result.filter(p => p.type?.toLowerCase() === filters.type.toLowerCase());
    }

    // Price Range Filter
    result = result.filter(p => {
       const price = Number(p.price);
       return !isNaN(price) && price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Category Filter
    if (filters.category !== "all") {
      result = result.filter(p => p.categoryId === filters.category);
    }

    // Sorting
    const sortFunctions = {
        'price-asc': (a, b) => Number(a.price) - Number(b.price),
        'price-desc': (a, b) => Number(b.price) - Number(a.price),
        'name': (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
        'newest': (a, b) => (b.id ?? 0) - (a.id ?? 0),
    };
    if (sortFunctions[sortOption]) {
      result.sort(sortFunctions[sortOption]);
    }

    setFilteredProducts(result);
  }, [products, searchTerm, filters, sortOption]);

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };
   const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }, };

  // --- Component Return ---
  return (
    <div className="relative w-full font-sans bg-gray-950 flex flex-col flex-grow min-h-screen">
      <SEO 
        title="Marketplace - VenturesRoom"
        description="Explore innovative products and services from startups on the VenturesRoom marketplace."
      />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp"
          alt="Abstract background"
          className="h-full w-full object-cover filter blur-xl scale-110"
          loading="eager"
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
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full md:w-auto">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name, description, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 shadow-sm"
                />
              </div>

              <div className="flex gap-2 flex-wrap justify-center md:justify-end w-full md:w-auto flex-shrink-0">
                <button
                  id="filter-toggle-button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2.5 border border-white/20 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
                  aria-expanded={showFilters}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2 text-blue-400" />
                  Filters
                </button>

                <div ref={sortOptionsRef} className="relative z-50">
                  <button
                    id="sort-toggle-button"
                    onClick={() => setShowSortOptions(!showSortOptions)}
                    className="inline-flex items-center px-4 py-2.5 border border-white/20 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors text-sm font-medium w-full justify-center md:w-auto whitespace-nowrap"
                    aria-haspopup="true"
                    aria-expanded={showSortOptions}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2 text-blue-400" />
                    Sort
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showSortOptions ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showSortOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl z-50 border border-white/15 overflow-hidden"
                      >
                        <div className="py-1">
                          {[
                            { key: 'newest', label: 'Newest', icon: null },
                            { key: 'price-asc', label: 'Price: Low to High', icon: <ArrowUp className="h-3 w-3 ml-auto" /> },
                            { key: 'price-desc', label: 'Price: High to Low', icon: <ArrowDown className="h-3 w-3 ml-auto" /> },
                            { key: 'name', label: 'Name (A-Z)', icon: null },
                          ].map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => { setSortOption(opt.key); setShowSortOptions(false); }}
                              className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${sortOption === opt.key ? 'bg-blue-500/40 text-blue-100' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                            >
                              {opt.label}
                              {opt.icon}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex border border-white/20 rounded-lg overflow-hidden bg-white/10">
                  <button onClick={() => setViewMode("grid")} title="Grid View" className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/15"}`} > <Grid className="h-4 w-4" /> </button>
                  <button onClick={() => setViewMode("list")} title="List View" className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/15"}`} > <List className="h-4 w-4" /> </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  ref={filterPanelRef}
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-6 bg-black/30 rounded-xl border border-white/10 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-white">Filters</h3>
                      <div className="flex gap-3 items-center">
                         <button onClick={resetFilters} className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition"> Reset Filters </button>
                         <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white transition"> <X className="h-5 w-5" /> </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Type</h4>
                        <div className="space-y-2">
                          {['all', 'product', 'service'].map(type => (
                            <label key={type} className="flex items-center cursor-pointer">
                              <input type="radio" name="type" checked={filters.type === type} onChange={() => setFilters({ ...filters, type: type })} className="h-4 w-4 text-blue-500 focus:ring-blue-400 bg-gray-700/50 border-gray-600 rounded cursor-pointer" />
                              <span className="ml-2 text-gray-300 capitalize">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                         <h4 className="text-sm font-medium text-gray-300 mb-2">Price Range</h4>
                         <div className="flex items-center gap-2 text-sm">
                           <span className="text-gray-400">$</span>
                           <input type="number" min="0" max={MAX_PRICE} value={filters.priceRange[0]} onChange={(e) => setFilters({ ...filters, priceRange: [Math.max(0, parseInt(e.target.value || '0')), filters.priceRange[1]] })} className="w-full p-2 border border-white/20 rounded bg-white/10 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                           <span className="text-gray-400">-</span>
                           <span className="text-gray-400">$</span>
                           <input type="number" min="0" max={MAX_PRICE} value={filters.priceRange[1]} onChange={(e) => setFilters({ ...filters, priceRange: [filters.priceRange[0], Math.min(MAX_PRICE, parseInt(e.target.value || '0'))] })} className="w-full p-2 border border-white/20 rounded bg-white/10 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                         </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Category</h4>
                        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full p-2.5 border border-white/20 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }} >
                          <option value="all" className="bg-gray-800 text-white">All Categories</option>
                          {getCategories().map(([id, name]) => (
                            <option key={id} value={id} className="bg-gray-800 text-white">{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {(filters.type !== 'all' || filters.category !== 'all' || filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE || searchTerm) && (
               <div className="mt-4 flex flex-wrap gap-2 items-center">
                 <span className="text-sm text-gray-400 mr-2">Active:</span>
                 {searchTerm && (<span className="pill"><Search className="icon"/> "{searchTerm}" <button onClick={() => setSearchTerm('')}><X className="close-icon"/></button></span>)}
                 {filters.type !== 'all' && (<span className="pill"><Tag className="icon"/> {filters.type} <button onClick={() => setFilters({...filters, type: 'all'})}><X className="close-icon"/></button></span>)}
                 {filters.category !== 'all' && (<span className="pill"><Tag className="icon"/> {getCategoryName(filters.category)} <button onClick={() => setFilters({...filters, category: 'all'})}><X className="close-icon"/></button></span>)}
                 {(filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE) && (<span className="pill">{formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])} <button onClick={() => setFilters({...filters, priceRange: [0, MAX_PRICE]})}><X className="close-icon"/></button></span>)}
                 <button onClick={resetFilters} className="text-xs text-blue-400 hover:text-blue-300 underline ml-2 transition"> Clear All </button>
               </div>
             )}
          </motion.section>

          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-gradient-to-br from-red-800/30 to-red-900/20 backdrop-blur-lg rounded-3xl border border-red-500/50 shadow-xl px-6">
                <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-red-200 mb-2">Failed to Load Products</h3>
                <p className="text-red-300 mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-white/15 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/25 transition-all duration-300 border border-white/20 active:scale-95">
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
                 <div className="text-center py-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl px-6">
                    <ShoppingBag className="h-16 w-16 text-gray-500 mx-auto mb-5" />
                    <h3 className="text-2xl font-medium text-white mb-3">Marketplace is Empty</h3>
                    <p className="text-gray-300 max-w-md mx-auto mb-8"> No products or services have been listed yet. Check back soon! </p>
                 </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl px-6">
                <Search className="h-16 w-16 text-gray-500 mx-auto mb-5" />
                <h3 className="text-2xl font-medium text-white mb-3">No Matches Found</h3>
                <p className="text-gray-300 max-w-md mx-auto mb-8"> Your search or filter criteria didn't return any results. </p>
                <button onClick={resetFilters} className="px-6 py-2.5 bg-white/15 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/25 transition-all duration-300 border border-white/20 active:scale-95">
                    Reset Filters
                </button>
              </div>
            ) : (
               <motion.div
                 variants={containerVariants}
                 initial="hidden"
                 animate="visible"
                 className={ viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-0" : "flex flex-col space-y-6 relative z-0" }
               >
                {filteredProducts.map((product) => (
                   <motion.div
                     key={product.id}
                     variants={itemVariants}
                     layout
                     className={`bg-gradient-to-br from-white/15 to-white/5 rounded-2xl shadow-lg overflow-hidden border border-white/20 group transition-all duration-300 hover:border-white/30 ${ viewMode === "list" ? "flex flex-row items-stretch" : "flex flex-col" }`}
                     initial={{ opacity: 1 }}
                     animate={{ opacity: 1 }}
                     whileHover={{ y: -5, scale: 1.02 }}
                   >
                     <div className={`relative overflow-hidden ${ viewMode === "grid" ? "h-52 w-full" : "h-auto w-40 sm:w-48 flex-shrink-0" }`}>
                       <Link to={`/product/${product.id}`} className="block w-full h-full group-hover:opacity-90 transition-opacity">
                         {product.images && product.images.length > 0 ? (
                           <img
                             src={`${baseUrl}${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}`}
                             alt={`Image of ${product.name || "product"}`}
                             className="w-full h-full object-cover transition-transform duration-400 ease-in-out group-hover:scale-110"
                             loading="eager"
                             onError={(e) => setImgError(true)}
                           />
                         ) : (
                           <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                             {getProductIcon(product.type, "h-16 w-16 text-gray-500 opacity-50")}
                           </div>
                         )}
                       </Link>
                       <button onClick={() => toggleFavorite(product.id)} title={favorites.includes(product.id) ? "Remove from Favorites" : "Add to Favorites"} className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm p-1.5 rounded-full text-white hover:text-red-400 transition-colors z-10 transform hover:scale-110">
                         <Heart className={`h-4 w-4 ${ favorites.includes(product.id) ? "fill-red-500 text-red-500" : "fill-transparent stroke-current" }`} />
                       </button>
                       <div className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow ${product.type?.toLowerCase() === 'service' ? 'bg-purple-600/80 text-purple-100' : 'bg-blue-600/80 text-blue-100'} backdrop-blur-sm`}>
                            <span className="flex items-center gap-1">{getProductIcon(product.type)} {product.type ? product.type.charAt(0).toUpperCase() + product.type.slice(1) : 'Product'}</span>
                        </div>
                     </div>

                     <div className={`p-5 flex flex-col flex-grow ${viewMode === 'list' ? 'justify-between' : ''}`}>
                       <div>
                         <div className={`flex items-center mb-2 ${viewMode === 'grid' ? 'justify-between' : 'flex-wrap gap-x-3 gap-y-1'}`}>
                           <span
                              className="inline-block text-xs font-medium text-cyan-300 hover:text-cyan-200 cursor-pointer transition-colors"
                              onClick={(e) => { e.stopPropagation(); setFilters({...filters, category: product.categoryId ?? 'all'}); }}
                              title={`Filter by ${getCategoryName(product.categoryId)}`}
                            >
                               <Tag className="inline-block h-3 w-3 mr-1 align-[-0.1em]"/> {getCategoryName(product.categoryId)}
                           </span>
                            <div className="flex items-center gap-1" title={`${getRandomRating(product.id)} stars`}>
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400"/>
                                <span className="text-xs text-gray-300 font-medium">{getRandomRating(product.id)}</span>
                            </div>
                         </div>
                         <Link to={`/product/${product.id}`} className="block">
                            <h3 className={`font-semibold text-white group-hover:text-blue-300 transition-colors mb-1 ${viewMode === 'grid' ? 'text-lg line-clamp-2' : 'text-base line-clamp-1'}`}>
                                {product.name || "Untitled Product"}
                            </h3>
                         </Link>
                         <p className={`text-sm text-gray-400 ${viewMode === 'grid' ? 'line-clamp-3 mb-4' : 'line-clamp-2 mb-3'}`}>
                           {product.description || "No description available."}
                         </p>
                       </div>

                       <div className={`flex items-center mt-auto pt-4 border-t border-white/10 ${viewMode === 'grid' ? 'justify-between' : 'justify-between gap-4'}`}>
                          <div className="flex flex-col">
                            <span className="text-xl font-bold text-blue-300">
                              {formatPrice(product.discountedPrice)}
                            </span>
                            {product.originalPrice !== product.discountedPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/product/${product.id}`}
                              className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg shadow-sm text-gray-200 bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors whitespace-nowrap transform hover:scale-105 active:scale-95"
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => handleAddToCart(e, product.id)}
                              className="p-2 rounded-full bg-blue-500/80 text-white hover:bg-blue-600 transition-colors"
                            >
                              <ShoppingBag className="h-4 w-4" />
                            </button>
                          </div>
                       </div>
                     </div>
                   </motion.div>
                ))}
               </motion.div>
            )}

             {!loading && !error && (
               <div className="mt-8 text-center text-sm text-gray-400">
                 {products.length === 0 ?
                    `Marketplace is currently empty.` :
                    filteredProducts.length > 0 ?
                    `Showing ${filteredProducts.length} of ${products.length} total items` :
                    `Found 0 items matching your criteria`
                 }
               </div>
             )}
          </motion.section>
        </main>
      </div>

      <style>
        {`
         .btn { /* your styles */ }
         .btn-primary { /* your styles */ }
         /* other styles */
        `}
      </style>
    </div>
  );
}

export default Products;
// --- END OF FILE Products.jsx ---