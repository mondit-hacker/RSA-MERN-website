import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Shell from '../../core/ui/Shell';
import { managerService, complaintService, analyticsService } from '../../core/net/client';

const NAV=[
  {to:'/workspace/ops',           icon:'fa-gauge',    label:'Overview'},
  {to:'/workspace/ops/pipeline',  icon:'fa-envelope', label:'Enquiries'},
  {to:'/workspace/ops/complaints',icon:'fa-comment-dots',label:'Complaints'},
  {to:'/workspace/ops/announce',  icon:'fa-bullhorn', label:'Broadcast'},
  {to:'/workspace/ops/insights',  icon:'fa-chart-bar',label:'Analytics'},
];

const PIE_COLORS=['#3B82F6','#F59E0B','#10B981','#64748B'];
const Spin=()=><div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#F59E0B',borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>;
const Err=({m})=>m?<div className="c-err"><i className="fa-solid fa-circle-exclamation"/>{m}</div>:null;
const Ok=({m})=>m?<div className="c-ok"><i className="fa-solid fa-circle-check"/>{m}</div>:null;

function Overview(){
  const [d,setD]=useState(null);const [err,setErr]=useState('');
  useEffect(()=>{ managerService.overview().then(r=>setD(r.data.overview)).catch(e=>setErr(e.message)); },[]);
  if(!d&&!err) return <Spin/>;
  return (
    <>
      <Err m={err}/>
      <div style={{background:'linear-gradient(135deg,#78350F,#D97706)',borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff'}}>
        <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'5px'}}>Operations Dashboard</h2>
        <p style={{opacity:.72,fontSize:'.9rem'}}>Pending enquiries: <strong>{d?.pendingEnquiries||0}</strong> · Open complaints: <strong>{d?.openComplaints||0}</strong></p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
        {[['Total Students',d?.totalStudents||0,'fa-user-graduate','#3B82F6','#EFF6FF'],['Active Students',d?.activeStudents||0,'fa-circle-check','#10B981','#F0FDF4'],['Total Teachers',d?.totalTeachers||0,'fa-chalkboard-user','#8B5CF6','#F5F3FF'],['New Enquiries',d?.newEnquiriesMonth||0,'fa-envelope','#F59E0B','#FFFBEB']].map(([l,n,i,c,bg])=>(
          <div className="c-stat" key={l}><div className="c-stat-bar" style={{background:c}}/><div className="c-stat-ico" style={{background:bg,color:c}}><i className={`fa-solid ${i}`}/></div><div className="c-stat-num">{n}</div><div className="c-stat-lbl">{l}</div></div>
        ))}
      </div>
    </>
  );
}

