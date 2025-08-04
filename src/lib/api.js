/**
 * API utility functions for handling URLs in development and production
 */

/**
 * Get the base URL for API calls
 * @returns {string} The base URL
 */
export function getBaseUrl() {
  // In browser, use relative URLs
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // On server, we need the full URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback for local development
  return 'http://localhost:3000';
}

/**
 * Create a full API URL
 * @param {string} path - The API path (e.g., '/api/notes')
 * @returns {string} The full URL
 */
export function getApiUrl(path) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
}

/**
 * Enhanced fetch function that automatically handles URLs
 * @param {string} path - The API path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export async function apiFetch(path, options = {}) {
  const url = getApiUrl(path);
  
  // Add default headers
  const defaultHeaders = {};
  
  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  return fetch(url, mergedOptions);
}