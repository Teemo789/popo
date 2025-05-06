"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bell,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  UserPlus,
  MessageSquare,
  Eye,
  Edit,
  ChevronRight,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  Building,
  Building2,
  UserCheck,
  RefreshCcw,
  AlertCircle,
} from "lucide-react"
import { removeToken, isAdmin, getToken } from "../utils/auth"
import { isLoggedIn } from "../config/localstorage"
import baseUrl from "../config/Baseurl"
import StartupsList from "../Components/StartupList"

function Overview() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showUsersSidebar, setShowUsersSidebar] = useState(false)
  const [currentView, setCurrentView] = useState("overview") // "overview", "startups", "productsLog", or "settings"
  const navigate = useNavigate()

  // Data states
  const [counts, setCounts] = useState({
    totalClients: 0,
    totalStartups: 0,
    products: 0,
    revenue: 0,
    totalIncubators: 0,
  })
  const [pendingStartups, setPendingStartups] = useState([])
  const [loading, setLoading] = useState({
  })
  const [error, setError] = useState({
    counts: null,
    pendingStartups: null,
  })
  const [processingIds, setProcessingIds] = useState([])

  const [allStartups, setAllStartups] = useState([])
  const [loadingStartups, setLoadingStartups] = useState(true)
  const [errorStartups, setErrorStartups] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStartups, setFilteredStartups] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" })
  const [startupsStatus, setStartupsStatus] = useState([])
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [unreadMessages, setUnreadMessages] = useState([])
  const usersSidebarRef = useRef(null)
  const notificationsRef = useRef(null)
  const dropdownRef = useRef(null)

  // Modal states
  const [showStartupModal, setShowStartupModal] = useState(false)
  const modalRef = useRef(null)

  // New states
  const [productsLog, setProductsLog] = useState([])
  const [loadingProductsLog, setLoadingProductsLog] = useState(true)
  const [errorProductsLog, setErrorProductsLog] = useState(null)

  // Add new state for users
  const [users, setUsers] = useState({});

  // Add new state for product filtering
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Add new state for settings modal
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'Accelerateur/Incubateur'
  });
  const [createUserError, setCreateUserError] = useState(null);
  const [createUserSuccess, setCreateUserSuccess] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Check if user is logged in and is admin
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login")
    } else if (!isAdmin()) {
      // If logged in but not admin, redirect to homepage
      navigate("/")
    } else {
      // Fetch dashboard data
      fetchCounts()
      fetchPendingStartups()
      fetchAllStartups()
      fetchStartupsStatus()
      fetchUnreadMessages()
    }
  }, [navigate])

  // New function
  const fetchProductsLog = async () => {
    setLoadingProductsLog(true)
    try {
      const token = getToken()
      const response = await fetch(`${baseUrl}/api/Product/all-for-admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch products log: ${response.status}`)
      }
      const data = await response.json()
      setProductsLog(data)
      setErrorProductsLog(null)
    } catch (error) {
      console.error("Error fetching products log:", error)
      setErrorProductsLog(error.message)
    } finally {
      setLoadingProductsLog(false)
    }
  }

  // Add function to fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const token = getToken();
      const response = await fetch(`${baseUrl}/api/Users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(prev => ({...prev, [userId]: data.displayName || data.email || 'Unknown User'}));
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUsers(prev => ({...prev, [userId]: 'Unknown User'}));
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchProductsLog().then(() => {
        // Fetch user details for each unique user ID
        const userIds = [...new Set(productsLog.map(product => product.createdByUserId))];
        userIds.forEach(userId => {
          if (!users[userId]) {
            fetchUserDetails(userId);
          }
        });
      });
    }
  }, [navigate]);

  // Modify the useEffect for products to include filtering
  useEffect(() => {
    const filtered = productsLog.filter(product => {
      const searchLower = productSearchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.createdByName.toLowerCase().includes(searchLower) ||
        product.creatorEmail.toLowerCase().includes(searchLower)
      );
    });
    setFilteredProducts(filtered);
  }, [productsLog, productSearchTerm]);

  // Close modals when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        usersSidebarRef.current &&
        !usersSidebarRef.current.contains(event.target) &&
        !event.target.closest("[data-users-toggle]")
      ) {
        setShowUsersSidebar(false)
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        !event.target.closest("[data-notifications-toggle]")
      ) {
        setNotificationsOpen(false)
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest("[data-dropdown-toggle]")
      ) {
        setDropdownOpen(false)
      }

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowStartupModal(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fetch unread messages
  const fetchUnreadMessages = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${baseUrl}/api/Messages/unread`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadMessages(data)
      }
    } catch (error) {
      console.error("Error fetching unread messages:", error)
    }
  }

  // Fetch startups status
  const fetchStartupsStatus = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/Auth/startups/status`)
      if (response.ok) {
        const data = await response.json()
        setStartupsStatus(data)
      }
    } catch (error) {
      console.error("Error fetching startups status:", error)
    }
  }

  // Get startup status
  const getStartupStatus = (startupName) => {
    const startup = startupsStatus.find((s) => s.name === startupName)
    return startup ? startup.status : "Offline"
  }

  // Get unread message count for a startup
  const getUnreadMessageCount = (startupName) => {
    const startup = unreadMessages.find((s) => s.startupName === startupName)
    return startup ? startup.unreadMessages : 0
  }

  // Fetch dashboard counts
  const fetchCounts = async () => {
    setLoading((prev) => ({ ...prev, counts: true }))
    try {
      const token = getToken()
      
      // Fetch general stats
      const [statsResponse, productsResponse, incubateursResponse] = await Promise.all([
        fetch(`${baseUrl}/api/Admin/counts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${baseUrl}/api/Product`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${baseUrl}/api/Admin/GetIncubateurs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch counts: ${statsResponse.status}`)
      }

      const statsData = await statsResponse.json();
      const productsData = await productsResponse.json();
      const incubateursCount = await incubateursResponse.json();

      setCounts({
        totalClients: statsData.totalClients || 0,
        totalStartups: statsData.totalStartups || 0,
        products: Array.isArray(productsData) ? productsData.length : 0,
        totalIncubators: incubateursCount || 0,
      })
      
      setError((prev) => ({ ...prev, counts: null }))
    } catch (err) {
      console.error("Error fetching counts:", err)
      setError((prev) => ({ ...prev, counts: err.message }))
    } finally {
      setLoading((prev) => ({ ...prev, counts: false }))
    }
  }

  // Fetch pending startups
  const fetchPendingStartups = async () => {
    setLoading((prev) => ({ ...prev, pendingStartups: true }))
    try {
      const token = getToken()
      const response = await fetch(`${baseUrl}/api/Admin/pending-startups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch pending startups: ${response.status}`)
      }

      const data = await response.json()
      setPendingStartups(data || [])
      setError((prev) => ({ ...prev, pendingStartups: null }))
    } catch (err) {
      console.error("Error fetching pending startups:", err)
      setError((prev) => ({ ...prev, pendingStartups: err.message }))
    } finally {
      setLoading((prev) => ({ ...prev, pendingStartups: false }))
    }
  }

  // Fetch all startups
  const fetchAllStartups = async () => {
    setLoadingStartups(true)
    try {
      const token = getToken()
      const response = await fetch(`${baseUrl}/api/Admin/all-startups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch startups: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setAllStartups(data)
      setFilteredStartups(data)
      setErrorStartups(null)
    } catch (err) {
      console.error("Error fetching startups:", err)
      setErrorStartups(err.message)
    } finally {
      setLoadingStartups(false)
    }
  }

  // Handle approve startup
  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this startup?")) {
      return;
    }
    
    setProcessingIds((prev) => [...prev, id]);
    try {
      const token = getToken();
      const response = await fetch(`${baseUrl}/api/Admin/approve/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to approve startup: ${response.status}`);
      }

      const result = await response.json();
      
      // Show success message
      alert(result.message || "Startup approved successfully");

      // Refresh data
      fetchCounts();
      fetchPendingStartups();
      fetchAllStartups();
      fetchStartupsStatus();

      // Update selected startup if it was approved
      if (selectedStartup && selectedStartup.id === id) {
        setSelectedStartup({ ...selectedStartup, isApproved: true });
      }
    } catch (err) {
      console.error("Error approving startup:", err);
      alert(`Failed to approve startup: ${err.message}`);
    } finally {
      setProcessingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Handle reject startup
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this startup? This action cannot be undone.")) {
      return;
    }

    setProcessingIds((prev) => [...prev, id]);
    try {
      const token = getToken();
      const response = await fetch(`${baseUrl}/api/Admin/reject/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reject startup: ${response.status}`);
      }

      const result = await response.json();
      
      // Show success message
      alert(result.message || "Startup rejected successfully");

      // Refresh data
      fetchCounts();
      fetchPendingStartups();
      fetchAllStartups();

      // Close details modal if rejected startup was selected
      if (selectedStartup && selectedStartup.id === id) {
        setShowStartupModal(false);
        setSelectedStartup(null);
      }
    } catch (err) {
      console.error("Error rejecting startup:", err);
      alert(`Failed to reject startup: ${err.message}`);
    } finally {
      setProcessingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Handle mark messages as read
  const handleMarkAsRead = async (startupName) => {
    try {
      const token = getToken()
      const response = await fetch(`${baseUrl}/api/Messages/mark-as-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(startupName),
      })

      if (response.ok) {
        fetchUnreadMessages()
      }
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  // Handle sort
  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const handleLogout = () => {
    removeToken()
    window.dispatchEvent(new Event("authChange"))
    navigate("/login")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleUsersSidebar = () => {
    setShowUsersSidebar(!showUsersSidebar)
  }

  const viewStartupDetails = (startup) => {
    setSelectedStartup(startup)
    setShowStartupModal(true)
    setShowUsersSidebar(false)
  }

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreatingUser(true);
    setCreateUserError(null);
    setCreateUserSuccess(false);

    try {
      const token = getToken();
      const response = await fetch(`${baseUrl}/api/Admin/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createUserForm)
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status}`);
      }

      const data = await response.json();
      setCreateUserSuccess(true);
      setCreateUserForm({
        email: '',
        password: '',
        displayName: '',
        role: 'accelerateur/incubateur'
      });
    } catch (error) {
      setCreateUserError(error.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  // Get random color based on name
  const getRandomColor = (name) => {
    if (!name) return "#6366f1" // Default indigo color

    const colors = [
      "#f43f5e", // rose
      "#8b5cf6", // violet
      "#06b6d4", // cyan
      "#10b981", // emerald
      "#f59e0b", // amber
      "#6366f1", // indigo
      "#ec4899", // pink
      "#14b8a6", // teal
    ]

    // Simple hash function to get consistent color for the same name
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }

  // Apply search and sorting
  useEffect(() => {
    let result = [...allStartups]

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (startup) =>
          (startup.displayName && startup.displayName.toLowerCase().includes(term)) ||
          (startup.email && startup.email.toLowerCase().includes(term)) ||
          (startup.country && startup.country.toLowerCase().includes(term)),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key] || ""
      const bValue = b[sortConfig.key] || ""

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredStartups(result)
  }, [allStartups, searchTerm, sortConfig])

  // Calculate total unread messages
  const totalUnreadMessages = unreadMessages.reduce((total, startup) => total + startup.unreadMessages, 0)

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white/80 dark:bg-gray-800/80 backdrop-blur-md h-screen fixed transition-all duration-300 ease-in-out shadow-lg z-20 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent flex items-center">
              {sidebarOpen ? "VenturesRoom" : "VR"}
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <ChevronDown className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => setCurrentView("overview")}
              className={`flex items-center px-4 py-2 ${
                currentView === "overview"
                  ? "text-gray-900 dark:text-white bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-l-4 border-purple-500 dark:border-purple-400 rounded-md group"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              }`}
            >
              <LayoutDashboard className="h-5 w-5 mr-3 text-purple-500 dark:text-purple-400" />
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            {/* Users */}
            <button
              onClick={() => setCurrentView("startups")}
              className={`flex items-center px-4 py-2 ${
                currentView === "startups"
                  ? "text-gray-900 dark:text-white bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-l-4 border-purple-500 dark:border-purple-400 rounded-md group"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              }`}
            >
              <Users className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              {sidebarOpen && <span>Manage Startups</span>}
            </button>

            {/* Products Log */}
            <button
              onClick={() => setCurrentView("productsLog")}
              className={`flex items-center px-4 py-2 ${
                currentView === "productsLog"
                  ? "text-gray-900 dark:text-white bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-l-4 border-purple-500 dark:border-purple-400 rounded-md group"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
              }`}
            >
              <Package className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              {sidebarOpen && <span>Products Log</span>}
            </button>

            {/* Settings */}
            <button
              onClick={() => setCurrentView("settings")}
              className={`flex items-center px-4 py-2 ${
                currentView === "settings"
                  ? "text-gray-900 dark:text-white bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-l-4 border-purple-500 dark:border-purple-400 rounded-md group"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group w-full"
              }`}
            >
              <Settings className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              {sidebarOpen && <span>Settings</span>}
            </button>
          </div>
        </nav>

        {/* Logout button at bottom */}
        <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300 ease-in-out`}>
        {/* Top Navigation */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm z-10 sticky top-0">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <h1 className="ml-2 text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search..."
                  className="py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-700 border-0 rounded-md w-60 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  data-notifications-toggle
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <Bell className="h-5 w-5" />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    ref={notificationsRef}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {totalUnreadMessages} unread messages
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {unreadMessages.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No new notifications</p>
                        </div>
                      ) : (
                        unreadMessages.map((item) => (
                          <div
                            key={item.startupName}
                            className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div
                                  className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium"
                                  style={{ backgroundColor: getRandomColor(item.startupName) }}
                                >
                                  {getInitials(item.startupName)}
                                </div>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.startupName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.unreadMessages} unread messages
                                </p>
                              </div>
                              <Link
                                to={`/chat/${item.startupName}`}
                                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                onClick={() => handleMarkAsRead(item.startupName)}
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  data-dropdown-toggle
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                  {dropdownOpen ? (
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180 transition-transform" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4 transition-transform" />
                  )}
                </button>

                {dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {currentView === "overview" ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {loading.counts ? (
                  // Loading skeleton for stats cards
                  Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-md p-6 animate-pulse border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-2"></div>
                      </div>
                    ))
                ) : error.counts ? (
                  // Error state
                  <div className="col-span-4 bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border-l-4 border-red-500">
                    <p className="text-red-700 dark:text-red-400">Error loading dashboard data: {error.counts}</p>
                    <button onClick={fetchCounts} className="mt-2 text-sm text-red-700 dark:text-red-400 underline">
                      Try again
                    </button>
                  </div>
                ) : (
                  // Actual stats cards
                  <>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Clients</h3>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {formatNumber(counts.totalClients)}
                      </p>
                      <p className="text-green-500 text-sm font-medium mt-2 flex items-center">
                        <span>↑ 12%</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
                      </p>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Startups</h3>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                          <Building className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {formatNumber(counts.totalStartups)}
                      </p>
                      <p className="text-green-500 text-sm font-medium mt-2 flex items-center">
                        <span>↑ 8%</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
                      </p>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Products</h3>
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                          <Package className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {formatNumber(counts.products)}
                      </p>
                      <p className="text-green-500 text-sm font-medium mt-2 flex items-center">
                        <span>↑ 16%</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
                      </p>
                    </div>

                    {/* Remplacer la carte Revenue par Incubateurs */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Incubateurs</h3>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {formatNumber(counts.totalIncubators)}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-2">
                        Incubateurs enregistrés
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Pending Approvals */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pending Startup Approvals</h3>
                  {!loading.pendingStartups && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900/30 dark:text-yellow-300">
                      {pendingStartups.length} Pending
                    </span>
                  )}
                </div>
                <div className="p-6">
                  {loading.pendingStartups ? (
                    // Loading skeleton for table
                    <div className="animate-pulse">
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                      {Array(3)
                        .fill(0)
                        .map((_, index) => (
                          <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        ))}
                    </div>
                  ) : error.pendingStartups ? (
                    // Error state
                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border-l-4 border-red-500">
                      <p className="text-red-700 dark:text-red-400">
                        Error loading pending startups: {error.pendingStartups}
                      </p>
                      <button
                        onClick={fetchPendingStartups}
                        className="mt-2 text-sm text-red-700 dark:text-red-400 underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : pendingStartups.length === 0 ? (
                    // Empty state
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">All caught up!</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        There are no pending startups to approve at the moment.
                      </p>
                    </div>
                  ) : (
                    // Actual table with data
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort("displayName")}
                            >
                              <div className="flex items-center">
                                Startup
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort("email")}
                            >
                              <div className="flex items-center">
                                Contact
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort("country")}
                            >
                              <div className="flex items-center">
                                Country
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort("lastActiveAt")}
                            >
                              <div className="flex items-center">
                                Date
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {pendingStartups.map((startup) => (
                            <tr key={startup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {startup.logoPath ? (
                                      <img
                                        src={`${baseUrl}${startup.logoPath}`}
                                        alt={startup.displayName}
                                        className="h-10 w-10 rounded-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null
                                          e.target.src = `/placeholder.svg?height=40&width=40&text=${startup.displayName?.charAt(0) || "S"}`
                                        }}
                                      />
                                    ) : (
                                      <div
                                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                                        style={{ backgroundColor: getRandomColor(startup.displayName) }}
                                      >
                                        {getInitials(startup.displayName)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {startup.displayName || `Startup #${startup.id}`}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {startup.email || `startup${startup.id}@example.com`}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {startup.contactName || startup.displayName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {startup.telephone || "No phone provided"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {startup.country || "Not specified"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(startup.lastActiveAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  {/* View Button */}
                                  <button
                                    onClick={() => viewStartupDetails(startup)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    title="View Details"
                                  >
                                    <Eye className="h-5 w-5" />
                                  </button>

                                  {/* Approve Button */}
                                  <button
                                    onClick={() => handleApprove(startup.id)}
                                    disabled={processingIds.includes(startup.id)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Approve Startup"
                                  >
                                    {processingIds.includes(startup.id) ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-5 w-5" />
                                    )}
                                  </button>

                                  {/* Reject Button */}
                                  <button
                                    onClick={() => handleReject(startup.id)}
                                    disabled={processingIds.includes(startup.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Reject Startup"
                                  >
                                    {processingIds.includes(startup.id) ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      <XCircle className="h-5 w-5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats Section */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Online Startups */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Online Startups</h3>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {startupsStatus
                      .filter((s) => s.status.includes("En ligne"))
                      .slice(0, 5)
                      .map((startup) => (
                        <div key={startup.name} className="flex items-center">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium mr-3"
                            style={{ backgroundColor: getRandomColor(startup.name) }}
                          >
                            {getInitials(startup.name)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{startup.name}</p>
                            <p className="text-xs text-green-500">{startup.status}</p>
                          </div>
                          <Link
                            to={`/chat/${startup.name}`}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            Message
                          </Link>
                        </div>
                      ))}
                    {startupsStatus.filter((s) => s.status.includes("En ligne")).length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">No startups online</p>
                    )}
                  </div>
                </div>

                {/* Recent Approvals */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Approvals</h3>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {allStartups
                      .filter((s) => s.isApproved)
                      .slice(0, 5)
                      .map((startup) => (
                        <div key={startup.id} className="flex items-center">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium mr-3"
                            style={{ backgroundColor: getRandomColor(startup.displayName) }}
                          >
                            {getInitials(startup.displayName)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{startup.displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(startup.lastActiveAt)}</p>
                          </div>
                          <button
                            onClick={() => viewStartupDetails(startup)}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    {allStartups.filter((s) => s.isApproved).length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent approvals</p>
                    )}
                  </div>
                </div>

                {/* Unread Messages */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Unread Messages</h3>
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {unreadMessages.slice(0, 5).map((item) => (
                      <div key={item.startupName} className="flex items-center">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium mr-3"
                          style={{ backgroundColor: getRandomColor(item.startupName) }}
                        >
                          {getInitials(item.startupName)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.startupName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.unreadMessages} unread messages</p>
                        </div>
                        <Link
                          to={`/chat/${item.startupName}`}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          Read
                        </Link>
                      </div>
                    ))}
                    {unreadMessages.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">No unread messages</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : currentView === "productsLog" ? (
            <div className="space-y-6">
              {/* Header Section with Search and Filters */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                      Products Gallery
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Browse and monitor all products from startups
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="search"
                        placeholder="Search products or creators..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full md:w-80 rounded-full border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loadingProductsLog ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md">
                      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
                      <div className="p-6 space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : errorProductsLog ? (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                  <Package className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Products</h3>
                  <p className="text-red-500 dark:text-red-400 mb-4">{errorProductsLog}</p>
                  <button
                    onClick={() => fetchProductsLog()}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* Product Image Section */}
                        <div className="relative h-64 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={`${baseUrl}${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-product.svg";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                              <Package className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          {/* Type Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100/90 text-purple-700 dark:bg-purple-900/90 dark:text-purple-400 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
                              {product.type}
                            </span>
                          </div>
                          {/* Price Badge */}
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 text-sm font-bold rounded-full bg-green-100/90 text-green-700 dark:bg-green-900/90 dark:text-green-400 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50">
                              ${product.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Product Info Section */}
                        <div className="p-6">
                          <div className="mb-4">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 line-clamp-2 text-sm">
                              {product.description}
                            </p>
                          </div>
                          {/* Category and Creator Info */}
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {product.categoryId === 'e' ? '💻 Electronics' :
                                product.categoryId === 's' ? '🔧 Software' :
                                product.categoryId === 'c' ? '👥 Consulting' :
                                product.categoryId === 'f' ? '👔 Fashion' :
                                product.categoryId === 'h' ? '🏥 Health' : '📦 Other'}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                  {product.createdByName.charAt(0)}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                    {product.createdByName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {product.creatorEmail}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Products Found</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {productSearchTerm ? "Try adjusting your search terms" : "No products have been added yet"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : currentView === "startups" ? (
            <StartupsList />
          ) : currentView === "settings" ? (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                {/* En-tête compact */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <UserPlus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Account Management
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create new accelerator or incubator accounts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulaire compact */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={createUserForm.email}
                          onChange={(e) => setCreateUserForm(prev => ({...prev, email: e.target.value}))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter professional email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={createUserForm.password}
                          onChange={(e) => setCreateUserForm(prev => ({...prev, password: e.target.value}))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Create a strong password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        required
                        value={createUserForm.displayName}
                        onChange={(e) => setCreateUserForm(prev => ({...prev, displayName: e.target.value}))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="Enter organization name"
                      />
                    </div>

                    {createUserError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p>{createUserError}</p>
                      </div>
                    )}

                    {createUserSuccess && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        <p>Account created successfully!</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isCreatingUser}
                      className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 transition-colors duration-200"
                    >
                      {isCreatingUser ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : 'Create New Account'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default Overview
