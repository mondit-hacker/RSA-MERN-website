import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Shell from '../../core/ui/Shell';
import { adminService, analyticsService, attendanceService, complaintService, resultService, logMgmtService, backupService, adminExtService, assignmentService, hrService, credService } from '../../core/net/client';

const NAV = [
  { to:'/workspace/ctl',              icon:'fa-gauge',            label:'Dashboard'    },
  { to:'/workspace/ctl/students',     icon:'fa-user-graduate',    label:'Students'     },
  { to:'/workspace/ctl/users',        icon:'fa-users',            label:'Users'        },
  { to:'/workspace/ctl/attendance',   icon:'fa-calendar-check',   label:'Attendance'   },
  { to:'/workspace/ctl/results',      icon:'fa-star-half-stroke', label:'Results'      },
  { to:'/workspace/ctl/complaints',   icon:'fa-comment-dots',     label:'Complaints'   },
  { to:'/workspace/ctl/analytics',    icon:'fa-chart-pie',        label:'Analytics'    },
  { to:'/workspace/ctl/backup',       icon:'fa-database',         label:'Backup'       },
  { to:'/workspace/ctl/classes',      icon:'fa-chalkboard',       label:'Classes'      },
  { to:'/workspace/ctl/credentials',  icon:'fa-key',              label:'Credentials'  },
  { to:'/workspace/ctl/logs',         icon:'fa-shield-halved',    label:'Logs'         },
];

