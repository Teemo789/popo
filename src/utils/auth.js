import { jwtDecode } from "jwt-decode"
import {
  saveToken as saveTokenToStorage,
  getToken as getTokenFromStorage,
  removeToken as removeTokenFromStorage,
  saveUserRole as saveUserRoleToStorage,
  getUserRole as getUserRoleFromStorage,
  isAdmin as checkIsAdmin,
} from "../config/localstorage"

/**
 * Save authentication token to localStorage
 * @param {string} token - JWT token
 */
export const saveToken = (token) => {
  saveTokenToStorage(token)
}

/**
 * Get token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export const getToken = () => {
  return getTokenFromStorage()
}

/**
 * Remove token from localStorage (logout)
 */
export const removeToken = () => {
  removeTokenFromStorage()
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const token = getToken()
  if (!token) return false

  try {
    // Check if token is expired
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000

    if (decoded.exp < currentTime) {
      // Token is expired
      removeToken()
      return false
    }

    return true
  } catch (error) {
    console.error("Error decoding token:", error)
    return false
  }
}

/**
 * Save user role to localStorage
 * @param {string} role - User role
 */
export const saveUserRole = (role) => {
  saveUserRoleToStorage(role)
}

/**
 * Get user role from localStorage
 * @returns {string|null}
 */
export const getUserRole = () => {
  return getUserRoleFromStorage()
}

/**
 * Check if user has admin role
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  return checkIsAdmin()
}

/**
 * Get user info from token
 * @returns {object|null} User info or null if not authenticated
 */
export const getUserInfo = () => {
  const token = getToken()
  if (!token) return null

  try {
    return jwtDecode(token)
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

/**
 * Handle logout - clear storage and trigger event
 */
export const logout = () => {
  removeToken()
  // Dispatch event to notify components about logout
  window.dispatchEvent(new Event("authChange"))
}
