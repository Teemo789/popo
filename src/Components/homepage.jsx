// "use client"; // REMOVED - Not needed for standard React/Vite

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Rocket,
  Users,
  MessageCircle,
  Zap,
  ShoppingBag,
  Tag,
  Star,
  Globe,
  Award,
  Mail,
  Loader2,
  ChevronRight,
  AlertCircle,
  Eye,
} from "lucide-react"
import { Helmet } from "react-helmet"
import { motion, AnimatePresence } from "framer-motion"
import baseUrl from "../config/Baseurl" // Ensure this path is correct
import Footer from "../Components/Footer" // MODIFICATION: Import Footer

// --- Helper Functions ---
const getRandomColor = (name) => {
  if (!name) return "#3b82f6"
  const colors = ["#0ea5e9", "#38bdf8", "#0369a1", "#1d4ed8", "#2563eb", "#3b82f6", "#06b6d4"]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
const getInitials = (name) => {
  if (!name) return "?"
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  if (parts.length === 1 && parts[0].length > 0) return parts[0][0].toUpperCase()
  return "?"
}
const formatPrice = (price) => {
  if (price === undefined || price === null) {
    console.warn(`formatPrice received undefined/null value`);
    return "$ N/A";
  }
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    console.warn(`formatPrice received non-numeric value: ${price}`);
    return "$ N/A";
  }
  return new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD", 
    minimumFractionDigits: 0 
  }).format(numericPrice);
};
const getCategoryName = (categoryId) => {
  const categories = { e: "Electronics", s: "Software", c: "Consulting", f: "Fashion", h: "Health" }
  return categories[categoryId] || "Other"
}
const getProductIcon = (type) => {
  const iconClass = "h-6 w-6"
  if (type && typeof type === "string" && type.toLowerCase() === "service") return <Zap className={iconClass} />
  return <ShoppingBag className={iconClass} />
}

