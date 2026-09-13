import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Shell from '../../core/ui/Shell';
import { hrService, complaintService, assignmentService } from '../../core/net/client';

const NAV=[
  {to:'/workspace/ppl',            icon:'fa-gauge',          label:'Overview'},
  {to:'/workspace/ppl/faculty',    icon:'fa-chalkboard-user',label:'Faculty'},
  {to:'/workspace/ppl/personnel',  icon:'fa-user-tie',       label:'Personnel'},
  {to:'/workspace/ppl/roster',     icon:'fa-user-graduate',  label:'Students'},
  {to:'/workspace/ppl/classes',    icon:'fa-chalkboard',     label:'Classes'},
  {to:'/workspace/ppl/messages',   icon:'fa-comment-dots',   label:'Messages'},
];

const Spin=()=><div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#10B981',borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>;
const Err=({m})=>m?<div className="c-err"><i className="fa-solid fa-circle-exclamation"/>{m}</div>:null;
const Ok=({m})=>m?<div className="c-ok"><i className="fa-solid fa-circle-check"/>{m}</div>:null;

function Overview(){
  const [tc,setTc]=useState(0);const [sc,setSc]=useState(0);const [lc,setLc]=useState(0);const [err,setErr]=useState('');
  useEffect(()=>{
    hrService.listTeachers('limit=1').then(r=>setTc(r.meta?.total||0)).catch(e=>setErr(e.message));
    hrService.listStaff('limit=1').then(r=>setSc(r.meta?.total||0)).catch(()=>{});
    hrService.listStudents('limit=1').then(r=>setLc(r.meta?.total||0)).catch(()=>{});
  },[]);
  return (
    <>
      <Err m={err}/>
      <div style={{background:'linear-gradient(135deg,#065F46,#059669)',borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff'}}>
        <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'5px'}}>People &amp; HR Management</h2>
        <p style={{opacity:.72,fontSize:'.9rem'}}>Manage faculty, personnel, and view student records.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px'}}>
        {[['Faculty',tc,'fa-chalkboard-user','#10B981','#F0FDF4'],['Personnel',sc,'fa-user-tie','#3B82F6','#EFF6FF'],['Students',lc,'fa-user-graduate','#8B5CF6','#F5F3FF']].map(([l,n,i,c,bg])=>(
          <div className="c-stat" key={l}><div className="c-stat-bar" style={{background:c}}/><div className="c-stat-ico" style={{background:bg,color:c}}><i className={`fa-solid ${i}`}/></div><div className="c-stat-num">{n}</div><div className="c-stat-lbl">{l}</div></div>
        ))}
      </div>
    </>
  );
}

