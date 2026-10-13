/**
 * EduMind AI - Shared Frontend API Client
 * Configures communication with the Phase 2 FastAPI backend.
 * Provides resilient fallbacks so the frontend runs cleanly even when the backend is offline.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Checks the operational health and database connectivity of the backend.
 * Safe to call at any time; never throws unhandled errors.
 * 
 * @param {number} timeoutMs - Timeout in milliseconds (default: 3000ms)
 * @returns {Promise<{ available: boolean, data?: object, error?: string }>}
 */
export async function checkBackendHealth(timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) {
      return {
        available: false,
        error: `Backend responded with HTTP status ${response.status}`
      };
    }

    const data = await response.json();
    return {
      available: data.status === 'healthy',
      data
    };
  } catch (error) {
    clearTimeout(timer);
    return {
      available: false,
      error: error.name === 'AbortError'
        ? 'Connection timed out'
        : (error.message || 'Unable to reach backend service')
    };
  }
}

/**
 * Resilient API fetch wrapper for future Phase 2 endpoints.
 * 
 * @param {string} endpoint - Path relative to API_BASE_URL (e.g., '/materials')
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const headers = {
      'Accept': 'application/json',
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return {
        success: false,
        error: (isJson && data?.detail) ? data.detail : `Request failed with status ${response.status}`,
        status: response.status
      };
    }

    return {
      success: true,
      data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Network error occurred while contacting the server',
      networkError: true
    };
  }
}

export default {
  API_BASE_URL,
  checkBackendHealth,
  apiRequest
};
