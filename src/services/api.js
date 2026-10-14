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
 * Retrieves the currently stored JWT access token from localStorage.
 * 
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem('edumind_token');
}

/**
 * Resilient API fetch wrapper for backend endpoints.
 * Automatically injects the JWT Bearer authorization header if available.
 * 
 * @param {string} endpoint - Path relative to API_BASE_URL (e.g., '/materials')
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<{ success: boolean, data?: any, error?: string, status?: number }>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const token = getAuthToken();

  try {
    const headers = {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
      // If unauthorized and we had a token, session expired or invalidated
      if (response.status === 401 && token) {
        localStorage.removeItem('edumind_token');
        localStorage.removeItem('edumind_user');
        window.dispatchEvent(new CustomEvent('edumind:unauthorized'));
      }

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

/**
 * Generates an MCQ quiz from an uploaded learning material.
 * 
 * @param {object} payload - { material_id, title, topic, num_questions, difficulty }
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function generateQuiz(payload) {
  return apiRequest('/quizzes/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Lists generated quizzes from backend SQLite database.
 * 
 * @param {object} [params={}] - Optional filters { material_id, subject_code }
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>}
 */
export async function getQuizzes(params = {}) {
  const queryParts = [];
  if (params.material_id) queryParts.push(`material_id=${encodeURIComponent(params.material_id)}`);
  if (params.subject_code) queryParts.push(`subject_code=${encodeURIComponent(params.subject_code)}`);
  const query = queryParts.length ? `?${queryParts.join('&')}` : '';
  return apiRequest(`/quizzes${query}`, { method: 'GET' });
}

/**
 * Retrieves full quiz structure and questions by ID.
 * 
 * @param {number|string} id - Quiz ID
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getQuizById(id) {
  return apiRequest(`/quizzes/${id}`, { method: 'GET' });
}

/**
 * Starts a new quiz attempt on the backend.
 * Protects answers: does not return correct answers or explanations.
 * 
 * @param {number|string} quizId - Quiz ID
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function startQuizAttempt(quizId) {
  return apiRequest(`/quizzes/${quizId}/attempts`, {
    method: 'POST'
  });
}

/**
 * Submits learner responses for server-side evaluation.
 * 
 * @param {number|string} attemptId - Attempt ID
 * @param {object} submissionData - { responses: [{ question_id, selected_index }], time_taken_seconds }
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function submitQuizAttempt(attemptId, submissionData) {
  return apiRequest(`/attempts/${attemptId}/submit`, {
    method: 'POST',
    body: JSON.stringify(submissionData)
  });
}

/**
 * Retrieves the saved evaluation result for a completed quiz attempt.
 * 
 * @param {number|string} attemptId - Attempt ID
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getAttemptResult(attemptId) {
  return apiRequest(`/attempts/${attemptId}/result`, {
    method: 'GET'
  });
}

/**
 * Retrieves user's quiz attempt history.
 * 
 * @param {object} [params={}] - Optional filters { quiz_id, limit }
 * @returns {Promise<{ success: boolean, data?: Array, error?: string }>}
 */
export async function getAttemptHistory(params = {}) {
  const queryParts = [];
  if (params.quiz_id) queryParts.push(`quiz_id=${encodeURIComponent(params.quiz_id)}`);
  if (params.limit) queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
  const query = queryParts.length ? `?${queryParts.join('&')}` : '';
  return apiRequest(`/attempts${query}`, { method: 'GET' });
}

/**
 * Registers a new learner account with genuine password hashing.
 * 
 * @param {object} payload - { full_name, email, password, confirm_password }
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function registerUser(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Authenticates a registered user and receives a signed JWT access token.
 * 
 * @param {object} payload - { email, password }
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function loginUser(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Retrieves the currently authenticated user's profile.
 * 
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getCurrentUser() {
  return apiRequest('/auth/me', {
    method: 'GET'
  });
}

/**
 * Invalidate current session and log out the user.
 * 
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function logoutUser() {
  return apiRequest('/auth/logout', {
    method: 'POST'
  });
}

/**
 * Retrieves topic-level competency gap analysis from actual quiz attempts.
 * If userId is not provided, defaults to the authenticated user's data on the backend.
 * 
 * @param {string} [userId] - Optional learner identifier
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getCompetencies(userId) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiRequest(`/competencies${query}`, {
    method: 'GET'
  });
}

/**
 * Retrieves personalized learning recommendations tied to identified competency gaps.
 * If userId is not provided, defaults to the authenticated user's data on the backend.
 * 
 * @param {string} [userId] - Optional learner identifier
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getRecommendations(userId) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiRequest(`/recommendations${query}`, {
    method: 'GET'
  });
}

export default {
  API_BASE_URL,
  checkBackendHealth,
  apiRequest,
  getAuthToken,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getMaterials,
  uploadMaterial,
  getMaterialDetails,
  getMaterialContent,
  deleteMaterial,
  generateQuiz,
  getQuizzes,
  getQuizById,
  startQuizAttempt,
  submitQuizAttempt,
  getAttemptResult,
  getAttemptHistory,
  getCompetencies,
  getRecommendations
};

