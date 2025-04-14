// API utility functions for QuantumFluxAI

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  };
  
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Node-related API calls
 */
export const nodeApi = {
  getAllNodes: () => fetchWithAuth('/nodes'),
  getNodeById: (nodeId) => fetchWithAuth(`/nodes/${nodeId}`),
  registerNode: (nodeData) => fetchWithAuth('/nodes', {
    method: 'POST',
    body: JSON.stringify(nodeData),
  }),
  updateNodeStatus: (nodeId, status) => fetchWithAuth(`/nodes/${nodeId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

/**
 * Task-related API calls
 */
export const taskApi = {
  getAllTasks: () => fetchWithAuth('/tasks'),
  getTaskById: (taskId) => fetchWithAuth(`/tasks/${taskId}`),
  createTask: (taskData) => fetchWithAuth('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  updateTaskStatus: (taskId, status) => fetchWithAuth(`/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

/**
 * Auth-related API calls
 */
export const authApi = {
  login: (credentials) => fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'Authorization': '' }, // No auth token needed for login
  }),
  logout: () => fetchWithAuth('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => fetchWithAuth('/auth/me'),
};

export default {
  nodeApi,
  taskApi,
  authApi,
}; 