import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PanelLayout from '../../components/panel/PanelLayout';
import { studentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { path:'/panel/student',               icon:'fa-gauge',        label:'Dashboard'     },
  { path:'/panel/student/profile',        icon:'fa-user',         label:'My Profile'    },
  { path:'/panel/student/notifications',  icon:'fa-bell',         label:'Notifications' },
];

const Spinner = () => <div style={{display:'flex',justifyContent:'center',padding:'48px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#3B82F6',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>;
const ErrMsg = ({msg}) => msg?<div className="panel-error-msg"><i className="fa-solid fa-circle-exclamation"/>{msg}</div>:null;
const OkMsg  = ({msg}) => msg?<div className="panel-success-msg"><i className="fa-solid fa-circle-check"/>{msg}</div>:null;

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifs,  setNotifs]  = useState([]);
  const [err, setErr]         = useState('');
  useEffect(()=>{
    studentAPI.profile().then(r=>setProfile(r.data.student)).catch(e=>setErr(e.message));
    studentAPI.notifications('limit=5&unread=true').then(r=>setNotifs(r.data.notifications||[])).catch(()=>{});
  },[]);
  if(!profile&&!err) return <Spinner/>;
  return (
    <>
      <ErrMsg msg={err}/>
      <div style={{background:'linear-gradient(135deg,#1E3A5F,#2D5A8E)',borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff',display:'flex',alignItems:'center',gap:'20px'}}>
        <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(59,130,246,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',fontWeight:'800',border:'3px solid rgba(255,255,255,0.3)',flexShrink:0}}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'4px'}}>Welcome back, {user?.firstName}!</h2>
          <p style={{opacity:0.7,fontSize:'0.9rem'}}>Admission No: <strong>{profile?.admissionNo||'—'}</strong> &nbsp;·&nbsp; {profile?.programme} &nbsp;·&nbsp; Grade {profile?.grade}{profile?.section}</p>
          <p style={{opacity:0.6,fontSize:'0.82rem',marginTop:'4px'}}>Campus: {profile?.campus} &nbsp;·&nbsp; Year: {profile?.academicYear}</p>
        </div>
        <div style={{marginLeft:'auto',textAlign:'right'}}>
          <span style={{background:'rgba(255,255,255,0.15)',padding:'6px 16px',borderRadius:'999px',fontSize:'0.78rem',fontWeight:'700'}}>Student</span>
        </div>
      </div>
      <div className="stat-cards">
        <div className="stat-card"><div className="stat-card-accent" style={{background:'#3B82F6'}}/><div className="stat-card-icon" style={{background:'#EFF6FF',color:'#3B82F6'}}><i className="fa-solid fa-bell"/></div><div className="stat-card-num">{notifs.length}</div><div className="stat-card-label">Unread Notifications</div></div>
        <div className="stat-card"><div className="stat-card-accent" style={{background:'#10B981'}}/><div className="stat-card-icon" style={{background:'#F0FDF4',color:'#10B981'}}><i className="fa-solid fa-graduation-cap"/></div><div className="stat-card-num">{profile?.grade||'—'}</div><div className="stat-card-label">Current Grade</div></div>
        <div className="stat-card"><div className="stat-card-accent" style={{background:'#8B5CF6'}}/><div className="stat-card-icon" style={{background:'#F5F3FF',color:'#8B5CF6'}}><i className="fa-solid fa-book-open"/></div><div className="stat-card-num">{profile?.programme||'—'}</div><div className="stat-card-label">Programme</div></div>
        <div className="stat-card"><div className="stat-card-accent" style={{background:'#F59E0B'}}/><div className="stat-card-icon" style={{background:'#FFFBEB',color:'#F59E0B'}}><i className="fa-solid fa-location-dot"/></div><div className="stat-card-num">{profile?.campus==='hcpur'?'HCP':'KSP'}</div><div className="stat-card-label">Campus</div></div>
      </div>
      {notifs.length>0&&(
        <div className="panel-card">
          <div className="panel-card-title"><i className="fa-solid fa-bell"/>Recent Notifications</div>
          {notifs.map(n=>(
            <div key={n._id} style={{padding:'12px',borderRadius:'8px',background:'#F8FAFC',marginBottom:'8px',borderLeft:'3px solid #3B82F6'}}>
              <strong style={{fontSize:'0.88rem'}}>{n.title}</strong>
              <p style={{fontSize:'0.82rem',color:'#64748B',marginTop:'3px'}}>{n.message}</p>
            </div>
          ))}
          <Link to="/panel/student/notifications" className="panel-btn panel-btn-ghost panel-btn-sm" style={{marginTop:'8px'}}>View all notifications</Link>
        </div>
      )}
    </>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok,  setOk]  = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(()=>{
    studentAPI.profile().then(r=>{setProfile(r.data.student);setForm({ address: r.data.student.address||{}, father: r.data.student.father||{}, mother: r.data.student.mother||{} });}).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[]);

  async function handleSave(e){
    e.preventDefault();setErr('');setOk('');
    try{await studentAPI.updateProfile(form);setOk('Profile updated successfully.');setEditing(false);}catch(ex){setErr(ex.message);}
  }

  if(loading) return <Spinner/>;
  if(!profile) return <ErrMsg msg={err||'Profile not found.'}/>;

  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div className="panel-card">
        <div className="panel-card-title"><i className="fa-solid fa-user"/>Personal Information</div>
        <div className="info-grid">
          {[['Admission No',profile.admissionNo],['Programme',profile.programme],['Grade',`${profile.grade}${profile.section||''}`],['Campus',profile.campus],['Academic Year',profile.academicYear],['Status',profile.status],['Blood Group',profile.bloodGroup||'—'],['Gender',profile.gender||'—']].map(([l,v])=>(
            <div className="info-item" key={l}><label>{l}</label><span>{v}</span></div>
          ))}
        </div>
      </div>
      <div className="panel-card">
        <div className="panel-card-title" style={{justifyContent:'space-between'}}>
          <span><i className="fa-solid fa-home"/>Address &amp; Guardian Info</span>
          {!editing&&<button className="panel-btn panel-btn-ghost panel-btn-sm" onClick={()=>setEditing(true)}><i className="fa-solid fa-pen"/>Edit</button>}
        </div>
        {editing?(
          <form onSubmit={handleSave}>
            <p className="panel-section-title">Address</p>
            <div className="panel-form-grid">
              {[['street','Street'],['city','City'],['district','District'],['pincode','Pincode']].map(([k,l])=>(
                <div className="panel-form-group" key={k}><label>{l}</label><input value={form.address?.[k]||''} onChange={e=>setForm(f=>({...f,address:{...f.address,[k]:e.target.value}}))} /></div>
              ))}
            </div>
            <p className="panel-section-title">Father's Info</p>
            <div className="panel-form-grid">
              {[['name','Name'],['phone','Phone'],['occupation','Occupation'],['email','Email']].map(([k,l])=>(
                <div className="panel-form-group" key={k}><label>{l}</label><input value={form.father?.[k]||''} onChange={e=>setForm(f=>({...f,father:{...f.father,[k]:e.target.value}}))} /></div>
              ))}
            </div>
            <p className="panel-section-title">Mother's Info</p>
            <div className="panel-form-grid">
              {[['name','Name'],['phone','Phone'],['occupation','Occupation'],['email','Email']].map(([k,l])=>(
                <div className="panel-form-group" key={k}><label>{l}</label><input value={form.mother?.[k]||''} onChange={e=>setForm(f=>({...f,mother:{...f.mother,[k]:e.target.value}}))} /></div>
              ))}
            </div>
            <div className="panel-modal-footer">
              <button type="button" className="panel-btn panel-btn-ghost" onClick={()=>setEditing(false)}>Cancel</button>
              <button type="submit" className="panel-btn panel-btn-primary">Save Changes</button>
            </div>
          </form>
        ):(
          <div className="info-grid">
            {[['Street',profile.address?.street||'—'],['City',profile.address?.city||'—'],['District',profile.address?.district||'—'],['Pincode',profile.address?.pincode||'—'],["Father's Name",profile.father?.name||'—'],["Father's Phone",profile.father?.phone||'—'],["Mother's Name",profile.mother?.name||'—'],["Mother's Phone",profile.mother?.phone||'—']].map(([l,v])=>(
              <div className="info-item" key={l}><label>{l}</label><span>{v}</span></div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Notifications() {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [err,setErr]=useState(''); const [ok,setOk]=useState('');
  useEffect(()=>{ studentAPI.notifications().then(r=>setRows(r.data.notifications||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[]);
  async function markRead(id){ try{ await studentAPI.markRead(id); setRows(r=>r.map(n=>n._id===id?{...n,isRead:true}:n)); }catch(ex){setErr(ex.message);} }
  async function markAll(){ try{ await studentAPI.markAllRead(); setRows(r=>r.map(n=>({...n,isRead:true}))); setOk('All marked as read.'); }catch(ex){setErr(ex.message);} }
  const TYPE_COLOR={announcement:'#3B82F6',alert:'#EF4444',info:'#10B981',warning:'#F59E0B',system:'#8B5CF6'};
  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'16px'}}>
        <button className="panel-btn panel-btn-ghost panel-btn-sm" onClick={markAll}><i className="fa-solid fa-check-double"/>Mark all read</button>
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:rows.length===0?<div className="panel-empty"><i className="fa-solid fa-bell"/><p>No notifications yet.</p></div>:(
          rows.map(n=>(
            <div key={n._id} onClick={()=>!n.isRead&&markRead(n._id)} style={{padding:'14px 16px',borderRadius:'10px',background:n.isRead?'#F8FAFC':'#EFF6FF',marginBottom:'10px',borderLeft:`4px solid ${TYPE_COLOR[n.type]||'#64748B'}`,cursor:n.isRead?'default':'pointer',transition:'background 0.2s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px'}}>
                <strong style={{fontSize:'0.9rem',color:'#1E293B'}}>{n.title}</strong>
                {!n.isRead&&<span className="badge badge-blue" style={{flexShrink:0}}>New</span>}
              </div>
              <p style={{fontSize:'0.84rem',color:'#64748B',marginTop:'4px'}}>{n.message}</p>
              <p style={{fontSize:'0.75rem',color:'#94A3B8',marginTop:'6px'}}>{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default function StudentPanel() {
  const loc = useLocation();
  let Content = Dashboard;
  if (loc.pathname.includes('/profile'))       Content = Profile;
  if (loc.pathname.includes('/notifications')) Content = Notifications;
  return <PanelLayout navItems={NAV} panelName="Student Panel"><Content/></PanelLayout>;
}
