import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Shell from '../../core/ui/Shell';
import { teacherService, attendanceService, resultService, complaintService, assignmentService } from '../../core/net/client';
import { useSession } from '../../core/store/session';

const NAV=[
  {to:'/workspace/edu',              icon:'fa-gauge',          label:'Overview'},
  {to:'/workspace/edu/cohort',       icon:'fa-user-graduate',  label:'My Students'},
  {to:'/workspace/edu/attendance',   icon:'fa-calendar-check', label:'Mark Attendance'},
  {to:'/workspace/edu/results',      icon:'fa-star-half-stroke',label:'Enter Results'},
  {to:'/workspace/edu/messages',     icon:'fa-comment-dots',   label:'Messages'},
  {to:'/workspace/edu/inbox',        icon:'fa-bell',           label:'Inbox'},
  {to:'/workspace/edu/profile',      icon:'fa-user',           label:'Profile'},
];

const PIE_COLORS=['#10B981','#EF4444','#F59E0B','#8B5CF6'];
const Spin=()=><div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#8B5CF6',borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>;
const Err=({m})=>m?<div className="c-err"><i className="fa-solid fa-circle-exclamation"/>{m}</div>:null;
const Ok=({m})=>m?<div className="c-ok"><i className="fa-solid fa-circle-check"/>{m}</div>:null;

/* ══ OVERVIEW ══ */
function Overview(){
  const {user}=useSession();
  const [p,setP]=useState(null);const [students,setStudents]=useState([]);const [err,setErr]=useState('');
  useEffect(()=>{
    teacherService.profile().then(r=>setP(r.data.teacher)).catch(e=>setErr(e.message));
    teacherService.myStudents('limit=5').then(r=>setStudents(r.data.students||[])).catch(()=>{});
  },[]);
  if(!p&&!err) return <Spin/>;
  return (
    <>
      <Err m={err}/>
      <div style={{background:'linear-gradient(135deg,#2D1B4E,#5B21B6)',borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff',display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
        <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(139,92,246,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',fontWeight:'800',border:'3px solid rgba(255,255,255,.25)',flexShrink:0}}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
        <div style={{flex:1}}>
          <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'5px'}}>Welcome, {p?.designation||'Teacher'} {user?.firstName}!</h2>
          <p style={{opacity:.7,fontSize:'.9rem'}}>Employee ID: {p?.employeeId} · Dept: {p?.department||'General'}</p>
          <p style={{opacity:.55,fontSize:'.8rem',marginTop:'3px'}}>Subjects: {p?.subjects?.join(', ')||'—'} · Campus: {p?.campus}</p>
        </div>
        <span style={{background:'rgba(255,255,255,.15)',padding:'5px 14px',borderRadius:'999px',fontSize:'.75rem',fontWeight:700}}>Teacher</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}}>
        {[['Students',students.length+'+','fa-user-graduate','#8B5CF6','#F5F3FF'],['Subjects',p?.subjects?.length||0,'fa-book','#3B82F6','#EFF6FF'],['Grades',p?.grades?.length||0,'fa-chalkboard','#10B981','#F0FDF4'],['Experience',`${p?.experience?.total||0}y`,'fa-briefcase','#F59E0B','#FFFBEB']].map(([l,n,i,c,bg])=>(
          <div className="c-stat" key={l}><div className="c-stat-bar" style={{background:c}}/><div className="c-stat-ico" style={{background:bg,color:c}}><i className={`fa-solid ${i}`}/></div><div className="c-stat-num" style={{fontSize:typeof n==='string'&&n.length>4?'1.2rem':'1.8rem'}}>{n}</div><div className="c-stat-lbl">{l}</div></div>
        ))}
      </div>
      {students.length>0&&<div className="c-card"><div className="c-card-hd"><i className="fa-solid fa-user-graduate"/>Recent Students</div>
        <div className="c-tw"><table className="c-t"><thead><tr><th>Adm. No</th><th>Name</th><th>Grade</th><th>Campus</th></tr></thead>
        <tbody>{students.map(s=><tr key={s._id}><td>{s.admissionNo}</td><td>{s.user?.firstName} {s.user?.lastName}</td><td>{s.grade}{s.section}</td><td>{s.campus}</td></tr>)}</tbody>
        </table></div>
      </div>}
    </>
  );
}