const PIE_COLORS=['#0B1F3A','#C9A84C','#10B981','#3B82F6','#8B5CF6','#EF4444'];
const Spin=()=><div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div style={{width:'38px',height:'38px',border:'3px solid #E2E8F0',borderTopColor:'#EF4444',borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>;
const Err=({m})=>m?<div className="c-err"><i className="fa-solid fa-circle-exclamation"/>{m}</div>:null;
const Ok=({m})=>m?<div className="c-ok"><i className="fa-solid fa-circle-check"/>{m}</div>:null;

/* ════ DASHBOARD ════ */
function Dashboard(){
  const [ov,setOv]=useState(null);const [adm,setAdm]=useState([]);const [prog,setProg]=useState([]);const [campus,setCampus]=useState([]);const [err,setErr]=useState('');
  useEffect(()=>{
    analyticsService.overview().then(r=>setOv(r.data.overview)).catch(e=>setErr(e.message));
    analyticsService.admissions().then(r=>setAdm(r.data.monthly||[])).catch(()=>{});
    analyticsService.programmes().then(r=>setProg(r.data.programmes||[])).catch(()=>{});
    analyticsService.campus().then(r=>setCampus(r.data.students||[])).catch(()=>{});
  },[]);
  if(!ov&&!err) return <Spin/>;
  const stats=[
    {l:'Total Students',    n:ov?.totalStudents||0,     i:'fa-user-graduate',  c:'#3B82F6',bg:'#EFF6FF'},
    {l:'Active Teachers',   n:ov?.totalTeachers||0,     i:'fa-chalkboard-user',c:'#8B5CF6',bg:'#F5F3FF'},
    {l:'Today Present',     n:ov?.todayPresent||0,      i:'fa-calendar-check', c:'#10B981',bg:'#F0FDF4'},
    {l:'Today Absent',      n:ov?.todayAbsent||0,       i:'fa-calendar-xmark', c:'#EF4444',bg:'#FEF2F2'},
    {l:'New Enquiries',     n:ov?.newEnquiriesMonth||0, i:'fa-envelope',       c:'#6366F1',bg:'#EEF2FF'},
    {l:'Open Complaints',   n:ov?.openComplaints||0,    i:'fa-comment-dots',   c:'#EF4444',bg:'#FEF2F2'},
  ];
  return (
    <>
      <Err m={err}/>
      <div style={{background:'linear-gradient(135deg,#0B1F3A,#1A3A5C)',borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h2 style={{fontSize:'1.5rem',fontWeight:'800',marginBottom:'6px'}}>Admin Control Centre</h2>
          <p style={{opacity:.65,fontSize:'.9rem'}}>{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <Link to="/workspace/ctl/students" className="c-btn c-btn-gd"><i className="fa-solid fa-user-plus"/>Admit Student</Link>
          <Link to="/workspace/ctl/backup" className="c-btn" style={{background:'rgba(255,255,255,.12)',color:'#fff',border:'1px solid rgba(255,255,255,.2)'}}><i className="fa-solid fa-database"/>Backup Data</Link>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}}>
        {stats.map(s=><div className="c-stat" key={s.l}><div className="c-stat-bar" style={{background:s.c}}/><div className="c-stat-ico" style={{background:s.bg,color:s.c}}><i className={`fa-solid ${s.i}`}/></div><div className="c-stat-num" style={{fontSize:typeof s.n==='string'?'1.1rem':'1.8rem'}}>{s.n}</div><div className="c-stat-lbl">{s.l}</div></div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <div className="c-card">
          <div className="c-card-hd"><i className="fa-solid fa-chart-bar"/>Monthly Admissions (2026)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={adm}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="month" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="#C9A84C" radius={[4,4,0,0]} name="Admissions"/></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="c-card">
          <div className="c-card-hd"><i className="fa-solid fa-chart-pie"/>Programmes</div>
          {prog.length>0?<ResponsiveContainer width="100%" height={200}><PieChart><Pie data={prog.map(p=>({name:p._id,value:p.count}))} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={30} paddingAngle={3} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>{prog.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
          :<div className="c-empty"><i className="fa-solid fa-chart-pie"/><p>No data</p></div>}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div className="c-card">
          <div className="c-card-hd"><i className="fa-solid fa-location-dot"/>Campus Breakdown</div>
          {campus.map(c=><div key={c._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#F8FAFC',borderRadius:'8px',marginBottom:'8px'}}><span style={{fontWeight:600}}>{c._id==='hcpur'?'Harish Chandra Pur':'Kashim Pur'}</span><span style={{background:'#0B1F3A',color:'#C9A84C',padding:'3px 14px',borderRadius:'999px',fontWeight:700,fontSize:'.88rem'}}>{c.count}</span></div>)}
        </div>
        <div className="c-card">
          <div className="c-card-hd"><i className="fa-solid fa-bolt"/>Quick Actions</div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {[['/workspace/ctl/attendance','fa-calendar-check','Mark Attendance','#10B981'],['/workspace/ctl/fees','fa-indian-rupee-sign','Collect Fee','#F59E0B'],['/workspace/ctl/results','fa-star-half-stroke','Add Results','#8B5CF6'],['/workspace/ctl/complaints','fa-comment-dots','Complaints','#EF4444'],['/workspace/ctl/analytics','fa-chart-pie','Analytics','#3B82F6'],['/workspace/ctl/backup','fa-database','Backup & Export','#6366F1']].map(([to,icon,label,color])=>(
              <Link key={to} to={to} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',background:'#F8FAFC',borderRadius:'8px',textDecoration:'none',color:'#1E293B',fontWeight:600,fontSize:'.88rem',border:'1px solid #E2E8F0'}}><i className={`fa-solid ${icon}`} style={{color,width:'18px',textAlign:'center'}}/>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ════ STUDENTS ════ */
function Students(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [search,setSearch]=useState('');const [campus,setCampus]=useState('');const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [modal,setModal]=useState(false);const [detailId,setDetailId]=useState(null);const [detail,setDetail]=useState(null);const [results,setResults]=useState([]);const [resetModal,setResetModal]=useState(null);
  const INIT={firstName:'',lastName:'',email:'',phone:'',admissionNo:'',programme:'eChamps',grade:'',section:'',campus:'hcpur',academicYear:'2026-27',password:''};
  const [form,setForm]=useState(INIT);

  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(search&&{search}),...(campus&&{campus})}).toString(); adminService.listStudents(q).then(r=>{setRows(r.data.students||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,search,campus]);
  useEffect(()=>{load();},[load]);

  async function openDetail(s){
    setDetailId(s._id);setDetail(s);
    resultService.studentResults(s._id).then(r=>setResults(r.data.results||[])).catch(()=>{});
  }
  async function create(ev){
    ev.preventDefault();setErr('');setOk('');
    try{const r=await adminService.createStudent(form);setOk(`Admitted! Adm No: ${r.data.admissionNo}. Credentials emailed.`);setModal(false);setForm(INIT);load();}
    catch(ex){setErr(ex.message);}
  }
  async function remove(id){ if(!confirm('Remove student?'))return; try{await adminService.deleteStudent(id);setOk('Removed.');setDetailId(null);load();}catch(ex){setErr(ex.message);} }
  async function resetPwd(userId,pwd){ try{await adminExtService.resetPassword(userId,pwd||'');setOk('Password reset. Credentials emailed.');setResetModal(null);}catch(ex){setErr(ex.message);} }

  function printStudentList(){
    const win=window.open('','_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Student List — RSA</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:20px}h1{color:#0B1F3A;font-size:1.4rem}h2{color:#C9A84C;font-size:1rem}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:0.82rem}th{background:#0B1F3A;color:#C9A84C;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #eee}tr:nth-child(even){background:#F8FAFC}.footer{margin-top:20px;font-size:0.75rem;color:#94A3B8;text-align:center}@media print{button{display:none}}</style></head><body>
    <h1>Rise &amp; Shine Academy — Student List</h1>
    <h2>Generated: ${new Date().toLocaleDateString('en-IN')}</h2>
    <table><thead><tr><th>Adm No</th><th>Name</th><th>Grade</th><th>Programme</th><th>Campus</th><th>Status</th></tr></thead>
    <tbody>${rows.map(s=>`<tr><td>${s.admissionNo}</td><td>${s.user?.firstName} ${s.user?.lastName}</td><td>${s.grade}${s.section||''}</td><td>${s.programme}</td><td>${s.campus}</td><td>${s.status}</td></tr>`).join('')}</tbody></table>
    <div class="footer">Rise &amp; Shine Academy, Malda, WB — Confidential</div>
    <script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
  }

  // Download student export
  function downloadExport(){ const t=adminService.listStudents; window.open(`/x-api/backup/export/students${campus?`?campus=${campus}`:''}`, '_blank'); }

  if(detailId&&detail) return (
    <div>
      <button className="c-btn c-btn-gh" style={{marginBottom:'16px'}} onClick={()=>{setDetailId(null);setDetail(null);}}><i className="fa-solid fa-arrow-left"/>Back</button>
      <Err m={err}/><Ok m={ok}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div className="c-card">
          <div className="c-card-hd"><i className="fa-solid fa-id-card"/>Student Details</div>
          <div className="c-ig">{[['Name',`${detail.user?.firstName} ${detail.user?.lastName}`],['Admission No',detail.admissionNo],['Email',detail.user?.email],['Programme',detail.programme],['Grade',`${detail.grade}${detail.section||''}`],['Campus',detail.campus],['Year',detail.academicYear],['Status',detail.status]].map(([l,v])=><div className="c-ii" key={l}><label>{l}</label><span>{v||'—'}</span></div>)}</div>
          <div style={{display:'flex',gap:'8px',marginTop:'16px',flexWrap:'wrap'}}>
            <button className="c-btn c-btn-gd c-btn-sm" onClick={()=>setResetModal(detail)}><i className="fa-solid fa-key"/>Reset Password</button>
            <button className="c-btn c-btn-rd c-btn-sm" onClick={()=>remove(detail._id)}><i className="fa-solid fa-trash"/>Remove</button>
          </div>
        </div>
        <div>
          <div className="c-card" style={{marginBottom:'16px'}}>
            <div className="c-card-hd"><i className="fa-solid fa-indian-rupee-sign"/>Fee History</div>
            {fees.length===0?<p style={{fontSize:'.87rem',color:'#64748B'}}>No fee records.</p>:fees.slice(0,5).map(f=>(
              <div key={f._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #F1F5F9',flexWrap:'wrap',gap:'6px'}}>
                <span style={{fontSize:'.85rem',fontWeight:600}}>{f.month} {f.academicYear}</span>
                <span className={`bd ${f.status==='paid'?'bd-g':f.status==='overdue'?'bd-r':'bd-y'}`}>{f.status}</span>
                <span style={{fontSize:'.85rem',color:'#64748B'}}>₹{f.amount}</span>
                <button className="c-btn c-btn-gh c-btn-sm" onClick={()=>setSlipData({student:detail,fee:f})}><i className="fa-solid fa-receipt"/>Slip</button>
              </div>
            ))}
          </div>
          <div className="c-card">
            <div className="c-card-hd"><i className="fa-solid fa-star-half-stroke"/>Recent Results</div>
            {results.length===0?<p style={{fontSize:'.87rem',color:'#64748B'}}>No results yet.</p>:results.slice(0,3).map(r=>(
              <div key={r._id} style={{padding:'8px 0',borderBottom:'1px solid #F1F5F9'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:'.85rem',fontWeight:600}}>{r.examName}</span><span className={`bd ${r.result==='pass'?'bd-g':'bd-r'}`}>{r.percentage}%</span></div>
                <span style={{fontSize:'.78rem',color:'#64748B'}}>{r.grade} | {r.examType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {resetModal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setResetModal(null)}><div className="c-md" style={{maxWidth:'380px'}}>
        <div className="c-md-hd"><h3>Reset Password</h3><button className="c-md-cl" onClick={()=>setResetModal(null)}>✕</button></div>
        <p style={{fontSize:'.88rem',color:'#64748B',marginBottom:'14px'}}>A new password will be auto-generated and emailed to <strong>{resetModal.user?.email}</strong>.</p>
        <div className="c-md-ft"><button className="c-btn c-btn-gh" onClick={()=>setResetModal(null)}>Cancel</button><button className="c-btn c-btn-gd" onClick={()=>resetPwd(resetModal.user?._id)}><i className="fa-solid fa-key"/>Reset &amp; Email</button></div>
      </div></div>}
    </div>
  );

  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-sb">
        <input className="c-inp" placeholder="Search name / admission no…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} pattern="[A-Za-z0-9 \-]*" maxLength={50}/>
        <select className="c-sel" value={campus} onChange={e=>{setCampus(e.target.value);setPage(1);}}>
          <option value="">All Campuses</option><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option>
        </select>
        <button className="c-btn c-btn-dk" onClick={()=>setModal(true)}><i className="fa-solid fa-plus"/>Admit Student</button>
        <button className="c-btn c-btn-gh" onClick={printStudentList}><i className="fa-solid fa-print"/>Print</button>
        <button className="c-btn c-btn-gh" onClick={downloadExport}><i className="fa-solid fa-file-excel"/>Export Excel</button>
      </div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-user-graduate"/><p>No students found.</p></div>:(
          <div className="c-tw"><table className="c-t">
            <thead><tr><th>Adm. No</th><th>Name</th><th>Grade</th><th>Programme</th><th>Campus</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{rows.map(s=>(<tr key={s._id} style={{cursor:'pointer'}} onClick={()=>openDetail(s)}><td><strong>{s.admissionNo}</strong></td><td>{s.user?.firstName} {s.user?.lastName}</td><td>{s.grade}{s.section}</td><td><span className="bd bd-b">{s.programme}</span></td><td className="mt">{s.campus}</td><td><span className={`bd ${s.status==='active'?'bd-g':'bd-gr'}`}>{s.status}</span></td><td onClick={e=>e.stopPropagation()}><button className="c-btn c-btn-rd c-btn-sm" onClick={()=>remove(s._id)}><i className="fa-solid fa-trash"/></button></td></tr>))}</tbody>
          </table></div>
        )}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>

      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md">
        <div className="c-md-hd"><h3>Admit New Student</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
        <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:'8px',padding:'10px 14px',marginBottom:'14px',fontSize:'.83rem',color:'#1D4ED8',display:'flex',gap:'8px',alignItems:'center'}}>
          <i className="fa-solid fa-circle-info"/>Password is auto-generated and emailed. Or set one manually below.
        </div>
        <form onSubmit={create}><div className="c-fg">
          <div className="c-fgp"><label>First Name*</label><input required value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} pattern="[A-Za-z .'\-]{1,50}" maxLength={50}/></div>
          <div className="c-fgp"><label>Last Name*</label><input required value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} pattern="[A-Za-z .'\-]{1,50}" maxLength={50}/></div>
          <div className="c-fgp"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} maxLength={120}/></div>
          <div className="c-fgp"><label>Phone</label><input type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} pattern="[0-9+\-]{7,15}" maxLength={15}/></div>
          <div className="c-fgp"><label>Admission No (auto if blank)</label><input value={form.admissionNo} onChange={e=>setForm(f=>({...f,admissionNo:e.target.value}))} pattern="[A-Za-z0-9\-]{0,20}" maxLength={20}/></div>
          <div className="c-fgp"><label>Grade*</label><input required value={form.grade} onChange={e=>setForm(f=>({...f,grade:e.target.value.replace(/[^0-9A-Za-z]/g,'')}))} maxLength={5}/></div>
          <div className="c-fgp"><label>Section</label><input value={form.section} onChange={e=>setForm(f=>({...f,section:e.target.value.toUpperCase().replace(/[^A-Z]/g,'')}))} maxLength={1}/></div>
          <div className="c-fgp"><label>Password (auto if blank)</label><input type="text" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Auto-generated" maxLength={72}/></div>
          <div className="c-fgp"><label>Programme*</label><select value={form.programme} onChange={e=>setForm(f=>({...f,programme:e.target.value}))}>{['eKidz','eChamps','eTechno'].map(p=><option key={p}>{p}</option>)}</select></div>
          <div className="c-fgp"><label>Campus*</label><select value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option></select></div>
          <div className="c-fgp"><label>Academic Year</label><input value={form.academicYear} onChange={e=>setForm(f=>({...f,academicYear:e.target.value}))} pattern="[0-9]{4}-[0-9]{2}" maxLength={7}/></div>
        </div>
        <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="c-btn c-btn-dk"><i className="fa-solid fa-user-plus"/>Admit &amp; Email</button></div>
        </form>
      </div></div>}
    </>
  );
}

/* ════ USERS ════ */
function Users(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [role,setRole]=useState('');const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [modal,setModal]=useState(false);const [resetModal,setResetModal]=useState(null);
  const INIT={firstName:'',lastName:'',email:'',role:'teacher',password:'',employeeId:'',campus:'hcpur',designation:''};
  const [form,setForm]=useState(INIT);
  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(role&&{role})}).toString(); adminService.listUsers(q).then(r=>{setRows(r.data.users||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,role]);
  useEffect(()=>{load();},[load]);
  const RB={student:'bd-b',teacher:'bd-p',hr:'bd-g',manager:'bd-y',admin:'bd-r',developer:'bd-i'};
  async function create(ev){ ev.preventDefault();setErr('');setOk(''); try{const r=await adminService.createUser(form);setOk(`Account created. Password: ${r.data.password}. Credentials emailed.`);setModal(false);setForm(INIT);load();}catch(ex){setErr(ex.message);} }
  async function toggle(u){ try{await adminService.updateUser(u._id,{isActive:!u.isActive});setOk('Updated.');load();}catch(ex){setErr(ex.message);} }
  async function unlock(id){ try{await adminService.unlockUser(id);setOk('Unlocked.');load();}catch(ex){setErr(ex.message);} }
  async function resetPwd(u){ try{await adminExtService.resetPassword(u._id,'');setOk(`Password reset & emailed to ${u.email}.`);setResetModal(null);}catch(ex){setErr(ex.message);} }
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-sb">
        <select className="c-sel" value={role} onChange={e=>{setRole(e.target.value);setPage(1);}}>
          <option value="">All Roles</option>{['student','teacher','hr','manager','admin','developer'].map(r=><option key={r} value={r}>{r}</option>)}
        </select>
        <button className="c-btn c-btn-dk" onClick={()=>setModal(true)}><i className="fa-solid fa-plus"/>Create User</button>
      </div>
      <div className="c-card">
        {loading?<Spin/>:<div className="c-tw"><table className="c-t">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Locked</th><th>Actions</th></tr></thead>
          <tbody>{rows.map(u=><tr key={u._id}><td><strong>{u.firstName} {u.lastName}</strong></td><td className="mt">{u.email}</td><td><span className={`bd ${RB[u.role]||'bd-gr'}`}>{u.role}</span></td><td><span className={`bd ${u.isActive?'bd-g':'bd-r'}`}>{u.isActive?'Active':'Inactive'}</span></td><td>{u.isLocked?<span className="bd bd-r">Locked</span>:<span className="bd bd-g">OK</span>}</td><td style={{display:'flex',gap:'5px',flexWrap:'wrap'}}><button className="c-btn c-btn-gh c-btn-sm" onClick={()=>toggle(u)}>{u.isActive?'Deactivate':'Activate'}</button>{u.isLocked&&<button className="c-btn c-btn-gd c-btn-sm" onClick={()=>unlock(u._id)}>Unlock</button>}<button className="c-btn c-btn-gh c-btn-sm" onClick={()=>setResetModal(u)}><i className="fa-solid fa-key"/></button></td></tr>)}
          </tbody>
        </table></div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages}</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md">
        <div className="c-md-hd"><h3>Create User Account</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
        <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:'8px',padding:'10px 14px',marginBottom:'14px',fontSize:'.83rem',color:'#1D4ED8',display:'flex',gap:'8px'}}>
          <i className="fa-solid fa-circle-info"/>Password is auto-generated and emailed. Or enter one manually.
        </div>
        <form onSubmit={create}><div className="c-fg">
          <div className="c-fgp"><label>First Name*</label><input required value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} pattern="[A-Za-z .'\-]{1,50}" maxLength={50}/></div>
          <div className="c-fgp"><label>Last Name*</label><input required value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} pattern="[A-Za-z .'\-]{1,50}" maxLength={50}/></div>
          <div className="c-fgp"><label>Email*</label><input required type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} maxLength={120}/></div>
          <div className="c-fgp"><label>Password (auto if blank)</label><input type="text" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Auto-generated" maxLength={72}/></div>
          <div className="c-fgp"><label>Role*</label><select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>{['student','teacher','hr','manager','admin','developer'].map(r=><option key={r}>{r}</option>)}</select></div>
          <div className="c-fgp"><label>Employee ID (auto if blank)</label><input value={form.employeeId} onChange={e=>setForm(f=>({...f,employeeId:e.target.value}))} pattern="[A-Za-z0-9\-]{0,20}" maxLength={20}/></div>
          <div className="c-fgp"><label>Designation</label><input value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))} pattern="[A-Za-z0-9 \-]{0,60}" maxLength={60}/></div>
          <div className="c-fgp"><label>Campus</label><select value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option><option value="both">Both</option></select></div>
        </div>
        <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="c-btn c-btn-dk"><i className="fa-solid fa-user-plus"/>Create &amp; Email</button></div>
        </form>
      </div></div>}
      {resetModal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setResetModal(null)}><div className="c-md" style={{maxWidth:'380px'}}>
        <div className="c-md-hd"><h3>Reset Password</h3><button className="c-md-cl" onClick={()=>setResetModal(null)}>✕</button></div>
        <p style={{fontSize:'.88rem',color:'#64748B',marginBottom:'14px'}}>A new secure password will be auto-generated and emailed to <strong>{resetModal.email}</strong>.</p>
        <div className="c-md-ft"><button className="c-btn c-btn-gh" onClick={()=>setResetModal(null)}>Cancel</button><button className="c-btn c-btn-gd" onClick={()=>resetPwd(resetModal)}><i className="fa-solid fa-key"/>Reset &amp; Email</button></div>
      </div></div>}
    </>
  );
}

