import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PanelLayout from '../../components/panel/PanelLayout';
import { managerAPI } from '../../utils/api';

const NAV = [
  { path:'/panel/manager',               icon:'fa-gauge',      label:'Dashboard'     },
  { path:'/panel/manager/enquiries',     icon:'fa-envelope',   label:'Enquiries'     },
  { path:'/panel/manager/broadcast',     icon:'fa-bullhorn',   label:'Broadcast'     },
  { path:'/panel/manager/reports',       icon:'fa-chart-bar',  label:'Reports'       },
];

const Spinner = () => <div style={{display:'flex',justifyContent:'center',padding:'48px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#F59E0B',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>;
const ErrMsg = ({msg}) => msg?<div className="panel-error-msg"><i className="fa-solid fa-circle-exclamation"/>{msg}</div>:null;
const OkMsg  = ({msg}) => msg?<div className="panel-success-msg"><i className="fa-solid fa-circle-check"/>{msg}</div>:null;

function Dashboard() {
  const [data,setData]=useState(null); const [err,setErr]=useState('');
  useEffect(()=>{ managerAPI.overview().then(r=>setData(r.data.overview)).catch(e=>setErr(e.message)); },[]);
  if(!data&&!err) return <Spinner/>;
  const stats=[
    { label:'Total Students',   num:data?.totalStudents||0,   icon:'fa-user-graduate',  color:'#3B82F6', bg:'#EFF6FF' },
    { label:'Active Students',  num:data?.activeStudents||0,  icon:'fa-circle-check',   color:'#10B981', bg:'#F0FDF4' },
    { label:'Total Teachers',   num:data?.totalTeachers||0,   icon:'fa-chalkboard-user',color:'#8B5CF6', bg:'#F5F3FF' },
    { label:'New Enquiries',    num:data?.newEnquiries||0,    icon:'fa-envelope',       color:'#F59E0B', bg:'#FFFBEB' },
  ];
  return (
    <>
      <ErrMsg msg={err}/>
      <div style={{background:'linear-gradient(135deg,#78350F,#D97706)',borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff'}}>
        <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'6px'}}>Manager Dashboard</h2>
        <p style={{opacity:0.75,fontSize:'0.92rem'}}>Pending enquiries: <strong>{data?.pendingEnquiries||0}</strong></p>
      </div>
      <div className="stat-cards">{stats.map(s=><div className="stat-card" key={s.label}><div className="stat-card-accent" style={{background:s.color}}/><div className="stat-card-icon" style={{background:s.bg,color:s.color}}><i className={`fa-solid ${s.icon}`}/></div><div className="stat-card-num">{s.num}</div><div className="stat-card-label">{s.label}</div></div>)}</div>
    </>
  );
}

function Enquiries() {
  const [rows,setRows]=useState([]); const [meta,setMeta]=useState({}); const [search,setSearch]=useState(''); const [status,setStatus]=useState(''); const [page,setPage]=useState(1); const [loading,setLoading]=useState(true); const [err,setErr]=useState(''); const [ok,setOk]=useState(''); const [selected,setSelected]=useState(null); const [note,setNote]=useState('');

  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(search&&{search}),...(status&&{status})}).toString(); managerAPI.listEnquiries(q).then(r=>{setRows(r.data.enquiries||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,search,status]);
  useEffect(()=>{load();},[load]);

  async function updateStatus(id,newStatus){ try{ await managerAPI.updateEnquiry(id,{status:newStatus}); setOk('Status updated.'); load(); }catch(ex){setErr(ex.message);} }
  async function addNote(){ if(!note.trim())return; try{ await managerAPI.addNote(selected._id,note); setNote(''); setOk('Note added.'); setSelected(null); }catch(ex){setErr(ex.message);} }
  async function handleDelete(id){ if(!window.confirm('Delete enquiry?'))return; try{ await managerAPI.deleteEnquiry(id); setOk('Deleted.'); load(); }catch(ex){setErr(ex.message);} }

  const STATUS_BADGE={new:'badge-blue',contacted:'badge-yellow',converted:'badge-green',closed:'badge-gray'};
  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div className="panel-search-bar">
        <input className="panel-search-input" placeholder="Search by name or phone…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        <select className="panel-select" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
          <option value="">All Status</option><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Converted</option><option value="closed">Closed</option>
        </select>
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:rows.length===0?<div className="panel-empty"><i className="fa-solid fa-envelope"/><p>No enquiries found.</p></div>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Class</th><th>Campus</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>{rows.map(e=>(
                <tr key={e._id}>
                  <td><strong>{e.name}</strong><br/><span style={{fontSize:'0.78rem',color:'#64748B'}}>{e.email||'—'}</span></td>
                  <td>{e.phone}</td>
                  <td className="muted">{e.classInterest||'—'}</td>
                  <td className="muted">{e.campus||'—'}</td>
                  <td>
                    <select className="panel-select" style={{padding:'4px 8px',fontSize:'0.78rem'}} value={e.status} onChange={ev=>updateStatus(e._id,ev.target.value)}>
                      {['new','contacted','converted','closed'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="muted">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td style={{display:'flex',gap:'4px'}}>
                    <button className="panel-btn panel-btn-ghost panel-btn-sm" onClick={()=>setSelected(e)}><i className="fa-solid fa-note-sticky"/></button>
                    <button className="panel-btn panel-btn-danger panel-btn-sm" onClick={()=>handleDelete(e._id)}><i className="fa-solid fa-trash"/></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {meta.pages>1&&<div className="panel-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
      {selected&&(
        <div className="panel-modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="panel-modal">
            <div className="panel-modal-header"><h3>Add Note — {selected.name}</h3><button className="panel-modal-close" onClick={()=>setSelected(null)}>✕</button></div>
            {selected.notes?.length>0&&(<div style={{marginBottom:'16px'}}>{selected.notes.map((n,i)=><div key={i} style={{background:'#F8FAFC',padding:'10px 12px',borderRadius:'8px',marginBottom:'6px',fontSize:'0.85rem'}}>{n.note}</div>)}</div>)}
            <div className="panel-form-group"><label>New Note</label><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Enter follow-up note…"/></div>
            <div className="panel-modal-footer"><button className="panel-btn panel-btn-ghost" onClick={()=>setSelected(null)}>Cancel</button><button className="panel-btn panel-btn-primary" onClick={addNote}>Add Note</button></div>
          </div>
        </div>
      )}
    </>
  );
}

function Broadcast() {
  const [form,setForm]=useState({title:'',message:'',recipientRole:'all',type:'announcement'}); const [err,setErr]=useState(''); const [ok,setOk]=useState(''); const [loading,setLoading]=useState(false);
  async function handleSend(e){
    e.preventDefault();setErr('');setOk('');setLoading(true);
    try{ await managerAPI.broadcast(form); setOk('Notification sent successfully!'); setForm({title:'',message:'',recipientRole:'all',type:'announcement'}); }
    catch(ex){setErr(ex.message);}finally{setLoading(false);}
  }
  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div className="panel-card">
        <div className="panel-card-title"><i className="fa-solid fa-bullhorn"/>Send Broadcast Notification</div>
        <form onSubmit={handleSend}>
          <div className="panel-form-grid">
            <div className="panel-form-group" style={{gridColumn:'1/-1'}}><label>Title *</label><input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Notification title…"/></div>
            <div className="panel-form-group" style={{gridColumn:'1/-1'}}><label>Message *</label><textarea required value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Enter your message…" style={{minHeight:'100px'}}/></div>
            <div className="panel-form-group"><label>Send To</label><select value={form.recipientRole} onChange={e=>setForm(f=>({...f,recipientRole:e.target.value}))}>
              {['all','student','teacher','hr','manager','admin'].map(r=><option key={r} value={r}>{r==='all'?'Everyone':r}</option>)}
            </select></div>
            <div className="panel-form-group"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              {['announcement','alert','info','warning'].map(t=><option key={t} value={t}>{t}</option>)}
            </select></div>
          </div>
          <div style={{marginTop:'20px'}}><button type="submit" className="panel-btn panel-btn-primary" disabled={loading}><i className="fa-solid fa-paper-plane"/>{loading?'Sending…':'Send Notification'}</button></div>
        </form>
      </div>
    </>
  );
}

function Reports() {
  const [overview,setOverview]=useState(null); const [campus,setCampus]=useState([]); const [err,setErr]=useState('');
  useEffect(()=>{
    managerAPI.overview().then(r=>setOverview(r.data.overview)).catch(e=>setErr(e.message));
    managerAPI.byCampus().then(r=>setCampus(r.data.campusBreakdown||[])).catch(()=>{});
  },[]);
  if(!overview&&!err) return <Spinner/>;
  return (
    <>
      <ErrMsg msg={err}/>
      <div className="panel-card">
        <div className="panel-card-title"><i className="fa-solid fa-chart-bar"/>Enrolment Overview</div>
        <div className="info-grid">
          {[['Total Students',overview?.totalStudents],['Active Students',overview?.activeStudents],['Total Teachers',overview?.totalTeachers],['Active Teachers',overview?.activeTeachers],['New Enquiries',overview?.newEnquiries],['Pending Enquiries',overview?.pendingEnquiries]].map(([l,v])=>(
            <div className="info-item" key={l}><label>{l}</label><span style={{fontSize:'1.3rem',fontWeight:'800',color:'#1E293B'}}>{v||0}</span></div>
          ))}
        </div>
      </div>
      <div className="panel-card">
        <div className="panel-card-title"><i className="fa-solid fa-location-dot"/>Students by Campus</div>
        {campus.length===0?<p style={{color:'#64748B',fontSize:'0.9rem'}}>No data yet.</p>:campus.map(c=>(
          <div key={c._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#F8FAFC',borderRadius:'8px',marginBottom:'8px'}}>
            <span style={{fontWeight:'600',textTransform:'capitalize'}}>{c._id==='hcpur'?'Harish Chandra Pur':'Kashim Pur'}</span>
            <span style={{background:'#0B1F3A',color:'#C9A84C',padding:'4px 16px',borderRadius:'999px',fontWeight:'700',fontSize:'0.9rem'}}>{c.count} students</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ManagerPanel() {
  const loc = useLocation();
  let Content = Dashboard;
  if(loc.pathname.includes('/enquiries')) Content = Enquiries;
  else if(loc.pathname.includes('/broadcast')) Content = Broadcast;
  else if(loc.pathname.includes('/reports'))   Content = Reports;
  return <PanelLayout navItems={NAV} panelName="Manager Panel"><Content/></PanelLayout>;
}
