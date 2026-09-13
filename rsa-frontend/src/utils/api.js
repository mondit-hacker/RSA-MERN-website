const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken()  { return localStorage.getItem('rsa_access_token'); }
export function getUser()   { try { return JSON.parse(localStorage.getItem('rsa_user') || 'null'); } catch { return null; } }
export function setToken(t) { localStorage.setItem('rsa_access_token', t); }
export function setUser(u)  { localStorage.setItem('rsa_user', JSON.stringify(u)); }
export function clearAuth() { localStorage.removeItem('rsa_access_token'); localStorage.removeItem('rsa_user'); }

async function apiFetch(path, options = {}, retry = true) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
  });

  if (res.status === 401 && retry) {
    try {
      const ref = await fetch(`${BASE}/auth/refresh-token`, { method: 'POST', credentials: 'include' });
      const rd  = await ref.json();
      if (rd.success && rd.data?.accessToken) {
        setToken(rd.data.accessToken);
        return apiFetch(path, options, false);
      }
    } catch (_) {}
    clearAuth();
    window.location.href = '/login';
    return;
  }

  const data = await res.json();
  if (!data.success) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.errors = data.errors;
    throw err;
  }
  return data;
}

export const authAPI = {
  login:     (email, password) => apiFetch('/auth/login', { method:'POST', body:{ email, password } }),
  logout:    ()    => apiFetch('/auth/logout',       { method:'POST' }),
  me:        ()    => apiFetch('/auth/me'),
  updateMe:  (b)   => apiFetch('/auth/update-me',   { method:'PATCH', body:b }),
  changePass:(b)   => apiFetch('/auth/change-password', { method:'PATCH', body:b }),
  forgotPass:(email)=>apiFetch('/auth/forgot-password', { method:'POST', body:{ email } }),
  register:  (b)   => apiFetch('/auth/register',    { method:'POST', body:b }),
};
export const adminAPI = {
  dashboard:     ()     => apiFetch('/admin/dashboard'),
  listUsers:     (q='') => apiFetch(`/admin/users?${q}`),
  getUser:       (id)   => apiFetch(`/admin/users/${id}`),
  createUser:    (b)    => apiFetch('/admin/users',      { method:'POST',   body:b }),
  updateUser:    (id,b) => apiFetch(`/admin/users/${id}`,{ method:'PATCH',  body:b }),
  deleteUser:    (id)   => apiFetch(`/admin/users/${id}`,{ method:'DELETE' }),
  unlockUser:    (id)   => apiFetch(`/admin/users/${id}/unlock`, { method:'POST' }),
  listStudents:  (q='') => apiFetch(`/admin/students?${q}`),
  createStudent: (b)    => apiFetch('/admin/students',   { method:'POST',   body:b }),
  updateStudent: (id,b) => apiFetch(`/admin/students/${id}`,{ method:'PATCH', body:b }),
  deleteStudent: (id)   => apiFetch(`/admin/students/${id}`,{ method:'DELETE' }),
  auditLogs:     (q='') => apiFetch(`/admin/logs/audit?${q}`),
  securityLogs:  (q='') => apiFetch(`/admin/logs/security?${q}`),
};
export const managerAPI = {
  overview:      ()     => apiFetch('/manager/reports/overview'),
  byCampus:      ()     => apiFetch('/manager/reports/students-by-campus'),
  listEnquiries: (q='') => apiFetch(`/manager/enquiries?${q}`),
  getEnquiry:    (id)   => apiFetch(`/manager/enquiries/${id}`),
  updateEnquiry: (id,b) => apiFetch(`/manager/enquiries/${id}`,{ method:'PATCH', body:b }),
  addNote:       (id,n) => apiFetch(`/manager/enquiries/${id}/note`,{ method:'POST', body:{ note:n } }),
  deleteEnquiry: (id)   => apiFetch(`/manager/enquiries/${id}`,{ method:'DELETE' }),
  broadcast:     (b)    => apiFetch('/manager/notifications/broadcast',{ method:'POST', body:b }),
};
export const hrAPI = {
  listTeachers:  (q='') => apiFetch(`/hr/teachers?${q}`),
  createTeacher: (b)    => apiFetch('/hr/teachers',  { method:'POST',   body:b }),
  updateTeacher: (id,b) => apiFetch(`/hr/teachers/${id}`,{ method:'PATCH', body:b }),
  deleteTeacher: (id)   => apiFetch(`/hr/teachers/${id}`,{ method:'DELETE' }),
  listStaff:     (q='') => apiFetch(`/hr/staff?${q}`),
  createStaff:   (b)    => apiFetch('/hr/staff',     { method:'POST',   body:b }),
  updateStaff:   (id,b) => apiFetch(`/hr/staff/${id}`,{ method:'PATCH', body:b }),
  deleteStaff:   (id)   => apiFetch(`/hr/staff/${id}`,{ method:'DELETE' }),
  listStudents:  (q='') => apiFetch(`/hr/students?${q}`),
};
export const teacherAPI = {
  profile:       ()     => apiFetch('/teacher/profile'),
  updateProfile: (b)    => apiFetch('/teacher/profile',{ method:'PATCH', body:b }),
  myStudents:    (q='') => apiFetch(`/teacher/students?${q}`),
  notifications: (q='') => apiFetch(`/teacher/notifications?${q}`),
  markRead:      (id)   => apiFetch(`/teacher/notifications/${id}/read`,{ method:'PATCH' }),
};
export const studentAPI = {
  profile:       ()     => apiFetch('/student/profile'),
  updateProfile: (b)    => apiFetch('/student/profile',{ method:'PATCH', body:b }),
  notifications: (q='') => apiFetch(`/student/notifications?${q}`),
  markRead:      (id)   => apiFetch(`/student/notifications/${id}/read`,{ method:'PATCH' }),
  markAllRead:   ()     => apiFetch('/student/notifications/read-all',{ method:'PATCH' }),
};
export const developerAPI = {
  health:        ()     => apiFetch('/developer/system/health'),
  stats:         ()     => apiFetch('/developer/system/stats'),
  listAllUsers:  (q='') => apiFetch(`/developer/users?${q}`),
  changeRole:    (id,r) => apiFetch(`/developer/users/${id}/role`,{ method:'PATCH', body:{ role:r } }),
  hardDelete:    (id)   => apiFetch(`/developer/users/${id}`,{ method:'DELETE' }),
  revokeAllSess: ()     => apiFetch('/developer/sessions',{ method:'DELETE' }),
  purgeSessions: ()     => apiFetch('/developer/maintenance/purge-sessions',{ method:'POST' }),
  activityLogs:  (q='') => apiFetch(`/developer/logs/activity?${q}`),
  auditLogs:     (q='') => apiFetch(`/developer/logs/audit?${q}`),
  securityLogs:  (q='') => apiFetch(`/developer/logs/security?${q}`),
};
export const publicAPI = {
  submitEnquiry: (b) => apiFetch('/enquiry',{ method:'POST', body:b }),
};