/* ══ COHORT ══ */
function Cohort(){
  const [rows,setRows]=useState([]);const [meta,setMeta]=useState({});const [search,setSearch]=useState('');const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');
  const load=useCallback(()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...(search&&{search})}).toString(); teacherService.myStudents(q).then(r=>{setRows(r.data.students||[]);setMeta(r.meta||{});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[page,search]);
  useEffect(()=>{load();},[load]);
  return (
    <>
      <Err m={err}/>
      <div className="c-sb"><input className="c-inp" placeholder="Search students…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} pattern="[A-Za-z0-9 \-]*" maxLength={50}/></div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-user-graduate"/><p>No students in your cohort.</p></div>:
          <div className="c-tw"><table className="c-t"><thead><tr><th>Adm. No</th><th>Name</th><th>Grade</th><th>Section</th><th>Programme</th><th>Campus</th><th>Status</th></tr></thead>
          <tbody>{rows.map(s=><tr key={s._id}><td><strong>{s.admissionNo}</strong></td><td>{s.user?.firstName} {s.user?.lastName}</td><td>{s.grade}</td><td>{s.section||'—'}</td><td><span className="bd bd-b">{s.programme}</span></td><td className="mt">{s.campus}</td><td><span className={`bd ${s.status==='active'?'bd-g':'bd-gr'}`}>{s.status}</span></td></tr>)}</tbody>
          </table></div>}
        {meta.pages>1&&<div className="c-pg"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button><span>Page {meta.page} of {meta.pages} ({meta.total})</span><button disabled={page>=meta.pages} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
      </div>
    </>
  );
}

/* ══ ATTENDANCE (Teacher marks) ══ */
function MarkAttendance(){
  const [grade,setGrade]=useState('');const [section,setSection]=useState('');const [campus,setCampus]=useState('hcpur');const [date,setDate]=useState(new Date().toISOString().split('T')[0]);
  const [students,setStudents]=useState([]);const [records,setRecords]=useState({});const [loading,setLoading]=useState(false);const [err,setErr]=useState('');const [ok,setOk]=useState('');
  async function loadStudents(){
    if(!grade){setErr('Enter grade first.');return;}
    setLoading(true);setErr('');
    const q=new URLSearchParams({grade,campus,...(section&&{section}),limit:100}).toString();
    teacherService.myStudents(q).then(r=>{
      const s=r.data.students||[];setStudents(s);
      const init={};s.forEach(st=>{init[st._id]='present';});setRecords(init);
    }).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  }
  async function submit(){
    if(!students.length){setErr('Load students first.');return;}
    setLoading(true);setErr('');setOk('');
    const recs=students.map(s=>({studentId:s._id,status:records[s._id]||'present'}));
    attendanceService.markBulk({date,grade,section,campus,records:recs}).then(()=>setOk(`Attendance submitted for ${recs.length} students.`)).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
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
          {Object.entries(counts).map(([s,c])=>(
            <div key={s} style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:'10px',padding:'14px',borderTop:`3px solid ${STATUS_C[s]}`}}>
              <div style={{fontSize:'1.5rem',fontWeight:'800',color:STATUS_C[s]}}>{c}</div>
              <div style={{fontSize:'.73rem',textTransform:'capitalize',color:'#64748B',fontWeight:600}}>{s}</div>
            </div>
          ))}
        </div>
        <div className="c-card">
          <div className="c-card-hd"><i className="fa-solid fa-users"/>Students — {date} | Grade {grade}{section}</div>
          <div className="c-tw"><table className="c-t">
            <thead><tr><th>Adm. No</th><th>Name</th><th>Present</th><th>Absent</th><th>Late</th><th>Half Day</th></tr></thead>
            <tbody>{students.map(s=>(
              <tr key={s._id}>
                <td><strong>{s.admissionNo}</strong></td><td>{s.user?.firstName} {s.user?.lastName}</td>
                {['present','absent','late','half-day'].map(st=>(
                  <td key={st} style={{textAlign:'center'}}><input type="radio" name={s._id} value={st} checked={records[s._id]===st} onChange={()=>setRecords(r=>({...r,[s._id]:st}))} style={{accentColor:STATUS_C[st],width:'16px',height:'16px',cursor:'pointer'}}/></td>
                ))}
              </tr>
            ))}</tbody>
          </table></div>
          <div style={{marginTop:'16px',display:'flex',justifyContent:'flex-end'}}>
            <button className="c-btn c-btn-ok" onClick={submit} disabled={loading}><i className="fa-solid fa-circle-check"/>Submit Attendance</button>
          </div>
        </div>
      </>}
    </>
  );
}