function Faculty(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [search,setSearch]=useState('');const [campus,setCampus]=useState('');const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [modal,setModal]=useState(false);
  const INIT={firstName:'',lastName:'',email:'',phone:'',employeeId:'',campus:'hcpur',designation:'',department:'',subjects:'',grades:'',joiningDate:''};const [form,setForm]=useState(INIT);
  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(search&&{search}),...(campus&&{campus})}).toString(); hrService.listTeachers(q).then(r=>{setRows(r.data.teachers||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,search,campus]);
  useEffect(()=>{load();},[load]);
  async function create(ev){ev.preventDefault();setErr('');setOk('');const b={...form,subjects:form.subjects.split(',').map(s=>s.trim()).filter(Boolean),grades:form.grades.split(',').map(s=>s.trim()).filter(Boolean)};try{await hrService.createTeacher(b);setOk('Faculty added!');setModal(false);setForm(INIT);load();}catch(ex){setErr(ex.message);}}
  async function remove(id){if(!confirm('Remove?'))return;try{await hrService.deleteTeacher(id);setOk('Removed.');load();}catch(ex){setErr(ex.message);}}
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-sb">
        <input className="c-inp" placeholder="Search faculty…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} pattern="[A-Za-z0-9 \-]*" maxLength={50}/>
        <select className="c-sel" value={campus} onChange={e=>{setCampus(e.target.value);setPage(1);}}>
          <option value="">All Campuses</option><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option>
        </select>
        <button className="c-btn c-btn-dk" onClick={()=>setModal(true)}><i className="fa-solid fa-plus"/>Add Faculty</button>
      </div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-chalkboard-user"/><p>No faculty found.</p></div>:
          <div className="c-tw"><table className="c-t"><thead><tr><th>ID</th><th>Name</th><th>Designation</th><th>Subjects</th><th>Campus</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map(t=><tr key={t._id}><td><strong>{t.employeeId}</strong></td><td>{t.user?.firstName} {t.user?.lastName}</td><td className="mt">{t.designation}</td><td>{t.subjects?.slice(0,2).map(s=><span key={s} className="bd bd-p" style={{marginRight:'3px'}}>{s}</span>)}</td><td className="mt">{t.campus}</td><td><span className={`bd ${t.status==='active'?'bd-g':'bd-gr'}`}>{t.status}</span></td><td><button className="c-btn c-btn-rd c-btn-sm" onClick={()=>remove(t._id)}><i className="fa-solid fa-trash"/></button></td></tr>)}</tbody>
          </table></div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md">
        <div className="c-md-hd"><h3>Add Faculty</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
        <form onSubmit={create}><div className="c-fg">
          <div className="c-fgp"><label>First Name*</label><input required value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} pattern="[A-Za-z .'\-]{1,50}" maxLength={50}/></div>
          <div className="c-fgp"><label>Last Name*</label><input required value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} pattern="[A-Za-z .'\-]{1,50}" maxLength={50}/></div>
          <div className="c-fgp"><label>Email*</label><input required type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} maxLength={120}/></div>
          <div className="c-fgp"><label>Phone</label><input type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} pattern="[0-9+\-]{7,15}" maxLength={15}/></div>
          <div className="c-fgp"><label>Employee ID*</label><input required value={form.employeeId} onChange={e=>setForm(f=>({...f,employeeId:e.target.value}))} pattern="[A-Za-z0-9\-]{1,20}" maxLength={20}/></div>
          <div className="c-fgp"><label>Designation*</label><input required value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))} pattern="[A-Za-z0-9 \-]{1,60}" maxLength={60}/></div>
          <div className="c-fgp"><label>Department</label><input value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} pattern="[A-Za-z0-9 \-]{0,60}" maxLength={60}/></div>
          <div className="c-fgp"><label>Subjects (comma sep.)</label><input value={form.subjects} onChange={e=>setForm(f=>({...f,subjects:e.target.value}))} pattern="[A-Za-z0-9 ,]{0,200}" maxLength={200}/></div>
          <div className="c-fgp"><label>Grades (comma sep.)</label><input value={form.grades} onChange={e=>setForm(f=>({...f,grades:e.target.value}))} pattern="[0-9, ]{0,50}" maxLength={50}/></div>
          <div className="c-fgp"><label>Joining Date</label><input type="date" value={form.joiningDate} onChange={e=>setForm(f=>({...f,joiningDate:e.target.value}))}/></div>
          <div className="c-fgp"><label>Campus</label><select value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option><option value="both">Both</option></select></div>
        </div>
        <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="c-btn c-btn-dk">Add</button></div>
        </form>
      </div></div>}
    </>
  );
}

