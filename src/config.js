/**
 * Shared API configuration — base URL without trailing /api
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

/** Full API prefix, e.g. http://localhost:5000/api */
export const API_URL = `${API_BASE_URL}/api`;