/* ══ RESULTS (teacher enters) ══ */
function EnterResults(){
  const EXAM_TYPES=[
    {val:'class-test',label:'Class Test'},
    {val:'1st-term',  label:'1st Term Exam'},
    {val:'2nd-term',  label:'2nd Term Exam'},
    {val:'3rd-term',  label:'3rd Term Exam'},
    {val:'exam',      label:'Exam'},
  ];
  const DEFAULT_SUBJECTS=['English','Mathematics','Science','Social Science','Hindi','Computer'];
  const INIT={student:'',academicYear:'2026-27',examName:'',examType:'class-test',grade:'',section:'',
    subjects:DEFAULT_SUBJECTS.map(s=>({name:s,maxMarks:100,obtained:0}))};

  const [rows,setRows]=useState([]);const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');
  const [modal,setModal]=useState(false);const [editRow,setEditRow]=useState(null);const [form,setForm]=useState(INIT);
  const [newSubject,setNewSubject]=useState('');

  useEffect(()=>{
    Promise.all([
      resultService.list('limit=30'),
      teacherService.profile().then(p=>{
        const tid=p.data.teacher?._id;
        if(!tid) return {data:{students:[],assignments:[]}};
        return assignmentService.teacherStudents(tid);
      }),
    ]).then(([r,s])=>{
      setRows(r.data.results||[]);
      setStudents(s.data.students||[]);
    }).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[]);

  function openAdd(){ setEditRow(null);setForm(INIT);setErr('');setOk('');setModal(true); }
  function openEdit(r){
    setEditRow(r);
    setForm({
      student:r.student?._id||r.student||'',
      academicYear:r.academicYear,examName:r.examName,
      examType:r.examType||'class-test',grade:r.grade,section:r.section||'',
      subjects:(r.subjects||[]).map(s=>({name:s.name,maxMarks:s.maxMarks,obtained:s.obtained})),
    });
    setErr('');setOk('');setModal(true);
  }

  const totalMax      = form.subjects.reduce((s,x)=>s+(+x.maxMarks||0),0);
  const totalObtained = form.subjects.reduce((s,x)=>s+(+x.obtained||0),0);
  const pct           = totalMax>0?+(totalObtained/totalMax*100).toFixed(1):0;

  async function save(ev){
    ev.preventDefault();setErr('');setOk('');
    if(!form.student){setErr('Please select a student.');return;}
    if(!form.examName.trim()){setErr('Exam name is required.');return;}
    try{
      if(editRow){
        await resultService.update(editRow._id,{examName:form.examName,examType:form.examType,academicYear:form.academicYear,subjects:form.subjects});
        setOk('Result updated.');
      } else {
        await resultService.create({...form,subjects:form.subjects.map(s=>({...s,subject:s.name,maxMarks:+s.maxMarks,obtained:+s.obtained}))});
        setOk(`Result saved for ${students.find(s=>s._id===form.student)?.user?.firstName||'student'}.`);
      }
      setModal(false);
      resultService.list('limit=30').then(r=>setRows(r.data.results||[]));
    }catch(ex){setErr(ex.message);}
  }

  async function del(id){
    if(!confirm('Delete this result?'))return;
    try{await resultService.remove(id);setOk('Deleted.');setRows(r=>r.filter(x=>x._id!==id));}catch(ex){setErr(ex.message);}
  }

  function setSubject(i,field,val){
    const s=[...form.subjects];s[i]={...s[i],[field]:field==='name'?val:+val};setForm(f=>({...f,subjects:s}));
  }
  function removeSubject(i){ setForm(f=>({...f,subjects:f.subjects.filter((_,j)=>j!==i)})); }
  function addSubject(){
    const n=newSubject.trim();if(!n)return;
    if(form.subjects.find(s=>s.name.toLowerCase()===n.toLowerCase()))return;
    setForm(f=>({...f,subjects:[...f.subjects,{name:n,maxMarks:100,obtained:0}]}));
    setNewSubject('');
  }

  if(loading) return <Spin/>;
  return(
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
        <div><h3 style={{fontWeight:700,color:'#0B1F3A',margin:0}}>Exam Results</h3>
          <p style={{fontSize:'.83rem',color:'#64748B',margin:'2px 0 0'}}>{students.length} student{students.length!==1?'s':''} from your assigned classes</p>
        </div>
        <button className="c-btn c-btn-dk" style={{background:'#8B5CF6'}} onClick={openAdd}><i className="fa-solid fa-plus"/>Add Result</button>
      </div>

      {students.length===0&&<div style={{background:'#FEF9C3',border:'1px solid #FDE68A',borderRadius:'10px',padding:'12px 16px',marginBottom:'14px',fontSize:'.84rem',color:'#92400E',display:'flex',gap:'8px'}}>
        <i className="fa-solid fa-triangle-exclamation" style={{flexShrink:0}}/>
        No students found. Ask Admin or HR to assign you to a class from Admin Panel → Classes.
      </div>}

      {rows.length===0
        ?<div className="c-empty"><i className="fa-solid fa-star-half-stroke"/><p>No results entered yet. Click Add Result to start.</p></div>
        :<div className="c-card"><div className="c-tw"><table className="c-t">
          <thead><tr><th>Student</th><th>Exam</th><th>Type</th><th>Grade</th><th>Score</th><th>%</th><th>Result</th><th></th></tr></thead>
          <tbody>{rows.map(r=>(
            <tr key={r._id}>
              <td style={{fontSize:'.85rem'}}>{r.student?.user?.firstName||r.student?.admissionNo||'—'}</td>
              <td><strong>{r.examName}</strong></td>
              <td><span className="bd bd-p">{EXAM_TYPES.find(e=>e.val===r.examType)?.label||r.examType}</span></td>
              <td className="mt">Gr.{r.grade}{r.section||''}</td>
              <td className="mt">{r.totalObtained}/{r.totalMax}</td>
              <td style={{fontWeight:700,color:r.percentage>=75?'#10B981':r.percentage>=33?'#F59E0B':'#EF4444'}}>{r.percentage}%</td>
              <td><span className={`bd ${r.result==='pass'?'bd-g':'bd-r'}`}>{r.result}</span></td>
              <td style={{display:'flex',gap:'4px'}}>
                <button className="c-btn c-btn-gh c-btn-sm" onClick={()=>openEdit(r)}><i className="fa-solid fa-pen"/></button>
                <button className="c-btn c-btn-rd c-btn-sm" onClick={()=>del(r._id)}><i className="fa-solid fa-trash"/></button>
              </td>
            </tr>
          ))}</tbody>
        </table></div></div>}

      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md" style={{maxWidth:'600px'}}>
        <div className="c-md-hd"><h3>{editRow?'Edit Result':'Enter Exam Result'}</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
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

          <div style={{background:'#F5F3FF',border:'1px solid #DDD6FE',borderRadius:'10px',padding:'14px',margin:'14px 0'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
              <span style={{fontWeight:700,fontSize:'.9rem',color:'#5B21B6'}}>Subject Marks</span>
              <span style={{fontSize:'.82rem',fontWeight:700,color:pct>=33?'#10B981':'#EF4444'}}>{totalObtained}/{totalMax} ({pct}%) — {pct>=33?'✓ PASS':'✗ FAIL'}</span>
            </div>
            {form.subjects.map((s,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 70px 70px 28px',gap:'6px',marginBottom:'6px',alignItems:'center'}}>
                <input value={s.name} onChange={e=>setSubject(i,'name',e.target.value)} style={{padding:'5px 8px',borderRadius:'6px',border:'1px solid #DDD6FE',fontSize:'.84rem'}}/>
                <input type="number" min={0} max={999} value={s.maxMarks} onChange={e=>setSubject(i,'maxMarks',e.target.value)} placeholder="Max" style={{padding:'5px 6px',borderRadius:'6px',border:'1px solid #DDD6FE',fontSize:'.84rem',textAlign:'center'}}/>
                <input type="number" min={0} max={s.maxMarks||999} value={s.obtained} onChange={e=>setSubject(i,'obtained',e.target.value)} placeholder="Got" style={{padding:'5px 6px',borderRadius:'6px',border:`1px solid ${+s.obtained>+s.maxMarks?'#EF4444':'#DDD6FE'}`,fontSize:'.84rem',textAlign:'center',background:+s.maxMarks>0&&+s.obtained/+s.maxMarks>=0.33?'#F0FDF4':'#FFF1F2'}}/>
                <button type="button" onClick={()=>removeSubject(i)} style={{background:'none',border:'none',color:'#EF4444',cursor:'pointer',padding:'2px'}}>✕</button>
              </div>
            ))}
            <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
              <input value={newSubject} onChange={e=>setNewSubject(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSubject())} placeholder="Add another subject…" style={{flex:1,padding:'5px 10px',borderRadius:'6px',border:'1px dashed #8B5CF6',fontSize:'.84rem'}}/>
              <button type="button" className="c-btn c-btn-gh c-btn-sm" onClick={addSubject}><i className="fa-solid fa-plus"/>Add</button>
            </div>
          </div>

          <div className="c-md-ft">
            <button type="button" className="c-btn c-btn-gh" onClick={()=>setModal(false)}>Cancel</button>
            <button type="submit" className="c-btn c-btn-dk" style={{background:'#8B5CF6'}} disabled={!form.student||!form.examName||!form.subjects.length}>
              <i className="fa-solid fa-floppy-disk"/>{editRow?'Update':'Save Result'}
            </button>
          </div>
        </form>
      </div></div>}
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
              <div><h4 style={{fontSize:'.92rem',fontWeight:700}}>{c.subject}</h4><p style={{fontSize:'.78rem',color:'#64748B',marginTop:'2px'}}>{new Date(c.createdAt).toLocaleString()}</p></div>
              <div style={{display:'flex',gap:'6px'}}><span className={`bd ${c.type==='complaint'?'bd-r':'bd-b'}`}>{c.type}</span><span className={`bd ${c.status==='resolved'?'bd-g':c.status==='open'?'bd-r':'bd-y'}`}>{c.status}</span></div>
            </div>
            <p style={{fontSize:'.86rem',color:'#64748B',marginTop:'8px',lineHeight:1.65}}>{c.message}</p>
            {c.response&&<div style={{marginTop:'10px',background:'#F0FDF4',borderRadius:'8px',padding:'10px 12px',border:'1px solid #BBF7D0'}}>
              <p style={{fontSize:'.75rem',color:'#15803D',fontWeight:700,marginBottom:'3px'}}>Admin Response</p>
              <p style={{fontSize:'.86rem',color:'#166534'}}>{c.response}</p>
            </div>}
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

/* ══ INBOX ══ */
function Inbox(){
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');
  useEffect(()=>{ teacherService.notifications().then(r=>setRows(r.data.notifications||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[]);
  async function markRead(id){try{await teacherService.markRead(id);setRows(r=>r.map(n=>n._id===id?{...n,isRead:true}:n));}catch(ex){setErr(ex.message);}}
  return (
    <>
      <Err m={err}/>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-bell"/><p>No notifications.</p></div>:rows.map(n=>(
          <div key={n._id} onClick={()=>!n.isRead&&markRead(n._id)} style={{padding:'13px 15px',borderRadius:'9px',background:n.isRead?'#F8FAFC':'#F5F3FF',marginBottom:'9px',borderLeft:'4px solid #8B5CF6',cursor:n.isRead?'default':'pointer'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><strong style={{fontSize:'.88rem'}}>{n.title}</strong>{!n.isRead&&<span className="bd bd-p">New</span>}</div>
            <p style={{fontSize:'.82rem',color:'#64748B',marginTop:'4px'}}>{n.message}</p>
            <p style={{fontSize:'.73rem',color:'#94A3B8',marginTop:'5px'}}>{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ══ PROFILE ══ */
function Profile(){
  const [p,setP]=useState(null);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [editing,setEditing]=useState(false);const [subjects,setSubjects]=useState('');
  useEffect(()=>{ teacherService.profile().then(r=>{setP(r.data.teacher);setSubjects((r.data.teacher.subjects||[]).join(', '));}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[]);
  async function save(ev){ev.preventDefault();setErr('');setOk('');try{await teacherService.updateProfile({subjects:subjects.split(',').map(s=>s.trim()).filter(Boolean)});setOk('Saved.');setEditing(false);}catch(ex){setErr(ex.message);}}
  if(loading) return <Spin/>;
  if(!p) return <Err m={err||'Profile not found.'}/>;
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-card">
        <div className="c-card-hd" style={{justifyContent:'space-between'}}><span><i className="fa-solid fa-chalkboard-user"/>Teacher Profile</span>{!editing&&<button className="c-btn c-btn-gh c-btn-sm" onClick={()=>setEditing(true)}><i className="fa-solid fa-pen"/>Edit</button>}</div>
        <div className="c-ig">{[['Employee ID',p.employeeId],['Designation',p.designation],['Department',p.department||'—'],['Campus',p.campus],['Employment',p.employmentType],['Status',p.status],['Total Experience',`${p.experience?.total||0} yrs`],['At School',`${p.experience?.atSchool||0} yrs`]].map(([l,v])=><div className="c-ii" key={l}><label>{l}</label><span>{v}</span></div>)}</div>
        {editing?(
          <form onSubmit={save} style={{marginTop:'16px'}}>
            <div className="c-fgp"><label>Subjects (comma separated)</label><input value={subjects} onChange={e=>setSubjects(e.target.value)} pattern="[A-Za-z0-9 ,]{0,200}" maxLength={200}/></div>
            <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setEditing(false)}>Cancel</button><button type="submit" className="c-btn c-btn-dk">Save</button></div>
          </form>
        ):(
          <div style={{marginTop:'16px'}}>
            <p className="c-sl">Subjects</p>
            <div style={{display:'flex',gap:'7px',flexWrap:'wrap'}}>{p.subjects?.map(s=><span key={s} className="bd bd-p">{s}</span>)||<span style={{color:'#94A3B8',fontSize:'.87rem'}}>None assigned</span>}</div>
            <p className="c-sl">Grades</p>
            <div style={{display:'flex',gap:'7px',flexWrap:'wrap'}}>{p.grades?.map(g=><span key={g} className="bd bd-b">Grade {g}</span>)||<span style={{color:'#94A3B8',fontSize:'.87rem'}}>None assigned</span>}</div>
          </div>
        )}
      </div>
    </>
  );
}

export default function V3(){
  const loc=useLocation();
  let C=Overview;
  if(loc.pathname.includes('/cohort'))     C=Cohort;
  if(loc.pathname.includes('/attendance')) C=MarkAttendance;
  if(loc.pathname.includes('/results'))    C=EnterResults;
  if(loc.pathname.includes('/messages'))   C=Messages;
  if(loc.pathname.includes('/inbox'))      C=Inbox;
  if(loc.pathname.includes('/profile'))    C=Profile;
  return <Shell nav={NAV} title="Educator Hub"><C/></Shell>;
}