/* ════ ATTENDANCE ════ */
function Attendance(){
  const [grade,setGrade]=useState('');const [section,setSection]=useState('');const [campus,setCampus]=useState('hcpur');const [date,setDate]=useState(new Date().toISOString().split('T')[0]);
  const [students,setStudents]=useState([]);const [records,setRecords]=useState({});const [loading,setLoading]=useState(false);const [err,setErr]=useState('');const [ok,setOk]=useState('');
  async function loadStudents(){ if(!grade)return; setLoading(true);setErr(''); const q=new URLSearchParams({grade,campus,...(section&&{section}),limit:100}).toString(); adminService.listStudents(q).then(r=>{const s=r.data.students||[];setStudents(s);const init={};s.forEach(st=>{init[st._id]='present';});setRecords(init);}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); }
  async function submit(){ if(!students.length){setErr('Load students first.');return;} setLoading(true);setErr('');setOk(''); const recs=students.map(s=>({studentId:s._id,status:records[s._id]||'present'})); attendanceService.markBulk({date,grade,section,campus,records:recs}).then(()=>setOk(`Attendance marked for ${recs.length} students.`)).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); }
  function printAttendance(){
    const win=window.open('','_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Attendance — ${date}</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:20px}h1{color:#0B1F3A;font-size:1.3rem}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:0.82rem}th{background:#0B1F3A;color:#C9A84C;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #eee}.sig{margin-top:40px;display:flex;justify-content:space-between}.sig-line{width:200px;border-top:1px solid #000;padding-top:6px;font-size:0.75rem;color:#64748B}@media print{button{display:none}}</style></head><body>
    <h1>Rise &amp; Shine Academy — Attendance Register</h1>
    <p>Date: <strong>${date}</strong> | Grade: <strong>${grade}${section||''}</strong> | Campus: <strong>${campus}</strong></p>
    <table><thead><tr><th>#</th><th>Adm. No</th><th>Student Name</th><th>Status</th><th>Remarks</th></tr></thead>
    <tbody>${students.map((s,i)=>`<tr><td>${i+1}</td><td>${s.admissionNo}</td><td>${s.user?.firstName} ${s.user?.lastName}</td><td>${records[s._id]||'present'}</td><td></td></tr>`).join('')}</tbody></table>
    <div class="sig"><div class="sig-line">Class Teacher Signature</div><div class="sig-line">Principal Signature</div><div class="sig-line">Date &amp; Stamp</div></div>
    <script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
  }
  const STATUS_C={present:'#10B981',absent:'#EF4444',late:'#F59E0B','half-day':'#8B5CF6'};
  const counts={present:0,absent:0,late:0,'half-day':0};
  Object.values(records).forEach(s=>{if(counts[s]!==undefined)counts[s]++;});
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-card">
        <div className="c-card-hd"><i className="fa-solid fa-calendar-check"/>Mark Attendance</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'16px'}}>
          <div className="c-fgp"><label>Date*</label><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
          <div className="c-fgp"><label>Grade*</label><input value={grade} onChange={e=>setGrade(e.target.value.replace(/[^0-9A-Za-z]/g,''))} placeholder="e.g. 5" maxLength={5}/></div>
          <div className="c-fgp"><label>Section</label><input value={section} onChange={e=>setSection(e.target.value.toUpperCase().replace(/[^A-Z]/g,''))} placeholder="A" maxLength={1}/></div>
          <div className="c-fgp"><label>Campus</label><select value={campus} onChange={e=>setCampus(e.target.value)}><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option></select></div>
        </div>
        <button className="c-btn c-btn-dk" onClick={loadStudents} disabled={!grade||loading}><i className="fa-solid fa-magnifying-glass"/>Load Students</button>
      </div>
      {students.length>0&&<>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'16px'}}>
          {Object.entries(counts).map(([s,c])=><div key={s} style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:'10px',padding:'14px',borderTop:`3px solid ${STATUS_C[s]}`}}><div style={{fontSize:'1.5rem',fontWeight:'800',color:STATUS_C[s]}}>{c}</div><div style={{fontSize:'.73rem',textTransform:'capitalize',color:'#64748B',fontWeight:600}}>{s}</div></div>)}
        </div>
        <div className="c-card">
          <div className="c-card-hd" style={{justifyContent:'space-between'}}><span><i className="fa-solid fa-users"/>Students — {date} | Grade {grade}{section}</span>
            <button className="c-btn c-btn-gh c-btn-sm" onClick={printAttendance}><i className="fa-solid fa-print"/>Print Register</button>
          </div>
          <div className="c-tw"><table className="c-t">
            <thead><tr><th>Adm. No</th><th>Name</th><th>Present</th><th>Absent</th><th>Late</th><th>Half Day</th></tr></thead>
            <tbody>{students.map(s=><tr key={s._id}><td><strong>{s.admissionNo}</strong></td><td>{s.user?.firstName} {s.user?.lastName}</td>{['present','absent','late','half-day'].map(st=><td key={st} style={{textAlign:'center'}}><input type="radio" name={s._id} value={st} checked={records[s._id]===st} onChange={()=>setRecords(r=>({...r,[s._id]:st}))} style={{accentColor:STATUS_C[st],width:'16px',height:'16px',cursor:'pointer'}}/></td>)}</tr>)}</tbody>
          </table></div>
          <div style={{marginTop:'16px',display:'flex',justifyContent:'flex-end'}}><button className="c-btn c-btn-ok" onClick={submit} disabled={loading}><i className="fa-solid fa-circle-check"/>Submit Attendance</button></div>
        </div>
      </>}
    </>
  );
}