function Pipeline(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [search,setSearch]=useState('');const [status,setStatus]=useState('');const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [sel,setSel]=useState(null);const [note,setNote]=useState('');
  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(search&&{search}),...(status&&{status})}).toString(); managerService.listEnquiries(q).then(r=>{setRows(r.data.enquiries||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,search,status]);
  useEffect(()=>{load();},[load]);
  async function updateStatus(id,st){try{await managerService.updateEnquiry(id,{status:st});setOk('Updated.');load();}catch(ex){setErr(ex.message);}}
  async function addNote(){if(!note.trim())return;try{await managerService.addNote(sel._id,note);setNote('');setOk('Note added.');setSel(null);}catch(ex){setErr(ex.message);}}
  async function remove(id){if(!confirm('Delete?'))return;try{await managerService.deleteEnquiry(id);setOk('Deleted.');load();}catch(ex){setErr(ex.message);}}
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-sb">
        <input className="c-inp" placeholder="Search name/phone…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} pattern="[A-Za-z0-9 +\-]*" maxLength={50}/>
        <select className="c-sel" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
          <option value="">All</option><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Converted</option><option value="closed">Closed</option>
        </select>
      </div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-envelope"/><p>No enquiries.</p></div>:
          <div className="c-tw"><table className="c-t">
            <thead><tr><th>Name</th><th>Phone</th><th>Class</th><th>Campus</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>{rows.map(r=>(
              <tr key={r._id}>
                <td><strong>{r.name}</strong><br/><span style={{fontSize:'.75rem',color:'#64748B'}}>{r.email||'—'}</span></td>
                <td>{r.phone}</td><td className="mt">{r.classInterest||'—'}</td><td className="mt">{r.campus||'—'}</td>
                <td><select className="c-sel" style={{padding:'3px 7px',fontSize:'.76rem'}} value={r.status} onChange={ev=>updateStatus(r._id,ev.target.value)}>{['new','contacted','converted','closed'].map(s=><option key={s}>{s}</option>)}</select></td>
                <td className="mt">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td style={{display:'flex',gap:'4px'}}>
                  <button className="c-btn c-btn-gh c-btn-sm" onClick={()=>setSel(r)}><i className="fa-solid fa-note-sticky"/></button>
                  <button className="c-btn c-btn-rd c-btn-sm" onClick={()=>remove(r._id)}><i className="fa-solid fa-trash"/></button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
      {sel&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setSel(null)}><div className="c-md">
        <div className="c-md-hd"><h3>Notes — {sel.name}</h3><button className="c-md-cl" onClick={()=>setSel(null)}>✕</button></div>
        {sel.notes?.length>0&&<div style={{marginBottom:'14px'}}>{sel.notes.map((n,i)=><div key={i} style={{background:'#F8FAFC',padding:'9px 11px',borderRadius:'7px',marginBottom:'6px',fontSize:'.84rem'}}>{n.note}</div>)}</div>}
        <div className="c-fgp"><label>New Note</label><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Follow-up note…" maxLength={500} style={{minHeight:'80px'}}/></div>
        <div className="c-md-ft"><button className="c-btn c-btn-gh" onClick={()=>setSel(null)}>Cancel</button><button className="c-btn c-btn-dk" onClick={addNote}>Add</button></div>
      </div></div>}
    </>
  );
}

function Complaints(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [status,setStatus]=useState('');const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [sel,setSel]=useState(null);const [resp,setResp]=useState('');
  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(status&&{status})}).toString(); complaintService.list(q).then(r=>{setRows(r.data.complaints||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,status]);
  useEffect(()=>{load();},[load]);
  async function respond(ev){ev.preventDefault();setErr('');setOk('');try{await complaintService.respond(sel._id,{response:resp,status:'resolved'});setOk('Response sent.');setSel(null);load();}catch(ex){setErr(ex.message);}}
  const PB={low:'bd-g',medium:'bd-y',high:'bd-r'};
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-sb">
        <select className="c-sel" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
          <option value="">All</option><option value="open">Open</option><option value="in-review">In Review</option><option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-comment-dots"/><p>No complaints.</p></div>:
          <div className="c-tw"><table className="c-t">
            <thead><tr><th>From</th><th>Subject</th><th>Type</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>{rows.map(c=><tr key={c._id}><td><strong>{c.from?.firstName} {c.from?.lastName}</strong><br/><span style={{fontSize:'.74rem',color:'#64748B'}}>{c.fromRole}</span></td><td style={{maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.subject}</td><td><span className="bd bd-b">{c.type}</span></td><td><span className={`bd ${PB[c.priority]||'bd-gr'}`}>{c.priority}</span></td><td><span className={`bd ${c.status==='resolved'?'bd-g':c.status==='open'?'bd-r':'bd-y'}`}>{c.status}</span></td><td className="mt">{new Date(c.createdAt).toLocaleDateString()}</td><td><button className="c-btn c-btn-dk c-btn-sm" onClick={()=>{setSel(c);setResp(c.response||'');}}>View</button></td></tr>)}</tbody>
          </table></div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages}</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
      {sel&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setSel(null)}><div className="c-md">
        <div className="c-md-hd"><h3>{sel.subject}</h3><button className="c-md-cl" onClick={()=>setSel(null)}>✕</button></div>
        <div style={{background:'#F8FAFC',borderRadius:'8px',padding:'14px',marginBottom:'14px'}}><p style={{fontSize:'.82rem',color:'#64748B',marginBottom:'6px'}}>From: <strong>{sel.from?.firstName} {sel.from?.lastName}</strong> ({sel.fromRole})</p><p style={{fontSize:'.9rem',color:'#1E293B',lineHeight:1.65}}>{sel.message}</p></div>
        {sel.status!=='resolved'&&<form onSubmit={respond}>
          <div className="c-fgp"><label>Response*</label><textarea required value={resp} onChange={e=>setResp(e.target.value)} maxLength={2000} style={{minHeight:'80px'}}/></div>
          <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setSel(null)}>Cancel</button><button type="submit" className="c-btn c-btn-ok">Send Response</button></div>
        </form>}
      </div></div>}
    </>
  );
}

