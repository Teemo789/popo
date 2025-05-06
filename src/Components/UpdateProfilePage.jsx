// src/Components/UpdateProfilePage.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Loader2, AlertCircle, User, Mail, Phone, MapPin, Lock, Image as ImageIcon, CheckCircle, Upload, XCircle } from 'lucide-react';
import baseUrl from '../config/Baseurl';
import { getToken } from '../config/localstorage';

const getLogoUrl = (logoPath) => {
    if (!logoPath || typeof logoPath !== 'string' || !baseUrl) return null;
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) return logoPath;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanLogoPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${cleanBaseUrl}${cleanLogoPath}`;
};

const UpdateProfilePage = () => {
    const navigate = useNavigate();
    const [currentProfile, setCurrentProfile] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        displayName: '',
        telephone: '',
        country: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const fileInputRef = useRef(null);

    const fetchProfile = useCallback(async () => {
        setLoadingInitial(true);
        setError(null);
        const token = getToken();
        if (!token) {
            setError("Authentication required.");
            setLoadingInitial(false);
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/Auth/profile`, {
                headers: { 'Authorization': `Bearer ${token.trim()}` }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch profile (${response.status})`);
            }
            const data = await response.json();
            setCurrentProfile(data);
            setFormData(prev => ({
                ...prev,
                email: data.email || '',
                displayName: data.displayName || '',
                telephone: data.telephone || '',
                country: data.country || '',
            }));
            setLogoPreview(getLogoUrl(data.logoPath));
        } catch (err) {
            console.error("Fetch profile error:", err);
            setError(err.message || "Could not load profile data.");
        } finally {
            setLoadingInitial(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSuccessMessage(null);
        setError(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError("Logo file is too large (max 10MB).");
                setSelectedLogo(null);
                setLogoPreview(getLogoUrl(currentProfile?.logoPath));
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type)) {
                setError("Invalid file type. Please upload an image (JPG, PNG, GIF, WEBP, SVG).");
                setSelectedLogo(null);
                setLogoPreview(getLogoUrl(currentProfile?.logoPath));
                return;
            }

            setSelectedLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError(null);
            setSuccessMessage(null);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (formData.newPassword && formData.newPassword.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (formData.newPassword && !formData.currentPassword) {
            setError("Current password is required to set a new password.");
            return;
        }

        setLoadingUpdate(true);

        const token = getToken();
        if (!token) {
            setError("Authentication token missing. Please log in again.");
            setLoadingUpdate(false);
            return;
        }

        const dataToSubmit = new FormData();

        if (formData.email && formData.email !== currentProfile?.email) {
            dataToSubmit.append('Email', formData.email);
        }
        if (formData.displayName && formData.displayName !== currentProfile?.displayName) {
            dataToSubmit.append('DisplayName', formData.displayName);
        }
        if (formData.telephone !== currentProfile?.telephone) {
            dataToSubmit.append('Telephone', formData.telephone);
        }
        if (formData.country && formData.country !== currentProfile?.country) {
            dataToSubmit.append('Country', formData.country);
        }

        if (formData.newPassword) {
            dataToSubmit.append('CurrentPassword', formData.currentPassword);
            dataToSubmit.append('NewPassword', formData.newPassword);
        }

        if (selectedLogo) {
            dataToSubmit.append('Logo', selectedLogo);
        }

        let hasChanges = selectedLogo || formData.newPassword ||
            formData.email !== currentProfile?.email ||
            formData.displayName !== currentProfile?.displayName ||
            formData.telephone !== currentProfile?.telephone ||
            formData.country !== currentProfile?.country;

        if (!hasChanges) {
            setSuccessMessage("No changes detected.");
            setLoadingUpdate(false);
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/Auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token.trim()}`,
                },
                body: dataToSubmit,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Update failed (${response.status})`);
            }

            setSuccessMessage(result.message || "Profile updated successfully!");

            if (result.user) {
                setCurrentProfile(result.user);
                setFormData(prev => ({
                    ...prev,
                    email: result.user.email || '',
                    displayName: result.user.displayName || '',
                    telephone: result.user.telephone || '',
                    country: result.user.country || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                }));
                setLogoPreview(getLogoUrl(result.user.logoPath));
            } else {
                fetchProfile();
            }

            setSelectedLogo(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (err) {
            console.error("Update profile error:", err);
            setError(err.message || "An error occurred during the update.");
        } finally {
            setLoadingUpdate(false);
        }
    };

    const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

    if (loadingInitial) {
        return (
            <div className="relative w-full min-h-screen font-sans bg-gray-950 flex flex-col items-center justify-center text-white">
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp" alt="Abstract background" className="h-full w-full object-cover filter blur-xl scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
                    <p className="text-gray-300">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error && !currentProfile) {
        return (
            <div className="relative w-full min-h-screen font-sans bg-gray-950 flex flex-col items-center justify-center text-white p-5">
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=75&w=1920&auto=format&fit=crop&fm=webp" alt="Abstract background" className="h-full w-full object-cover filter blur-xl scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80"></div>
                </div>
                <motion.div
                    initial="hidden" animate="visible" variants={fadeIn}
                    className="relative z-10 text-center py-12 px-6 bg-gradient-to-br from-red-800/30 to-red-900/20 backdrop-blur-lg rounded-3xl border border-red-500/50 shadow-xl max-w-md"
                >
                    <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-red-200 mb-2">Error Loading Profile</h3>
                    <p className="text-red-300 mb-6">{error}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen font-sans bg-gray-950 flex flex-col">
            <Helmet>
                <title>Update Profile - VenturesRoom</title>
                <meta name="description" content="Update your VenturesRoom profile information." />
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
                <main className="p-5 md:p-8 lg:p-10 flex-grow w-full max-w-3xl mx-auto">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Update Your Profile</h1>
                            <p className="mt-2 text-lg text-gray-300">Keep your information current.</p>
                        </div>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="mb-6 p-4 bg-red-900/40 rounded-lg border border-red-500/50 flex items-start shadow-lg"
                            role="alert"
                        >
                            <AlertCircle className="h-5 w-5 text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-medium text-red-200">Error:</span>
                                <p className="text-sm text-red-300 mt-1">{error}</p>
                            </div>
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="mb-6 p-4 bg-green-900/40 rounded-lg border border-green-500/50 flex items-start shadow-lg"
                            role="alert"
                        >
                            <CheckCircle className="h-5 w-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-medium text-green-200">Success:</span>
                                <p className="text-sm text-green-300 mt-1">{successMessage}</p>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl overflow-hidden"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        transition={{ delay: 0.3 }}
                    >
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold mb-5 border-b border-white/20 pb-3 text-gray-100">
                                    Personal Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Display Name <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                id="displayName"
                                                name="displayName"
                                                value={formData.displayName}
                                                onChange={handleInputChange}
                                                required
                                                className="form-input-dark pl-11"
                                                placeholder="Your Name or Company Name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Email Address <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="form-input-dark pl-11"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="telephone" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Telephone
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                            <input
                                                type="tel"
                                                id="telephone"
                                                name="telephone"
                                                value={formData.telephone}
                                                onChange={handleInputChange}
                                                className="form-input-dark pl-11"
                                                placeholder="Optional contact number"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1.5">
                                            Country <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                required
                                                className="form-input-dark pl-11"
                                                placeholder="Your Country"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mb-5 border-b border-white/20 pb-3 text-gray-100">
                                    Profile Picture / Logo
                                </h2>
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="flex-shrink-0">
                                        <span className="block text-sm font-medium text-gray-300 mb-2">Preview</span>
                                        <img
                                            src={logoPreview || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNiIgY3k9IjguNiIgcj0iMC42IiBmaWxsPSJjdXJyZW50Q29sb3IiLz48cGF0aCBkPSJtMjEgMTYtNSA1TDYgMTZsMTUgMHoiLz48L3N2Zz4='}
                                            alt="Logo Preview"
                                            className="h-24 w-24 rounded-full object-cover border-2 border-white/30 shadow-md bg-white/10"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlLW9mZiI+PHBhdGggZD0ibTE0LjUgIDIuMDYgNSA1Ii8+PHBhdGggZD0iTTIxIDE2djRhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ2LTNhMiAyIDAgMCAwLTIgMlYxOWEyIDIgMCAwIDAgMiAyaDE0YTIgMiAwIDAgMCAyLTJ2LTQiLz48bGluZSB4MT0iMiIgeDI9IjIyIiB5MT0iMiIgeTI9IjIyIi8+PHBhdGggZD0iTTE1IDE4IDIxIDEyIi8+PHBhdGggZD0iTTkgMTJhMyAzIDAgMTExLjUgMi45Nk0yLjUgMjAuMDZBMTUgMTUgMCAwIDEgMjAuMDYgMi41Ii8+PC9zdmc+';
                                                e.target.style.objectFit = 'contain';
                                                e.target.parentElement.style.backgroundColor = '#e5e7eb';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <input
                                            type="file"
                                            id="logo"
                                            name="logo"
                                            accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml"
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={triggerFileInput}
                                            className="btn btn-secondary mb-2"
                                        >
                                            <Upload className="h-5 w-5 mr-2"/>
                                            Choose New Logo
                                        </button>
                                        <p className="text-xs text-gray-400">PNG, JPG, GIF, WEBP, SVG up to 10MB.</p>
                                        {selectedLogo && (
                                            <div className="mt-2 text-xs text-green-400 flex items-center">
                                                <ImageIcon className="h-4 w-4 mr-1"/> Selected: {selectedLogo.name}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedLogo(null);
                                                        setLogoPreview(getLogoUrl(currentProfile?.logoPath));
                                                        if(fileInputRef.current) fileInputRef.current.value = "";
                                                    }}
                                                    className="ml-2 p-0.5 rounded-full text-red-400 hover:bg-red-500/20 focus:outline-none"
                                                    title="Clear selection"
                                                >
                                                    <XCircle size={16}/>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mb-5 border-b border-white/20 pb-3 text-gray-100">
                                    Change Password (Optional)
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                className="form-input-dark pl-11"
                                                placeholder="Required only if changing password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className="form-input-dark pl-11"
                                                placeholder="Leave blank to keep current password"
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                                            <input
                                                type="password"
                                                id="confirmNewPassword"
                                                name="confirmNewPassword"
                                                value={formData.confirmNewPassword}
                                                onChange={handleInputChange}
                                                className="form-input-dark pl-11"
                                                placeholder="Confirm your new password"
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="pt-6 border-t border-white/20">
                                <button
                                    type="submit"
                                    disabled={loadingUpdate}
                                    className={`btn btn-primary w-full ${loadingUpdate ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                                >
                                    {loadingUpdate ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </main>
            </div>

            <style jsx global>{`
                .form-input-dark {
                    display: block;
                    width: 100%;
                    padding-top: 0.75rem;
                    padding-bottom: 0.75rem;
                    padding-left: 0.75rem;
                    padding-right: 0.75rem;
                    border-width: 1px;
                    border-color: rgba(255, 255, 255, 0.2);
                    border-radius: 0.5rem;
                    background-color: rgba(255, 255, 255, 0.1);
                    color: white;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    outline: none;
                }
                .form-input-dark::placeholder {
                    color: #9ca3af;
                }
                .form-input-dark:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px #3b82f6;
                }
                .form-input-dark.pl-11 { padding-left: 2.75rem; }
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.1) inset !important;
                    -webkit-text-fill-color: #ffffff !important;
                    caret-color: #ffffff !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; transition: all 0.2s ease-in-out; text-align: center; border: 1px solid transparent; cursor: pointer; }
                .btn-primary { background-color: #2563eb; color: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-color: #2563eb; }
                .btn-primary:hover:not(:disabled) { background-color: #1d4ed8; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
                .btn-secondary { background-color: rgba(255, 255, 255, 0.1); color: #d1d5db; border: 1px solid rgba(255, 255, 255, 0.2); }
                .btn-secondary:hover:not(:disabled) { background-color: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.3); }
                .btn:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default UpdateProfilePage;