// --- Main Home Component ---
function Home() {
  // --- State Variables ---
  const [featuredStartups, setFeaturedStartups] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState({ startups: true, products: true })
  const [error, setError] = useState({ startups: null, products: null })
  const [testimonials] = useState([
    {
      id: 1,
      name: "Sophie Martin",
      role: "CEO, TechInnovate",
      image: "/logo1.jpg",
      content:
        "VenturesRoom a transformé notre façon de connecter avec les clients. Nous avons vu une augmentation de 40% des leads qualifiés en seulement deux mois.",
      rating: 5,
    },
    {
      id: 2,
      name: "Thomas Dubois",
      role: "Fondateur, EcoSolutions",
      image: "/logo2.jpeg",
      content:
        "La plateforme est intuitive et les outils de gestion des produits sont exactement ce dont nous avions besoin pour développer notre présence en ligne.",
      rating: 4,
    },
    {
      id: 3,
      name: "Camille Leroy",
      role: "Directrice Marketing, FutureTech",
      image: "/logo3.jpg",
      content:
        "Le support client est exceptionnel et l'équipe répond toujours rapidement à nos questions. Une expérience vraiment professionnelle.",
      rating: 5,
    },
  ])
  const [stats] = useState([
    { id: 1, value: "500+", label: "Startups", icon: <Rocket className="h-10 w-10" /> },
    { id: 2, value: "10k+", label: "Produits", icon: <ShoppingBag className="h-10 w-10" /> },
    { id: 3, value: "25k+", label: "Utilisateurs", icon: <Users className="h-10 w-10" /> },
    { id: 4, value: "30+", label: "Pays", icon: <Globe className="h-10 w-10" /> },
  ])
  const [email, setEmail] = useState("")
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const [currentSlide, setCurrentSlide] = useState(0)
  const [latestProducts, setLatestProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productError, setProductError] = useState(null)

  // --- Refs ---
  const sectionRefs = {
    hero: useRef(null),
    stats: useRef(null),
    startups: useRef(null),
    products: useRef(null),
    newsletter: useRef(null),
    testimonials: useRef(null),
    cta: useRef(null),
  }

  // --- Hero slides data ---
  const heroSlides = [
    {
      title: "Découvrez le Futur de l'Innovation",
      subtitle: "Connectez-vous avec des startups révolutionnaires et faites partie de la prochaine grande révolution.",
      image: "/1691982395-Photoroom.png",
      cta: "Explorer le Marché",
      link: "/dashboard/products",
    },
    {
      title: "Propulsez Votre Startup",
      subtitle: "Présentez vos produits et services à un public ciblé et engagé.",
      image: "/startup1.jpeg",
      cta: "Rejoindre Maintenant",
      link: "/register",
    },
    {
      title: "Investissez dans le Futur",
      subtitle: "Découvrez des opportunités d'investissement dans les technologies de demain.",
      image: "/startup2.jpg",
      cta: "Voir les Startups",
      link: "/startups",
    },
  ]

  // --- useEffect Hooks ---
  useEffect(() => {
    const interval = setInterval(() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length), 6000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 8000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "-50px" }
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
        }
      })
    }
    const observer = new IntersectionObserver(observerCallback, observerOptions)
    const refs = Object.values(sectionRefs)
    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.id = Object.keys(sectionRefs).find((key) => sectionRefs[key] === ref) + "-section"
        observer.observe(ref.current)
      }
    })
    return () => {
      refs.forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current)
      })
    }
  }, [])

  useEffect(() => {
    const fetchFeaturedStartups = async () => {
      setLoading((prev) => ({ ...prev, startups: true }))
      setError((prev) => ({ ...prev, startups: null }))
      try {
        const response = await fetch(`${baseUrl}/api/Admin/all-startups`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const approvedStartups = (Array.isArray(data) ? data : []).filter((s) => s.isApproved)
        setFeaturedStartups(approvedStartups.slice(0, 3))
      } catch (err) {
        console.error("Error fetching featured startups:", err)
        setError((prev) => ({ ...prev, startups: err.message || "Failed to fetch startups" }))
      } finally {
        setLoading((prev) => ({ ...prev, startups: false }))
      }
    }
    fetchFeaturedStartups()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading((prev) => ({ ...prev, products: true }))
      setError((prev) => ({ ...prev, products: null }))
      try {
        const response = await fetch(`${baseUrl}/api/Product`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const activeProducts = (Array.isArray(data) ? data : []).slice(0, 6)
        setProducts(activeProducts)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError((prev) => ({ ...prev, products: err.message || "Failed to fetch products" }))
      } finally {
        setLoading((prev) => ({ ...prev, products: false }))
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchLatestProducts = async () => {
      setLoadingProducts(true)
      setProductError(null)
      try {
        const response = await fetch(`${baseUrl}/api/Product`)
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`)
        }
        const data = await response.json()
        const latest = Array.isArray(data) ? data.slice(0, 3) : []
        setLatestProducts(latest)
      } catch (err) {
        console.error("Error fetching latest products:", err)
        setProductError(err.message)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchLatestProducts()
  }, [])

  // --- Animation Variants ---
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] } },
  }
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  }
  const scaleUp = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] } },
  }

  // --- Event Handlers ---
  const handleSubscribe = (e) => {
    e.preventDefault()
    console.log(`Subscribing email: ${email}`)
    alert(`Subscription request sent for: ${email}`)
    setEmail("")
  }

  // --- Component Return ---
  return (
    // MODIFICATION: This root div needs to grow if App.jsx gives it space,
    // and it manages the internal vertical layout.
    <div className="relative w-full font-sans bg-gray-950 flex flex-col flex-grow">
      <Helmet>
        <title>VenturesRoom – Future of Innovation</title>
        <meta
          name="description"
          content="Discover, connect, and grow with innovative startups and products worldwide on VenturesRoom."
        />
      </Helmet>
      {/* Background Image (Kept as requested) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp"
          alt="Abstract background"
          className="h-full w-full object-cover filter blur-xl scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80"></div>
      </div>
      {/* Content Container: Stacks above background, handles internal flex */}
      {/* MODIFICATION: Added flex-1 to make this container expand vertically */}
      <div className="relative z-10 flex flex-col text-white pt-16 sm:pt-20 flex-1">
        {/* --- Main Content Area --- */}
        {/* MODIFICATION: Removed flex-1 from main, it's on the parent now */}
        <main className="p-5 md:p-8 lg:p-10 pb-16 space-y-12 lg:space-y-16 w-full max-w-screen-xl mx-auto">
          {/* Hero Section */}
          <motion.section
            id="hero-section"
            ref={sectionRefs.hero}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-10 md:p-14 lg:p-16 relative overflow-hidden min-h-[450px] flex items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 w-full"
              >
                <div className="lg:w-3/5 text-center lg:text-left z-10">
                  <motion.h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white !leading-tight mb-6">
                    {heroSlides[currentSlide].title.split(" ").map((word, i, arr) =>
                      i === arr.length - 1 ? (
                        <span key={i} className="text-blue-300">
                          {" "}
                          {word}
                        </span>
                      ) : (
                        <span key={i}> {word}</span>
                      ),
                    )}
                  </motion.h1>
                  <motion.p className="text-xl lg:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto lg:mx-0">
                    {heroSlides[currentSlide].subtitle}
                  </motion.p>
                  <motion.div className="flex flex-wrap gap-5 justify-center lg:justify-start">
                    <Link
                      to={heroSlides[currentSlide].link}
                      className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg flex items-center text-base lg:text-lg transform hover:scale-105 active:scale-95"
                    >
                      {heroSlides[currentSlide].cta} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      to="/about"
                      className="px-8 py-4 bg-white/15 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/25 transition-all duration-300 border border-white/20 text-base lg:text-lg active:scale-95"
                    >
                      En Savoir Plus
                    </Link>
                  </motion.div>
                </div>
                <motion.div className="lg:w-2/5 hidden lg:block relative z-0">
                  {heroSlides[currentSlide].image && (
                    <img
                      src={heroSlides[currentSlide].image || "/placeholder.svg"}
                      alt={`${heroSlides[currentSlide].title} visual representation`}
                      className="rounded-2xl shadow-xl object-cover w-full max-w-lg mx-auto border-2 border-white/15"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute -inset-6 bg-blue-500/15 rounded-full blur-3xl opacity-60 -z-10"></div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2.5 z-20">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-400 ease-out ${currentSlide === index ? "bg-blue-400 w-7 scale-110" : "bg-white/50 hover:bg-white/70"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.section>

          {/* Stats Section */}
          <motion.section
            id="stats-section"
            ref={sectionRefs.stats}
            className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-10 md:p-12 lg:p-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <h2 className="text-4xl font-bold mb-10 lg:mb-12 text-center text-white">
              Notre Impact en <span className="text-blue-300">Chiffres</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  variants={scaleUp}
                  className="bg-white/10 rounded-2xl p-6 text-center border border-white/15 transition-all duration-300 hover:bg-white/20 hover:border-white/25 hover:scale-[1.03] shadow-md hover:shadow-lg"
                >
                  <div className="inline-flex items-center justify-center p-5 bg-blue-500/30 rounded-full text-blue-200 mb-5 shadow-inner">
                    {" "}
                    {stat.icon}{" "}
                  </div>
                  <CounterAnimation
                    target={Number.parseInt(stat.value)}
                    duration={2000}
                    delay={index * 150}
                    isVisible={isVisible["stats-section"]}
                    suffix={stat.value.includes("+") ? "+" : ""}
                    className="text-5xl font-bold block mb-2 text-blue-300"
                  />
                  <p className="text-lg text-gray-200 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Featured Startups Section */}
          <motion.section
            id="startups-section"
            ref={sectionRefs.startups}
            className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-10 md:p-12 lg:p-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <h2 className="text-4xl font-bold mb-10 lg:mb-12 text-white">
              Startups à la <span className="text-blue-300">Une</span>
            </h2>
            {loading.startups ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-10 w-10 text-blue-300 animate-spin" />
              </div>
            ) : error.startups ? (
              <p className="text-center text-red-400 py-8 bg-red-900/20 rounded-lg border border-red-500/30">
                {" "}
                Erreur: {error.startups}{" "}
              </p>
            ) : featuredStartups.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
              >
                {featuredStartups.map((startup) => (
                  <motion.div
                    key={startup.id}
                    variants={fadeIn}
                    whileHover={{ y: -8, scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="bg-gradient-to-br from-white/15 to-white/5 rounded-2xl overflow-hidden border border-white/20 shadow-lg transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative h-48 bg-gradient-to-r from-gray-800/70 to-gray-700/70 flex items-center justify-center overflow-hidden">
                      <StartupLogo startup={startup} baseUrl={baseUrl} />
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-blue-600/90 text-white text-xs font-semibold rounded-full shadow-md backdrop-blur-sm">
                        {" "}
                        {startup.country || "Unknown"}{" "}
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <Link to={`/startup/${startup.id}`} className="block hover:text-blue-300 transition-colors">
                          {" "}
                          <h3 className="text-2xl font-semibold text-white mb-2 truncate group-hover:text-blue-300 transition-colors">
                            {" "}
                            {startup.displayName || "Unnamed Startup"}{" "}
                          </h3>{" "}
                        </Link>
                        <p className="text-base text-gray-300 mb-5 line-clamp-3">
                          {" "}
                          {startup.description ||
                            `Innovative startup from ${startup.country || "N/A"}. Focused on delivering cutting-edge solutions.`}{" "}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20">
                        {startup.isApproved && (
                          <div className="flex items-center text-sm text-yellow-300 font-medium">
                            {" "}
                            <Award className="h-5 w-5 text-yellow-400 mr-1.5" /> Verified{" "}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-center text-gray-400 py-8 italic text-lg">Aucune startup à la une pour le moment.</p>
            )}
            <div className="mt-12 text-center">
              <Link
                to="/startups"
                className="inline-flex items-center px-8 py-3.5 bg-blue-500 text-white text-lg font-medium rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95"
              >
                Voir toutes les startups <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.section>

          {/* Products Section */}
          <motion.section
            id="products-section"
            ref={sectionRefs.products}
            className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-10 md:p-12 lg:p-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-bold text-white">
                Nos Derniers <span className="text-blue-300">Produits</span>
              </h2>
              <Link
                to="/dashboard/products"
                className="text-blue-400 hover:text-blue-300 flex items-center group"
              >
                Voir tout
                <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading.products ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-10 w-10 text-blue-300 animate-spin" />
              </div>
            ) : error.products ? (
              <p className="text-center text-red-400 py-8 bg-red-900/20 rounded-lg border border-red-500/30">
                {" "}
                Erreur: {error.products}{" "}
              </p>
            ) : products.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
              >
                {products.slice(0, 6).map((product) => (
                  <motion.div
                    key={product.id}
                    variants={fadeIn}
                    whileHover={{ y: -8, scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="bg-gradient-to-br from-white/15 to-white/5 rounded-2xl overflow-hidden border border-white/20 shadow-lg transition-all duration-300 group flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <ProductImage product={product} baseUrl={baseUrl} />
                      <div className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-lg text-blue-300 border border-white/15 text-xs shadow-md">
                        {" "}
                        <span title={product.type === "service" ? "Service" : "Product"}>
                          {getProductIcon(product.type)}
                        </span>{" "}
                      </div>
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-blue-600/90 text-white text-xs font-semibold rounded-full shadow-md backdrop-blur-sm capitalize">
                        {" "}
                        {product.type || "Produit"}{" "}
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2 gap-3">
                          <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors flex-1 min-w-0">
                            {" "}
                            <Link to={`/product/${product.id}`} className="hover:underline truncate block">
                              {" "}
                              {product.name || "Unnamed Product"}{" "}
                            </Link>{" "}
                          </h3>
                          <span className="text-lg font-bold text-blue-300 flex-shrink-0 pt-0.5 whitespace-nowrap">
                            {formatPrice(product.discountedPrice || product.price)}
                          </span>
                        </div>
                        <p className="text-base text-gray-300 mb-5 line-clamp-3">
                          {" "}
                          {product.description ||
                            "Discover this innovative product offering unique features and benefits."}{" "}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20 gap-2">
                        <span className="text-xs text-gray-400 flex items-center bg-white/10 px-2.5 py-1 rounded-full border border-white/15 whitespace-nowrap">
                          {" "}
                          <Tag className="inline-block mr-1.5 h-4 w-4 flex-shrink-0" />{" "}
                          <span className="truncate">{getCategoryName(product.categoryId)}</span>{" "}
                        </span>
                        <Link
                          to={`/product/${product.id}`}
                          className="inline-flex items-center text-sm px-4 py-2 bg-blue-500/25 text-blue-200 rounded-lg hover:bg-blue-500/40 transition-colors duration-200 font-medium flex-shrink-0"
                        >
                          {" "}
                          Details <ArrowRight className="ml-1.5 h-4 w-4" />{" "}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-center text-gray-400 py-8 italic text-lg">Aucun produit à afficher pour le moment.</p>
            )}
          </motion.section>

          {/* Newsletter Section */}
          <motion.section
            id="newsletter-section"
            ref={sectionRefs.newsletter}
            className="bg-gradient-to-r from-blue-800/60 to-purple-800/60 backdrop-blur-xl rounded-3xl border border-white/25 shadow-xl p-10 md:p-12 lg:p-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeIn}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              <div className="text-white text-center lg:text-left max-w-lg">
                <h2 className="text-4xl font-bold mb-3">Restez Connecté !</h2>
                <p className="text-lg text-blue-100"> Abonnez-vous pour les dernières innovations et opportunités. </p>
              </div>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto max-w-xl mx-auto lg:mx-0"
              >
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse e-mail"
                    required
                    aria-label="Email address for newsletter"
                    className="w-full pl-12 pr-4 py-4 border bg-white/95 focus:bg-white border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 text-base shadow-sm placeholder:text-gray-500 outline-none transition duration-200"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-white/25 backdrop-blur-md text-white px-7 py-4 rounded-xl text-base font-semibold hover:bg-white/35 transition-colors duration-200 shadow-md border border-white/20 flex-shrink-0 active:scale-95"
                >
                  {" "}
                  S'abonner{" "}
                </button>
              </form>
            </div>
          </motion.section>

          {/* Testimonials Section */}
          <motion.section
            id="testimonials-section"
            ref={sectionRefs.testimonials}
            className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-10 md:p-12 lg:p-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <h2 className="text-4xl font-bold mb-12 lg:mb-14 text-center text-white">
              Ce que disent nos <span className="text-blue-300">clients</span>
            </h2>
            <div className="relative max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  className="bg-gradient-to-br from-white/15 to-white/5 rounded-2xl p-8 md:p-10 border border-white/20 text-center min-h-[360px] flex flex-col items-center justify-center shadow-inner"
                >
                  {testimonials[activeTestimonial] && (
                    <>
                      <img
                        src={testimonials[activeTestimonial].image || "/default-avatar.png"}
                        alt={`Avatar de ${testimonials[activeTestimonial].name}`}
                        className="h-24 w-24 rounded-full object-cover mx-auto mb-6 border-4 border-blue-500/50 shadow-lg"
                        loading="lazy"
                      />
                      <div
                        className="flex justify-center mb-5"
                        aria-label={`Note: ${testimonials[activeTestimonial].rating} sur 5 étoiles`}
                      >
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${i < testimonials[activeTestimonial].rating ? "text-blue-400 fill-current" : "text-gray-500"}`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <blockquote className="text-xl lg:text-2xl text-gray-100 italic mb-6 max-w-xl">
                        {" "}
                        <p>"{testimonials[activeTestimonial].content}"</p>{" "}
                      </blockquote>
                      <div className="mt-auto">
                        {" "}
                        <h3 className="text-xl font-semibold text-white">{testimonials[activeTestimonial].name}</h3>{" "}
                        <p className="text-lg text-gray-300">{testimonials[activeTestimonial].role}</p>{" "}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center mt-10 space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-400 ease-out ${activeTestimonial === index ? "bg-blue-400 w-7 scale-110" : "bg-white/50 hover:bg-white/70"}`}
                    aria-label={`Voir le témoignage ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.section>

          {/* Call to Action Section */}
          <motion.section
            id="cta-section"
            ref={sectionRefs.cta}
            className="bg-gradient-to-r from-blue-700/70 to-purple-700/70 backdrop-blur-xl rounded-3xl border border-white/25 shadow-xl p-12 md:p-16 lg:p-20 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeIn}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white !leading-tight">
              Prêt à rejoindre la <span className="text-blue-200">révolution</span> ?
            </h2>
            <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto">
              Lancez votre projet, découvrez des innovations ou investissez dans le futur dès aujourd'hui sur
              VenturesRoom.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/register"
                className="px-9 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg text-lg transform hover:scale-105 active:scale-95"
              >
                {" "}
                Rejoindre Maintenant <ArrowRight className="ml-2 h-5 w-5 inline" />{" "}
              </Link>
              <Link
                to="/about"
                className="px-9 py-4 bg-white/20 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/30 transition-all duration-300 border border-white/20 text-lg active:scale-95"
              >
                {" "}
                En Savoir Plus{" "}
              </Link>
            </div>
          </motion.section>
        </main>{" "}
        {/* End Main Content Area */}
        {/* MODIFICATION: Footer rendered here */}
        <Footer className="mt-auto" />
      </div>{" "}
      {/* End Relative Content Container */}
    </div> // End Root Wrapper for Home component
  )
}

// --- Helper Components ---
function StartupLogo({ startup, baseUrl }) {
  const [imgError, setImgError] = useState(false)
  const logoUrl = startup.logoPath
    ? `${baseUrl}${startup.logoPath.startsWith("/") ? "" : "/"}${startup.logoPath}`
    : null
  useEffect(() => {
    setImgError(false)
  }, [startup.logoPath])
  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl || "/placeholder.svg"}
        alt={`${startup.displayName || "Startup"} logo`}
        className="max-h-full max-w-[75%] object-contain transition-transform duration-400 group-hover:scale-110"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    )
  } else {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {" "}
        <div
          className="h-24 w-24 rounded-full flex items-center justify-center text-white text-3xl font-bold ring-2 ring-white/15"
          style={{ backgroundColor: getRandomColor(startup.displayName) }}
          aria-label={`Initials for ${startup.displayName || "Startup"}`}
        >
          {" "}
          {getInitials(startup.displayName)}{" "}
        </div>{" "}
      </div>
    )
  }
}

function ProductImage({ product, baseUrl }) {
  const [imgError, setImgError] = useState(false)
  const imageUrl =
    product.images && Array.isArray(product.images) && product.images.length > 0
      ? `${baseUrl}${product.images[0].startsWith("/") ? "" : "/"}${product.images[0]}`
      : null
  useEffect(() => {
    setImgError(false)
  }, [product.images])
  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={`Image of ${product.name || "product"}`}
        className="w-full h-full object-cover transition-transform duration-400 ease-in-out group-hover:scale-110"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    )
  } else {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800/70 to-gray-700/70">
        {" "}
        <span className="text-gray-400 text-5xl opacity-50" aria-label="Product icon placeholder">
          {" "}
          {getProductIcon(product.type)}{" "}
        </span>{" "}
      </div>
    )
  }
}

function CounterAnimation({ target, duration = 1800, delay = 0, isVisible, suffix = "", className = "" }) {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)
  const targetNumber = Number.parseInt(target?.toString().replace(/\D/g, "") || "0")
  useEffect(() => {
    if (!isVisible || targetNumber <= 0) return
    let animationFrameId
    let startTime
    const startCount = 0
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      if (elapsed < delay) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }
      const timeAfterDelay = elapsed - delay
      const progress = Math.min(timeAfterDelay / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(startCount + easedProgress * (targetNumber - startCount))
      setCount(currentCount)
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setCount(targetNumber)
      }
    }
    setCount(startCount)
    animationFrameId = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isVisible, targetNumber, duration, delay])
  return (
    <span ref={countRef} className={className}>
      {" "}
      {count.toLocaleString()} {suffix}{" "}
    </span>
  )
}

export default Home
