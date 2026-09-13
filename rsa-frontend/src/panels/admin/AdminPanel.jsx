import { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PanelLayout from '../../components/panel/PanelLayout';
import { adminAPI } from '../../utils/api';

const NAV = [
  { path:'/panel/admin',          icon:'fa-gauge',         label:'Dashboard' },
  { path:'/panel/admin/students', icon:'fa-user-graduate', label:'Students'  },
  { path:'/panel/admin/users',    icon:'fa-users',         label:'Users'     },
  { path:'/panel/admin/logs',     icon:'fa-shield-halved', label:'Logs'      },
];

const Spinner = () => <div style={{display:'flex',justifyContent:'center',padding:'48px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#0B1F3A',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>;
const ErrMsg = ({msg}) => msg ? <div className="panel-error-msg"><i className="fa-solid fa-circle-exclamation"/>{msg}</div> : null;
const OkMsg  = ({msg}) => msg ? <div className="panel-success-msg"><i className="fa-solid fa-circle-check"/>{msg}</div> : null;

function Dashboard() {
  const [data, setData] = useState(null);
  const [err,  setErr]  = useState('');
  useEffect(() => { adminAPI.dashboard().then(r=>setData(r.data.dashboard)).catch(e=>setErr(e.message)); }, []);
  if (!data && !err) return <Spinner/>;
  const stats = [
    { label:'Total Users',     num:data?.totalUsers||0,     icon:'fa-users',          color:'#3B82F6', bg:'#EFF6FF' },
    { label:'Active Students', num:data?.totalStudents||0,  icon:'fa-user-graduate',   color:'#10B981', bg:'#F0FDF4' },
    { label:'Active Teachers', num:data?.totalTeachers||0,  icon:'fa-chalkboard-user', color:'#8B5CF6', bg:'#F5F3FF' },
    { label:'Locked Accounts', num:data?.lockedAccounts||0, icon:'fa-lock',            color:'#EF4444', bg:'#FEF2F2' },
  ];
  return (
    <>
      <ErrMsg msg={err}/>
      <div className="stat-cards">
        {stats.map(s=>(
          <div className="stat-card" key={s.label}>
            <div className="stat-card-accent" style={{background:s.color}}/>
            <div className="stat-card-icon" style={{background:s.bg,color:s.color}}><i className={`fa-solid ${s.icon}`}/></div>
            <div className="stat-card-num">{s.num}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="panel-card">
        <div className="panel-card-title"><i className="fa-solid fa-circle-info"/>Quick Links</div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <Link to="/panel/admin/students" className="panel-btn panel-btn-primary"><i className="fa-solid fa-user-graduate"/>Manage Students</Link>
          <Link to="/panel/admin/users"    className="panel-btn panel-btn-ghost"><i className="fa-solid fa-users"/>Manage Users</Link>
          <Link to="/panel/admin/logs"     className="panel-btn panel-btn-ghost"><i className="fa-solid fa-shield-halved"/>View Logs</Link>
        </div>
        <p style={{marginTop:'16px',fontSize:'0.88rem',color:'#64748B'}}>Active sessions: <strong>{data?.activeSessions||0}</strong> &nbsp;·&nbsp; Staff: <strong>{data?.totalStaff||0}</strong></p>
      </div>
    </>
  );
}

function Students() {
  const [rows,setRows]=useState([]); const [meta,setMeta]=useState({});
  const [search,setSearch]=useState(''); const [campus,setCampus]=useState('');
  const [page,setPage]=useState(1); const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(''); const [ok,setOk]=useState('');
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',phone:'',admissionNo:'',programme:'eChamps',grade:'',section:'',campus:'hcpur',academicYear:'2026-27'});

  const load=useCallback(()=>{
    setLoading(true);
    const q=new URLSearchParams({page,limit:15,...(search&&{search}),...(campus&&{campus})}).toString();
    adminAPI.listStudents(q).then(r=>{setRows(r.data.students||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[page,search,campus]);
  useEffect(()=>{load();},[load]);

  async function handleCreate(e){
    e.preventDefault();setErr('');setOk('');
    try{await adminAPI.createStudent(form);setOk('Student admitted successfully!');setModal(false);setForm({firstName:'',lastName:'',email:'',phone:'',admissionNo:'',programme:'eChamps',grade:'',section:'',campus:'hcpur',academicYear:'2026-27'});load();}
    catch(ex){setErr(ex.message);}
  }
  async function handleDelete(id){
    if(!window.confirm('Remove this student? This cannot be undone.'))return;
    try{await adminAPI.deleteStudent(id);setOk('Student removed.');load();}catch(ex){setErr(ex.message);}
  }

  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div className="panel-search-bar">
        <input className="panel-search-input" placeholder="Search by name or admission no…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        <select className="panel-select" value={campus} onChange={e=>{setCampus(e.target.value);setPage(1);}}>
          <option value="">All Campuses</option>
          <option value="hcpur">Harish Chandra Pur</option>
          <option value="kashimpur">Kashim Pur</option>
        </select>
        <button className="panel-btn panel-btn-primary" onClick={()=>setModal(true)}><i className="fa-solid fa-plus"/>Admit Student</button>
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:rows.length===0?<div className="panel-empty"><i className="fa-solid fa-user-graduate"/><p>No students found.</p></div>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr><th>Admission No</th><th>Name</th><th>Grade</th><th>Programme</th><th>Campus</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {rows.map(s=>(
                  <tr key={s._id}>
                    <td><strong>{s.admissionNo}</strong></td>
                    <td>{s.user?.firstName} {s.user?.lastName}</td>
                    <td>{s.grade}{s.section}</td>
                    <td><span className="badge badge-blue">{s.programme}</span></td>
                    <td className="muted">{s.campus}</td>
                    <td><span className={`badge ${s.status==='active'?'badge-green':'badge-gray'}`}>{s.status}</span></td>
                    <td><button className="panel-btn panel-btn-danger panel-btn-sm" onClick={()=>handleDelete(s._id)}><i className="fa-solid fa-trash"/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.pages>1&&<div className="panel-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total} total)</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>

      {modal&&(
        <div className="panel-modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="panel-modal">
            <div className="panel-modal-header"><h3>Admit New Student</h3><button className="panel-modal-close" onClick={()=>setModal(false)}>✕</button></div>
            <form onSubmit={handleCreate}>
              <div className="panel-form-grid">
                {[['firstName','First Name',true],['lastName','Last Name',true],['email','Email',true],['phone','Phone',false],['admissionNo','Admission No',true],['grade','Grade / Class',true],['section','Section','A'],['academicYear','Academic Year',false]].map(([k,l,req])=>(
                  <div className="panel-form-group" key={k}><label>{l}</label><input required={!!req} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>
                ))}
                <div className="panel-form-group"><label>Programme</label>
                  <select value={form.programme} onChange={e=>setForm(f=>({...f,programme:e.target.value}))}>
                    {['eKidz','eChamps','eTechno','SR.Secondary'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="panel-form-group"><label>Campus</label>
                  <select value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}>
                    <option value="hcpur">Harish Chandra Pur</option>
                    <option value="kashimpur">Kashim Pur</option>
                  </select>
                </div>
              </div>
              <div className="panel-modal-footer">
                <button type="button" className="panel-btn panel-btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="panel-btn panel-btn-primary"><i className="fa-solid fa-user-plus"/>Admit Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Users() {
  const [rows,setRows]=useState([]); const [meta,setMeta]=useState({});
  const [role,setRole]=useState(''); const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true); const [err,setErr]=useState(''); const [ok,setOk]=useState('');

  const load=useCallback(()=>{
    setLoading(true);
    const q=new URLSearchParams({page,limit:15,...(role&&{role})}).toString();
    adminAPI.listUsers(q).then(r=>{setRows(r.data.users||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[page,role]);
  useEffect(()=>{load();},[load]);

  const RBADGE={student:'badge-blue',teacher:'badge-purple',hr:'badge-green',manager:'badge-yellow',admin:'badge-red',developer:'badge-indigo'};

  async function toggleActive(u){
    try{await adminAPI.updateUser(u._id,{isActive:!u.isActive});setOk(`User ${u.isActive?'deactivated':'activated'}.`);load();}catch(ex){setErr(ex.message);}
  }
  async function handleUnlock(id){
    try{await adminAPI.unlockUser(id);setOk('Account unlocked.');load();}catch(ex){setErr(ex.message);}
  }

  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div className="panel-search-bar">
        <select className="panel-select" value={role} onChange={e=>{setRole(e.target.value);setPage(1);}}>
          <option value="">All Roles</option>
          {['student','teacher','hr','manager','admin','developer'].map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Locked</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(u=>(
                  <tr key={u._id}>
                    <td><strong>{u.firstName} {u.lastName}</strong></td>
                    <td className="muted">{u.email}</td>
                    <td><span className={`badge ${RBADGE[u.role]||'badge-gray'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.isActive?'badge-green':'badge-red'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                    <td>{u.isLocked?<span className="badge badge-red">Locked</span>:<span className="badge badge-green">OK</span>}</td>
                    <td style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      <button className="panel-btn panel-btn-ghost panel-btn-sm" onClick={()=>toggleActive(u)}>{u.isActive?'Deactivate':'Activate'}</button>
                      {u.isLocked&&<button className="panel-btn panel-btn-gold panel-btn-sm" onClick={()=>handleUnlock(u._id)}>Unlock</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length===0&&<div className="panel-empty"><i className="fa-solid fa-users"/><p>No users found.</p></div>}
          </div>
        )}
        {meta.pages>1&&<div className="panel-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages}</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
    </>
  );
}

function Logs() {
  const [tab,setTab]=useState('audit'); const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [err,setErr]=useState('');
  useEffect(()=>{
    setLoading(true);setRows([]);
    (tab==='audit'?adminAPI.auditLogs:adminAPI.securityLogs)().then(r=>setRows(r.data.logs||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[tab]);
  return (
    <>
      <ErrMsg msg={err}/>
      <div style={{display:'flex',gap:'8px',marginBottom:'18px'}}>
        {['audit','security'].map(t=><button key={t} className={`panel-btn ${tab===t?'panel-btn-primary':'panel-btn-ghost'}`} onClick={()=>setTab(t)} style={{textTransform:'capitalize'}}><i className={`fa-solid ${t==='audit'?'fa-clipboard-list':'fa-shield-halved'}`}/>{t} Logs</button>)}
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr>
                {tab==='audit'?<><th>Action</th><th>Entity</th><th>Actor</th><th>Status</th><th>Time</th></>:<><th>Event</th><th>IP</th><th>Email</th><th>Severity</th><th>Time</th></>}
              </tr></thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={i}>
                    {tab==='audit'?<>
                      <td><strong>{r.action}</strong></td><td className="muted">{r.entity}</td>
                      <td className="muted">{r.actor?.email||'system'}</td>
                      <td><span className={`badge ${r.status==='success'?'badge-green':'badge-red'}`}>{r.status}</span></td>
                      <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                    </>:<>
                      <td><strong>{r.event}</strong></td><td className="muted">{r.ip}</td>
                      <td className="muted">{r.email||r.user?.email||'—'}</td>
                      <td><span className={`badge ${r.severity==='high'||r.severity==='critical'?'badge-red':r.severity==='medium'?'badge-yellow':'badge-green'}`}>{r.severity}</span></td>
                      <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                    </>}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length===0&&<div className="panel-empty"><i className="fa-solid fa-file-lines"/><p>No logs found.</p></div>}
          </div>
        )}
      </div>
    </>
  );
}

export default function AdminPanel() {
  const loc = useLocation();
  let Content = Dashboard;
  if (loc.pathname.includes('/students')) Content = Students;
  else if (loc.pathname.includes('/users')) Content = Users;
  else if (loc.pathname.includes('/logs'))  Content = Logs;
  return <PanelLayout navItems={NAV} panelName="Admin Panel"><Content/></PanelLayout>;
}
