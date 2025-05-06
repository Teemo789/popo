"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Briefcase, Mail, Lock, Phone, Globe, Upload, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react"
import { Helmet } from "react-helmet"
import { motion } from "framer-motion"
import baseUrl from "../config/Baseurl"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [telephone, setTelephone] = useState("")
  const [country, setCountry] = useState("")
  const [role, setRole] = useState("Client") // Default role
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pendingMessage, setPendingMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Reset logo when role changes to Client
  useEffect(() => {
    if (role === "Client") {
      setLogo(null)
      setLogoPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = null
      }
    }
  }, [role])

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setLogo(file)

      // Create preview URL for the selected image
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setLogo(null)
      setLogoPreview(null)
    }
  }

  const clearForm = () => {
    setEmail("")
    setPassword("")
    setDisplayName("")
    setTelephone("")
    setCountry("")
    setRole("Client")
    setLogo(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = null
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setPendingMessage("")
    setSuccessMessage("")
    setLoading(true)

    const formData = new FormData()
    formData.append("Email", email)
    formData.append("Password", password)
    formData.append("DisplayName", displayName)
    formData.append("Telephone", telephone)
    formData.append("Country", country)
    formData.append("Role", role)
    if (logo) {
      formData.append("Logo", logo)
    }

    try {
      const response = await fetch(`${baseUrl}/api/Auth/register`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = `Registration failed: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.title || JSON.stringify(errorData)
        } catch (e) {
          errorMessage = `Registration failed: ${response.status} ${response.statusText || ""}`.trim()
        }
        throw new Error(errorMessage)
      }

      console.log("Registration successful")
      clearForm() // Clear form on success

      if (role === "Startup") {
        setPendingMessage(
          "Inscription réussie pour Startup. En attente de confirmation de l'administration, veuillez patienter.",
        )
      } else if (role === "Client") {
        setSuccessMessage("Inscription réussie ! Vous allez être redirigé vers la page de connexion...")
        setTimeout(() => {
          navigate("/login") // Redirect to login for clients
        }, 2500)
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full min-h-screen font-sans bg-gray-950 flex flex-col">
      <Helmet>
        <title>Register - VenturesRoom</title>
        <meta name="description" content="Create your VenturesRoom account." />
      </Helmet>

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp"
          alt="Abstract background"
          className="h-full w-full object-cover filter blur-xl scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col text-white pt-16 sm:pt-20 flex-grow">
        <main className="p-5 md:p-8 lg:p-10 flex-grow flex items-center justify-center w-full max-w-screen-xl mx-auto">
          <motion.div 
            className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {/* Header */}
            <div className="px-8 py-6 text-center border-b border-white/10">
              <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
              <p className="mt-2 text-gray-300">Join our platform and connect with innovative startups</p>
            </div>

            {/* Form Area */}
            <div className="px-8 py-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 rounded-lg border border-red-500/50 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-900/30 rounded-lg border border-green-500/50 flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-200">{successMessage}</p>
                </div>
              )}

              {/* Pending Message */}
              {pendingMessage && (
                <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/50">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-blue-300 mr-3 flex-shrink-0" />
                    <h3 className="font-medium text-blue-200">Registration Successful</h3>
                  </div>
                  <p className="text-sm text-blue-100 ml-8">{pendingMessage}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Role buttons with glassmorphism */}
                  <button
                    type="button"
                    onClick={() => setRole("Client")}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border border-white/20 backdrop-blur-sm transition-all ${
                      role === "Client"
                        ? "bg-blue-600/20 border-blue-400/50"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <User className={`h-6 w-6 mb-2 ${role === "Client" ? "text-blue-400" : "text-gray-400"}`} />
                    <span className="font-medium">Client</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("Startup")}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border border-white/20 backdrop-blur-sm transition-all ${
                      role === "Startup"
                        ? "bg-blue-600/20 border-blue-400/50"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Briefcase className={`h-6 w-6 mb-2 ${role === "Startup" ? "text-blue-400" : "text-gray-400"}`} />
                    <span className="font-medium">Startup</span>
                  </button>
                </div>

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
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Display Name Input */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1.5">
                    {role === "Startup" ? "Company Name" : "Display Name"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                      placeholder={role === "Startup" ? "Your Company Name" : "Your Name"}
                      required
                    />
                  </div>
                </div>

                {/* Two Column Layout for Phone and Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Telephone Field */}
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="telephone"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  {/* Country Field */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Country
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                        placeholder="Your Country"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Upload - Only show for Startup role */}
                {role === "Startup" && (
                  <div>
                    <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Company Logo
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                      <div className="space-y-1 text-center">
                        {logoPreview ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo preview"
                              className="h-32 w-32 object-contain mb-3"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogo(null)
                                setLogoPreview(null)
                                if (fileInputRef.current) fileInputRef.current.value = null
                              }}
                              className="text-sm text-red-400 hover:text-red-300 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-400">
                              <label
                                htmlFor="logo"
                                className="relative cursor-pointer bg-white/10 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="logo"
                                  name="logo"
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleFileChange}
                                  accept="image/*"
                                  disabled={loading}
                                  className="sr-only"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${
                    loading
                      ? 'bg-blue-700/60 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Sign in Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 mt-auto">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} VenturesRoom. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Utility Styles */}
      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.1) inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  )
}

export default Register
