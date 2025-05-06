"use client" // This directive might be Next.js specific, keep if needed for that environment

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { User, LogOut, Settings, Bell, ChevronDown, Loader2, ShoppingBag } from "lucide-react"
import { isAuthenticated, getUserRole, logout } from "../utils/auth" // Ensure path is correct
import baseUrl from "../config/Baseurl" // Ensure path is correct
import { getToken } from "../config/localstorage" // Ensure path is correct
import { useCart } from "../hooks/useCart"
import Cart from './Cart'

// Helper: Get Initials (Identical to original)
const getInitials = (name) => {
  if (!name) return "?"
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  } else if (parts.length === 1 && parts[0].length > 0) {
    return parts[0][0].toUpperCase()
  }
  return "?"
}

// Helper: Get Random Color (Identical to original)
const getRandomColor = (name) => {
  if (!name) return "#2563eb" // Default blue to match theme
  const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#0284c7", "#0ea5e9", "#38bdf8", "#0369a1"]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

const Navbar = ({ onCartClick }) => {
  const [isOpen, setIsOpen] = useState(false) // We can remove this later if test works
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const { cartCount, updateCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  // --- Notification State ---
  const [unreadSummary, setUnreadSummary] = useState([])
  const [startupDetails, setStartupDetails] = useState({})
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationRef = useRef(null)

  // Set isLoaded to true after component mounts
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const isStartup = userRole === "startup"

  // Check Auth Status
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated()
      const role = getUserRole()
      const wasLoggedIn = isLoggedIn
      const wasStartup = isStartup // Use the derived state here

      setIsLoggedIn(authStatus)
      setUserRole(role)

      // Reset notifications if user logs out or is no longer a startup
      if (!authStatus || role !== "startup") {
        if (wasLoggedIn || wasStartup) {
          // Check if previous state was relevant
          setUnreadSummary([])
          setStartupDetails({}) // Clear details too
          setIsNotificationOpen(false)
        }
      }
    }
    checkAuth()
    window.addEventListener("authChange", checkAuth)
    return () => window.removeEventListener("authChange", checkAuth)
  }, [isLoggedIn, isStartup]) // Updated dependency to use derived state

  // Fetch Startup Details (for avatars in notifications)
  useEffect(() => {
    const fetchStartupDetails = async () => {
      // Only run if logged in as a startup and details map is empty
      if (!isLoggedIn || !isStartup || Object.keys(startupDetails).length > 0) return

      setLoadingNotifications(true) // Show loading state while fetching details for avatars
      try {
        const token = getToken()
        if (!token) return
        const response = await fetch(`${baseUrl}/api/Messages/conversable-startups`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        })
        if (response.ok) {
          const data = await response.json()
          const detailsMap = (Array.isArray(data) ? data : []).reduce((acc, startup) => {
            if (startup.displayName) {
              acc[startup.displayName] = { logoPath: startup.logoPath, id: startup.id }
            }
            return acc
          }, {})
          setStartupDetails(detailsMap)
        } else {
          // Avoid console logging 401/403 repeatedly if token expires during session
          if (response.status !== 401 && response.status !== 403) {
            console.error("Failed to fetch startup details:", response.status)
          }
        }
      } catch (error) {
        console.error("Error fetching startup details:", error)
      } finally {
        setLoadingNotifications(false) // Hide loading state
      }
    }
    // Trigger fetch only when necessary conditions are met
    if (isLoggedIn && isStartup && Object.keys(startupDetails).length === 0) {
      fetchStartupDetails()
    }
    // No dependency array needed here as it's triggered conditionally inside
    // Or keep dependencies: [isLoggedIn, isStartup, baseUrl] if preferred, but check condition inside
  }, [isLoggedIn, isStartup, baseUrl, startupDetails]) // Added startupDetails to dependencies to re-check if it's empty

  // Fetch Unread Message Summary Periodically & Listen for Updates
  useEffect(() => {
    if (!isLoggedIn || !isStartup) {
      setUnreadSummary([]) // Clear summary if not applicable
      return
    }

    let intervalId = null
    let isFetching = false // Prevent concurrent fetches

    const fetchUnread = async () => {
      if (isFetching) return // Skip if already fetching
      isFetching = true
      try {
        const token = getToken()
        if (!token) {
          isFetching = false
          return // Stop if no token
        }

        const response = await fetch(`${baseUrl}/api/Messages/my-unread-summary`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        })

        if (response.ok) {
          const summaryData = await response.json()
          // Filter out items with 0 count directly
          setUnreadSummary(Array.isArray(summaryData) ? summaryData.filter((s) => s.unreadCount > 0) : [])
        } else if (response.status !== 401 && response.status !== 403) {
          // Don't log auth errors repeatedly
          console.error("Failed fetch unread summary:", response.status)
          setUnreadSummary([]) // Clear summary on error other than auth
        } else {
          // Handle auth error, maybe clear summary or trigger logout?
          setUnreadSummary([])
        }
      } catch (error) {
        console.error("Error checking unread messages:", error)
        setUnreadSummary([]) // Clear summary on fetch error
      } finally {
        isFetching = false // Allow next fetch
      }
    }

    fetchUnread() // Initial fetch on component mount or when user becomes startup

    intervalId = setInterval(fetchUnread, 20000) // Check every 20 seconds

    // Listen for custom event from ChatModal when messages are marked read
    const handleMarkedRead = () => {
      console.log("Navbar: Detected unreadCountChanged event, fetching summary.")
      fetchUnread() // Re-fetch immediately
    }
    window.addEventListener("unreadCountChanged", handleMarkedRead)

    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId) // Clear interval
      window.removeEventListener("unreadCountChanged", handleMarkedRead) // Remove listener
    }
  }, [isLoggedIn, isStartup, baseUrl]) // Dependencies: Re-run if login status or role changes

  // Click Outside Handler for Menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile menu
      const profileMenuTrigger = document.getElementById("profile-menu-button")
      if (
        isProfileMenuOpen &&
        profileMenuTrigger &&
        !profileMenuTrigger.contains(event.target) &&
        !event.target.closest(".profile-menu-dropdown") // Check class of the dropdown itself
      ) {
        setIsProfileMenuOpen(false)
      }
      // Close notification dropdown (Check both desktop and mobile IDs)
      const notificationBellDesktop = document.getElementById("notification-bell-button")
      const isClickInsideBell =
        notificationBellDesktop && notificationBellDesktop.contains(event.target)
      const isClickInsideDropdown = notificationRef.current && notificationRef.current.contains(event.target)

      if (isNotificationOpen && !isClickInsideBell && !isClickInsideDropdown) {
        setIsNotificationOpen(false)
      }
    }
    // Use mousedown to catch click before it triggers other actions
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isProfileMenuOpen, isNotificationOpen]) // Dependencies remain the same

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false)
    setIsProfileMenuOpen(false)
    setIsSearchOpen(false)
    setIsNotificationOpen(false)
  }, [location])

  useEffect(() => {
    // Mettre à jour le panier lors du montage du composant
    updateCart();
  }, [updateCart]);

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen)
  const toggleNotificationMenu = () => setIsNotificationOpen(!isNotificationOpen)

  const handleCartClick = () => {
    updateCart(); // Rafraîchir le panier avant de l'afficher
    setShowCart(true);
  };

  // Calculate total unread count
  const totalUnreadCount = unreadSummary.reduce((sum, item) => sum + (item.unreadCount || 0), 0)

  const isActiveLink = (path) =>
    location.pathname === path || (path === "/manage-products" && location.pathname.startsWith("/manage-products/")) // Highlight manage-products even with params

  // Handler for clicking a notification item - Updated
  const handleNotificationClickItem = (senderName) => {
    if (!senderName) return
    setIsNotificationOpen(false)
    // Navigate directly to chat with partner
    navigate(`/chat/${senderName}`)
  }

  // Handler for "View all messages" link - Updated
  const handleViewAllMessagesLink = () => {
    setIsNotificationOpen(false)
    // Navigate directly to chat
    navigate('/chat')
  }

  // Get Startup Avatar Helper (Improved Fallback and URL Cleaning)
  const getStartupAvatar = (senderName) => {
    const details = startupDetails[senderName]
    // Check if details exist and logoPath is a non-empty string
    if (details?.logoPath && baseUrl && typeof details.logoPath === "string" && details.logoPath.trim() !== "") {
      try {
        // Combine base URL and logo path carefully
        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
        // Ensure logo path starts with a slash if it's relative, otherwise assume full URL or handle appropriately
        const cleanLogoPath = details.logoPath.startsWith("http")
          ? details.logoPath
          : details.logoPath.startsWith("/")
            ? details.logoPath
            : `/${details.logoPath}`
        const fullUrl = details.logoPath.startsWith("http") ? cleanLogoPath : `${cleanBaseUrl}${cleanLogoPath}`

        // Basic check for common image extensions - adjust if needed
        if (fullUrl.match(/\.(jpeg|jpg|gif|png|svg)(\?.*)?$/i)) {
          return fullUrl
        } else {
          console.warn("Navbar: Logo path does not seem to be a standard image URL:", fullUrl)
          // Fallback if format seems wrong
        }
      } catch (e) {
        console.error("Navbar: Error constructing avatar URL", e)
        // Fallback on error
      }
    }
    // Fallback to UI Avatars if no logoPath, details missing, or URL construction failed
    const nameParam = encodeURIComponent(senderName || "?")
    const color = getRandomColor(senderName).replace("#", "")
    return `https://ui-avatars.com/api/?name=${nameParam}&background=${color}&color=fff&size=96&fontSize=0.4&bold=true`
  }

  // Fallback for avatar errors during rendering
  const handleAvatarError = (e, name) => {
    e.target.onerror = null // Prevent infinite loops
    const nameParam = encodeURIComponent(name || "?")
    const color = getRandomColor(name).replace("#", "")
    e.target.src = `https://ui-avatars.com/api/?name=${nameParam}&background=${color}&color=fff&size=96&fontSize=0.4&bold=true`
  }

  const showStartupFeatures = () => {
    const role = getUserRole()?.toLowerCase();
    return role === "startup" || role === "accelerateur/incubateur" || role === "admin";
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-gray-950/70 backdrop-blur-lg shadow-lg border-b border-white/10" : "bg-transparent"
        } ${isLoaded ? "opacity-100" : "opacity-0"} font-sans`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Main Links */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center flex-shrink-0 mr-4 group">
                <span className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                  VENTURES
                  <span className="text-blue-400 group-hover:text-white transition-colors duration-300">ROOM</span>
                </span>
              </Link>
              {/* Desktop Navigation Links - Now always visible */}
              <div className="ml-6 flex space-x-5">
                {[
                  { path: "/", label: "ACCUEIL", roles: ["any"] },
                  { path: "/dashboard/products", label: "PRODUITS", roles: ["any"] },
                  { path: "/my-market", label: "MON MARCHÉ", roles: ["startup"] },
                  { path: "/manage-products", label: "GÉRER PRODUITS", roles: ["startup"] },
                  { path: "/community", label: "COMMUNITY", roles: ["startup"] },
                  { path: "/chat", label: "CHAT", roles: ["startup", "admin"] },
                  { path: "/dashboard/overview", label: "DASHBOARD", roles: ["admin"] },
                ].map((link) => {
                  const showLink = link.roles.includes("any") || (isLoggedIn && link.roles.includes(userRole))
                  if (!showLink) return null
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`${
                        isActiveLink(link.path)
                          ? "text-blue-300 border-blue-400"
                          : "text-gray-300 border-transparent hover:text-white hover:border-blue-400/50"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ease-in-out h-16`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Side Icons & Actions - Now always visible */}
            <div className="ml-6 flex items-center space-x-4">
              {/* Notification Bell (Only for Startups) */}
              {isLoggedIn && isStartup && (
                <div className="relative">
                  <button
                    id="notification-bell-button" // Keep ID for click outside detection
                    onClick={toggleNotificationMenu}
                    className="relative p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 rounded-full transition-colors duration-200"
                    aria-label={`View notifications (${totalUnreadCount} unread)`}
                    aria-haspopup="true"
                    aria-expanded={isNotificationOpen}
                  >
                    <Bell className="h-5 w-5" />
                    {totalUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white ring-1 ring-gray-900/50 animate-pulse">
                        {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div
                      ref={notificationRef}
                      // Darker theme, higher z-index to ensure it's above modal if needed
                      className="absolute right-0 mt-3 w-80 origin-top-right bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl ring-1 ring-black/20 focus:outline-none border border-white/15 overflow-hidden"
                      style={{ zIndex: 60 }} // Make sure it's above navbar (z-50) but potentially below modal (z-100)
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="notification-bell-button"
                    >
                      <div className="px-4 py-2 border-b border-white/15 bg-gradient-to-r from-blue-700/20 to-cyan-600/10">
                        <p className="text-sm font-semibold text-gray-100">Notifications</p>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-white/10 custom-scrollbar">
                        {" "}
                        {/* Add scrollbar styling if needed */}
                        {loadingNotifications && Object.keys(startupDetails).length === 0 ? ( // Show loader only when fetching initial details
                          <div className="flex justify-center items-center py-6">
                            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                          </div>
                        ) : unreadSummary.length === 0 ? (
                          <div className="px-4 py-6 text-sm text-center text-gray-400 flex flex-col items-center">
                            <Bell className="h-8 w-8 text-gray-500 mb-2" />
                            <p>No new messages</p>
                          </div>
                        ) : (
                          unreadSummary.map((item) => (
                            <button
                              type="button"
                              key={item.senderName}
                              onClick={() => handleNotificationClickItem(item.senderName)}
                              className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center space-x-3 transition-colors duration-150 cursor-pointer focus:outline-none focus:bg-white/10"
                              role="menuitem"
                            >
                              <img
                                src={getStartupAvatar(item.senderName) || "/placeholder.svg"}
                                alt={`${item.senderName} logo`}
                                className="h-9 w-9 rounded-full object-cover flex-shrink-0 shadow-sm border border-white/15 bg-gray-700"
                                loading="lazy"
                                onError={(e) => handleAvatarError(e, item.senderName)} // Use error handler
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-100 truncate">{item.senderName}</p>
                                <p className="text-xs text-gray-400">
                                  {item.unreadCount} new message{item.unreadCount > 1 ? "s" : ""}
                                </p>
                              </div>
                              <span className="inline-flex items-center justify-center px-2 py-0.5 ml-2 text-[10px] font-bold leading-none text-white bg-blue-500 rounded-full shadow-md flex-shrink-0">
                                {item.unreadCount}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                      {/* Show "View all" only if there are unread messages */}
                      {unreadSummary.length > 0 && (
                        <div className="px-4 py-2 border-t border-white/15 bg-black/20">
                          <button
                            type="button"
                            onClick={handleViewAllMessagesLink}
                            className="block w-full text-center text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-400 rounded py-1"
                            role="menuitem"
                          >
                            View all messages
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Cart Button */}
              <button 
                onClick={handleCartClick}
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Shopping Cart"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile/Login */}
              {isLoggedIn ? (
                <div className="relative profile-menu-container">
                  <button
                    id="profile-menu-button" // Keep ID for click outside
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 p-1 rounded-full text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                    aria-label="Open user menu"
                    aria-haspopup="true"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                      <User className="h-4 w-4" />
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </button>
                  {isProfileMenuOpen && (
                    <div
                      className="profile-menu-dropdown absolute right-0 mt-3 w-48 origin-top-right bg-gray-800/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/20 focus:outline-none border border-white/15 py-1 z-50" // Ensure z-index
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="profile-menu-button"
                    >
                      <div className="px-3 py-2 border-b border-white/10">
                        <p className="text-xs font-medium text-gray-400">Signed in as</p>
                        <p className="text-sm text-gray-100 truncate">
                          {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-blue-300 transition-colors duration-150 focus:outline-none focus:bg-white/10"
                        role="menuitem"
                      >
                        <User className="h-4 w-4 mr-2 opacity-60" />
                        Your Profile
                      </Link>
                      <Link
                        to="/update-profile"
                        className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-white/5 hover:text-blue-300 transition-colors duration-150 focus:outline-none focus:bg-white/10"
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4 mr-2 opacity-60" />
                        Settings
                      </Link>
                      <div className="border-t border-white/10 my-1 mx-2"></div> {/* Separator */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors duration-150 focus:outline-none focus:bg-white/10 rounded-b-md" // Ensure focus style applies
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 mr-2 opacity-60" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 border border-white/25 rounded-md text-sm font-medium text-gray-200 hover:bg-white/10 hover:border-white/40 hover:text-white transition-all duration-200"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Modal */}
      {showCart && <Cart isOpen={showCart} onClose={() => setShowCart(false)} />}
    </>
  )
}

export default Navbar
