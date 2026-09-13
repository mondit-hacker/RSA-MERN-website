import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PanelLayout from '../../components/panel/PanelLayout';
import { developerAPI } from '../../utils/api';

const NAV = [
  { path:'/panel/developer',             icon:'fa-gauge',        label:'System Health' },
  { path:'/panel/developer/users',       icon:'fa-users',        label:'All Users'     },
  { path:'/panel/developer/sessions',    icon:'fa-key',          label:'Sessions'      },
  { path:'/panel/developer/logs',        icon:'fa-file-lines',   label:'Logs'          },
];

const Spinner = () => <div style={{display:'flex',justifyContent:'center',padding:'48px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#6366F1',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>;
const ErrMsg = ({msg}) => msg?<div className="panel-error-msg"><i className="fa-solid fa-circle-exclamation"/>{msg}</div>:null;
const OkMsg  = ({msg}) => msg?<div className="panel-success-msg"><i className="fa-solid fa-circle-check"/>{msg}</div>:null;

function Health() {
  const [health,setHealth]=useState(null); const [stats,setStats]=useState(null); const [err,setErr]=useState(''); const [loading,setLoading]=useState(true);
  const load=()=>{ setLoading(true); Promise.all([developerAPI.health(),developerAPI.stats()]).then(([h,s])=>{setHealth(h.data.health);setStats(s.data.stats);}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);
  if(loading) return <Spinner/>;
  const H_COLOR = health?.status==='healthy'?'#10B981':'#EF4444';
  return (
    <>
      <ErrMsg msg={err}/>
      <div style={{background:`linear-gradient(135deg,${health?.status==='healthy'?'#065F46,#059669':'#7F1D1D,#DC2626'})`,borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'6px'}}>System Status: {health?.status?.toUpperCase()}</h2>
          <p style={{opacity:0.75,fontSize:'0.9rem'}}>Uptime: {health?.uptime} &nbsp;·&nbsp; Node: {health?.nodeVersion} &nbsp;·&nbsp; Env: {health?.environment}</p>
        </div>
        <button className="panel-btn" style={{background:'rgba(255,255,255,0.2)',color:'#fff',border:'1px solid rgba(255,255,255,0.3)'}} onClick={load}><i className="fa-solid fa-rotate-right"/>Refresh</button>
      </div>

      <div className="stat-cards">
        {[['Database',health?.database?.state,health?.database?.state==='connected'?'#10B981':'#EF4444','fa-database'],['Memory Used',health?.memory?.heapUsed,'#3B82F6','fa-microchip'],['CPUs',health?.system?.cpus,'#8B5CF6','fa-server'],['Free Memory',health?.system?.freeMemory,'#F59E0B','fa-hard-drive']].map(([l,v,c,i])=>(
          <div className="stat-card" key={l}><div className="stat-card-accent" style={{background:c}}/><div className="stat-card-icon" style={{background:`${c}18`,color:c}}><i className={`fa-solid ${i}`}/></div><div className="stat-card-num" style={{fontSize:'1.2rem'}}>{v||'—'}</div><div className="stat-card-label">{l}</div></div>
        ))}
      </div>

      {stats&&(
        <div className="panel-card">
          <div className="panel-card-title"><i className="fa-solid fa-database"/>Collection Stats</div>
          <div className="info-grid">
            {Object.entries(stats).map(([k,v])=>(
              <div className="info-item" key={k}><label>{k}</label><span style={{fontWeight:'700',fontSize:'1rem'}}>{v}</span></div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function AllUsers() {
  const [rows,setRows]=useState([]); const [meta,setMeta]=useState({}); const [page,setPage]=useState(1); const [loading,setLoading]=useState(true); const [err,setErr]=useState(''); const [ok,setOk]=useState('');
  const load=useCallback(()=>{ setLoading(true); developerAPI.listAllUsers(`page=${page}&limit=20`).then(r=>{setRows(r.data.users||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page]);
  useEffect(()=>{load();},[load]);

  const ROLES=['student','teacher','hr','manager','admin','developer'];
  const RBADGE={student:'badge-blue',teacher:'badge-purple',hr:'badge-green',manager:'badge-yellow',admin:'badge-red',developer:'badge-indigo'};

  async function changeRole(id,role){ if(!window.confirm(`Change role to ${role}? All sessions will be revoked.`))return; try{ await developerAPI.changeRole(id,role); setOk('Role changed. Sessions revoked.'); load(); }catch(ex){setErr(ex.message);} }
  async function hardDelete(id){ if(!window.confirm('PERMANENTLY DELETE this user? This CANNOT be undone.'))return; try{ await developerAPI.hardDelete(id); setOk('User permanently deleted.'); load(); }catch(ex){setErr(ex.message);} }

  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div style={{background:'#FEF9C3',border:'1px solid #FDE047',borderRadius:'10px',padding:'12px 16px',marginBottom:'16px',fontSize:'0.85rem',color:'#713F12',display:'flex',alignItems:'center',gap:'8px'}}>
        <i className="fa-solid fa-triangle-exclamation"/>Developer zone — all users including deleted ones are visible. Hard delete is permanent.
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Deleted</th><th>Change Role</th><th>Hard Delete</th></tr></thead>
              <tbody>{rows.map(u=>(
                <tr key={u._id}>
                  <td><strong>{u.firstName} {u.lastName}</strong></td>
                  <td className="muted">{u.email}</td>
                  <td><span className={`badge ${RBADGE[u.role]||'badge-gray'}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.isActive?'badge-green':'badge-red'}`}>{u.isActive?'Yes':'No'}</span></td>
                  <td><span className={`badge ${u.isDeleted?'badge-red':'badge-green'}`}>{u.isDeleted?'Yes':'No'}</span></td>
                  <td>
                    <select className="panel-select" style={{padding:'4px 8px',fontSize:'0.78rem'}} value={u.role} onChange={e=>changeRole(u._id,e.target.value)}>
                      {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td><button className="panel-btn panel-btn-danger panel-btn-sm" onClick={()=>hardDelete(u._id)}><i className="fa-solid fa-bomb"/></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {meta.pages>1&&<div className="panel-pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
    </>
  );
}

function Sessions() {
  const [err,setErr]=useState(''); const [ok,setOk]=useState(''); const [loading,setLoading]=useState(false);
  async function revokeAll(){ if(!window.confirm('Revoke ALL active sessions? Everyone will be logged out.'))return; setLoading(true); try{ await developerAPI.revokeAllSess(); setOk('All sessions revoked. Everyone has been logged out.'); }catch(ex){setErr(ex.message);}finally{setLoading(false);} }
  async function purge(){ setLoading(true); try{ await developerAPI.purgeSessions(); setOk('Expired sessions purged from database.'); }catch(ex){setErr(ex.message);}finally{setLoading(false);} }
  return (
    <>
      <ErrMsg msg={err}/><OkMsg msg={ok}/>
      <div style={{background:'#FEE2E2',border:'1px solid #FECACA',borderRadius:'10px',padding:'12px 16px',marginBottom:'20px',fontSize:'0.85rem',color:'#991B1B',display:'flex',alignItems:'center',gap:'8px'}}>
        <i className="fa-solid fa-triangle-exclamation"/>Danger zone — these actions affect all users immediately.
      </div>
      <div className="panel-card">
        <div className="panel-card-title"><i className="fa-solid fa-key"/>Session Management</div>
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div style={{background:'#F8FAFC',borderRadius:'10px',padding:'20px',border:'1px solid #E2E8F0'}}>
            <h4 style={{marginBottom:'6px',color:'#1E293B'}}>Revoke All Sessions</h4>
            <p style={{fontSize:'0.88rem',color:'#64748B',marginBottom:'14px'}}>Immediately invalidates all active sessions. Every logged-in user will be logged out.</p>
            <button className="panel-btn panel-btn-danger" onClick={revokeAll} disabled={loading}><i className="fa-solid fa-ban"/>Revoke All Sessions</button>
          </div>
          <div style={{background:'#F8FAFC',borderRadius:'10px',padding:'20px',border:'1px solid #E2E8F0'}}>
            <h4 style={{marginBottom:'6px',color:'#1E293B'}}>Purge Expired Sessions</h4>
            <p style={{fontSize:'0.88rem',color:'#64748B',marginBottom:'14px'}}>Removes expired session documents from the database. Safe operation — only affects already-expired sessions.</p>
            <button className="panel-btn panel-btn-ghost" onClick={purge} disabled={loading}><i className="fa-solid fa-trash-can"/>Purge Expired Sessions</button>
          </div>
        </div>
      </div>
    </>
  );
}

function Logs() {
  const [tab,setTab]=useState('security'); const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [err,setErr]=useState('');
  useEffect(()=>{
    setLoading(true);setRows([]);
    const fn={security:developerAPI.securityLogs,audit:developerAPI.auditLogs,activity:developerAPI.activityLogs}[tab];
    fn().then(r=>setRows(r.data.logs||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[tab]);
  return (
    <>
      <ErrMsg msg={err}/>
      <div style={{display:'flex',gap:'8px',marginBottom:'18px',flexWrap:'wrap'}}>
        {['security','audit','activity'].map(t=><button key={t} className={`panel-btn ${tab===t?'panel-btn-primary':'panel-btn-ghost'}`} onClick={()=>setTab(t)} style={{textTransform:'capitalize'}}>{t} Logs</button>)}
      </div>
      <div className="panel-card">
        {loading?<Spinner/>:(
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead><tr>
                {tab==='security'&&<><th>Event</th><th>IP</th><th>Email</th><th>Severity</th><th>Time</th></>}
                {tab==='audit'&&<><th>Action</th><th>Entity</th><th>Actor</th><th>Status</th><th>Time</th></>}
                {tab==='activity'&&<><th>Method</th><th>Path</th><th>Status</th><th>IP</th><th>Time</th></>}
              </tr></thead>
              <tbody>{rows.map((r,i)=>(
                <tr key={i}>
                  {tab==='security'&&<><td><strong>{r.event}</strong></td><td className="muted">{r.ip}</td><td className="muted">{r.email||'—'}</td><td><span className={`badge ${r.severity==='high'||r.severity==='critical'?'badge-red':r.severity==='medium'?'badge-yellow':'badge-green'}`}>{r.severity}</span></td><td className="muted">{new Date(r.createdAt).toLocaleString()}</td></>}
                  {tab==='audit'&&<><td><strong>{r.action}</strong></td><td className="muted">{r.entity}</td><td className="muted">{r.actor?.email||'system'}</td><td><span className={`badge ${r.status==='success'?'badge-green':'badge-red'}`}>{r.status}</span></td><td className="muted">{new Date(r.createdAt).toLocaleString()}</td></>}
                  {tab==='activity'&&<><td><span className="badge badge-blue">{r.method}</span></td><td className="muted" style={{fontSize:'0.78rem',wordBreak:'break-all'}}>{r.path}</td><td><span className={`badge ${r.statusCode<400?'badge-green':r.statusCode<500?'badge-yellow':'badge-red'}`}>{r.statusCode}</span></td><td className="muted">{r.ip}</td><td className="muted">{new Date(r.createdAt).toLocaleString()}</td></>}
                </tr>
              ))}</tbody>
            </table>
            {rows.length===0&&<div className="panel-empty"><i className="fa-solid fa-file-lines"/><p>No logs found.</p></div>}
          </div>
        )}
      </div>
    </>
  );
}

export default function DeveloperPanel() {
  const loc = useLocation();
  let Content = Health;
  if(loc.pathname.includes('/users'))    Content = AllUsers;
  else if(loc.pathname.includes('/sessions')) Content = Sessions;
  else if(loc.pathname.includes('/logs'))     Content = Logs;
  return <PanelLayout navItems={NAV} panelName="Developer Panel"><Content/></PanelLayout>;
}
