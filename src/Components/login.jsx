// --- START OF FILE Login.jsx ---

"use client"; // Remove if not using Next.js App Router

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Lock, Mail, Loader2 } from "lucide-react"; // Added Loader2
import { saveToken, saveUserRole } from "../config/localstorage"; // Assuming path is correct
import baseUrl from "../config/Baseurl"; // Assuming path is correct

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        saveToken(data.token);
        const decodedToken = jwtDecode(data.token);
        
        // Récupérer le rôle et le convertir en minuscules pour la comparaison
        const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"].toLowerCase();
        saveUserRole(userRole);

        setSuccessMessage("Login successful! Redirecting...");
        
        // Vérification avec le rôle en minuscules
        if (userRole === "admin") {
          setTimeout(() => navigate("/dashboard/overview"), 1500);
        } 
        else if (userRole === "accelerateur/incubateur") {
          console.log("Redirecting to accelerator dashboard...", userRole); // Debug log
          setTimeout(() => navigate("/accelerator/dashboard"), 1500);
        }
        else {
          setTimeout(() => navigate("/"), 1500);
        }
      } else {
        setError(data.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Animation Variants (copied from MyMarket for consistency)
  const fadeIn = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    // --- Root Structure matches MyMarket.jsx ---
    <div className="relative w-full min-h-screen font-sans bg-gray-950 flex flex-col">
      <Helmet>
        <title>Login - VenturesRoom</title>
        <meta name="description" content="Login to your VenturesRoom account." />
      </Helmet>

      {/* --- Background matches MyMarket.jsx --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp" // Or use your '/background.png' if preferred
          alt="Abstract background"
          className="h-full w-full object-cover filter blur-xl scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80"></div>
      </div>

      {/* --- Content Container matches MyMarket.jsx --- */}
      <div className="relative z-10 flex flex-col text-white pt-16 sm:pt-20 flex-grow">

        {/* --- Main Content Area matches MyMarket.jsx --- */}
        {/* Added flex-grow and items-center to center the card vertically */}
        <main className="p-5 md:p-8 lg:p-10 flex-grow flex items-center justify-center w-full max-w-screen-xl mx-auto">

          {/* --- Login Card (Styled like MyMarket sections/cards) --- */}
          <motion.div
            className="w-full max-w-md bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {/* Header */}
            <div className="px-8 py-6 text-center border-b border-white/10">
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-gray-300">Sign in to your account</p>
            </div>

            {/* Form Area */}
            <div className="px-8 py-8">
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 rounded-lg border border-red-500/50 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-900/30 rounded-lg border border-green-500/50 flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-200">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="block w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 shadow-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="block w-full pl-11 pr-10 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 shadow-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    // Style matches "Add New" button from MyMarket
                    className={`w-full inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${
                        loading
                        ? 'bg-blue-700/60 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
                    }`}
                  >
                    {loading ? (
                       <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                         Signing in...
                       </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign in
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Sign up Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div> {/* End Login Card */}

        </main> {/* End Main Content Area */}

        {/* Footer (Optional but consistent) */}
        <footer className="text-center py-6 mt-auto">
             <p className="text-sm text-gray-500">© {new Date().getFullYear()} VenturesRoom. All rights reserved.</p>
        </footer>

      </div> {/* End Relative Content Container */}

      {/* Utility Styles - Copied from MyMarket.jsx for consistency, can be centralized */}
      <style jsx global>{`
         input:-webkit-autofill,
         input:-webkit-autofill:hover,
         input:-webkit-autofill:focus,
         input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.1) inset !important; /* Match input background */
            -webkit-text-fill-color: #ffffff !important; /* Ensure text is white */
            caret-color: #ffffff !important; /* Ensure cursor is white */
            transition: background-color 5000s ease-in-out 0s; /* Delay transition */
         }
         .pattern-dots { background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 16px 16px; color: rgba(255, 255, 255, 0.05); } /* Adjusted dot opacity */
      `}</style>

    </div> // End Root Wrapper
  );
};

export default Login;

// --- END OF FILE Login.jsx ---