function Personnel(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [modal,setModal]=useState(false);
  const INIT={firstName:'',lastName:'',email:'',phone:'',role:'hr',employeeId:'',campus:'both',designation:'',department:'',joiningDate:''};const [form,setForm]=useState(INIT);
  const load=useCallback(()=>{ setLoading(true); hrService.listStaff(`page=${page}&limit=15`).then(r=>{setRows(r.data.staff||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page]);
  useEffect(()=>{load();},[load]);
  async function create(ev){ev.preventDefault();setErr('');setOk('');try{await hrService.createStaff(form);setOk('Added!');setModal(false);setForm(INIT);load();}catch(ex){setErr(ex.message);}}
  async function remove(id){if(!confirm('Remove?'))return;try{await hrService.deleteStaff(id);setOk('Removed.');load();}catch(ex){setErr(ex.message);}}
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'14px'}}><button className="c-btn c-btn-dk" onClick={()=>setModal(true)}><i className="fa-solid fa-plus"/>Add Personnel</button></div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-user-tie"/><p>No personnel.</p></div>:
          <div className="c-tw"><table className="c-t"><thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Designation</th><th>Campus</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map(s=><tr key={s._id}><td><strong>{s.employeeId}</strong></td><td>{s.user?.firstName} {s.user?.lastName}</td><td><span className={`bd ${s.role==='hr'?'bd-g':'bd-y'}`}>{s.role}</span></td><td className="mt">{s.designation||'—'}</td><td className="mt">{s.campus}</td><td><span className={`bd ${s.status==='active'?'bd-g':'bd-gr'}`}>{s.status}</span></td><td><button className="c-btn c-btn-rd c-btn-sm" onClick={()=>remove(s._id)}><i className="fa-solid fa-trash"/></button></td></tr>)}</tbody>
          </table></div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages}</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md">
        <div className="c-md-hd"><h3>Add Personnel</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
        <form onSubmit={create}><div className="c-fg">
          <div className="c-fgp"><label>First Name*</label><input required value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} pattern="[A-Za-z .'\-]{1,50}" maxLength={50}/></div>
          <div className="c-fgp"><label>Last Name*</label><input required value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} pattern="[A-Za-z .'\-]{1,50}" maxLength={50}/></div>
          <div className="c-fgp"><label>Email*</label><input required type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} maxLength={120}/></div>
          <div className="c-fgp"><label>Phone</label><input type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} pattern="[0-9+\-]{7,15}" maxLength={15}/></div>
          <div className="c-fgp"><label>Employee ID*</label><input required value={form.employeeId} onChange={e=>setForm(f=>({...f,employeeId:e.target.value}))} pattern="[A-Za-z0-9\-]{1,20}" maxLength={20}/></div>
          <div className="c-fgp"><label>Designation</label><input value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))} pattern="[A-Za-z0-9 \-]{0,60}" maxLength={60}/></div>
          <div className="c-fgp"><label>Role</label><select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}><option value="hr">HR</option><option value="manager">Manager</option></select></div>
          <div className="c-fgp"><label>Campus</label><select value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}><option value="hcpur">HCP</option><option value="kashimpur">Kashim Pur</option><option value="both">Both</option></select></div>
          <div className="c-fgp"><label>Joining Date</label><input type="date" value={form.joiningDate} onChange={e=>setForm(f=>({...f,joiningDate:e.target.value}))}/></div>
        </div>
        <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="c-btn c-btn-dk">Add</button></div>
        </form>
      </div></div>}
    </>
  );
}

function Roster(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [search,setSearch]=useState('');const [campus,setCampus]=useState('');const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');
  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(search&&{search}),...(campus&&{campus})}).toString(); hrService.listStudents(q).then(r=>{setRows(r.data.students||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,search,campus]);
  useEffect(()=>{load();},[load]);
  return (
    <>
      <Err m={err}/>
      <div className="c-sb">
        <input className="c-inp" placeholder="Search students…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} maxLength={50}/>
        <select className="c-sel" value={campus} onChange={e=>{setCampus(e.target.value);setPage(1);}}>
          <option value="">All Campuses</option><option value="hcpur">Harish Chandra Pur</option><option value="kashimpur">Kashim Pur</option>
        </select>
      </div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-user-graduate"/><p>No students.</p></div>:
          <div className="c-tw"><table className="c-t"><thead><tr><th>Adm. No</th><th>Name</th><th>Grade</th><th>Programme</th><th>Campus</th><th>Status</th></tr></thead>
          <tbody>{rows.map(s=><tr key={s._id}><td><strong>{s.admissionNo}</strong></td><td>{s.user?.firstName} {s.user?.lastName}</td><td>{s.grade}{s.section}</td><td><span className="bd bd-b">{s.programme}</span></td><td className="mt">{s.campus}</td><td><span className={`bd ${s.status==='active'?'bd-g':'bd-gr'}`}>{s.status}</span></td></tr>)}</tbody>
          </table></div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
    </>
  );
}

