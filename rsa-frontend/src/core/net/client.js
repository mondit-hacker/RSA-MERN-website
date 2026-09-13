const BASE = import.meta.env.VITE_API_BASE || '/x-api';

const _getToken = () => localStorage.getItem('_rt');
const _setToken = t => localStorage.setItem('_rt', t);
const _clearAll = () => { localStorage.removeItem('_rt'); localStorage.removeItem('_us'); };

export const getUser    = () => { try { return JSON.parse(localStorage.getItem('_us')||'null'); } catch { return null; } };
export const storeUser  = u => localStorage.setItem('_us', JSON.stringify(u));
export const storeToken = t => _setToken(t);
export const wipeSession= () => _clearAll();

async function request(path, opts={}, retry=true) {
  const token = _getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts, credentials:'include',
    headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}), ...opts.headers },
    body: opts.body ? (typeof opts.body==='string'?opts.body:JSON.stringify(opts.body)) : undefined,
  });
  if (res.status===401 && retry) {
    try {
      const ref = await fetch(`${BASE}/auth/refresh-token`,{method:'POST',credentials:'include'});
      const rd  = await ref.json();
      if (rd.success && rd.data?.accessToken) { _setToken(rd.data.accessToken); return request(path,opts,false); }
    } catch(_){}
    _clearAll(); window.location.replace('/login'); return;
  }
  const data = await res.json();
  if (!data.success) { const e=new Error(data.message||'Request failed'); e.status=res.status; e.errors=data.errors; throw e; }
  return data;
}

const get  = path       => request(path);
const post = (path,body)=> request(path,{method:'POST',body});
const patch= (path,body)=> request(path,{method:'PATCH',body});
const del  = path       => request(path,{method:'DELETE'});

// ── Auth ──────────────────────────────────────────────────────────
export const authService = {
  login:      (email,pw) => post('/auth/login',{email,password:pw}),
  logout:     ()         => post('/auth/logout'),
  me:         ()         => get('/auth/me'),
  updateMe:   b          => patch('/auth/update-me',b),
  changePass: b          => patch('/auth/change-password',b),
  forgotPass: email      => post('/auth/forgot-password',{email}),
  register:   b          => post('/auth/register',b),
};

// ── Admin ─────────────────────────────────────────────────────────
export const adminService = {
  dashboard:     ()      => get('/admin/dashboard'),
  listUsers:     (q='')  => get(`/admin/users?${q}`),
  createUser:    b       => post('/admin/users',b),
  updateUser:    (id,b)  => patch(`/admin/users/${id}`,b),
  deleteUser:    id      => del(`/admin/users/${id}`),
  unlockUser:    id      => post(`/admin/users/${id}/unlock`),
  listStudents:  (q='')  => get(`/admin/students?${q}`),
  createStudent: b       => post('/admin/students',b),
  updateStudent: (id,b)  => patch(`/admin/students/${id}`,b),
  deleteStudent: id      => del(`/admin/students/${id}`),
  auditLogs:     (q='')  => get(`/admin/logs/audit?${q}`),
  securityLogs:  (q='')  => get(`/admin/logs/security?${q}`),
};

// ── Analytics ─────────────────────────────────────────────────────
export const analyticsService = {
  overview:        ()      => get('/analytics/overview'),
  admissions:      (y='')  => get(`/analytics/admissions?year=${y}`),
  attendanceTrend: ()      => get('/analytics/attendance'),
  programmes:      ()      => get('/analytics/programmes'),
  campus:          ()      => get('/analytics/campus'),
  enquiryFunnel:   ()      => get('/analytics/enquiry-funnel'),
  todayAttendance: ()      => get('/analytics/today-attendance'),
};

// ── Attendance ────────────────────────────────────────────────────
export const attendanceService = {
  list:      (q='')  => get(`/attendance?${q}`),
  markBulk:  b       => post('/attendance/bulk',b),
  summary:   id      => get(`/attendance/summary/${id}`),
  byStudent: (id,q='') => get(`/attendance?student=${id}&${q}`),
};


// ── Results ───────────────────────────────────────────────────────
export const resultService = {
  list:           (q='')    => get(`/results?${q}`),
  create:         b         => post('/results', b),
  update:         (id, b)   => patch(`/results/${id}`, b),
  remove:         id        => request(`/results/${id}`, { method:'DELETE' }),
  studentResults: id        => get(`/results/student/${id}`),
  studentsList:   (q='')    => get(`/results/students-list?${q}`),
};


export const complaintService = {
  list:       (q='') => get(`/complaints?${q}`),
  mine:       (q='') => get(`/complaints/mine?${q}`),
  create:     b      => post('/complaints',b),
  respond:    (id,b) => patch(`/complaints/${id}/respond`,b),
};

