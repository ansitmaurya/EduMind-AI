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
 * Resilient API fetch wrapper for backend endpoints.
 * 
 * @param {string} endpoint - Path relative to API_BASE_URL (e.g., '/materials')
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<{ success: boolean, data?: any, error?: string, status?: number }>}
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

/**
 * Fetches all saved learning materials from the backend.
 * 
 * @param {string} [subjectCode] - Optional filter by subject code
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>}
 */
export async function getMaterials(subjectCode) {
  const query = subjectCode ? `?subject_code=${encodeURIComponent(subjectCode)}` : '';
  return apiRequest(`/materials${query}`, { method: 'GET' });
}

/**
 * Uploads a document file (.pdf, .docx, .txt) with multipart/form-data.
 * 
 * @param {File} file - The file to upload
 * @param {object} [metadata={}] - Optional metadata { title, subject_code, description }
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function uploadMaterial(file, metadata = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata.title) formData.append('title', metadata.title);
  if (metadata.subject_code) formData.append('subject_code', metadata.subject_code);
  if (metadata.description) formData.append('description', metadata.description);

  return apiRequest('/materials/upload', {
    method: 'POST',
    body: formData
  });
}

/**
 * Fetches specific document details by ID.
 * 
 * @param {number|string} id - Document ID
 */
export async function getMaterialDetails(id) {
  return apiRequest(`/materials/${id}`, { method: 'GET' });
}

/**
 * Fetches full extracted text content for a document ID.
 * 
 * @param {number|string} id - Document ID
 */
export async function getMaterialContent(id) {
  return apiRequest(`/materials/${id}/content`, { method: 'GET' });
}

/**
 * Deletes a document by ID.
 * 
 * @param {number|string} id - Document ID
 */
export async function deleteMaterial(id) {
  return apiRequest(`/materials/${id}`, { method: 'DELETE' });
}

export default {
  API_BASE_URL,
  checkBackendHealth,
  apiRequest,
  getMaterials,
  uploadMaterial,
  getMaterialDetails,
  getMaterialContent,
  deleteMaterial
};
