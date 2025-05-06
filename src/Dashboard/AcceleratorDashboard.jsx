import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UserPlus,
  LogOut,
  ChevronDown,
  Menu,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { removeToken, getToken } from "../utils/auth";
import baseUrl from "../config/Baseurl";

function AcceleratorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    displayName: '',
    telephone: '',
    country: '',
    logo: null
  });
  const [createUserError, setCreateUserError] = useState(null);
  const [createUserSuccess, setCreateUserSuccess] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [myStartups, setMyStartups] = useState([]);
  const [loadingStartups, setLoadingStartups] = useState(true);
  const [startupError, setStartupError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyStartups = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${baseUrl}/api/Accelerator/my-startups`, {
          headers: {
            'Authorization': `Bearer ${token.trim()}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch startups');
        }

        const data = await response.json();
        setMyStartups(data);
      } catch (error) {
        console.error('Error fetching startups:', error);
        setStartupError(error.message);
      } finally {
        setLoadingStartups(false);
      }
    };

    fetchMyStartups();
  }, []);

  const fetchProductsCount = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${baseUrl}/api/Product/GetAllProductscount`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch products count');
      const count = await response.json();
      setTotalProducts(count);
    } catch (error) {
      console.error('Error fetching products count:', error);
    }
  };

  useEffect(() => {
    fetchProductsCount();
  }, []);

  const handleCreateStartup = async (e) => {
    e.preventDefault();
    setIsCreatingUser(true);
    setCreateUserError(null);
    setCreateUserSuccess(false);

    const formData = new FormData();
    Object.keys(createUserForm).forEach(key => {
      if (createUserForm[key] !== null) {
        formData.append(key.charAt(0).toUpperCase() + key.slice(1), createUserForm[key]);
      }
    });

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${baseUrl}/api/Accelerator/create-startup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.trim()}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create startup: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      
      setCreateUserSuccess(true);
      setCreateUserForm({
        email: '',
        password: '',
        displayName: '',
        telephone: '',
        country: '',
        logo: null
      });
    } catch (error) {
      console.error('Error creating startup:', error);
      setCreateUserError(error.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-64" : "w-20"} h-screen fixed bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
              {sidebarOpen ? "VenturesRoom" : "VR"}
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              {sidebarOpen ? <ChevronDown className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="p-4">
            <button className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg">
              <UserPlus className="h-5 w-5 mr-3" />
              {sidebarOpen && <span>Create Startup</span>}
            </button>
          </div>

          <div className="absolute bottom-0 w-full p-4">
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <LogOut className="h-5 w-5 mr-3" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} p-8`}>
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Card pour les Produits */}
              <div className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{totalProducts}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Startup</h2>
                  
                <form onSubmit={handleCreateStartup} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={createUserForm.email}
                        onChange={(e) => setCreateUserForm(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                      <input
                        type="password"
                        required
                        value={createUserForm.password}
                        onChange={(e) => setCreateUserForm(prev => ({...prev, password: e.target.value}))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                      <input
                        type="text"
                        required
                        value={createUserForm.displayName}
                        onChange={(e) => setCreateUserForm(prev => ({...prev, displayName: e.target.value}))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telephone</label>
                      <input
                        type="tel"
                        required
                        value={createUserForm.telephone}
                        onChange={(e) => setCreateUserForm(prev => ({...prev, telephone: e.target.value}))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                      <input
                        type="text"
                        required
                        value={createUserForm.country}
                        onChange={(e) => setCreateUserForm(prev => ({...prev, country: e.target.value}))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCreateUserForm(prev => ({...prev, logo: e.target.files[0]}))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {createUserError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>{createUserError}</span>
                    </div>
                  )}

                  {createUserSuccess && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Startup created successfully!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isCreatingUser ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        <span>Creating...</span>
                      </div>
                    ) : 'Create Startup'}
                  </button>
                </form>
              </div>
            </div>

            {/* Startups List Section */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">My Startups</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {myStartups.length} startup{myStartups.length !== 1 ? 's' : ''} in portfolio
                    </p>
                  </div>
                </div>

                {loadingStartups ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : startupError ? (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 mb-2" />
                    <p>{startupError}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myStartups.map(startup => (
                      <div 
                        key={startup.id}
                        className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-start gap-4">
                          {startup.logoPath ? (
                            <img 
                              src={`${baseUrl}${startup.logoPath}`}
                              alt={`${startup.displayName} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                {startup.displayName[0]}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 dark:text-white">{startup.displayName}</h4>
                              {startup.isApproved ? (
                                <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approved
                                </span>
                              ) : (
                                <span className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Pending
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{startup.email}</p>
                            {startup.lastActiveAt && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Last active: {new Date(startup.lastActiveAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcceleratorDashboard;