// ── Manager ───────────────────────────────────────────────────────
export const managerService = {
  overview:      ()      => get('/manager/reports/overview'),
  byCampus:      ()      => get('/manager/reports/students-by-campus'),
  listEnquiries: (q='')  => get(`/manager/enquiries?${q}`),
  updateEnquiry: (id,b)  => patch(`/manager/enquiries/${id}`,b),
  addNote:       (id,n)  => post(`/manager/enquiries/${id}/note`,{note:n}),
  deleteEnquiry: id      => del(`/manager/enquiries/${id}`),
  broadcast:     b       => post('/manager/notifications/broadcast',b),
};

// ── HR ────────────────────────────────────────────────────────────
export const hrService = {
  listTeachers:  (q='') => get(`/hr/teachers?${q}`),
  createTeacher: b      => post('/hr/teachers',b),
  updateTeacher: (id,b) => patch(`/hr/teachers/${id}`,b),
  deleteTeacher: id     => del(`/hr/teachers/${id}`),
  listStaff:     (q='') => get(`/hr/staff?${q}`),
  createStaff:   b      => post('/hr/staff',b),
  updateStaff:   (id,b) => patch(`/hr/staff/${id}`,b),
  deleteStaff:   id     => del(`/hr/staff/${id}`),
  listStudents:  (q='') => get(`/hr/students?${q}`),
};

// ── Teacher ───────────────────────────────────────────────────────
export const teacherService = {
  profile:       ()     => get('/teacher/profile'),
  updateProfile: b      => patch('/teacher/profile',b),
  myStudents:    (q='') => get(`/teacher/students?${q}`),
  notifications: (q='') => get(`/teacher/notifications?${q}`),
  markRead:      id     => patch(`/teacher/notifications/${id}/read`),
};

// ── Student ───────────────────────────────────────────────────────
export const studentService = {
  profile:       ()     => get('/student/profile'),
  updateProfile: b      => patch('/student/profile',b),
  notifications: (q='') => get(`/student/notifications?${q}`),
  markRead:      id     => patch(`/student/notifications/${id}/read`),
  markAllRead:   ()     => patch('/student/notifications/read-all'),
};

// ── Developer ─────────────────────────────────────────────────────
export const devService = {
  health:        ()     => get('/developer/system/health'),
  stats:         ()     => get('/developer/system/stats'),
  listAllUsers:  (q='') => get(`/developer/users?${q}`),
  changeRole:    (id,r) => patch(`/developer/users/${id}/role`,{role:r}),
  hardDelete:    id     => del(`/developer/users/${id}`),
  revokeAll:     ()     => del('/developer/sessions'),
  purgeSessions: ()     => post('/developer/maintenance/purge-sessions'),
  activityLogs:  (q='') => get(`/developer/logs/activity?${q}`),
  auditLogs:     (q='') => get(`/developer/logs/audit?${q}`),
  securityLogs:  (q='') => get(`/developer/logs/security?${q}`),
};

// ── Log Management ───────────────────────────────────────────────
export const logMgmtService = {
  deletedLogs:      (q='')         => get(`/logs/deleted?${q}`),
  deleteAuditLogs:  (body)         => request('/logs/audit',    { method:'DELETE', body }),
  deleteSecurityLogs:(body)        => request('/logs/security', { method:'DELETE', body }),
  deleteActivityLogs:(body)        => request('/logs/activity', { method:'DELETE', body }),
};

// ── Backup & Export ──────────────────────────────────────────────
export const backupService = {
  run:           ()         => post('/backup/run'),
  list:          ()         => get('/backup/list'),
  downloadUrl:   (filename) => `${BASE}/backup/download/${encodeURIComponent(filename)}`,
  deleteBackup:  (filename) => request(`/backup/${encodeURIComponent(filename)}`, { method:'DELETE' }),
  // Export URLs — direct download links
  exportUrl:     (type, params='') => `${BASE}/backup/export/${type}?${params}`,
};

// ── Admin extras ──────────────────────────────────────────────────
export const adminExtService = {
  resetPassword: (id, password) => patch(`/admin/users/${id}/reset-password`, { password }),
};


// ── Class Assignments ────────────────────────────────────────────
export const assignmentService = {
  list:            (q='')       => get(`/assignments?${q}`),
  assign:          (body)       => post('/assignments', body),
  remove:          (id)         => request(`/assignments/${id}`, { method:'DELETE' }),
  byClass:         (q='')       => get(`/assignments/by-class?${q}`),
  teacherStudents: (teacherId)  => get(`/assignments/teacher/${teacherId}/students`),
};

// ── Credentials Vault ────────────────────────────────────────────
export const credService = {
  list:  ()    => get('/credentials'),
  clear: ()    => request('/credentials', { method:'DELETE' }),
};

export const publicService = {
  enquiry: b => post('/enquiry',{...b}),
};
