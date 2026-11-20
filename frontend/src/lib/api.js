/**
 * Centralized API client for VibeSkool frontend.
 * Wraps native fetch with auth token and error handling.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

export function setToken(token) {
  localStorage.setItem('vs_token', token);
}

export function getToken() {
  return localStorage.getItem('vs_token');
}

export function clearToken() {
  localStorage.removeItem('vs_token');
}

/**
 * Base fetch wrapper that handles common logic:
 * - Prefixing BASE_URL
 * - Attaching Authorization header
 * - Setting Content-Type: application/json
 * - Parsing JSON responses
 * - Throwing errors for non-2xx status codes
 */
async function fetchWrapper(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    // Attempt to parse JSON response, fallback to text
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Create an error with the message from the API if available
      const errorMessage = (data && (data.error || data.message)) || (typeof data === 'string' && data ? data : response.statusText);
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

// HTTP method aliases
const get = (endpoint) => fetchWrapper(endpoint, { method: 'GET' });
const post = (endpoint, body) => fetchWrapper(endpoint, { method: 'POST', body: JSON.stringify(body) });
const put = (endpoint, body) => fetchWrapper(endpoint, { method: 'PUT', body: JSON.stringify(body) });
const del = (endpoint) => fetchWrapper(endpoint, { method: 'DELETE' });
const patch = (endpoint, body) => fetchWrapper(endpoint, { method: 'PATCH', body: JSON.stringify(body) });

// ============================================================================
// API Route Definitions
// ============================================================================

export const authApi = {
  signup: ({ email, password, displayName, role }) => post('/api/auth/signup', { email, password, displayName, role }),
  login: ({ email, password }) => post('/api/auth/login', { email, password }),
  googleAuth: ({ credential, role }) => post('/api/auth/google', { credential, role }),
  getMe: () => get('/api/auth/me'),
  updateProfile: (data) => put('/api/auth/profile', data),
};

export const classroomApi = {
  list: () => get('/api/classrooms'),
  get: (id) => get(`/api/classrooms/${id}`),
  create: (data) => post('/api/classrooms', data),
  update: (id, data) => patch(`/api/classrooms/${id}`, data),
  delete: (id) => del(`/api/classrooms/${id}`),
  join: (inviteCode) => post('/api/classrooms/join', { inviteCode }),
  leave: (id) => post(`/api/classrooms/${id}/leave`),
  newInviteCode: (id) => post(`/api/classrooms/${id}/invite-code`),
  getMembers: (id) => get(`/api/classrooms/${id}/members`),
  removeMember: (classroomId, studentId) => del(`/api/classrooms/${classroomId}/members/${studentId}`),
  getStats: (id) => get(`/api/classrooms/${id}/stats`),
  getLeaderboard: (id) => get(`/api/classrooms/${id}/leaderboard`),
  getAnalytics: (id) => get(`/api/classrooms/${id}/analytics`),
  getInsights: (id) => get(`/api/classrooms/${id}/insights`),

  // Stream
  posts: (id, params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString()
    return get(`/api/classrooms/${id}/posts${q ? `?${q}` : ''}`)
  },
  createPost: (id, data) => post(`/api/classrooms/${id}/posts`, data),
  updatePost: (id, postId, data) => patch(`/api/classrooms/${id}/posts/${postId}`, data),
  deletePost: (id, postId) => del(`/api/classrooms/${id}/posts/${postId}`),
  reply: (id, postId, data) => post(`/api/classrooms/${id}/posts/${postId}/replies`, data),
  deleteReply: (id, replyId) => del(`/api/classrooms/${id}/replies/${replyId}`),
  acceptReply: (id, replyId) => post(`/api/classrooms/${id}/replies/${replyId}/accept`),

  // Classwork
  assignments: (id) => get(`/api/classrooms/${id}/assignments`),
  assignment: (id, aid) => get(`/api/classrooms/${id}/assignments/${aid}`),
  createAssignment: (id, data) => post(`/api/classrooms/${id}/assignments`, data),
  updateAssignment: (id, aid, data) => patch(`/api/classrooms/${id}/assignments/${aid}`, data),
  deleteAssignment: (id, aid) => del(`/api/classrooms/${id}/assignments/${aid}`),
  handIn: (id, aid, data) => put(`/api/classrooms/${id}/assignments/${aid}/submission`, data),
  submission: (id, sid) => get(`/api/classrooms/${id}/submissions/${sid}`),
  review: (id, sid, data) => post(`/api/classrooms/${id}/submissions/${sid}/review`, data),
  comment: (id, sid, data) => post(`/api/classrooms/${id}/submissions/${sid}/comments`, data),

  // Nudges
  nudges: (id) => get(`/api/classrooms/${id}/nudges`),
  nudge: (id, studentId, message) => post(`/api/classrooms/${id}/nudges`, { studentId, message }),
  readNudge: (id, nid) => post(`/api/classrooms/${id}/nudges/${nid}/read`),
};

export const contentApi = {
  getPaths: () => get('/api/paths'),
  getPath: (id) => get(`/api/paths/${id}`),
  getLessons: () => get('/api/lessons'),
  getLesson: (id) => get(`/api/lessons/${id}`),
  // Teacher CRUD (Phase 2)
  createLesson: (data) => post('/api/lessons', data),
  updateLesson: (id, data) => put(`/api/lessons/${id}`, data),
  deleteLesson: (id) => del(`/api/lessons/${id}`),
  createPath: (data) => post('/api/paths', data),
  updatePath: (id, data) => put(`/api/paths/${id}`, data),
  deletePath: (id) => del(`/api/paths/${id}`),
};

export const progressApi = {
  get: () => get('/api/progress'),
  completeLesson: (lessonId, pathId) => post('/api/progress/complete', { lessonId, pathId }),
  passModule: (moduleId, score) => post('/api/progress/pass-module', { moduleId, score }),
};

export const exerciseApi = {
  list: (lessonId) => get(`/api/exercises?lessonId=${lessonId}`),
  get: (id) => get(`/api/exercises/${id}`),
  create: (data) => post('/api/exercises', data),
  update: (id, data) => put(`/api/exercises/${id}`, data),
  delete: (id) => del(`/api/exercises/${id}`),
  submit: (id, code) => post(`/api/exercises/${id}/submit`, { code }),
  getSolutions: (id) => get(`/api/exercises/${id}/solutions`),
};

export const testApi = {
  list: () => get('/api/tests'),
  get: (id) => get(`/api/tests/${id}`),
  create: (data) => post('/api/tests', data),
  start: (id) => post(`/api/tests/${id}/start`),
  submit: (id, answers) => post(`/api/tests/${id}/submit`, { answers }),
  getSubmissions: (testId) => get(`/api/submissions?testId=${testId}`),
  grade: (submissionId, data) => put(`/api/submissions/${submissionId}/grade`, data),
};

export const aiApi = {
  chat: (data) => post('/api/ai/chat', data),
  getHistory: (lessonId) => get(`/api/ai/history?lessonId=${lessonId}`),
  getHint: (data) => post('/api/ai/hint', data),
};

export const projectApi = {
  list: () => get('/api/projects'),
  create: (data) => post('/api/projects', data),
  toggleLike: (id) => post(`/api/projects/${id}/like`)
};

export const challengeApi = {
  getDaily: () => get('/api/challenges/daily'),
  submitDaily: (id, code) => post('/api/challenges/daily/submit', { id, code })
};
