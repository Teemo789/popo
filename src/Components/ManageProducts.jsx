// --- START OF FILE ManageProducts.jsx ---

"use client"; // Remove if not using Next.js App Router

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  ImageIcon,
  DollarSign,
  Tag,
  FileText,
  Package,
  Trash2, // Added for Delete button icon
  X, // Added for Remove image button
  FolderOpen, // Added for Category icon
} from "lucide-react";
import baseUrl from "../config/Baseurl";
import { getToken } from "../config/localstorage";

const inputClassName = "block w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200";
const labelClassName = "block text-sm font-medium text-gray-300 mb-1.5";

function ManageProducts() {
  const { action, id } = useParams(); // action = 'new', 'edit', 'delete'
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    type: "product",
    price: "", // Store as string initially for better input control
    categoryId: "e",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null); // To show current image when editing
  const [loading, setLoading] = useState(false); // General loading state
  const [pageLoading, setPageLoading] = useState(false); // Loading for initial data fetch
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const isEditMode = action === "edit";
  const isDeleteMode = action === "delete";
  const isNewMode = action === "new";

  // --- Data Fetching ---
  useEffect(() => {
    if ((isEditMode || isDeleteMode) && id) {
      const fetchProductDetails = async (productId) => {
        setPageLoading(true);
        setError(null);
        try {
          const token = getToken();
          if (!token) throw new Error("Authentication required. Please log in.");

          const response = await fetch(`${baseUrl}/api/Product/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
             if (response.status === 401) throw new Error("Unauthorized access.");
             if (response.status === 404) throw new Error("Product not found.");
             throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          setProduct({
            name: data.name || "",
            description: data.description || "",
            type: data.type || "product",
            price: data.price != null ? String(data.price) : "", // Keep as string for input
            categoryId: data.categoryId || "e",
            imageFile: null, // Reset file input
          });

          // Set image preview/existing URL
          if (data.images && data.images.length > 0) {
              const imageUrl = `${baseUrl}${data.images[0].startsWith('/') ? '' : '/'}${data.images[0]}`;
              setImagePreview(imageUrl);
              setExistingImageUrl(imageUrl);
          } else {
              setImagePreview(null);
              setExistingImageUrl(null);
          }

        } catch (err) {
          console.error("Error fetching product details:", err);
          setError(`Failed to load product data: ${err.message}`);
        } finally {
          setPageLoading(false);
        }
      };
      fetchProductDetails(id);
    } else if (isNewMode) {
      // Reset form for 'new' action if navigating back/forth
      setProduct({ name: "", description: "", type: "product", price: "", categoryId: "e", imageFile: null });
      setImagePreview(null);
      setExistingImageUrl(null);
      setError(null);
      setSuccess(null);
    }
  }, [action, id, isEditMode, isDeleteMode, isNewMode, navigate]); // Added navigate to dependency array

  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation (optional)
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError("File size exceeds 10MB limit.");
          return;
      }
      if (!file.type.startsWith("image/")) {
          setError("Invalid file type. Please upload an image (PNG, JPG, GIF).");
          return;
      }
      setError(null); // Clear previous errors

      setProduct((prev) => ({ ...prev, imageFile: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
      setProduct((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(existingImageUrl); // Revert preview to original image if editing, else null
      if (fileInputRef.current) fileInputRef.current.value = null; // Reset file input visually
  }

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission

    // Basic validation for price
    const numericPrice = Number.parseFloat(product.price);
    if (isNaN(numericPrice) || numericPrice < 0) {
        setError("Please enter a valid non-negative price.");
        return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication required. Please log in.");

      const formData = new FormData();
      // Append only if not deleting
      if (!isDeleteMode) {
        formData.append("Name", product.name.trim());
        formData.append("Description", product.description.trim());
        formData.append("Type", product.type);
        formData.append("Price", numericPrice); // Send as number
        formData.append("CategoryId", product.categoryId);
        if (product.imageFile) {
          formData.append("ImageFile", product.imageFile);
        }
      }

      let url = `${baseUrl}/api/Product`;
      let method = "POST";

      if (isEditMode && id) {
        url = `${baseUrl}/api/Product/${id}`;
        method = "PUT";
      } else if (isDeleteMode && id) {
        url = `${baseUrl}/api/Product/${id}`;
        method = "DELETE";
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: isDeleteMode ? undefined : formData, // No body for DELETE
      });

      if (!response.ok) {
        let errorMessage = `Operation failed: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.title || JSON.stringify(errorData);
        } catch (jsonError) {
            const textResponse = await response.text();
            errorMessage = textResponse || `Operation failed: ${response.status} ${response.statusText}`;
        }
        if (response.status === 400) errorMessage = `Validation Error: ${errorMessage}`;
        if (response.status === 401) errorMessage = "Unauthorized. Please log in again.";
        if (response.status === 404) errorMessage = "Product not found.";

        throw new Error(errorMessage);
      }

      let successMsg = "";
      if (isDeleteMode) successMsg = "Product deleted successfully!";
      else if (isEditMode) successMsg = "Product updated successfully!";
      else successMsg = "Product created successfully!";
      setSuccess(successMsg);

      setTimeout(() => {
        navigate("/my-market");
      }, 1500);

    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false); // Ensure loading stops on error
    }
  };

  // --- Helper Functions ---
  const getPageTitle = () => {
    if (isEditMode) return "Edit Product";
    if (isDeleteMode) return "Delete Product";
    return "Add New Product";
  };

  const getButtonIcon = () => {
    if (isDeleteMode) return <Trash2 className="h-5 w-5 mr-2" />;
    return <Save className="h-5 w-5 mr-2" />;
  };

  const getButtonText = () => {
    if (loading) return "Processing...";
    if (isDeleteMode) return "Confirm Delete";
    if (isEditMode) return "Update Product";
    return "Create Product";
  };

  const getButtonClass = () => {
    if (isDeleteMode) {
        return `bg-red-600 hover:bg-red-700 focus:ring-red-500 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`;
    }
    return `bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`;
  };

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }, };

  return (
    <div className="relative w-full min-h-screen font-sans bg-gray-950 flex flex-col">
      <Helmet>
        <title>{getPageTitle()} - VenturesRoom</title>
        <meta name="description" content={`Manage your product: ${getPageTitle()}`} />
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

      <div className="relative z-10 flex flex-col text-white pt-16 sm:pt-20 flex-grow">
        <main className="p-5 md:p-8 lg:p-10 flex-grow w-full max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
            <div className="mb-6">
              <Link
                to="/my-market"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to My Market
              </Link>
            </div>

            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{getPageTitle()}</h1>
              <p className="mt-2 text-lg text-gray-300">
                {isDeleteMode
                  ? "Please review the details below before confirming deletion."
                  : "Provide the details for your product or service."}
              </p>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/40 rounded-lg border border-red-500/50 flex items-start shadow-lg"
            >
              <AlertCircle className="h-5 w-5 text-red-300 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-900/40 rounded-lg border border-green-500/50 flex items-start shadow-lg"
            >
              <CheckCircle className="h-5 w-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-200">{success}</p>
            </motion.div>
          )}

          <motion.div
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            {pageLoading && !success ? (
              <div className="p-10 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
                <p className="text-gray-300">Loading Product Details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                {isDeleteMode ? (
                  <div className="space-y-6">
                    <div className="bg-red-900/30 p-4 rounded-lg border-l-4 border-red-500/80">
                      <div className="flex items-center">
                        <AlertCircle className="h-6 w-6 text-red-300 mr-3 flex-shrink-0" />
                        <h3 className="text-lg font-medium text-red-200">Confirm Deletion</h3>
                      </div>
                      <p className="mt-2 text-red-300 ml-9">
                        Are you sure you want to permanently delete <strong className="font-semibold">"{product.name || 'this product'}"</strong>? This action cannot be undone.
                      </p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-white mb-3 text-base">Product Summary</h4>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-full sm:w-24 h-24 flex-shrink-0">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt={product.name || 'Product Image'}
                              className="w-full h-full object-cover rounded-lg border border-white/10"
                              onError={(e) => { e.target.src = `/placeholder-product.svg`; e.target.classList.add('img-error'); }}
                            />
                          ) : (
                            <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                              <ImageIcon className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="w-full text-center sm:text-left">
                          <p className="font-medium text-lg text-white">{product.name || "N/A"}</p>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{product.description || "No description"}</p>
                          <div className="flex items-center justify-center sm:justify-start mt-2 gap-2 flex-wrap">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${product.type === 'service' ? 'bg-purple-600/80 text-purple-100' : 'bg-blue-600/80 text-blue-100'} backdrop-blur-sm`}>
                              {product.type ? product.type.charAt(0).toUpperCase() + product.type.slice(1) : 'Product'}
                            </span>
                            <span className="text-sm text-blue-300 font-semibold">
                              ${Number.parseFloat(product.price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                      <Link
                        to="/my-market"
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-200 text-sm font-medium"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        className={`inline-flex items-center justify-center px-5 py-2.5 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm ${getButtonClass()}`}
                        disabled={loading}
                      >
                        {getButtonIcon()}
                        {getButtonText()}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className={labelClassName}>
                        Product Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={product.name}
                          onChange={handleInputChange}
                          className={inputClassName}
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="price" className={labelClassName}>
                        Price
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={handleInputChange}
                          className={inputClassName}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className={labelClassName}>
                        Description
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          id="description"
                          name="description"
                          value={product.description}
                          onChange={handleInputChange}
                          className={inputClassName}
                          rows="4"
                          placeholder="Enter product description"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="categoryId" className={labelClassName}>
                        Category
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <FolderOpen className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="categoryId"
                          name="categoryId"
                          value={product.categoryId}
                          onChange={handleInputChange}
                          className={inputClassName}
                          required
                        >
                          <option value="">Select a category</option>
                          <option value="e">Electronics</option>
                          <option value="s">Software</option>
                          <option value="c">Consulting</option>
                          <option value="f">Fashion</option>
                          <option value="h">Health</option>
                        </select>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Product Image
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-lg hover:border-blue-400/50 transition-colors">
                        <div className="space-y-1 text-center">
                          {imagePreview ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={imagePreview}
                                alt="Product preview"
                                className="h-40 w-40 object-contain mb-4"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setProduct(prev => ({ ...prev, imageFile: null }));
                                  setImagePreview(null);
                                }}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-400">
                                <label
                                  className="relative cursor-pointer bg-white/10 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none px-2 py-1"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                  />
                                </label>
                                <p className="pl-1 pt-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                      <Link
                        to="/my-market"
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-200 text-sm font-medium"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        className={`inline-flex items-center justify-center px-5 py-2.5 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm ${getButtonClass()}`}
                        disabled={loading || pageLoading}
                      >
                        {getButtonIcon()}
                        {getButtonText()}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default ManageProducts;

// --- END OF FILE ManageProducts.jsx ---