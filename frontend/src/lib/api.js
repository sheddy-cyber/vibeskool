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

// File uploads: the browser sets the multipart boundary, so no JSON header
async function upload(endpoint, fields) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v); });
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || res.statusText);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

const query = (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
  return q ? `?${q}` : '';
};

// ============================================================================
// API Route Definitions
// ============================================================================

export const authApi = {
  signup: ({ email, password, displayName, role }) => post('/api/auth/signup', { email, password, displayName, role }),
  login: ({ email, password }) => post('/api/auth/login', { email, password }),
  googleAuth: ({ credential, role }) => post('/api/auth/google', { credential, role }),
  getMe: () => get('/api/auth/me'),
  updateProfile: (data) => put('/api/auth/profile', data),
  uploadAvatar: (file) => upload('/api/auth/avatar', { avatar: file }),
  removeAvatar: () => del('/api/auth/avatar'),
};

export const peopleApi = {
  get: (id) => get(`/api/people/${id}`),
};

export const showcaseApi = {
  list: (params) => get(`/api/showcase/projects${query(params)}`),
  get: (id) => get(`/api/showcase/projects/${id}`),
  create: (data) => post('/api/showcase/projects', data),
  update: (id, data) => patch(`/api/showcase/projects/${id}`, data),
  delete: (id) => del(`/api/showcase/projects/${id}`),
  uploadImage: (id, file, alt) => upload(`/api/showcase/projects/${id}/image`, { image: file, alt }),
  removeImage: (id) => del(`/api/showcase/projects/${id}/image`),
  appreciate: (id) => post(`/api/showcase/projects/${id}/appreciate`),
  feature: (id) => post(`/api/showcase/projects/${id}/feature`),
  leave: (id) => post(`/api/showcase/projects/${id}/leave`),
  comments: (id) => get(`/api/showcase/projects/${id}/comments`),
  comment: (id, body) => post(`/api/showcase/projects/${id}/comments`, { body }),
  deleteComment: (id, commentId) => del(`/api/showcase/projects/${id}/comments/${commentId}`),
  people: (q) => get(`/api/showcase/collaborators${query({ q })}`),
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
  // The tutor's edited version of the code in a post, with notes on its lines
  saveCodeReview: (id, postId, data) => put(`/api/classrooms/${id}/posts/${postId}/code-review`, data),
  removeCodeReview: (id, postId) => del(`/api/classrooms/${id}/posts/${postId}/code-review`),

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
  check: (data) => post('/api/exercises/check', data),
};

/* Tutors: their own courses (alone or as a team) */
export const studioApi = {
  courses: () => get('/api/studio/courses'),
  createCourse: (data) => post('/api/studio/courses', data),
  course: (id) => get(`/api/studio/courses/${id}`),
  updateCourse: (id, data) => patch(`/api/studio/courses/${id}`, data),
  deleteCourse: (id) => del(`/api/studio/courses/${id}`),
  saveOutline: (id, modules) => put(`/api/studio/courses/${id}/outline`, { modules }),
  addLesson: (id, data) => post(`/api/studio/courses/${id}/lessons`, data),
  lesson: (id) => get(`/api/studio/lessons/${id}`),
  updateLesson: (id, data) => patch(`/api/studio/lessons/${id}`, data),
  deleteLesson: (id) => del(`/api/studio/lessons/${id}`),
  invite: (id, email) => post(`/api/studio/courses/${id}/invites`, { email }),
  cancelInvite: (inviteId) => del(`/api/studio/invites/${inviteId}`),
  acceptInvite: (inviteId) => post(`/api/studio/invites/${inviteId}/accept`),
  removeMember: (id, userId) => del(`/api/studio/courses/${id}/team/${userId}`),
  makeOwner: (id, userId) => post(`/api/studio/courses/${id}/team/${userId}/owner`),
  setClasses: (id, classIds) => put(`/api/studio/courses/${id}/classes`, { classIds }),
  exercises: (courseId) => get(`/api/studio/exercises${query({ courseId })}`),
};

export const teachingApi = {
  overview: () => get('/api/teaching/overview'),
};

export const aiApi = {
  chat: (data) => post('/api/ai/chat', data),
  getHint: (data) => post('/api/ai/hint', data),
};
