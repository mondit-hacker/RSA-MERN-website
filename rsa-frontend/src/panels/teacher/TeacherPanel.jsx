import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PanelLayout from '../../components/panel/PanelLayout';
import { teacherAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { path:'/panel/teacher',               icon:'fa-gauge',         label:'Dashboard'     },
  { path:'/panel/teacher/students',      icon:'fa-user-graduate', label:'My Students'   },
  { path:'/panel/teacher/notifications', icon:'fa-bell',          label:'Notifications' },
  { path:'/panel/teacher/profile',       icon:'fa-user',          label:'My Profile'    },
];

const Spinner = () => <div style={{display:'flex',justifyContent:'center',padding:'48px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#8B5CF6',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>;
const ErrMsg = ({msg}) => msg?<div className="panel-error-msg"><i className="fa-solid fa-circle-exclamation"/>{msg}</div>:null;
const OkMsg  = ({msg}) => msg?<div className="panel-success-msg"><i className="fa-solid fa-circle-check"/>{msg}</div>:null;

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [err, setErr] = useState('');
  useEffect(()=>{
    teacherAPI.profile().then(r=>setProfile(r.data.teacher)).catch(e=>setErr(e.message));
    teacherAPI.myStudents('limit=5').then(r=>setStudents(r.data.students||[])).catch(()=>{});
  },[]);
  if(!profile&&!err) return <Spinner/>;
  return (
    <>
      <ErrMsg msg={err}/>
      <div style={{background:'linear-gradient(135deg,#2D1B4E,#5B21B6)',borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff',display:'flex',alignItems:'center',gap:'20px'}}>
        <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(139,92,246,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',fontWeight:'800',border:'3px solid rgba(255,255,255,0.3)',flexShrink:0}}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'4px'}}>Welcome, {user?.firstName}!</h2>
          <p style={{opacity:0.7,fontSize:'0.9rem'}}>{profile?.designation} &nbsp;·&nbsp; Employee ID: {profile?.employeeId}</p>
          <p style={{opacity:0.6,fontSize:'0.82rem',marginTop:'4px'}}>Subjects: {profile?.subjects?.join(', ')||'—'} &nbsp;·&nbsp; Campus: {profile?.campus}</p>
        </div>
        <div style={{marginLeft:'auto'}}><span style={{background:'rgba(255,255,255,0.15)',padding:'6px 16px',borderRadius:'999px',fontSize:'0.78rem',fontWeight:'700'}}>Teacher</span></div>
      </div>
      <div className="stat-cards">
        <div className="stat-card"><div className="stat-card-accent" style={{background:'#8B5CF6'}}/><div className="stat-card-icon" style={{background:'#F5F3FF',color:'#8B5CF6'}}><i className="fa-solid fa-user-graduate"/></div><div className="stat-card-num">{students.length}+</div><div className="stat-card-label">My Students</div></div>
        <div className="stat-card"><div className="stat-card-accent" style={{background:'#3B82F6'}}/><div className="stat-card-icon" style={{background:'#EFF6FF',color:'#3B82F6'}}><i className="fa-solid fa-book"/></div><div className="stat-card-num">{profile?.subjects?.length||0}</div><div className="stat-card-label">Subjects</div></div>
        <div className="stat-card"><div className="stat-card-accent" style={{background:'#10B981'}}/><div className="stat-card-icon" style={{background:'#F0FDF4',color:'#10B981'}}><i className="fa-solid fa-chalkboard"/></div><div className="stat-card-num">{profile?.grades?.length||0}</div><div className="stat-card-label">Grades</div></div>
        <div className="stat-card"><div className="stat-card-accent" style={{background:'#F59E0B'}}/><div className="stat-card-icon" style={{background:'#FFFBEB',color:'#F59E0B'}}><i className="fa-solid fa-briefcase"/></div><div className="stat-card-num">{profile?.experience?.total||0}y</div><div className="stat-card-label">Experience</div></div>
      </div>
      {students.length>0&&(
        <div className="panel-card">
          <div className="panel-card-title"><i className="fa-solid fa-user-graduate"/>Recent Students</div>
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr><th>Admission No</th><th>Name</th><th>Grade</th><th>Campus</th></tr></thead>
              <tbody>{students.map(s=><tr key={s._id}><td>{s.admissionNo}</td><td>{s.user?.firstName} {s.user?.lastName}</td><td>{s.grade}{s.section}</td><td>{s.campus}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function MyStudents() {
  const [rows,setRows]=useState([]); const [meta,setMeta]=useState({}); const [search,setSearch]=useState(''); const [page,setPage]=useState(1); const [loading,setLoading]=useState(true); const [err,setErr]=useState('');
  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(search&&{search})}).toString(); teacherAPI.myStudents(q).then(r=>{setRows(r.data.students||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,search]);
  useEffect(()=>{load();},[load]);
  return (
    <>
      <ErrMsg msg={err}/>
      <div className="panel-search-bar"><input className="panel-search-input" placeholder="Search students…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
      <div className="panel-card">
        {loading?<Spinner/>:rows.length===0?<div className="panel-empty"><i className="fa-solid fa-user-graduate"/><p>No students found.</p></div>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr><th>Admission No</th><th>Name</th><th>Grade</th><th>Section</th><th>Programme</th><th>Campus</th><th>Status</th></tr></thead>
              <tbody>{rows.map(s=><tr key={s._id}><td><strong>{s.admissionNo}</strong></td><td>{s.user?.firstName} {s.user?.lastName}</td><td>{s.grade}</td><td>{s.section||'—'}</td><td><span className="badge badge-blue">{s.programme}</span></td><td className="muted">{s.campus}</td><td><span className={`badge ${s.status==='active'?'badge-green':'badge-gray'}`}>{s.status}</span></td></tr>)}</tbody>
            </table>
          </div>
        )}
        {meta.pages>1&&<div className="panel-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
    </>
  );
}

function Notifications() {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [err,setErr]=useState('');
  useEffect(()=>{ teacherAPI.notifications().then(r=>setRows(r.data.notifications||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[]);
  async function markRead(id){ try{ await teacherAPI.markRead(id); setRows(r=>r.map(n=>n._id===id?{...n,isRead:true}:n)); }catch(ex){setErr(ex.message);} }
  return (
    <>
      <ErrMsg msg={err}/>
      <div className="panel-card">
        {loading?<Spinner/>:rows.length===0?<div className="panel-empty"><i className="fa-solid fa-bell"/><p>No notifications.</p></div>:(
          rows.map(n=>(
            <div key={n._id} onClick={()=>!n.isRead&&markRead(n._id)} style={{padding:'14px 16px',borderRadius:'10px',background:n.isRead?'#F8FAFC':'#F5F3FF',marginBottom:'10px',borderLeft:'4px solid #8B5CF6',cursor:n.isRead?'default':'pointer'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><strong style={{fontSize:'0.9rem'}}>{n.title}</strong>{!n.isRead&&<span className="badge badge-purple">New</span>}</div>
              <p style={{fontSize:'0.84rem',color:'#64748B',marginTop:'4px'}}>{n.message}</p>
              <p style={{fontSize:'0.75rem',color:'#94A3B8',marginTop:'6px'}}>{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null); const [loading,setLoading]=useState(true); const [err,setErr]=useState(''); const [ok,setOk]=useState(''); const [editing,setEditing]=useState(false); const [subjects,setSubjects]=useState('');
  useEffect(()=>{ teacherAPI.profile().then(r=>{setProfile(r.data.teacher);setSubjects((r.data.teacher.subjects||[]).join(', '));}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[]);
  async function handleSave(e){ e.preventDefault();setErr('');setOk(''); try{ await teacherAPI.updateProfile({ subjects: subjects.split(',').map(s=>s.trim()).filter(Boolean) }); setOk('Profile updated.'); setEditing(false); }catch(ex){setErr(ex.message);} }
  if(loading) return <Spinner/>;
  if(!profile) return <ErrMsg msg={err||'Profile not found.'}/>;
  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div className="panel-card">
        <div className="panel-card-title" style={{justifyContent:'space-between'}}><span><i className="fa-solid fa-chalkboard-user"/>Teacher Profile</span>{!editing&&<button className="panel-btn panel-btn-ghost panel-btn-sm" onClick={()=>setEditing(true)}><i className="fa-solid fa-pen"/>Edit</button>}</div>
        <div className="info-grid">
          {[['Employee ID',profile.employeeId],['Designation',profile.designation],['Department',profile.department||'—'],['Campus',profile.campus],['Employment Type',profile.employmentType],['Status',profile.status],['Total Experience',`${profile.experience?.total||0} years`],['At School',`${profile.experience?.atSchool||0} years`]].map(([l,v])=>(
            <div className="info-item" key={l}><label>{l}</label><span>{v}</span></div>
          ))}
        </div>
        {editing?(
          <form onSubmit={handleSave} style={{marginTop:'16px'}}>
            <div className="panel-form-group"><label>Subjects (comma separated)</label><input value={subjects} onChange={e=>setSubjects(e.target.value)}/></div>
            <div className="panel-modal-footer"><button type="button" className="panel-btn panel-btn-ghost" onClick={()=>setEditing(false)}>Cancel</button><button type="submit" className="panel-btn panel-btn-primary">Save</button></div>
          </form>
        ):(
          <div style={{marginTop:'16px'}}>
            <p className="panel-section-title">Subjects</p>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>{profile.subjects?.map(s=><span key={s} className="badge badge-purple">{s}</span>)||<span style={{color:'#94A3B8',fontSize:'0.88rem'}}>None assigned</span>}</div>
            <p className="panel-section-title">Grades</p>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>{profile.grades?.map(g=><span key={g} className="badge badge-blue">Grade {g}</span>)||<span style={{color:'#94A3B8',fontSize:'0.88rem'}}>None assigned</span>}</div>
          </div>
        )}
      </div>
    </>
  );
}

export default function TeacherPanel() {
  const loc = useLocation();
  let Content = Dashboard;
  if(loc.pathname.includes('/students'))      Content = MyStudents;
  if(loc.pathname.includes('/notifications')) Content = Notifications;
  if(loc.pathname.includes('/profile'))       Content = Profile;
  return <PanelLayout navItems={NAV} panelName="Teacher Panel"><Content/></PanelLayout>;
}