function Messages(){
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [modal,setModal]=useState(false);
  const INIT={subject:'',message:'',type:'query',priority:'medium'};const [form,setForm]=useState(INIT);
  useEffect(()=>{ complaintService.mine().then(r=>setRows(r.data.complaints||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[]);
  async function send(ev){ev.preventDefault();setErr('');setOk('');try{await complaintService.create(form);setOk('Sent!');setModal(false);setForm(INIT);complaintService.mine().then(r=>setRows(r.data.complaints||[])).catch(()=>{});}catch(ex){setErr(ex.message);}}
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'16px'}}><button className="c-btn c-btn-dk" onClick={()=>setModal(true)}><i className="fa-solid fa-plus"/>New Message</button></div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-comment-dots"/><p>No messages.</p></div>:rows.map(c=>(
          <div key={c._id} style={{border:'1px solid #E2E8F0',borderRadius:'10px',padding:'14px',marginBottom:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
              <div><h4 style={{fontSize:'.92rem',fontWeight:700}}>{c.subject}</h4><p style={{fontSize:'.78rem',color:'#64748B'}}>{new Date(c.createdAt).toLocaleString()}</p></div>
              <div style={{display:'flex',gap:'6px'}}><span className="bd bd-b">{c.type}</span><span className={`bd ${c.status==='resolved'?'bd-g':c.status==='open'?'bd-r':'bd-y'}`}>{c.status}</span></div>
            </div>
            <p style={{fontSize:'.86rem',color:'#64748B',marginTop:'8px'}}>{c.message}</p>
            {c.response&&<div style={{marginTop:'10px',background:'#F0FDF4',borderRadius:'8px',padding:'10px 12px',border:'1px solid #BBF7D0'}}><p style={{fontSize:'.75rem',color:'#15803D',fontWeight:700,marginBottom:'3px'}}>Response</p><p style={{fontSize:'.86rem',color:'#166534'}}>{c.response}</p></div>}
          </div>
        ))}
      </div>
      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md">
        <div className="c-md-hd"><h3>New Message</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
        <form onSubmit={send}><div className="c-fg">
          <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Subject*</label><input required value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} pattern="[A-Za-z0-9 ,.'!?\-]{3,200}" maxLength={200}/></div>
          <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Message*</label><textarea required value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} maxLength={2000} style={{minHeight:'90px'}}/></div>
          <div className="c-fgp"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{['complaint','feedback','suggestion','query'].map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="c-fgp"><label>Priority</label><select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
        </div>
        <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="c-btn c-btn-dk"><i className="fa-solid fa-paper-plane"/>Send</button></div>
        </form>
      </div></div>}
    </>
  );
}


