// This is a suggested implementation for your localstorage.js file
// Create this file if it doesn't exist or update it if it does

const AUTH_TOKEN_KEY = "authToken"
const USER_ROLE_KEY = "userRole"

/**
 * Saves the authentication token to localStorage.
 * @param {string} token The JWT token to save.
 */
export const saveToken = (token) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      // Make sure to trim the token to avoid whitespace issues
      localStorage.setItem(AUTH_TOKEN_KEY, token.trim())
      console.log("Token saved successfully.")
    } catch (error) {
      console.error("Error saving token to localStorage:", error)
      // Handle potential storage errors (e.g., storage full)
    }
  } else {
    console.warn("localStorage is not available.")
  }
}

/**
 * Saves the user role to localStorage.
 * @param {string} role The user role to save.
 */
export const saveUserRole = (role) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(USER_ROLE_KEY, role)
      console.log("User role saved successfully.")
    } catch (error) {
      console.error("Error saving user role to localStorage:", error)
    }
  } else {
    console.warn("localStorage is not available.")
  }
}

/**
 * Retrieves the user role from localStorage.
 * @returns {string|null} The stored user role or null if not found.
 */
export const getUserRole = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem(USER_ROLE_KEY)
  }
  console.warn("localStorage is not available.")
  return null
}

/**
 * Checks if the current user is an admin.
 * @returns {boolean} True if the user is an admin, false otherwise.
 */
export const isAdmin = () => {
  return getUserRole() === "admin"
}

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string|null} The stored token or null if not found or localStorage is unavailable.
 */
export const getToken = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    // Return the trimmed token to avoid whitespace issues
    return token ? token.trim() : null
  }
  console.warn("localStorage is not available.")
  return null
}

/**
 * Removes the authentication token and user role from localStorage.
 */
export const removeToken = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(USER_ROLE_KEY)
      console.log("Token and user role removed successfully.")
    } catch (error) {
      console.error("Error removing data from localStorage:", error)
    }
  } else {
    console.warn("localStorage is not available.")
  }
}

/**
 * Checks if a user token exists in localStorage.
 * @returns {boolean} True if a token exists, false otherwise.
 */
export const isLoggedIn = () => {
  return !!getToken() // Returns true if getToken() returns a non-null/non-empty string
}

/**
 * Checks if the token is expired.
 * @returns {boolean} True if the token is expired or invalid, false otherwise.
 */
export const isTokenExpired = () => {
  const token = getToken()
  if (!token) return true

  try {
    // JWT tokens are split into three parts by dots
    const parts = token.split(".")
    if (parts.length !== 3) return true

    const payload = parts[1]
    // Decode the base64 payload
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const decodedPayload = JSON.parse(jsonPayload)

    // Check if the token has an expiration time
    if (!decodedPayload.exp) return false

    // Compare expiration time with current time
    const expirationTime = decodedPayload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expirationTime
  } catch (error) {
    console.error("Error checking token expiration:", error)
    return true // If we can't verify, assume it's expired for safety
  }
}

/**
 * Retrieves the user ID from localStorage.
 * @returns {string|null} The stored user ID or null if not found.
 */
export const getUserId = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    const user = JSON.parse(userData);
    return user.id;
  } catch {
    return null;
  }
};

/**
 * Clears user data from localStorage.
 */
export const clearUserData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