/* ════ RESULTS ════ */
function Results(){
  const EXAM_TYPES=[
    {val:'class-test',  label:'Class Test'},
    {val:'1st-term',    label:'1st Term Exam'},
    {val:'2nd-term',    label:'2nd Term Exam'},
    {val:'3rd-term',    label:'3rd Term Exam'},
    {val:'exam',        label:'Exam'},
  ];
  const DEFAULT_SUBJECTS=['English','Mathematics','Science','Social Science','Hindi','Computer'];
  const INIT={student:'',academicYear:'2026-27',examName:'',examType:'class-test',grade:'',section:'',
    subjects:DEFAULT_SUBJECTS.map(s=>({name:s,maxMarks:100,obtained:0}))};

  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [students,setStudents]=useState([]);
  const [grade,setGrade]=useState('');const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');
  const [modal,setModal]=useState(false);const [editRow,setEditRow]=useState(null);const [form,setForm]=useState(INIT);
  const [newSubject,setNewSubject]=useState('');

  const load=useCallback(()=>{
    setLoading(true);
    const q=new URLSearchParams({page,limit:15,...(grade&&{grade})}).toString();
    Promise.all([
      resultService.list(q),
      resultService.studentsList(grade?`grade=${grade}`:''),
    ]).then(([r,s])=>{
      setRows(r.data.results||[]);setMeta(r.meta||{});
      setStudents(s.data.students||[]);
    }).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[page,grade]);
  useEffect(()=>{load();},[load]);

  function openAdd(){ setEditRow(null); setForm(INIT); setErr(''); setOk(''); setModal(true); }
  function openEdit(r){
    setEditRow(r);
    setForm({
      student:r.student?._id||r.student||'',
      academicYear:r.academicYear,
      examName:r.examName,
      examType:r.examType||'class-test',
      grade:r.grade,section:r.section||'',
      subjects:(r.subjects||[]).map(s=>({name:s.name,maxMarks:s.maxMarks,obtained:s.obtained})),
    });
    setErr('');setOk('');setModal(true);
  }

  async function save(ev){
    ev.preventDefault();setErr('');setOk('');
    if(!form.student) {setErr('Please select a student.');return;}
    if(!form.examName.trim()) {setErr('Exam name is required.');return;}
    if(!form.subjects.length) {setErr('Add at least one subject.');return;}
    try{
      if(editRow){
        await resultService.update(editRow._id,{examName:form.examName,examType:form.examType,academicYear:form.academicYear,subjects:form.subjects});
        setOk('Result updated.');
      } else {
        await resultService.create(form);
        setOk('Result saved.');
      }
      setModal(false);load();
    }catch(ex){setErr(ex.message);}
  }

  async function del(id){
    if(!confirm('Delete this result permanently?'))return;
    try{await resultService.remove(id);setOk('Deleted.');load();}catch(ex){setErr(ex.message);}
  }

  function setSubject(i,field,val){
    const s=[...form.subjects];s[i]={...s[i],[field]:field==='name'?val:+val};setForm(f=>({...f,subjects:s}));
  }
  function removeSubject(i){ setForm(f=>({...f,subjects:f.subjects.filter((_,j)=>j!==i)})); }
  function addSubject(){
    const n=newSubject.trim();
    if(!n) return;
    if(form.subjects.find(s=>s.name.toLowerCase()===n.toLowerCase())) return;
    setForm(f=>({...f,subjects:[...f.subjects,{name:n,maxMarks:100,obtained:0}]}));
    setNewSubject('');
  }

  const totalMax      = form.subjects.reduce((s,x)=>s+(+x.maxMarks||0),0);
  const totalObtained = form.subjects.reduce((s,x)=>s+(+x.obtained||0),0);
  const pct           = totalMax>0?+(totalObtained/totalMax*100).toFixed(1):0;

  function downloadResults(){ window.open('/x-api/backup/export/results'+(grade?'?grade='+grade:''),'_blank'); }

  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-sb">
        <input className="c-inp" placeholder="Filter by grade…" value={grade} onChange={e=>{setGrade(e.target.value.replace(/[^0-9A-Za-z]/g,''));setPage(1);}} maxLength={5}/>
        <button className="c-btn c-btn-dk" onClick={openAdd}><i className="fa-solid fa-plus"/>Add Result</button>
        <button className="c-btn c-btn-gh" onClick={downloadResults}><i className="fa-solid fa-file-excel"/>Export</button>
      </div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-star-half-stroke"/><p>No results yet.</p></div>:
          <div className="c-tw"><table className="c-t">
            <thead><tr><th>Student</th><th>Exam</th><th>Type</th><th>Grade</th><th>Score</th><th>%</th><th>Result</th><th></th></tr></thead>
            <tbody>{rows.map(r=>(
              <tr key={r._id}>
                <td><div style={{fontWeight:600,fontSize:'.87rem'}}>{r.student?.user?.firstName||''} {r.student?.user?.lastName||''}</div><div style={{fontSize:'.75rem',color:'#64748B'}}>{r.student?.admissionNo||'—'}</div></td>
                <td><strong>{r.examName}</strong></td>
                <td><span className="bd bd-b">{EXAM_TYPES.find(e=>e.val===r.examType)?.label||r.examType}</span></td>
                <td className="mt">Gr.{r.grade}{r.section}</td>
                <td className="mt">{r.totalObtained}/{r.totalMax}</td>
                <td style={{fontWeight:700,color:r.percentage>=60?'#10B981':r.percentage>=33?'#F59E0B':'#EF4444'}}>{r.percentage}%</td>
                <td><span className={`bd ${r.result==='pass'?'bd-g':'bd-r'}`}>{r.result}</span></td>
                <td style={{display:'flex',gap:'4px'}}>
                  <button className="c-btn c-btn-gh c-btn-sm" onClick={()=>openEdit(r)}><i className="fa-solid fa-pen"/></button>
                  <button className="c-btn c-btn-rd c-btn-sm" onClick={()=>del(r._id)}><i className="fa-solid fa-trash"/></button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages}</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>

      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md" style={{maxWidth:'620px'}}>
        <div className="c-md-hd"><h3>{editRow?'Edit Result':'Add Exam Result'}</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
        <form onSubmit={save}>
          <div className="c-fg">
            <div className="c-fgp" style={{gridColumn:'1/-1'}}>
              <label>Student*</label>
              <select required value={form.student} onChange={e=>{
                const s=students.find(x=>x._id===e.target.value);
                setForm(f=>({...f,student:e.target.value,grade:s?.grade||f.grade,section:s?.section||f.section}));
              }} disabled={!!editRow}>
                <option value="">-- Select Student --</option>
                {students.map(s=><option key={s._id} value={s._id}>{s.user?.firstName} {s.user?.lastName} · {s.admissionNo} · Gr.{s.grade}{s.section}</option>)}
              </select>
              {students.length===0&&<span style={{fontSize:'.78rem',color:'#F59E0B'}}>⚠ No students found. Admit students first.</span>}
            </div>
            <div className="c-fgp"><label>Exam Name*</label><input required value={form.examName} onChange={e=>setForm(f=>({...f,examName:e.target.value}))} placeholder="e.g. Class Test 1" maxLength={60}/></div>
            <div className="c-fgp">
              <label>Exam Type*</label>
              <select value={form.examType} onChange={e=>setForm(f=>({...f,examType:e.target.value}))}>
                {EXAM_TYPES.map(t=><option key={t.val} value={t.val}>{t.label}</option>)}
              </select>
            </div>
            <div className="c-fgp"><label>Academic Year</label><input value={form.academicYear} onChange={e=>setForm(f=>({...f,academicYear:e.target.value}))} placeholder="2026-27" maxLength={7}/></div>
          </div>

          <div style={{background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:'10px',padding:'14px',margin:'14px 0'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
              <span style={{fontWeight:700,fontSize:'.9rem',color:'#0B1F3A'}}>Subject Marks</span>
              <span style={{fontSize:'.82rem',color:pct>=33?'#10B981':'#EF4444',fontWeight:700}}>{totalObtained}/{totalMax} ({pct}%) — {pct>=33?'PASS':'FAIL'}</span>
            </div>
            {form.subjects.map((s,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 70px 70px 28px',gap:'6px',marginBottom:'6px',alignItems:'center'}}>
                <input value={s.name} onChange={e=>setSubject(i,'name',e.target.value)} style={{padding:'5px 8px',borderRadius:'6px',border:'1px solid #E2E8F0',fontSize:'.84rem'}}/>
                <input type="number" min={0} max={999} value={s.maxMarks} onChange={e=>setSubject(i,'maxMarks',e.target.value)} placeholder="Max" style={{padding:'5px 6px',borderRadius:'6px',border:'1px solid #E2E8F0',fontSize:'.84rem',textAlign:'center'}}/>
                <input type="number" min={0} max={s.maxMarks||999} value={s.obtained} onChange={e=>setSubject(i,'obtained',e.target.value)} placeholder="Got" style={{padding:'5px 6px',borderRadius:'6px',border:`1px solid ${+s.obtained>+s.maxMarks?'#EF4444':'#E2E8F0'}`,fontSize:'.84rem',textAlign:'center',background:+s.maxMarks>0&&+s.obtained/+s.maxMarks>=0.33?'#F0FDF4':'#FFF1F2'}}/>
                <button type="button" onClick={()=>removeSubject(i)} style={{background:'none',border:'none',color:'#EF4444',cursor:'pointer',fontSize:'.9rem',padding:'2px'}}>✕</button>
              </div>
            ))}
            <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
              <input value={newSubject} onChange={e=>setNewSubject(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSubject())} placeholder="Add subject…" style={{flex:1,padding:'5px 10px',borderRadius:'6px',border:'1px dashed #C9A84C',fontSize:'.84rem'}}/>
              <button type="button" className="c-btn c-btn-gh c-btn-sm" onClick={addSubject}><i className="fa-solid fa-plus"/>Add</button>
            </div>
          </div>

          <div className="c-md-ft">
            <button type="button" className="c-btn c-btn-gh" onClick={()=>setModal(false)}>Cancel</button>
            <button type="submit" className="c-btn c-btn-dk" disabled={!form.student||!form.examName||!form.subjects.length}>
              <i className="fa-solid fa-floppy-disk"/>{editRow?'Update Result':'Save Result'}
            </button>
          </div>
        </form>
      </div></div>}
    </>
  );
}


/* ════ COMPLAINTS ════ */
function Complaints(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [status,setStatus]=useState('');const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [sel,setSel]=useState(null);const [resp,setResp]=useState('');
  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(status&&{status})}).toString(); complaintService.list(q).then(r=>{setRows(r.data.complaints||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,status]);
  useEffect(()=>{load();},[load]);
  async function respond(ev){ ev.preventDefault();setErr('');setOk(''); try{await complaintService.respond(sel._id,{response:resp,status:'resolved'});setOk('Response sent.');setSel(null);load();}catch(ex){setErr(ex.message);} }
  const PB={low:'bd-g',medium:'bd-y',high:'bd-r'};
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-sb"><select className="c-sel" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">All</option><option value="open">Open</option><option value="in-review">In Review</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-comment-dots"/><p>No complaints.</p></div>:
          <div className="c-tw"><table className="c-t"><thead><tr><th>From</th><th>Subject</th><th>Type</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>{rows.map(c=><tr key={c._id}><td><strong>{c.from?.firstName} {c.from?.lastName}</strong><br/><span style={{fontSize:'.75rem',color:'#64748B'}}>{c.fromRole}</span></td><td style={{maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.subject}</td><td><span className="bd bd-b">{c.type}</span></td><td><span className={`bd ${PB[c.priority]||'bd-gr'}`}>{c.priority}</span></td><td><span className={`bd ${c.status==='resolved'?'bd-g':c.status==='open'?'bd-r':'bd-y'}`}>{c.status}</span></td><td className="mt">{new Date(c.createdAt).toLocaleDateString()}</td><td><button className="c-btn c-btn-dk c-btn-sm" onClick={()=>{setSel(c);setResp(c.response||'');}}>View</button></td></tr>)}</tbody>
          </table></div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages}</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
      {sel&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setSel(null)}><div className="c-md"><div className="c-md-hd"><h3>{sel.subject}</h3><button className="c-md-cl" onClick={()=>setSel(null)}>✕</button></div>
        <div style={{background:'#F8FAFC',borderRadius:'8px',padding:'14px',marginBottom:'14px'}}><p style={{fontSize:'.82rem',color:'#64748B',marginBottom:'6px'}}>From: <strong>{sel.from?.firstName} {sel.from?.lastName}</strong> ({sel.fromRole}) · {new Date(sel.createdAt).toLocaleString()}</p><p style={{fontSize:'.9rem',color:'#1E293B',lineHeight:1.65}}>{sel.message}</p></div>
        {sel.response&&<div style={{background:'#F0FDF4',borderRadius:'8px',padding:'12px',marginBottom:'14px',border:'1px solid #BBF7D0'}}><p style={{fontSize:'.75rem',color:'#15803D',fontWeight:700,marginBottom:'3px'}}>Previous Response</p><p style={{fontSize:'.88rem',color:'#166534'}}>{sel.response}</p></div>}
        {sel.status!=='resolved'&&sel.status!=='closed'&&<form onSubmit={respond}><div className="c-fgp"><label>Response*</label><textarea required value={resp} onChange={e=>setResp(e.target.value)} maxLength={2000} style={{minHeight:'80px'}}/></div><div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setSel(null)}>Cancel</button><button type="submit" className="c-btn c-btn-ok">Send</button></div></form>}
      </div></div>}
    </>
  );
}