function Announce(){
  const [form,setForm]=useState({title:'',message:'',recipientRole:'all',type:'announcement'});const [err,setErr]=useState('');const [ok,setOk]=useState('');const [loading,setLoading]=useState(false);
  async function send(ev){ev.preventDefault();setErr('');setOk('');setLoading(true);try{await managerService.broadcast(form);setOk('Broadcast sent!');setForm({title:'',message:'',recipientRole:'all',type:'announcement'});}catch(ex){setErr(ex.message);}finally{setLoading(false);}}
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-card">
        <div className="c-card-hd"><i className="fa-solid fa-bullhorn"/>Send Broadcast Notification</div>
        <form onSubmit={send}><div className="c-fg">
          <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Title*</label><input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} pattern="[A-Za-z0-9 ,.'!?\-]{3,200}" maxLength={200}/></div>
          <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Message*</label><textarea required value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} maxLength={2000} style={{minHeight:'100px'}}/></div>
          <div className="c-fgp"><label>Send To</label><select value={form.recipientRole} onChange={e=>setForm(f=>({...f,recipientRole:e.target.value}))}>{['all','student','teacher','hr','manager','admin'].map(r=><option key={r} value={r}>{r==='all'?'Everyone':r}</option>)}</select></div>
          <div className="c-fgp"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{['announcement','alert','info','warning'].map(t=><option key={t}>{t}</option>)}</select></div>
        </div><div style={{marginTop:'16px'}}><button type="submit" className="c-btn c-btn-dk" disabled={loading}><i className="fa-solid fa-paper-plane"/>{loading?'Sending…':'Send'}</button></div></form>
      </div>
    </>
  );
}

function Insights(){
  const [ov,setOv]=useState(null);const [campus,setCampus]=useState([]);const [prog,setProg]=useState([]);const [funnel,setFunnel]=useState([]);const [err,setErr]=useState('');
  useEffect(()=>{
    managerService.overview().then(r=>setOv(r.data.overview)).catch(e=>setErr(e.message));
    managerService.byCampus().then(r=>setCampus(r.data.campusBreakdown||[])).catch(()=>{});
    analyticsService.programmes().then(r=>setProg(r.data.programmes||[])).catch(()=>{});
    analyticsService.enquiryFunnel().then(r=>setFunnel(r.data.funnel||[])).catch(()=>{});
  },[]);
  if(!ov&&!err) return <Spin/>;
  const PIE=['#0B1F3A','#C9A84C','#10B981','#3B82F6'];
  return (
    <>
      <Err m={err}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'20px'}}>
        {[['Total Students',ov?.totalStudents],['Active Students',ov?.activeStudents],['Total Teachers',ov?.totalTeachers],['New Enquiries',ov?.newEnquiriesMonth],['Pending Enquiries',ov?.pendingEnquiries],['Open Complaints',ov?.openComplaints]].map(([l,v])=>(
          <div key={l} style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:'12px',padding:'16px'}}><div style={{fontSize:'1.5rem',fontWeight:'800',color:'#1E293B'}}>{v||0}</div><div style={{fontSize:'.78rem',color:'#64748B',fontWeight:600,marginTop:'4px'}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div className="c-card"><div className="c-card-hd"><i className="fa-solid fa-chart-pie"/>Programme Distribution</div>
          {prog.length>0?<ResponsiveContainer width="100%" height={200}><PieChart><Pie data={prog.map(p=>({name:p._id,value:p.count}))} dataKey="value" cx="50%" cy="50%" outerRadius={75} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>{prog.map((_,i)=><Cell key={i} fill={PIE[i%PIE.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>:<div className="c-empty"><i className="fa-solid fa-chart-pie"/><p>No data</p></div>}
        </div>
        <div className="c-card"><div className="c-card-hd"><i className="fa-solid fa-filter"/>Enquiry Funnel</div>
          {funnel.length>0?<ResponsiveContainer width="100%" height={200}><BarChart data={funnel.map(f=>({name:f._id,value:f.count}))} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis type="number" tick={{fontSize:11}} allowDecimals={false}/><YAxis type="category" dataKey="name" tick={{fontSize:11}} width={75}/><Tooltip/><Bar dataKey="value" fill="#0B1F3A" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer>:<div className="c-empty"><i className="fa-solid fa-filter"/><p>No data</p></div>}
        </div>
      </div>
    </>
  );
}

export default function V5(){
  const loc=useLocation();
  let C=Overview;
  if(loc.pathname.includes('/pipeline'))   C=Pipeline;
  if(loc.pathname.includes('/complaints')) C=Complaints;
  if(loc.pathname.includes('/announce'))   C=Announce;
  if(loc.pathname.includes('/insights'))   C=Insights;
  return <Shell nav={NAV} title="Operations"><C/></Shell>;
}
