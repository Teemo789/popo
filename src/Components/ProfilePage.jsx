// src/Components/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, User, Mail, Phone, MapPin, ShieldCheck, Building, Clock } from 'lucide-react';
import baseUrl from '../config/Baseurl'; // Adjust path if needed
import { getToken } from '../config/localstorage'; // Adjust path if needed
import { useNavigate } from 'react-router-dom'; // To potentially redirect on auth error

// Helper to format date (optional, but nice)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString(); // Adjust format as needed
    } catch (e) {
        return 'Invalid Date';
    }
};

// Helper to construct full logo URL safely
const getLogoUrl = (logoPath) => {
    if (!logoPath || typeof logoPath !== 'string' || !baseUrl) return null;

    // If logoPath is already a full URL, use it directly
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        return logoPath;
    }

    // Construct URL, handling potential double slashes
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanLogoPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;

    return `${cleanBaseUrl}${cleanLogoPath}`;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            const token = getToken();

            if (!token) {
                setError("Authentication token not found. Redirecting to login...");
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000); // Redirect after a short delay
                return;
            }

            try {
                const response = await fetch(`${baseUrl}/api/Auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token.trim()}`,
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
                    if (response.status === 401 || response.status === 403) {
                        setError("Session expired or invalid. Please log in again.");
                        setTimeout(() => navigate('/login'), 2500);
                    } else {
                        setError(errorData.message || `Failed to fetch profile. Status: ${response.status}`);
                    }
                    setProfile(null);
                } else {
                    const data = await response.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Fetch profile error:", err);
                setError("An network error occurred while fetching your profile. Please check your connection and try again.");
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [baseUrl, navigate]); // Add navigate to dependency array

    // Fallback for logo image error
    const handleLogoError = (e) => {
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlLW9mZiI+PHBhdGggZD0ibTE0LjUgIDIuMDYgNSA1Ii8+PHBhdGggZD0iTTIxIDE2djRhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ2LTNhMiAyIDAgMCAwLTIgMlYxOWEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJ2LTQiLz48bGluZSB4MT0iMiIgeDI9IjIyIiB5MT0iMiIgeTI9IjIyIi8+PHBhdGggZD0iTTE1IDE4IDIxIDEyIi8+PHBhdGggZD0iTTkgMTJhMyAzIDAgMTExLjUgMi45Nk0yLjUgMjAuMDZBMTUgMTUgMCAwIDEgMjAuMDYgMi41Ii8+PC9zdmc+'; // Simple SVG placeholder
        e.target.style.objectFit = 'contain'; // Ensure placeholder looks okay
        e.target.parentElement.style.backgroundColor = '#e5e7eb'; // bg-gray-200
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-150px)] text-gray-600 dark:text-gray-400">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <span className="ml-4 text-lg">Loading Profile...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)] text-red-600 dark:text-red-400 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md max-w-md mx-auto mt-10">
                <AlertCircle className="h-12 w-12 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-center">Error Loading Profile</h2>
                <p className="text-center">{error}</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)] text-gray-600 dark:text-gray-400 p-6">
                <AlertCircle className="h-12 w-12 mb-4 text-yellow-500" />
                <p>Could not load profile data.</p>
            </div>
        );
    }

    const logoUrl = getLogoUrl(profile.logoPath);

    return (
        <div className="relative w-full min-h-screen font-sans bg-gray-950 flex flex-col">
            {/* Background gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp" 
                     alt="Abstract background" 
                     className="h-full w-full object-cover filter blur-xl scale-110" 
                     loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col text-white pt-16 sm:pt-20 flex-grow">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 pb-3">
                        Your Profile
                    </h1>
                    <p className="text-xl text-gray-300 mt-4">
                        View and manage your account information
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl overflow-hidden"
                    >
                        <div className="md:flex">
                            {/* Left Side: Avatar/Logo */}
                            <div className="md:w-1/3 p-6 md:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 dark:from-gray-700 to-indigo-100 dark:to-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-600">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt={`${profile.displayName}'s Logo`}
                                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-lg bg-gray-200 dark:bg-gray-500"
                                        onError={handleLogoError}
                                    />
                                ) : (
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white text-5xl md:text-6xl font-bold border-4 border-white dark:border-gray-600 shadow-lg">
                                        {profile.displayName?.charAt(0).toUpperCase() || <User size={48} />}
                                    </div>
                                )}
                                <h2 className="mt-4 text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">{profile.displayName}</h2>
                                <span className={`mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                                    profile.isApproved ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                                    }`}
                                >
                                    <ShieldCheck className={`mr-1.5 h-4 w-4 ${profile.isApproved ? 'text-green-600 dark:text-green-300' : 'text-yellow-600 dark:text-yellow-300'}`} />
                                    {profile.isApproved ? 'Approved' : 'Pending Approval'}
                                </span>
                            </div>

                            {/* Right Side: Details */}
                            <div className="md:w-2/3 p-6 md:p-8">
                                <h3 className="text-xl font-semibold mb-6 border-b pb-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                    Account Information
                                </h3>
                                <div className="space-y-5">
                                    <div className="flex items-center">
                                        <Mail className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                                            <p className="text-white">{profile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <User className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</span>
                                            <p className="text-white">{profile.displayName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Telephone</span>
                                            <p className="text-white">{profile.telephone || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</span>
                                            <p className="text-white">{profile.country}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Building className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</span>
                                            <p className="text-white capitalize">{profile.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status / Last Active</span>
                                            <p className="text-white">
                                                {profile.status} ({formatDate(profile.lastActiveAt)})
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;