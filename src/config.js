/**
 * Shared API configuration — base URL without trailing /api
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://myidebackend.onrender.com';

/** Full API prefix, e.g. https://myidebackend.onrender.com/api */
export const API_URL = `${API_BASE_URL}/api`;
