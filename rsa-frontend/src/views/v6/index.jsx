import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Shell from '../../core/ui/Shell';
import { devService, logMgmtService } from '../../core/net/client';

const NAV=[
  {to:'/workspace/sys',           icon:'fa-gauge',      label:'System Health'},
  {to:'/workspace/sys/registry',  icon:'fa-users',      label:'User Registry'},
  {to:'/workspace/sys/sessions',  icon:'fa-key',        label:'Sessions'},
  {to:'/workspace/sys/events',    icon:'fa-file-lines', label:'Event Logs'},
];

const Spin=()=><div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#6366F1',borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>;
const Err=({m})=>m?<div className="c-err"><i className="fa-solid fa-circle-exclamation"/>{m}</div>:null;
const Ok=({m})=>m?<div className="c-ok"><i className="fa-solid fa-circle-check"/>{m}</div>:null;

/* ══ HEALTH ══ */
function Health(){
  const [h,setH]=useState(null);const [s,setS]=useState(null);const [err,setErr]=useState('');const [loading,setLoading]=useState(true);
  const load=()=>{ setLoading(true); Promise.all([devService.health(),devService.stats()]).then(([hd,sd])=>{setH(hd.data.health);setS(sd.data.stats);}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);
  if(loading) return <Spin/>;
  const healthy=h?.status==='healthy';
  return (
    <>
      <Err m={err}/>
      <div style={{background:`linear-gradient(135deg,${healthy?'#065F46,#059669':'#7F1D1D,#DC2626'})`,borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'14px'}}>
        <div>
          <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'5px'}}>System: {(h?.status||'unknown').toUpperCase()}</h2>
          <p style={{opacity:.72,fontSize:'.88rem'}}>Uptime: {h?.uptime} · Node: {h?.nodeVersion} · Env: {h?.environment}</p>
        </div>
        <button className="c-btn" style={{background:'rgba(255,255,255,.2)',color:'#fff',border:'1px solid rgba(255,255,255,.3)'}} onClick={load}><i className="fa-solid fa-rotate-right"/>Refresh</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'20px'}}>
        {[['Database',h?.database?.state,h?.database?.state==='connected'?'#10B981':'#EF4444','fa-database'],['Heap Used',h?.memory?.heapUsed,'#3B82F6','fa-microchip'],['CPUs',h?.system?.cpus,'#8B5CF6','fa-server'],['Free Mem',h?.system?.freeMemory,'#F59E0B','fa-hard-drive']].map(([l,v,c,i])=>(
          <div className="c-stat" key={l}><div className="c-stat-bar" style={{background:c}}/><div className="c-stat-ico" style={{background:`${c}18`,color:c}}><i className={`fa-solid ${i}`}/></div><div className="c-stat-num" style={{fontSize:'1.05rem'}}>{v||'—'}</div><div className="c-stat-lbl">{l}</div></div>
        ))}
      </div>
      {s&&<div className="c-card"><div className="c-card-hd"><i className="fa-solid fa-database"/>Collection Counts</div>
        <div className="c-ig">{Object.entries(s).map(([k,v])=><div className="c-ii" key={k}><label>{k}</label><span style={{fontWeight:700,fontSize:'1.05rem'}}>{v}</span></div>)}</div>
      </div>}
    </>
  );
}

