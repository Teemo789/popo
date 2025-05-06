"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  Phone,
  Mail,
  ArrowUpDown,
  Download,
  Upload,
  Clock,
} from "lucide-react"
import { getToken, isAdmin } from "../utils/auth"
import baseUrl from "../config/Baseurl"

function StartupsList() {
  const [startups, setStartups] = useState([])
  const [filteredStartups, setFilteredStartups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" })
  const [filterConfig, setFilterConfig] = useState({
    status: "all", // "all", "approved", "pending"
    country: "all",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [countries, setCountries] = useState([])
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const navigate = useNavigate()

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/")
    }
  }, [navigate])

  // Fetch startups
  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true)
      try {
        const token = getToken()
        const response = await fetch(`${baseUrl}/api/Admin/all-startups`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch startups: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setStartups(data)
        setFilteredStartups(data)

        // Extract unique countries
        const uniqueCountries = [...new Set(data.map((startup) => startup.country))].filter(Boolean)
        setCountries(uniqueCountries)

        setError(null)
      } catch (err) {
        console.error("Error fetching startups:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStartups()
  }, [])

  // Apply filters and search
  useEffect(() => {
    let result = [...startups]

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (startup) =>
          startup.displayName?.toLowerCase().includes(term) ||
          startup.email?.toLowerCase().includes(term) ||
          startup.country?.toLowerCase().includes(term),
      )
    }

    // Apply status filter
    if (filterConfig.status !== "all") {
      const isApproved = filterConfig.status === "approved"
      result = result.filter((startup) => startup.isApproved === isApproved)
    }

    // Apply country filter
    if (filterConfig.country !== "all") {
      result = result.filter((startup) => startup.country === filterConfig.country)
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredStartups(result)
  }, [startups, searchTerm, filterConfig, sortConfig])

  // Handle sort
  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Handle approve/reject startup
  const handleApproveReject = async (id, approve) => {
    setProcessingId(id)
    try {
      const token = getToken()
      const endpoint = approve ? `${baseUrl}/api/Admin/approve/${id}` : `${baseUrl}/api/Admin/reject/${id}`
      const method = approve ? "PUT" : "DELETE"

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Operation failed: ${response.status}`)
      }

      // Update local state
      setStartups(startups.map((startup) => (startup.id === id ? { ...startup, isApproved: approve } : startup)))

      // Close modal if open
      setShowModal(false)
      setSelectedStartup(null)
    } catch (err) {
      console.error("Error:", err)
      alert(`Operation failed: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  // View startup details
  const viewStartupDetails = (startup) => {
    setSelectedStartup(startup)
    setShowModal(true)
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Telephone", "Country", "Role", "Status"]
    const csvData = filteredStartups.map((startup) => [
      startup.id,
      startup.displayName,
      startup.email,
      startup.telephone,
      startup.country,
      startup.role,
      startup.isApproved ? "Approved" : "Pending",
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "startups.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête amélioré */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Gestion des Startups
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Gérez et surveillez toutes les startups enregistrées sur la plateforme
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                Exporter CSV
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
                <Upload className="h-4 w-4 mr-2" />
                Importer des données
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres améliorés */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, email ou pays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2.5 ${
                showFilters 
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
              } border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200`}
            >
              <Filter className={`h-5 w-5 mr-2 ${showFilters ? 'text-purple-500' : 'text-gray-400'}`} />
              Filtres
              {showFilters ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </button>
          </div>

          {/* Panel de filtres amélioré */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50/80 dark:bg-gray-700/80 rounded-lg border border-gray-200 dark:border-gray-600 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Statut
                  </label>
                  <select
                    value={filterConfig.status}
                    onChange={(e) => setFilterConfig({ ...filterConfig, status: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="approved">Approuvé</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pays
                  </label>
                  <select
                    value={filterConfig.country}
                    onChange={(e) => setFilterConfig({ ...filterConfig, country: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">Tous les pays</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setFilterConfig({ status: "all", country: "all" });
                    setSearchTerm("");
                  }}
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Startups Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Liste des Startups</h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-orange-900/30 dark:text-orange-300">
              {filteredStartups.length} Startups
            </span>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 bg-red-50 dark:bg-red-900/20">
              <p>Erreur: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-700 dark:text-red-400 underline"
              >
                Réessayer
              </button>
            </div>
          ) : filteredStartups.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Aucune startup trouvée</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Aucune startup ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center">
                        ID
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
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
                      onClick={() => handleSort("country")}
                    >
                      <div className="flex items-center">
                        Pays
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("telephone")}
                    >
                      <div className="flex items-center">
                        Contact
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("isApproved")}
                    >
                      <div className="flex items-center">
                        Statut
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
                  {filteredStartups.map((startup) => (
                    <tr key={startup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {startup.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {startup.logoPath ? (
                              <img
                                src={`${baseUrl}${startup.logoPath}`}
                                alt={startup.displayName}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.src = `/placeholder.svg?height=40&width=40&text=${startup.displayName?.charAt(0) || "S"}`
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 flex items-center justify-center text-white font-bold">
                                {startup.displayName?.charAt(0) || "S"}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {startup.displayName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{startup.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Globe className="h-4 w-4 mr-1 text-teal-500" />
                          {startup.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-orange-500" />
                          {startup.telephone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {startup.isApproved ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Approuvé
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => viewStartupDetails(startup)}
                            className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                          >
                            <Eye className="h-5 w-5" />
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

      {/* Startup Details Modal */}
      {showModal && selectedStartup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Détails de la Startup</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedStartup(null)
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
                <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  {selectedStartup.logoPath ? (
                    <img
                      src={`${baseUrl}${selectedStartup.logoPath}`}
                      alt={selectedStartup.displayName}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `/placeholder.svg?height=96&width=96&text=${selectedStartup.displayName?.charAt(0) || "S"}`
                      }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-700 shadow-lg">
                      {selectedStartup.displayName?.charAt(0) || "S"}
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStartup.displayName}</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedStartup.isApproved ? (
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Startup approuvée
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-yellow-600 dark:text-yellow-400">
                        <Clock className="h-4 w-4 mr-1" />
                        En attente d'approbation
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Informations de contact</h5>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-gray-900 dark:text-white">{selectedStartup.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-gray-900 dark:text-white">{selectedStartup.telephone}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-gray-900 dark:text-white">{selectedStartup.country}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Détails du compte</h5>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 w-24">ID:</span>
                      <span className="text-gray-900 dark:text-white">{selectedStartup.id}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 w-24">Rôle:</span>
                      <span className="text-gray-900 dark:text-white">{selectedStartup.role}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 w-24">Statut:</span>
                      {selectedStartup.isApproved ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Approuvé
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          En attente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Actions</h5>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir le profil complet
                  </button>
                  {selectedStartup.isApproved && (
                    <button
                      onClick={() => handleApproveReject(selectedStartup.id, false)}
                      disabled={processingId === selectedStartup.id}
                      className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
                    >
                      {processingId === selectedStartup.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Suspendre
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StartupsList
