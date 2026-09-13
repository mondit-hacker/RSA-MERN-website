import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PanelLayout from '../../components/panel/PanelLayout';
import { hrAPI } from '../../utils/api';

const NAV = [
  { path:'/panel/hr',           icon:'fa-gauge',         label:'Dashboard' },
  { path:'/panel/hr/teachers',  icon:'fa-chalkboard-user',label:'Teachers' },
  { path:'/panel/hr/staff',     icon:'fa-user-tie',      label:'Staff'     },
  { path:'/panel/hr/students',  icon:'fa-user-graduate', label:'Students'  },
];

const Spinner = () => <div style={{display:'flex',justifyContent:'center',padding:'48px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#10B981',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>;
const ErrMsg = ({msg}) => msg?<div className="panel-error-msg"><i className="fa-solid fa-circle-exclamation"/>{msg}</div>:null;
const OkMsg  = ({msg}) => msg?<div className="panel-success-msg"><i className="fa-solid fa-circle-check"/>{msg}</div>:null;

function Dashboard() {
  const [teachers, setTeachers] = useState(0);
  const [staff,    setStaff]    = useState(0);
  const [students, setStudents] = useState(0);
  const [err, setErr] = useState('');
  useEffect(()=>{
    hrAPI.listTeachers('limit=1').then(r=>setTeachers(r.meta?.total||0)).catch(e=>setErr(e.message));
    hrAPI.listStaff('limit=1').then(r=>setStaff(r.meta?.total||0)).catch(()=>{});
    hrAPI.listStudents('limit=1').then(r=>setStudents(r.meta?.total||0)).catch(()=>{});
  },[]);
  const stats = [
    { label:'Total Teachers', num:teachers, icon:'fa-chalkboard-user', color:'#10B981', bg:'#F0FDF4' },
    { label:'Total Staff',    num:staff,    icon:'fa-user-tie',         color:'#3B82F6', bg:'#EFF6FF' },
    { label:'Total Students', num:students, icon:'fa-user-graduate',    color:'#8B5CF6', bg:'#F5F3FF' },
    { label:'HR Panel',       num:'Active', icon:'fa-shield-halved',    color:'#F59E0B', bg:'#FFFBEB' },
  ];
  return (
    <>
      <ErrMsg msg={err}/>
      <div style={{background:'linear-gradient(135deg,#065F46,#059669)',borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff'}}>
        <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'6px'}}>HR Management Panel</h2>
        <p style={{opacity:0.75,fontSize:'0.92rem'}}>Manage teachers, staff, and view student records.</p>
      </div>
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
    </>
  );
}

function Teachers() {
  const [rows,setRows]=useState([]); const [meta,setMeta]=useState({}); const [search,setSearch]=useState(''); const [campus,setCampus]=useState(''); const [page,setPage]=useState(1); const [loading,setLoading]=useState(true); const [err,setErr]=useState(''); const [ok,setOk]=useState(''); const [modal,setModal]=useState(false);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',phone:'',employeeId:'',campus:'hcpur',designation:'',department:'',subjects:'',grades:'',joiningDate:''});

  const load=useCallback(()=>{
    setLoading(true);
    const q=new URLSearchParams({page,limit:15,...(search&&{search}),...(campus&&{campus})}).toString();
    hrAPI.listTeachers(q).then(r=>{setRows(r.data.teachers||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[page,search,campus]);
  useEffect(()=>{load();},[load]);

  async function handleCreate(e){
    e.preventDefault();setErr('');setOk('');
    const body={...form, subjects:form.subjects.split(',').map(s=>s.trim()).filter(Boolean), grades:form.grades.split(',').map(s=>s.trim()).filter(Boolean)};
    try{await hrAPI.createTeacher(body);setOk('Teacher created! Welcome email sent.');setModal(false);setForm({firstName:'',lastName:'',email:'',phone:'',employeeId:'',campus:'hcpur',designation:'',department:'',subjects:'',grades:'',joiningDate:''});load();}
    catch(ex){setErr(ex.message);}
  }
  async function handleDelete(id){ if(!window.confirm('Remove this teacher?'))return; try{await hrAPI.deleteTeacher(id);setOk('Teacher removed.');load();}catch(ex){setErr(ex.message);} }

  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div className="panel-search-bar">
        <input className="panel-search-input" placeholder="Search teachers…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        <select className="panel-select" value={campus} onChange={e=>{setCampus(e.target.value);setPage(1);}}>
          <option value="">All Campuses</option><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option>
        </select>
        <button className="panel-btn panel-btn-primary" onClick={()=>setModal(true)}><i className="fa-solid fa-plus"/>Add Teacher</button>
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:rows.length===0?<div className="panel-empty"><i className="fa-solid fa-chalkboard-user"/><p>No teachers found.</p></div>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr><th>Employee ID</th><th>Name</th><th>Designation</th><th>Subjects</th><th>Campus</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{rows.map(t=>(
                <tr key={t._id}>
                  <td><strong>{t.employeeId}</strong></td>
                  <td>{t.user?.firstName} {t.user?.lastName}</td>
                  <td className="muted">{t.designation}</td>
                  <td>{t.subjects?.slice(0,2).map(s=><span key={s} className="badge badge-purple" style={{marginRight:'4px'}}>{s}</span>)}</td>
                  <td className="muted">{t.campus}</td>
                  <td><span className={`badge ${t.status==='active'?'badge-green':'badge-gray'}`}>{t.status}</span></td>
                  <td><button className="panel-btn panel-btn-danger panel-btn-sm" onClick={()=>handleDelete(t._id)}><i className="fa-solid fa-trash"/></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {meta.pages>1&&<div className="panel-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
      {modal&&(
        <div className="panel-modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="panel-modal">
            <div className="panel-modal-header"><h3>Add New Teacher</h3><button className="panel-modal-close" onClick={()=>setModal(false)}>✕</button></div>
            <form onSubmit={handleCreate}>
              <div className="panel-form-grid">
                {[['firstName','First Name',true],['lastName','Last Name',true],['email','Email',true],['phone','Phone',false],['employeeId','Employee ID',true],['designation','Designation',true],['department','Department',false],['subjects','Subjects (comma separated)',false],['grades','Grades (comma separated)',false]].map(([k,l,req])=>(
                  <div className="panel-form-group" key={k}><label>{l}</label><input required={!!req} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>
                ))}
                <div className="panel-form-group"><label>Joining Date</label><input type="date" value={form.joiningDate} onChange={e=>setForm(f=>({...f,joiningDate:e.target.value}))}/></div>
                <div className="panel-form-group"><label>Campus</label><select value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option><option value="both">Both</option></select></div>
              </div>
              <div className="panel-modal-footer"><button type="button" className="panel-btn panel-btn-ghost" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="panel-btn panel-btn-primary"><i className="fa-solid fa-plus"/>Add Teacher</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Staff() {
  const [rows,setRows]=useState([]); const [meta,setMeta]=useState({}); const [page,setPage]=useState(1); const [loading,setLoading]=useState(true); const [err,setErr]=useState(''); const [ok,setOk]=useState(''); const [modal,setModal]=useState(false);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',phone:'',role:'hr',employeeId:'',campus:'both',designation:'',department:'',joiningDate:''});

  const load=useCallback(()=>{ setLoading(true); hrAPI.listStaff(`page=${page}&limit=15`).then(r=>{setRows(r.data.staff||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page]);
  useEffect(()=>{load();},[load]);

  async function handleCreate(e){
    e.preventDefault();setErr('');setOk('');
    try{await hrAPI.createStaff(form);setOk('Staff member created!');setModal(false);setForm({firstName:'',lastName:'',email:'',phone:'',role:'hr',employeeId:'',campus:'both',designation:'',department:'',joiningDate:''});load();}
    catch(ex){setErr(ex.message);}
  }
  async function handleDelete(id){ if(!window.confirm('Remove this staff member?'))return; try{await hrAPI.deleteStaff(id);setOk('Staff removed.');load();}catch(ex){setErr(ex.message);} }

  const RBADGE={hr:'badge-green',manager:'badge-yellow'};
  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'16px'}}>
        <button className="panel-btn panel-btn-primary" onClick={()=>setModal(true)}><i className="fa-solid fa-plus"/>Add Staff</button>
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:rows.length===0?<div className="panel-empty"><i className="fa-solid fa-user-tie"/><p>No staff found.</p></div>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr><th>Employee ID</th><th>Name</th><th>Role</th><th>Designation</th><th>Campus</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{rows.map(s=>(
                <tr key={s._id}>
                  <td><strong>{s.employeeId}</strong></td>
                  <td>{s.user?.firstName} {s.user?.lastName}</td>
                  <td><span className={`badge ${RBADGE[s.role]||'badge-gray'}`}>{s.role}</span></td>
                  <td className="muted">{s.designation||'—'}</td>
                  <td className="muted">{s.campus}</td>
                  <td><span className={`badge ${s.status==='active'?'badge-green':'badge-gray'}`}>{s.status}</span></td>
                  <td><button className="panel-btn panel-btn-danger panel-btn-sm" onClick={()=>handleDelete(s._id)}><i className="fa-solid fa-trash"/></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {meta.pages>1&&<div className="panel-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages}</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
      {modal&&(
        <div className="panel-modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="panel-modal">
            <div className="panel-modal-header"><h3>Add Staff Member</h3><button className="panel-modal-close" onClick={()=>setModal(false)}>✕</button></div>
            <form onSubmit={handleCreate}>
              <div className="panel-form-grid">
                {[['firstName','First Name',true],['lastName','Last Name',true],['email','Email',true],['phone','Phone',false],['employeeId','Employee ID',true],['designation','Designation',false],['department','Department',false]].map(([k,l,req])=>(
                  <div className="panel-form-group" key={k}><label>{l}</label><input required={!!req} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>
                ))}
                <div className="panel-form-group"><label>Role</label><select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}><option value="hr">HR</option><option value="manager">Manager</option></select></div>
                <div className="panel-form-group"><label>Campus</label><select value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option><option value="both">Both</option></select></div>
                <div className="panel-form-group"><label>Joining Date</label><input type="date" value={form.joiningDate} onChange={e=>setForm(f=>({...f,joiningDate:e.target.value}))}/></div>
              </div>
              <div className="panel-modal-footer"><button type="button" className="panel-btn panel-btn-ghost" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="panel-btn panel-btn-primary"><i className="fa-solid fa-plus"/>Add Staff</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Students() {
  const [rows,setRows]=useState([]); const [meta,setMeta]=useState({}); const [search,setSearch]=useState(''); const [campus,setCampus]=useState(''); const [page,setPage]=useState(1); const [loading,setLoading]=useState(true); const [err,setErr]=useState('');
  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(search&&{search}),...(campus&&{campus})}).toString(); hrAPI.listStudents(q).then(r=>{setRows(r.data.students||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,search,campus]);
  useEffect(()=>{load();},[load]);
  return (
    <>
      <ErrMsg msg={err}/>
      <div className="panel-search-bar">
        <input className="panel-search-input" placeholder="Search students…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        <select className="panel-select" value={campus} onChange={e=>{setCampus(e.target.value);setPage(1);}}>
          <option value="">All Campuses</option><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option>
        </select>
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:rows.length===0?<div className="panel-empty"><i className="fa-solid fa-user-graduate"/><p>No students found.</p></div>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr><th>Admission No</th><th>Name</th><th>Grade</th><th>Programme</th><th>Campus</th><th>Status</th></tr></thead>
              <tbody>{rows.map(s=><tr key={s._id}><td><strong>{s.admissionNo}</strong></td><td>{s.user?.firstName} {s.user?.lastName}</td><td>{s.grade}{s.section}</td><td><span className="badge badge-blue">{s.programme}</span></td><td className="muted">{s.campus}</td><td><span className={`badge ${s.status==='active'?'badge-green':'badge-gray'}`}>{s.status}</span></td></tr>)}</tbody>
            </table>
          </div>
        )}
        {meta.pages>1&&<div className="panel-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
    </>
  );
}

export default function HRPanel() {
  const loc = useLocation();
  let Content = Dashboard;
  if(loc.pathname.includes('/teachers')) Content = Teachers;
  else if(loc.pathname.includes('/staff'))    Content = Staff;
  else if(loc.pathname.includes('/students')) Content = Students;
  return <PanelLayout navItems={NAV} panelName="HR Panel"><Content/></PanelLayout>;
}