/* ══ USER REGISTRY ══ */
function Registry(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');
  const load=useCallback(()=>{ setLoading(true); devService.listAllUsers(`page=${page}&limit=20`).then(r=>{setRows(r.data.users||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page]);
  useEffect(()=>{load();},[load]);
  const ROLES=['student','teacher','hr','manager','admin','developer'];
  const RB={student:'bd-b',teacher:'bd-p',hr:'bd-g',manager:'bd-y',admin:'bd-r',developer:'bd-i'};
  async function changeRole(id,role){ if(!confirm(`Change role to "${role}"? All sessions revoked.`))return; try{await devService.changeRole(id,role);setOk('Role changed.');load();}catch(ex){setErr(ex.message);} }
  async function hardDel(id){ if(!confirm('PERMANENTLY DELETE? Cannot be undone.'))return; try{await devService.hardDelete(id);setOk('Deleted.');load();}catch(ex){setErr(ex.message);} }
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{background:'#FEF9C3',border:'1px solid #FDE047',borderRadius:'9px',padding:'11px 15px',marginBottom:'14px',fontSize:'.84rem',color:'#713F12',display:'flex',alignItems:'center',gap:'8px'}}>
        <i className="fa-solid fa-triangle-exclamation"/>Developer zone — all users visible. Hard delete is permanent and irreversible.
      </div>
      <div className="c-card">
        {loading?<Spin/>:<div className="c-tw"><table className="c-t">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Deleted</th><th>Change Role</th><th>Hard Delete</th></tr></thead>
          <tbody>{rows.map(u=>(
            <tr key={u._id}>
              <td><strong>{u.firstName} {u.lastName}</strong></td>
              <td className="mt">{u.email}</td>
              <td><span className={`bd ${RB[u.role]||'bd-gr'}`}>{u.role}</span></td>
              <td><span className={`bd ${u.isActive?'bd-g':'bd-r'}`}>{u.isActive?'Yes':'No'}</span></td>
              <td><span className={`bd ${u.isDeleted?'bd-r':'bd-g'}`}>{u.isDeleted?'Yes':'No'}</span></td>
              <td><select className="c-sel" style={{padding:'3px 7px',fontSize:'.76rem'}} value={u.role} onChange={e=>changeRole(u._id,e.target.value)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></td>
              <td><button className="c-btn c-btn-rd c-btn-sm" onClick={()=>hardDel(u._id)}><i className="fa-solid fa-bomb"/></button></td>
            </tr>
          ))}</tbody>
        </table>{rows.length===0&&<div className="c-empty"><i className="fa-solid fa-users"/><p>No users.</p></div>}</div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
    </>
  );
}

/* ══ SESSIONS ══ */
function Sessions(){
  const [err,setErr]=useState('');const [ok,setOk]=useState('');const [loading,setLoading]=useState(false);
  async function revokeAll(){ if(!confirm('Revoke ALL sessions? Every user will be logged out immediately.'))return; setLoading(true); try{await devService.revokeAll();setOk('All sessions revoked. Every user is now logged out.');}catch(ex){setErr(ex.message);}finally{setLoading(false);} }
  async function purge(){ setLoading(true); try{await devService.purgeSessions();setOk('Expired sessions purged from database.');}catch(ex){setErr(ex.message);}finally{setLoading(false);} }
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{background:'#FEE2E2',border:'1px solid #FECACA',borderRadius:'9px',padding:'11px 15px',marginBottom:'18px',fontSize:'.84rem',color:'#991B1B',display:'flex',alignItems:'center',gap:'8px'}}>
        <i className="fa-solid fa-triangle-exclamation"/>Danger zone — these actions affect ALL users immediately.
      </div>
      <div className="c-card">
        <div className="c-card-hd"><i className="fa-solid fa-key"/>Session Management</div>
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <div style={{background:'#F8FAFC',borderRadius:'10px',padding:'20px',border:'1px solid #E2E8F0'}}>
            <h4 style={{marginBottom:'6px',color:'#1E293B'}}>Revoke All Active Sessions</h4>
            <p style={{fontSize:'.87rem',color:'#64748B',marginBottom:'14px'}}>Immediately invalidates every active session. All logged-in users will be logged out and redirected to the login page. Use only in security emergencies.</p>
            <button className="c-btn c-btn-rd" onClick={revokeAll} disabled={loading}><i className="fa-solid fa-ban"/>Revoke All Sessions</button>
          </div>
          <div style={{background:'#F8FAFC',borderRadius:'10px',padding:'20px',border:'1px solid #E2E8F0'}}>
            <h4 style={{marginBottom:'6px',color:'#1E293B'}}>Purge Expired Sessions</h4>
            <p style={{fontSize:'.87rem',color:'#64748B',marginBottom:'14px'}}>Removes expired session documents from the database. This is a safe, routine maintenance operation. Only expired (already-invalid) sessions are deleted.</p>
            <button className="c-btn c-btn-gh" onClick={purge} disabled={loading}><i className="fa-solid fa-trash-can"/>Purge Expired Sessions</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══ LOGS ══ */
function Logs(){
  const [tab,setTab]=useState('security');const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');
  const [delModal,setDelModal]=useState(null);const [delForm,setDelForm]=useState({olderThanDays:'90',reason:''});const [delLoading,setDelLoading]=useState(false);

  async function performDelete(ev){
    ev.preventDefault();if(!delForm.reason.trim()||delForm.reason.trim().length<5){setErr('Reason min 5 chars.');return;}
    setDelLoading(true);setErr('');setOk('');
    try{
      const fn=delModal.type==='audit'?logMgmtService.deleteAuditLogs:delModal.type==='security'?logMgmtService.deleteSecurityLogs:logMgmtService.deleteActivityLogs;
      const r=await fn({olderThanDays:Number(delForm.olderThanDays),reason:delForm.reason.trim()});
      setOk(r.message);setDelModal(null);setDelForm({olderThanDays:'90',reason:''});
    }catch(ex){setErr(ex.message);}finally{setDelLoading(false);}
  }
  useEffect(()=>{
    setLoading(true);setRows([]);
    const fn={security:devService.securityLogs,audit:devService.auditLogs,activity:devService.activityLogs}[tab];
    fn().then(r=>setRows(r.data.logs||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[tab]);
  return (
    <>
      <Err m={err}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
        <div style={{display:'flex',gap:'7px',flexWrap:'wrap'}}>
          {['security','audit','activity'].map(t=><button key={t} className={`c-btn ${tab===t?'c-btn-dk':'c-btn-gh'}`} onClick={()=>setTab(t)} style={{textTransform:'capitalize'}}>{t}</button>)}
        </div>
        <button className="c-btn c-btn-rd c-btn-sm" onClick={()=>setDelModal({type:tab})}><i className="fa-solid fa-trash"/>Delete Old Logs</button>
      </div>
      <div className="c-card">
        {loading?<Spin/>:<div className="c-tw"><table className="c-t">
          <thead><tr>
            {tab==='security'&&<><th>Event</th><th>IP</th><th>Email</th><th>Severity</th><th>Time</th></>}
            {tab==='audit'   &&<><th>Action</th><th>Entity</th><th>Actor</th><th>Status</th><th>Time</th></>}
            {tab==='activity'&&<><th>Method</th><th>Path</th><th>Code</th><th>IP</th><th>Time</th></>}
          </tr></thead>
          <tbody>{rows.map((r,i)=>(
            <tr key={i}>
              {tab==='security'&&<><td><strong>{r.event}</strong></td><td className="mt">{r.ip}</td><td className="mt">{r.email||'—'}</td><td><span className={`bd ${r.severity==='high'||r.severity==='critical'?'bd-r':r.severity==='medium'?'bd-y':'bd-g'}`}>{r.severity}</span></td><td className="mt">{new Date(r.createdAt).toLocaleString()}</td></>}
              {tab==='audit'   &&<><td><strong>{r.action}</strong></td><td className="mt">{r.entity}</td><td className="mt">{r.actor?.email||'system'}</td><td><span className={`bd ${r.status==='success'?'bd-g':'bd-r'}`}>{r.status}</span></td><td className="mt">{new Date(r.createdAt).toLocaleString()}</td></>}
              {tab==='activity'&&<><td><span className="bd bd-b">{r.method}</span></td><td className="mt" style={{fontSize:'.75rem',wordBreak:'break-all'}}>{r.path}</td><td><span className={`bd ${r.statusCode<400?'bd-g':r.statusCode<500?'bd-y':'bd-r'}`}>{r.statusCode}</span></td><td className="mt">{r.ip}</td><td className="mt">{new Date(r.createdAt).toLocaleString()}</td></>}
            </tr>
          ))}</tbody>
        </table>
        {rows.length===0&&<div className="c-empty"><i className="fa-solid fa-file-lines"/><p>No events.</p></div>}
        </div>}
      </div>
      {delModal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setDelModal(null)}><div className="c-md" style={{maxWidth:'440px'}}>
        <div className="c-md-hd"><h3>Delete {delModal.type} Logs</h3><button className="c-md-cl" onClick={()=>setDelModal(null)}>✕</button></div>
        <div style={{background:'#FEE2E2',border:'1px solid #FECACA',borderRadius:'8px',padding:'12px 14px',marginBottom:'16px',fontSize:'.84rem',color:'#B91C1C',display:'flex',gap:'8px'}}>
          <i className="fa-solid fa-triangle-exclamation" style={{flexShrink:0,marginTop:'2px'}}/><div><strong>Permanent action.</strong> A deletion record is permanently saved with your identity, IP, and reason.</div>
        </div>
        <form onSubmit={performDelete}><div className="c-fg">
          <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Older than (days)*</label><input required type="number" min="7" max="3650" value={delForm.olderThanDays} onChange={e=>setDelForm(f=>({...f,olderThanDays:e.target.value}))}/></div>
          <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Reason* (min 5 chars)</label><textarea required value={delForm.reason} onChange={e=>setDelForm(f=>({...f,reason:e.target.value}))} maxLength={500} style={{minHeight:'70px'}}/></div>
        </div>
        <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setDelModal(null)}>Cancel</button><button type="submit" className="c-btn c-btn-rd" disabled={delLoading}><i className="fa-solid fa-trash"/>{delLoading?'Deleting…':'Delete'}</button></div>
        </form>
      </div></div>}
    </>
  );
}

export default function V6(){
  const loc=useLocation();
  let C=Health;
  if(loc.pathname.includes('/registry')) C=Registry;
  if(loc.pathname.includes('/sessions')) C=Sessions;
  if(loc.pathname.includes('/events'))   C=Logs;
  return <Shell nav={NAV} title="System Console"><C/></Shell>;
}