/* ════ ANALYTICS ════ */
function Analytics(){
  const [ov,setOv]=useState(null);const [adm,setAdm]=useState([]);const [prog,setProg]=useState([]);const [funnel,setFunnel]=useState([]);const [err,setErr]=useState('');const [year,setYear]=useState('2026');
  useEffect(()=>{ analyticsService.overview().then(r=>setOv(r.data.overview)).catch(e=>setErr(e.message)); analyticsService.admissions(year).then(r=>setAdm(r.data.monthly||[])).catch(()=>{}); analyticsService.programmes().then(r=>setProg(r.data.programmes||[])).catch(()=>{}); analyticsService.enquiryFunnel().then(r=>setFunnel(r.data.funnel||[])).catch(()=>{}); },[year]);
  if(!ov&&!err) return <Spin/>;
  return (
    <>
      <Err m={err}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'24px'}}>
        {[['Total Students',ov?.totalStudents,'#3B82F6'],['Collected (Month)',`₹${(ov?.collectedThisMonth||0).toLocaleString('en-IN')}`,'#10B981'],['Pending Fees',ov?.pendingFees,'#EF4444'],['Today Present',ov?.todayPresent,'#10B981'],['Today Absent',ov?.todayAbsent,'#EF4444'],['Open Complaints',ov?.openComplaints,'#F59E0B']].map(([l,v,c])=>(
          <div key={l} style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:'12px',padding:'18px',borderTop:`3px solid ${c}`}}><div style={{fontSize:'1.7rem',fontWeight:'800',color:'#1E293B'}}>{v??0}</div><div style={{fontSize:'.78rem',color:'#64748B',fontWeight:600,marginTop:'4px',textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <div className="c-card">
          <div className="c-card-hd" style={{justifyContent:'space-between'}}><span><i className="fa-solid fa-chart-bar"/>Admissions Trend</span><select className="c-sel" style={{padding:'4px 8px',fontSize:'.8rem'}} value={year} onChange={e=>setYear(e.target.value)}>{['2024','2025','2026','2027'].map(y=><option key={y}>{y}</option>)}</select></div>
          <ResponsiveContainer width="100%" height={200}><BarChart data={adm}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="month" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}} allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="#C9A84C" radius={[4,4,0,0]} name="Admissions"/></BarChart></ResponsiveContainer>
        </div>
        <div className="c-card">
          <div className="c-card-hd"><i className="fa-solid fa-chart-pie"/>Programme Distribution</div>
          {prog.length>0?<ResponsiveContainer width="100%" height={200}><PieChart><Pie data={prog.map(p=>({name:p._id,value:p.count}))} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>{prog.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>:<div className="c-empty"><i className="fa-solid fa-chart-pie"/><p>No data</p></div>}
        </div>
      </div>
      <div className="c-card">
        <div className="c-card-hd"><i className="fa-solid fa-filter"/>Enquiry Conversion Funnel</div>
        {funnel.length>0?<ResponsiveContainer width="100%" height={200}><BarChart data={funnel.map(f=>({name:f._id,value:f.count}))} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis type="number" tick={{fontSize:11}} allowDecimals={false}/><YAxis type="category" dataKey="name" tick={{fontSize:11}} width={80}/><Tooltip/><Bar dataKey="value" fill="#0B1F3A" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer>:<div className="c-empty"><i className="fa-solid fa-filter"/><p>No data</p></div>}
      </div>
    </>
  );
}