/* ════ HR CLASSES ════ */
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

  const CL={hcpur:'Harish Chandra Pur',kashimpur:'Kashim Pur',both:'Both'};

  return(
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
        <div style={{display:'flex',gap:'8px'}}>
          <button className={`c-btn ${tab==='by-class'?'c-btn-dk':'c-btn-gh'}`} onClick={()=>setTab('by-class')}><i className="fa-solid fa-chalkboard"/>By Class</button>
          <button className={`c-btn ${tab==='by-teacher'?'c-btn-dk':'c-btn-gh'}`} onClick={()=>setTab('by-teacher')}><i className="fa-solid fa-chalkboard-user"/>By Teacher</button>
        </div>
        <button className="c-btn c-btn-dk" style={{background:'#10B981'}} onClick={()=>{setErr('');setOk('');setModal(true);}}><i className="fa-solid fa-plus"/>Assign Teacher</button>
      </div>

      {loading?<Spin/>:tab==='by-class'?(
        Object.keys(grouped).length===0
          ?<div className="c-empty"><i className="fa-solid fa-chalkboard"/><p>No class assignments yet. Click "Assign Teacher" to start.</p></div>
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
                    <td className="mt">{CL[s.campus]||s.campus}</td>
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
                <td className="mt">{CL[a.campus]||a.campus}</td>
                <td className="mt">{a.academicYear}</td>
                <td><button className="c-btn c-btn-rd c-btn-sm" onClick={()=>doRemove(a._id)}><i className="fa-solid fa-trash"/></button></td>
              </tr>
            ))}</tbody>
          </table></div></div>
      )}

      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md">
        <div className="c-md-hd"><h3>Assign Teacher to Class</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
        <div style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'8px',padding:'10px 14px',marginBottom:'14px',fontSize:'.84rem',color:'#166534'}}>
          <i className="fa-solid fa-circle-info"/> Select a teacher from the faculty list, then assign their class, subject, and campus.
        </div>
        {teachers.length===0&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'8px',padding:'10px 14px',marginBottom:'14px',fontSize:'.84rem',color:'#991B1B'}}><i className="fa-solid fa-triangle-exclamation"/> No teachers found. Add teachers in Faculty tab first.</div>}
        <form onSubmit={doAssign}><div className="c-fg">
          <div className="c-fgp" style={{gridColumn:'1/-1'}}>
            <label>Teacher*</label>
            <select required value={form.teacherId} onChange={e=>setForm(f=>({...f,teacherId:e.target.value}))}>
              <option value="">-- Select Teacher --</option>
              {teachers.map(t=><option key={t._id} value={t._id}>{t.user?.firstName||''} {t.user?.lastName||''}{t.employeeId?` (${t.employeeId})`:''}</option>)}
            </select>
          </div>
          <div className="c-fgp"><label>Grade* (e.g. 5)</label><input required value={form.grade} onChange={e=>setForm(f=>({...f,grade:e.target.value.replace(/[^0-9A-Za-z]/g,'')}))} placeholder="5" maxLength={3}/></div>
          <div className="c-fgp"><label>Section (blank = all)</label><input value={form.section} onChange={e=>setForm(f=>({...f,section:e.target.value.toUpperCase().replace(/[^A-Z]/g,'')}))} placeholder="A" maxLength={1}/></div>
          <div className="c-fgp">
            <label>Subject*</label>
            <select required value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}>
              <option value="">-- Select Subject --</option>
              {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="c-fgp"><label>Campus*</label>
            <select value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}>
              <option value="hcpur">Harish Chandra Pur</option>
              <option value="kashimpur">Kashim Pur</option>
              <option value="both">Both Campuses</option>
            </select>
          </div>
          <div className="c-fgp"><label>Academic Year</label><input value={form.academicYear} onChange={e=>setForm(f=>({...f,academicYear:e.target.value}))} placeholder="2026-27" maxLength={7}/></div>
        </div>
        <div className="c-md-ft">
          <button type="button" className="c-btn c-btn-gh" onClick={()=>setModal(false)}>Cancel</button>
          <button type="submit" className="c-btn c-btn-dk" style={{background:'#10B981'}} disabled={!form.teacherId||!form.grade||!form.subject}>
            <i className="fa-solid fa-chalkboard"/>Assign
          </button>
        </div>
        </form>
      </div></div>}
    </>
  );
}

export default function V4(){
  const loc=useLocation();
  let C=Overview;
  if(loc.pathname.includes('/faculty'))        C=Faculty;
  else if(loc.pathname.includes('/personnel')) C=Personnel;
  else if(loc.pathname.includes('/roster'))    C=Roster;
  else if(loc.pathname.includes('/classes'))   C=Classes;
  else if(loc.pathname.includes('/messages'))  C=Messages;
  return <Shell nav={NAV} title="People Ops"><C/></Shell>;
}