/* ════ BACKUP ════ */
function Backup(){
  const [backups,setBackups]=useState([]);const [loading,setLoading]=useState(false);const [err,setErr]=useState('');const [ok,setOk]=useState('');
  const load=()=>{ backupService.list().then(r=>setBackups(r.data.backups||[])).catch(e=>setErr(e.message)); };
  useEffect(()=>{load();},[]);
  async function runBackup(){ setLoading(true);setErr('');setOk(''); try{const r=await backupService.run();setOk(`Backup created: ${r.data.backup.filename} (${r.data.backup.fileSizeMB} MB, ${r.data.backup.totalRecords} records)`);load();}catch(ex){setErr(ex.message);}finally{setLoading(false);} }
  async function deleteBackup(filename){ if(!confirm(`Delete backup ${filename}?`))return; try{await backupService.deleteBackup(filename);setOk('Deleted.');load();}catch(ex){setErr(ex.message);} }
  const EXPORTS=[['Students','students','fa-user-graduate','#3B82F6'],['Teachers','teachers','fa-chalkboard-user','#8B5CF6'],['Fee Records','fees','fa-indian-rupee-sign','#F59E0B'],['Results','results','fa-star-half-stroke','#10B981'],['Attendance','attendance','fa-calendar-check','#6366F1'],['Enquiries','enquiries','fa-envelope','#EF4444'],['All Data','all','fa-database','#0B1F3A']];
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      {/* Export section */}
      <div className="c-card" style={{marginBottom:'16px'}}>
        <div className="c-card-hd"><i className="fa-solid fa-file-excel"/>Export Data to Excel</div>
        <p style={{fontSize:'.87rem',color:'#64748B',marginBottom:'16px'}}>Download any dataset as an Excel (.xlsx) file. All data is exported with full details.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
          {EXPORTS.map(([label,type,icon,color])=>(
            <a key={type} href={'/x-api/backup/export/'+type} target="_blank" rel="noopener noreferrer"
              style={{display:'flex',alignItems:'center',gap:'8px',padding:'12px 14px',background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:'10px',textDecoration:'none',color:'#1E293B',fontWeight:600,fontSize:'.85rem'}}>
              <i className={'fa-solid '+icon} style={{color}}/>{label}
            </a>
          ))}
        </div>
      </div>

      {/* Backup section */}
      <div className="c-card">
        <div className="c-card-hd" style={{justifyContent:'space-between'}}>
          <span><i className="fa-solid fa-database"/>Database Backups</span>
          <button className="c-btn c-btn-dk" onClick={runBackup} disabled={loading}><i className="fa-solid fa-play"/>{loading?'Running…':'Run Backup Now'}</button>
        </div>
        <div style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'8px',padding:'12px 14px',marginBottom:'16px',fontSize:'.84rem',color:'#15803D',display:'flex',gap:'8px',alignItems:'flex-start'}}>
          <i className="fa-solid fa-circle-check" style={{marginTop:'2px',flexShrink:0}}/>
          <div><strong>Automatic daily backup runs every night at 2:00 AM IST.</strong> Manual backup is also available above. Backups include all collections: students, teachers, staff, fees, results, attendance, complaints, logs and more. Last 30 backups are retained automatically.</div>
        </div>
        {backups.length===0&&<div className="c-empty"><i className="fa-solid fa-database"/><p>No backups yet. Click "Run Backup Now" to create the first one.</p></div>}
        {backups.length>0&&<div className="c-tw"><table className="c-t">
            <thead><tr><th>Filename</th><th>Size</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>{backups.map(b=>(
              <tr key={b.filename}>
                <td style={{fontSize:'.82rem'}}><i className="fa-solid fa-file-zipper" style={{color:'#C9A84C',marginRight:'8px'}}/>{b.filename}</td>
                <td><span className="bd bd-g">{b.size}</span></td>
                <td className="mt">{new Date(b.created).toLocaleString('en-IN')}</td>
                <td style={{display:'flex',gap:'6px'}}>
                  <a href={'/x-api/backup/download/'+encodeURIComponent(b.filename)} className="c-btn c-btn-gd c-btn-sm"><i className="fa-solid fa-download"/>Download</a>
                  <button className="c-btn c-btn-rd c-btn-sm" onClick={()=>deleteBackup(b.filename)}><i className="fa-solid fa-trash"/></button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>}
      </div>
    </>
  );
}

/* ════ LOGS ════ */
function Logs(){
  const [tab,setTab]=useState('audit');const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [delModal,setDelModal]=useState(null);const [delForm,setDelForm]=useState({olderThanDays:'90',reason:''});const [delLoading,setDelLoading]=useState(false);const [deletedLogs,setDeletedLogs]=useState([]);const [showDeleted,setShowDeleted]=useState(false);
  useEffect(()=>{ setLoading(true);setRows([]); (tab==='audit'?adminService.auditLogs:adminService.securityLogs)().then(r=>setRows(r.data.logs||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[tab]);
  function loadDeletedLogs(){ setShowDeleted(true); logMgmtService.deletedLogs().then(r=>setDeletedLogs(r.data.logs||[])).catch(e=>setErr(e.message)); }
  async function performDelete(ev){
    ev.preventDefault();if(!delForm.reason.trim()||delForm.reason.trim().length<5){setErr('Reason must be at least 5 characters.');return;}
    setDelLoading(true);setErr('');setOk('');
    try{ const fn=delModal.type==='audit'?logMgmtService.deleteAuditLogs:delModal.type==='security'?logMgmtService.deleteSecurityLogs:logMgmtService.deleteActivityLogs; const r=await fn({olderThanDays:Number(delForm.olderThanDays),reason:delForm.reason.trim()}); setOk(r.message);setDelModal(null);setDelForm({olderThanDays:'90',reason:''});(tab==='audit'?adminService.auditLogs:adminService.securityLogs)().then(rr=>setRows(rr.data.logs||[])).catch(()=>{}); }catch(ex){setErr(ex.message);}finally{setDelLoading(false);}
  }
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
        <div style={{display:'flex',gap:'8px'}}>
          {['audit','security'].map(t=><button key={t} className={`c-btn ${tab===t&&!showDeleted?'c-btn-dk':'c-btn-gh'}`} onClick={()=>{setTab(t);setShowDeleted(false);}} style={{textTransform:'capitalize'}}>{t} Logs</button>)}
          <button className={`c-btn ${showDeleted?'c-btn-dk':'c-btn-gh'}`} onClick={loadDeletedLogs}><i className="fa-solid fa-trash-clock"/>Deletion History</button>
        </div>
        <button className="c-btn c-btn-rd c-btn-sm" onClick={()=>setDelModal({type:tab})}><i className="fa-solid fa-trash"/>Delete Old {tab} Logs</button>
      </div>
      {!showDeleted&&<div className="c-card">
        {loading?<Spin/>:<div className="c-tw"><table className="c-t">
          <thead><tr>{tab==='audit'?<><th>Action</th><th>Entity</th><th>Actor</th><th>Status</th><th>Time</th></>:<><th>Event</th><th>IP</th><th>Email</th><th>Severity</th><th>Time</th></>}</tr></thead>
          <tbody>{rows.map((r,i)=><tr key={i}>{tab==='audit'?<><td><strong>{r.action}</strong></td><td className="mt">{r.entity}</td><td className="mt">{r.actor?.email||'system'}</td><td><span className={`bd ${r.status==='success'?'bd-g':'bd-r'}`}>{r.status}</span></td><td className="mt">{new Date(r.createdAt).toLocaleString()}</td></>:<><td><strong>{r.event}</strong></td><td className="mt">{r.ip}</td><td className="mt">{r.email||'—'}</td><td><span className={`bd ${r.severity==='high'||r.severity==='critical'?'bd-r':r.severity==='medium'?'bd-y':'bd-g'}`}>{r.severity}</span></td><td className="mt">{new Date(r.createdAt).toLocaleString()}</td></>}</tr>)}
          </tbody>
        </table>{rows.length===0&&<div className="c-empty"><i className="fa-solid fa-file-lines"/><p>No logs.</p></div>}</div>}
      </div>}
      {showDeleted&&<div className="c-card">
        <div className="c-card-hd"><i className="fa-solid fa-trash-clock"/>Deletion History — Permanent Audit Trail</div>
        <div style={{background:'#FEF9C3',border:'1px solid #FDE68A',borderRadius:'8px',padding:'10px 14px',marginBottom:'14px',fontSize:'.83rem',color:'#92400E',display:'flex',gap:'8px'}}><i className="fa-solid fa-circle-info"/>Every deletion is permanently recorded and cannot be removed.</div>
        {deletedLogs.length===0&&<div className="c-empty"><i className="fa-solid fa-trash-clock"/><p>No deletions recorded.</p></div>}
        {deletedLogs.length>0&&<div className="c-tw"><table className="c-t"><thead><tr><th>Deleted By</th><th>Role</th><th>Log Type</th><th>Count</th><th>Reason</th><th>IP</th><th>When</th></tr></thead>
          <tbody>{deletedLogs.map((d,i)=><tr key={i}><td><strong>{d.deletedBy?.firstName} {d.deletedBy?.lastName}</strong><br/><span style={{fontSize:'.74rem',color:'#64748B'}}>{d.deletedByEmail}</span></td><td><span className="bd bd-r">{d.deletedByRole}</span></td><td><span className="bd bd-b">{d.entity}</span></td><td style={{fontWeight:700,color:'#EF4444'}}>{d.count}</td><td style={{maxWidth:'180px',fontSize:'.82rem',color:'#64748B'}}>{d.reason}</td><td className="mt">{d.ipAddress}</td><td className="mt">{new Date(d.createdAt).toLocaleString()}</td></tr>)}</tbody>
          </table></div>}
      </div>}
      {delModal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setDelModal(null)}><div className="c-md" style={{maxWidth:'460px'}}><div className="c-md-hd"><h3>Delete {delModal.type} Logs</h3><button className="c-md-cl" onClick={()=>setDelModal(null)}>✕</button></div>
        <div style={{background:'#FEE2E2',border:'1px solid #FECACA',borderRadius:'8px',padding:'12px 14px',marginBottom:'16px',fontSize:'.84rem',color:'#B91C1C',display:'flex',gap:'8px'}}><i className="fa-solid fa-triangle-exclamation" style={{flexShrink:0,marginTop:'2px'}}/><div><strong>Permanent action.</strong> A deletion record is permanently saved with your identity, IP, and reason.</div></div>
        <form onSubmit={performDelete}><div className="c-fg">
          <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Delete logs older than (days)* — min 7</label><input required type="number" min="7" max="3650" value={delForm.olderThanDays} onChange={e=>setDelForm(f=>({...f,olderThanDays:e.target.value}))}/></div>
          <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Reason* (min 5 characters)</label><textarea required value={delForm.reason} onChange={e=>setDelForm(f=>({...f,reason:e.target.value}))} maxLength={500} style={{minHeight:'70px'}}/></div>
        </div>
        <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setDelModal(null)}>Cancel</button><button type="submit" className="c-btn c-btn-rd" disabled={delLoading}><i className="fa-solid fa-trash"/>{delLoading?'Deleting…':'Confirm Delete'}</button></div>
        </form>
      </div></div>}
    </>
  );
}

/* ════ ROUTER ════ */

/* ════ CLASSES ════ */
function Classes(){
  const [assignments,setAssignments]=useState([]);const [grouped,setGrouped]=useState({});const [teachers,setTeachers]=useState([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [modal,setModal]=useState(false);const [tab,setTab]=useState('by-class');
  const SUBJECTS=['English','Mathematics','Science','Social Science','Hindi','Computer','Physical Education','Art','Music','Drawing'];
  const INIT={teacherId:'',grade:'',section:'',subject:'',campus:'hcpur',academicYear:'2026-27'};
  const [form,setForm]=useState(INIT);

  const load=()=>{
    setLoading(true);
    Promise.all([
      assignmentService.list(),
      assignmentService.byClass(),
      hrService.listTeachers('limit=100'),
    ]).then(([a,b,t])=>{
      setAssignments(a.data.assignments||[]);
      setGrouped(b.data.grouped||{});
      setTeachers(t.data.teachers||[]);
    }).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  async function doAssign(ev){
    ev.preventDefault();setErr('');setOk('');
    if(!form.teacherId){setErr('Please select a teacher.');return;}
    try{
      const r=await assignmentService.assign(form);
      setOk(r.message||'Teacher assigned successfully.');
      setModal(false);setForm(INIT);load();
    }catch(ex){setErr(ex.message||'Failed to assign teacher.');}
  }

  async function doRemove(id){
    if(!confirm('Remove this assignment?'))return;
    try{await assignmentService.remove(id);setOk('Removed.');load();}
    catch(ex){setErr(ex.message);}
  }

  const CAMPUS_LABEL={hcpur:'Harish Chandra Pur',kashimpur:'Kashim Pur',both:'Both'};

  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
        <div style={{display:'flex',gap:'8px'}}>
          <button className={`c-btn ${tab==='by-class'?'c-btn-dk':'c-btn-gh'}`} onClick={()=>setTab('by-class')}><i className="fa-solid fa-chalkboard"/>By Class</button>
          <button className={`c-btn ${tab==='by-teacher'?'c-btn-dk':'c-btn-gh'}`} onClick={()=>setTab('by-teacher')}><i className="fa-solid fa-chalkboard-user"/>By Teacher</button>
        </div>
        <button className="c-btn c-btn-dk" onClick={()=>{setErr('');setOk('');setModal(true);}}><i className="fa-solid fa-plus"/>Assign Teacher</button>
      </div>

      {loading?<Spin/>:tab==='by-class'?(
        Object.keys(grouped).length===0
          ?<div className="c-empty"><i className="fa-solid fa-chalkboard"/><p>No class assignments yet. Click "Assign Teacher" to get started.</p></div>
          :<>{Object.entries(grouped).map(([gradeKey,subjects])=>(
            <div className="c-card" key={gradeKey} style={{marginBottom:'14px'}}>
              <div className="c-card-hd"><i className="fa-solid fa-users"/>{gradeKey}
                <span style={{marginLeft:'auto',fontSize:'.78rem',color:'#64748B',fontWeight:500}}>{subjects.length} subject{subjects.length!==1?'s':''}</span>
              </div>
              <div className="c-tw"><table className="c-t">
                <thead><tr><th>Subject</th><th>Teacher</th><th>Campus</th><th></th></tr></thead>
                <tbody>{subjects.map((s,i)=>(
                  <tr key={i}>
                    <td><span className="bd bd-p">{s.subject}</span></td>
                    <td><strong>{s.teacher||'—'}</strong></td>
                    <td className="mt">{CAMPUS_LABEL[s.campus]||s.campus}</td>
                    <td><button className="c-btn c-btn-rd c-btn-sm" onClick={()=>doRemove(s._id)}><i className="fa-solid fa-trash"/></button></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          ))}</>
      ):(
        assignments.length===0
          ?<div className="c-empty"><i className="fa-solid fa-chalkboard-user"/><p>No assignments yet.</p></div>
          :<div className="c-card"><div className="c-tw"><table className="c-t">
            <thead><tr><th>Teacher</th><th>Grade</th><th>Section</th><th>Subject</th><th>Campus</th><th>Year</th><th></th></tr></thead>
            <tbody>{assignments.map(a=>(
              <tr key={a._id}>
                <td><strong>{a.teacher?.user?.firstName} {a.teacher?.user?.lastName}</strong></td>
                <td style={{fontWeight:700}}>Grade {a.grade}</td>
                <td>{a.section||'All'}</td>
                <td><span className="bd bd-b">{a.subject}</span></td>
                <td className="mt">{CAMPUS_LABEL[a.campus]||a.campus}</td>
                <td className="mt">{a.academicYear}</td>
                <td><button className="c-btn c-btn-rd c-btn-sm" onClick={()=>doRemove(a._id)}><i className="fa-solid fa-trash"/></button></td>
              </tr>
            ))}</tbody>
          </table></div></div>
      )}

      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md">
        <div className="c-md-hd"><h3>Assign Teacher to Class</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
        <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:'8px',padding:'10px 14px',marginBottom:'14px',fontSize:'.84rem',color:'#1D4ED8'}}>
          <i className="fa-solid fa-circle-info"/> Select a teacher, grade, subject, and campus. A teacher can be assigned to multiple classes and subjects.
        </div>
        <form onSubmit={doAssign}><div className="c-fg">
          <div className="c-fgp" style={{gridColumn:'1/-1'}}>
            <label>Teacher* {teachers.length===0&&<span style={{color:'#EF4444',fontSize:'.78rem'}}>(No teachers found — add teachers in HR Panel first)</span>}</label>
            <select required value={form.teacherId} onChange={e=>setForm(f=>({...f,teacherId:e.target.value}))}>
              <option value="">-- Select Teacher --</option>
              {teachers.map(t=><option key={t._id} value={t._id}>{t.user?.firstName||''} {t.user?.lastName||''} {t.employeeId?`(${t.employeeId})`:''}</option>)}
            </select>
          </div>
          <div className="c-fgp"><label>Grade* (e.g. 5)</label><input required value={form.grade} onChange={e=>setForm(f=>({...f,grade:e.target.value.replace(/[^0-9A-Za-z]/g,'')}))} placeholder="5" maxLength={3}/></div>
          <div className="c-fgp"><label>Section (blank = all sections)</label><input value={form.section} onChange={e=>setForm(f=>({...f,section:e.target.value.toUpperCase().replace(/[^A-Z]/g,'')}))} placeholder="A" maxLength={1}/></div>
          <div className="c-fgp">
            <label>Subject*</label>
            <select required value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}>
              <option value="">-- Select Subject --</option>
              {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="c-fgp"><label>Campus*</label><select value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option><option value="both">Both Campuses</option></select></div>
          <div className="c-fgp"><label>Academic Year</label><input value={form.academicYear} onChange={e=>setForm(f=>({...f,academicYear:e.target.value}))} placeholder="2026-27" pattern="[0-9]{4}-[0-9]{2}" maxLength={7}/></div>
        </div>
        <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="c-btn c-btn-dk" disabled={!form.teacherId||!form.grade||!form.subject}><i className="fa-solid fa-chalkboard"/>Assign</button></div>
        </form>
      </div></div>}
    </>
  );
}

/* ════ CREDENTIALS ════ */
function Credentials(){
  const [entries,setEntries]=useState([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [search,setSearch]=useState('');const [copied,setCopied]=useState('');
  const load=()=>{ setLoading(true); credService.list().then(r=>setEntries(r.data.entries||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);
  async function clearLog(){ if(!confirm('Clear log? Make sure you have noted all passwords first.'))return; try{await credService.clear();setOk('Log cleared.');setEntries([]);}catch(ex){setErr(ex.message);} }
  function copy(email,pwd){ navigator.clipboard.writeText(`Email: ${email}
Password: ${pwd}`).then(()=>{setCopied(email);setTimeout(()=>setCopied(''),2000);}); }
  function printAll(){
    const win=window.open('','_blank');
    const rows=filtered.map(e=>`<tr><td>${e.created||''}</td><td>${e.name||''}</td><td>${e.role||''}</td><td>${e.email||''}</td><td style="font-weight:700;color:#0B1F3A;font-family:monospace">${e.password||''}</td><td>${e.adm_no||e.emp_id||''}</td></tr>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>RSA Credentials</title><style>body{font-family:Arial,sans-serif;margin:24px}h1{color:#0B1F3A}table{width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:12px}th{background:#0B1F3A;color:#C9A84C;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #eee}tr:nth-child(even){background:#F8FAFC}.warn{background:#FEF9C3;padding:12px 16px;border-radius:6px;margin:12px 0;font-size:0.85rem;color:#92400E;border:1px solid #FDE68A}@media print{button{display:none}}</style></head><body><h1>Rise &amp; Shine Academy — User Credentials</h1><div class="warn">⚠️ CONFIDENTIAL — Share with each user privately. Shred after distribution.</div><table><thead><tr><th>Created</th><th>Name</th><th>Role</th><th>Email (Login)</th><th>Password</th><th>ID</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=()=>window.print();</script></body></html>`);
    win.document.close();
  }
  const filtered=entries.filter(e=>!search||(e.name||'').toLowerCase().includes(search.toLowerCase())||(e.email||'').toLowerCase().includes(search.toLowerCase())||(e.role||'').toLowerCase().includes(search.toLowerCase()));
  const RC={student:'bd-b',teacher:'bd-p',hr:'bd-g',manager:'bd-y',admin:'bd-r',developer:'bd-i'};
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      {copied&&<div style={{position:'fixed',top:'80px',right:'20px',background:'#10B981',color:'#fff',padding:'10px 20px',borderRadius:'8px',fontWeight:700,zIndex:9999,fontSize:'.9rem',boxShadow:'0 4px 12px rgba(0,0,0,.2)'}}>✓ Copied!</div>}
      <div style={{background:'linear-gradient(135deg,#0B1F3A,#1A3A5C)',borderRadius:'14px',padding:'22px 24px',marginBottom:'16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h3 style={{color:'#C9A84C',fontWeight:800,fontSize:'1.05rem',marginBottom:'3px'}}><i className="fa-solid fa-key"/> Credentials Vault</h3>
          <p style={{color:'rgba(255,255,255,.6)',fontSize:'.85rem',margin:0}}>Every auto-generated password is saved here. Works even without email configured.</p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="c-btn" style={{background:'#C9A84C',color:'#0B1F3A',fontWeight:700}} onClick={printAll} disabled={!filtered.length}><i className="fa-solid fa-print"/>Print All</button>
          <button className="c-btn c-btn-rd" onClick={clearLog} disabled={!entries.length}><i className="fa-solid fa-trash"/>Clear Log</button>
        </div>
      </div>
      <div style={{background:'#FEF9C3',border:'1px solid #FDE68A',borderRadius:'9px',padding:'11px 14px',marginBottom:'14px',fontSize:'.84rem',color:'#92400E',display:'flex',gap:'8px'}}>
        <i className="fa-solid fa-triangle-exclamation" style={{flexShrink:0,marginTop:'2px'}}/>
        <span>This page shows all auto-generated passwords. Share credentials privately with each user. Clear log after distributing.</span>
      </div>
      <div className="c-sb">
        <input className="c-inp" placeholder="Search name, email, role…" value={search} onChange={e=>setSearch(e.target.value)} maxLength={50}/>
        <button className="c-btn c-btn-gh" onClick={load}><i className="fa-solid fa-rotate-right"/>Refresh</button>
        <span style={{fontSize:'.85rem',color:'#64748B',fontWeight:600,alignSelf:'center'}}>{filtered.length} account{filtered.length!==1?'s':''}</span>
      </div>
      <div className="c-card">
        {loading?<Spin/>:filtered.length===0
          ?<div className="c-empty"><i className="fa-solid fa-key"/><p>{entries.length===0?'No credentials logged yet. Create a user or student to see passwords here.':'No results match your search.'}</p></div>
          :<div className="c-tw"><table className="c-t">
            <thead><tr><th>Created</th><th>Name</th><th>Role</th><th>Login Email</th><th>Password</th><th>ID</th><th>Copy</th></tr></thead>
            <tbody>{filtered.map((e,i)=>(
              <tr key={i} style={{background:copied===e.email?'#F0FDF4':''}}>
                <td style={{fontSize:'.76rem',color:'#64748B',whiteSpace:'nowrap'}}>{(e.created||'').replace(/,.*$/,'')}</td>
                <td><strong>{e.name||'—'}</strong></td>
                <td><span className={`bd ${RC[(e.role||'').toLowerCase()]||'bd-gr'}`}>{e.role||'—'}</span></td>
                <td style={{fontSize:'.83rem'}}>{e.email||'—'}</td>
                <td><code style={{background:'#F1F5F9',padding:'3px 9px',borderRadius:'5px',fontWeight:700,fontSize:'.88rem',color:'#0B1F3A',letterSpacing:'.03em'}}>{e.password||'—'}</code></td>
                <td style={{fontSize:'.8rem',color:'#64748B'}}>{e.adm_no||e.emp_id||'—'}</td>
                <td><button className="c-btn c-btn-gh c-btn-sm" onClick={()=>copy(e.email,e.password)} title="Copy email + password"><i className="fa-solid fa-copy"/></button></td>
              </tr>
            ))}</tbody>
          </table></div>}
      </div>
    </>
  );
}

export default function V1(){
  const loc=useLocation();
  let C=Dashboard;
  if(loc.pathname.includes('/students'))        C=Students;
  else if(loc.pathname.includes('/users'))       C=Users;
  else if(loc.pathname.includes('/attendance'))  C=Attendance;
  else if(loc.pathname.includes('/results'))     C=Results;
  else if(loc.pathname.includes('/complaints'))  C=Complaints;
  else if(loc.pathname.includes('/analytics'))   C=Analytics;
  else if(loc.pathname.includes('/backup'))      C=Backup;
  else if(loc.pathname.includes('/classes'))     C=Classes;
  else if(loc.pathname.includes('/credentials')) C=Credentials;
  else if(loc.pathname.includes('/logs'))        C=Logs;
  return <Shell nav={NAV} title="Control Centre"><C/></Shell>;
}
