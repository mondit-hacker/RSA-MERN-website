import { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Shell from '../../core/ui/Shell';
import { studentService, resultService, complaintService, attendanceService } from '../../core/net/client';
import { useSession } from '../../core/store/session';

const NAV = [
  { to:'/workspace/hub',              icon:'fa-gauge',           label:'Overview'      },
  { to:'/workspace/hub/profile',      icon:'fa-id-card',         label:'My Profile'    },
  { to:'/workspace/hub/attendance',   icon:'fa-calendar-check',  label:'Attendance'    },
  { to:'/workspace/hub/results',      icon:'fa-star-half-stroke', label:'My Results'   },
  { to:'/workspace/hub/complaints',   icon:'fa-comment-dots',    label:'Messages'      },
  { to:'/workspace/hub/inbox',        icon:'fa-bell',            label:'Inbox'         },
];

const Spin=()=><div style={{display:'flex',justifyContent:'center',padding:'60px'}}><div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#3B82F6',borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>;
const Err=({m})=>m?<div className="c-err"><i className="fa-solid fa-circle-exclamation"/>{m}</div>:null;
const Ok=({m})=>m?<div className="c-ok"><i className="fa-solid fa-circle-check"/>{m}</div>:null;

/* ══ OVERVIEW ══ */
function Overview(){
  const {user}=useSession();
  const [p,setP]=useState(null);
  const [notifs,setNotifs]=useState([]);
  const [attSummary,setAttSummary]=useState(null);
  const [results,setResults]=useState([]);
  const [err,setErr]=useState('');
  useEffect(()=>{
    studentService.profile().then(r=>{
      setP(r.data.student);
      if(r.data.student?._id){
        attendanceService.summary(r.data.student._id).then(ar=>setAttSummary(ar.data.summary)).catch(()=>{});
        resultService.studentResults(r.data.student._id).then(rr=>setResults(rr.data.results||[])).catch(()=>{});
      }
    }).catch(e=>setErr(e.message));
    studentService.notifications('limit=5&unread=true').then(r=>setNotifs(r.data.notifications||[])).catch(()=>{});
  },[]);
  if(!p&&!err) return <Spin/>;

  const lastResult=results[0];
  const attPct=attSummary?.percentage||0;

  return (
    <>
      <Err m={err}/>
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg,#1E3A5F 0%,#2D5A8E 100%)',borderRadius:'16px',padding:'28px 32px',marginBottom:'24px',color:'#fff',display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
        <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(59,130,246,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',fontWeight:'800',border:'3px solid rgba(255,255,255,.25)',flexShrink:0}}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div style={{flex:1}}>
          <h2 style={{fontSize:'1.4rem',fontWeight:'800',marginBottom:'5px'}}>Welcome, {user?.firstName}!</h2>
          <p style={{opacity:.7,fontSize:'.9rem'}}>Admission: <strong>{p?.admissionNo||'—'}</strong> · {p?.programme} · Grade {p?.grade}{p?.section}</p>
          <p style={{opacity:.55,fontSize:'.8rem',marginTop:'3px'}}>Campus: {p?.campus==='hcpur'?'Harish Chandra Pur':'Kashim Pur'} · Year: {p?.academicYear}</p>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <Link to="/workspace/hub/results" className="c-btn" style={{background:'rgba(255,255,255,.15)',color:'#fff',border:'1px solid rgba(255,255,255,.25)',fontSize:'.82rem'}}>
            <i className="fa-solid fa-star-half-stroke"/>My Results
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}}>
        {[
          ['Attendance',`${attPct}%`,'fa-calendar-check','#10B981','#F0FDF4'],
                    ['Exams Taken',results.length,'fa-star-half-stroke','#8B5CF6','#F5F3FF'],
          ['Unread Alerts',notifs.length,'fa-bell','#3B82F6','#EFF6FF'],
        ].map(([l,n,i,c,bg])=>(
          <div className="c-stat" key={l}>
            <div className="c-stat-bar" style={{background:c}}/>
            <div className="c-stat-ico" style={{background:bg,color:c}}><i className={`fa-solid ${i}`}/></div>
            <div className="c-stat-num" style={{fontSize:typeof n==='string'&&n.length>4?'1.2rem':'1.8rem'}}>{n}</div>
            <div className="c-stat-lbl">{l}</div>
          </div>
        ))}
      </div>

      {/* Row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>

        {/* Last result */}
        <div className="c-card">
          <div className="c-card-hd"><i className="fa-solid fa-star-half-stroke"/>Latest Result</div>
          {!lastResult?<p style={{fontSize:'.88rem',color:'#64748B'}}>No results published yet.</p>:(
            <>
              <p style={{fontWeight:700,fontSize:'1rem',marginBottom:'4px'}}>{lastResult.examName}</p>
              <p style={{fontSize:'.82rem',color:'#64748B',marginBottom:'14px'}}>{lastResult.examType} · Grade {lastResult.grade}</p>
              <div style={{background:`linear-gradient(90deg,${lastResult.percentage>=60?'#10B981':lastResult.percentage>=33?'#F59E0B':'#EF4444'} ${lastResult.percentage}%,#F1F5F9 0%)`,height:'8px',borderRadius:'999px',marginBottom:'8px'}}/>
              <p style={{fontSize:'1.6rem',fontWeight:'800',color:lastResult.percentage>=60?'#10B981':lastResult.percentage>=33?'#F59E0B':'#EF4444'}}>{lastResult.percentage}%</p>
              <p style={{fontSize:'.82rem',color:'#64748B'}}>{lastResult.totalObtained} / {lastResult.totalMax} marks · <span className={`bd ${lastResult.result==='pass'?'bd-g':'bd-r'}`}>{lastResult.result}</span></p>
            </>
          )}
          <Link to="/workspace/hub/results" className="c-btn c-btn-gh c-btn-sm" style={{marginTop:'12px'}}>All results →</Link>
        </div>
      </div>

      {/* Notifications */}
      {notifs.length>0&&(
        <div className="c-card" style={{marginTop:'16px'}}>
          <div className="c-card-hd"><i className="fa-solid fa-bell"/>Recent Notifications</div>
          {notifs.map(n=>(
            <div key={n._id} style={{padding:'11px 13px',borderRadius:'8px',background:'#EFF6FF',marginBottom:'8px',borderLeft:'3px solid #3B82F6'}}>
              <strong style={{fontSize:'.87rem'}}>{n.title}</strong>
              <p style={{fontSize:'.81rem',color:'#64748B',marginTop:'3px'}}>{n.message}</p>
            </div>
          ))}
          <Link to="/workspace/hub/inbox" className="c-btn c-btn-gh c-btn-sm" style={{marginTop:'8px'}}>View all →</Link>
        </div>
      )}
    </>
  );
}

/* ══ PROFILE ══ */
function Profile(){
  const [p,setP]=useState(null);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [editing,setEditing]=useState(false);const [form,setForm]=useState({});
  useEffect(()=>{ studentService.profile().then(r=>{setP(r.data.student);setForm({address:r.data.student.address||{},father:r.data.student.father||{},mother:r.data.student.mother||{}});}).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[]);
  async function save(ev){ev.preventDefault();setErr('');setOk('');try{await studentService.updateProfile(form);setOk('Profile updated.');setEditing(false);}catch(ex){setErr(ex.message);}}
  if(loading) return <Spin/>;
  if(!p) return <Err m={err||'Profile not found.'}/>;
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div className="c-card">
        <div className="c-card-hd"><i className="fa-solid fa-id-card"/>Academic Details</div>
        <div className="c-ig">
          {[['Admission No',p.admissionNo],['Programme',p.programme],['Grade',`${p.grade}${p.section||''}`],['Campus',p.campus==='hcpur'?'Harish Chandra Pur':'Kashim Pur'],['Academic Year',p.academicYear],['Status',p.status],['Blood Group',p.bloodGroup||'—'],['Gender',p.gender||'—']].map(([l,v])=><div className="c-ii" key={l}><label>{l}</label><span>{v}</span></div>)}
        </div>
      </div>
      <div className="c-card">
        <div className="c-card-hd" style={{justifyContent:'space-between'}}>
          <span><i className="fa-solid fa-home"/>Address &amp; Family</span>
          {!editing&&<button className="c-btn c-btn-gh c-btn-sm" onClick={()=>setEditing(true)}><i className="fa-solid fa-pen"/>Edit</button>}
        </div>
        {editing?(
          <form onSubmit={save}>
            <p className="c-sl">Address</p>
            <div className="c-fg">
              {[['street','Street','[A-Za-z0-9 ,./\\-]{0,100}'],['city','City','[A-Za-z ]{0,60}'],['district','District','[A-Za-z ]{0,60}'],['pincode','Pincode','[0-9]{6}']].map(([k,l,pat])=>(
                <div className="c-fgp" key={k}><label>{l}</label><input value={form.address?.[k]||''} pattern={pat} title={`${l} field`} maxLength={100} onChange={e=>setForm(f=>({...f,address:{...f.address,[k]:e.target.value}}))}/></div>
              ))}
            </div>
            <p className="c-sl">Father</p>
            <div className="c-fg">
              {[['name','Name','[A-Za-z .\'\\-]{0,80}'],['phone','Phone','[0-9+\\s\\-]{7,15}'],['occupation','Occupation','[A-Za-z0-9 ,./\\-]{0,80}'],['email','Email']].map(([k,l,pat])=>(
                <div className="c-fgp" key={k}><label>{l}</label><input value={form.father?.[k]||''} type={k==='email'?'email':'text'} pattern={pat} maxLength={100} onChange={e=>setForm(f=>({...f,father:{...f.father,[k]:e.target.value}}))}/></div>
              ))}
            </div>
            <p className="c-sl">Mother</p>
            <div className="c-fg">
              {[['name','Name','[A-Za-z .\'\\-]{0,80}'],['phone','Phone','[0-9+\\s\\-]{7,15}'],['occupation','Occupation','[A-Za-z0-9 ,./\\-]{0,80}'],['email','Email']].map(([k,l,pat])=>(
                <div className="c-fgp" key={k}><label>{l}</label><input value={form.mother?.[k]||''} type={k==='email'?'email':'text'} pattern={pat} maxLength={100} onChange={e=>setForm(f=>({...f,mother:{...f.mother,[k]:e.target.value}}))}/></div>
              ))}
            </div>
            <div className="c-md-ft"><button type="button" className="c-btn c-btn-gh" onClick={()=>setEditing(false)}>Cancel</button><button type="submit" className="c-btn c-btn-dk">Save Changes</button></div>
          </form>
        ):(
          <div className="c-ig">
            {[['Street',p.address?.street||'—'],['City',p.address?.city||'—'],['District',p.address?.district||'—'],['Pincode',p.address?.pincode||'—'],["Father's Name",p.father?.name||'—'],["Father's Phone",p.father?.phone||'—'],["Mother's Name",p.mother?.name||'—'],["Mother's Phone",p.mother?.phone||'—']].map(([l,v])=><div className="c-ii" key={l}><label>{l}</label><span>{v}</span></div>)}
          </div>
        )}
      </div>
    </>
  );
}

/* ══ ATTENDANCE ══ */
function AttendanceView(){
  const [summary,setSummary]=useState(null);const [records,setRecords]=useState([]);const [err,setErr]=useState('');const [loading,setLoading]=useState(true);
  useEffect(()=>{
    studentService.profile().then(r=>{
      const sid=r.data.student?._id;
      if(!sid){setLoading(false);return;}
      Promise.all([
        attendanceService.summary(sid),
        attendanceService.byStudent ? attendanceService.byStudent(sid,'limit=60') : Promise.resolve({data:{attendance:[]}}),
      ]).then(([s,a])=>{
        setSummary(s.data);
        setRecords((a.data?.attendance||[]).slice(0,30));
      }).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
    }).catch(e=>{setErr(e.message);setLoading(false);});
  },[]);

  if(loading) return <Spin/>;

  const pct  = summary?.percentage || 0;
  const bars = [
    {label:'Present', val:summary?.present||0,   color:'#10B981'},
    {label:'Absent',  val:summary?.absent||0,    color:'#EF4444'},
    {label:'Late',    val:summary?.late||0,       color:'#F59E0B'},
    {label:'Half Day',val:summary?.halfDay||0,    color:'#8B5CF6'},
  ];
  const total = bars.reduce((s,b)=>s+b.val,0)||1;
  const pctColor = pct>=75?'#10B981':pct>=50?'#F59E0B':'#EF4444';

  return(
    <>
      <Err m={err}/>
      {/* Percentage hero */}
      <div style={{background:'linear-gradient(135deg,#1D4ED8,#3B82F6)',borderRadius:'16px',padding:'28px 32px',marginBottom:'20px',color:'#fff',display:'flex',alignItems:'center',gap:'28px',flexWrap:'wrap'}}>
        <div style={{width:'90px',height:'90px',borderRadius:'50%',border:'6px solid rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:`conic-gradient(${pctColor} ${pct*3.6}deg, rgba(255,255,255,.1) 0deg)`}}>
          <div style={{width:'72px',height:'72px',borderRadius:'50%',background:'rgba(29,78,216,.9)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
            <span style={{fontSize:'1.2rem',fontWeight:800,lineHeight:1}}>{pct}%</span>
            <span style={{fontSize:'.65rem',opacity:.7}}>Present</span>
          </div>
        </div>
        <div style={{flex:1}}>
          <h3 style={{fontWeight:800,fontSize:'1.15rem',marginBottom:'4px'}}>My Attendance</h3>
          <p style={{opacity:.7,fontSize:'.85rem',marginBottom:'10px'}}>Academic Year — {total} school days recorded</p>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {bars.map(b=>(
              <span key={b.label} style={{background:'rgba(255,255,255,.15)',padding:'3px 10px',borderRadius:'999px',fontSize:'.75rem',fontWeight:600}}>
                {b.label}: {b.val}
              </span>
            ))}
          </div>
        </div>
        <div style={{background: pct<75?'rgba(239,68,68,.2)':'rgba(16,185,129,.2)', border:`1px solid ${pctColor}`, borderRadius:'10px', padding:'12px 16px', textAlign:'center', flexShrink:0}}>
          <div style={{fontSize:'1.8rem',fontWeight:800,color:pctColor}}>{pct>=75?'✓':'!'}</div>
          <div style={{fontSize:'.75rem',fontWeight:600,color:pctColor}}>{pct>=75?'Good Standing':'Below 75%'}</div>
          <div style={{fontSize:'.7rem',opacity:.7,marginTop:'2px'}}>Min Required: 75%</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="c-card" style={{marginBottom:'16px'}}>
        <div className="c-card-hd"><i className="fa-solid fa-chart-bar"/>Attendance Breakdown</div>
        <div style={{padding:'12px 0'}}>
          {bars.map(b=>(
            <div key={b.label} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px',padding:'0 4px'}}>
              <span style={{width:'72px',fontSize:'.82rem',color:'#64748B',fontWeight:600,flexShrink:0}}>{b.label}</span>
              <div style={{flex:1,background:'#F1F5F9',borderRadius:'8px',height:'22px',overflow:'hidden'}}>
                <div style={{width:`${(b.val/total)*100}%`,height:'100%',background:b.color,borderRadius:'8px',transition:'width .6s ease',minWidth:b.val>0?'4px':'0'}}/>
              </div>
              <span style={{width:'32px',textAlign:'right',fontSize:'.82rem',fontWeight:700,color:b.color}}>{b.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent records */}
      {records.length>0&&<div className="c-card">
        <div className="c-card-hd"><i className="fa-solid fa-calendar-days"/>Recent Records</div>
        <div className="c-tw"><table className="c-t">
          <thead><tr><th>Date</th><th>Status</th><th>Remarks</th></tr></thead>
          <tbody>{records.map((r,i)=>(
            <tr key={i}>
              <td className="mt">{new Date(r.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
              <td><span className={`bd ${r.status==='present'?'bd-g':r.status==='absent'?'bd-r':r.status==='late'?'bd-y':'bd-p'}`}>{r.status}</span></td>
              <td className="mt">{r.remarks||'—'}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>}

      {records.length===0&&summary&&<div className="c-card">
        <div className="c-empty"><i className="fa-solid fa-calendar"/><p>No attendance records yet for this academic year.</p></div>
      </div>}
    </>
  );
}


function Results(){

  const EXAM_LABEL={
    'class-test':'Class Test','1st-term':'1st Term Exam',
    '2nd-term':'2nd Term Exam','3rd-term':'3rd Term Exam','exam':'Exam',
    'unit-test':'Unit Test','half-yearly':'Half Yearly','annual':'Annual',
    'mock':'Mock','class-test':'Class Test',
  };
  const [results,setResults]=useState([]);const [err,setErr]=useState('');const [loading,setLoading]=useState(true);const [expanded,setExpanded]=useState(null);
  useEffect(()=>{
    studentService.profile().then(r=>{
      const sid=r.data.student?._id;
      if(!sid){setLoading(false);return;}
      resultService.studentResults(sid).then(rr=>setResults(rr.data.results||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
    }).catch(e=>{setErr(e.message);setLoading(false);});
  },[]);

  if(loading) return <Spin/>;

  // Trend data for chart
  const chartData=results.slice(0,8).reverse().map(r=>({name:r.examName?.slice(0,12)||'', pct:r.percentage||0}));
  const best=results.reduce((b,r)=>r.percentage>b?r.percentage:b,0);
  const avg=results.length?Math.round(results.reduce((s,r)=>s+r.percentage,0)/results.length):0;

  return(
    <>
      <Err m={err}/>
      {results.length===0
        ?<div className="c-empty"><i className="fa-solid fa-star-half-stroke"/><p>No results published yet.</p></div>
        :<>
          {/* Summary stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px'}}>
            {[['Exams Taken',results.length,'fa-clipboard-list','#3B82F6','#EFF6FF'],
              ['Best Score',`${best}%`,'fa-trophy','#F59E0B','#FFFBEB'],
              ['Average',`${avg}%`,'fa-chart-line','#10B981','#F0FDF4'],
            ].map(([l,n,i,c,bg])=>(
              <div className="c-stat" key={l} style={{padding:'14px'}}>
                <div className="c-stat-ico" style={{background:bg,color:c}}><i className={`fa-solid ${i}`}/></div>
                <div className="c-stat-num" style={{fontSize:'1.4rem'}}>{n}</div>
                <div className="c-stat-lbl">{l}</div>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          {chartData.length>1&&<div className="c-card" style={{marginBottom:'16px'}}>
            <div className="c-card-hd"><i className="fa-solid fa-chart-line"/>Performance Trend</div>
            <div style={{padding:'8px 4px'}}>
              {chartData.map((d,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                  <span style={{width:'80px',fontSize:'.76rem',color:'#64748B',flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</span>
                  <div style={{flex:1,background:'#F1F5F9',borderRadius:'6px',height:'18px',overflow:'hidden'}}>
                    <div style={{width:`${d.pct}%`,height:'100%',background:d.pct>=75?'#10B981':d.pct>=50?'#F59E0B':'#EF4444',borderRadius:'6px',transition:'width .5s'}}/>
                  </div>
                  <span style={{width:'40px',textAlign:'right',fontSize:'.8rem',fontWeight:700,color:d.pct>=75?'#10B981':d.pct>=50?'#F59E0B':'#EF4444'}}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>}

          {/* Results list */}
          <div className="c-card">
            <div className="c-card-hd"><i className="fa-solid fa-list"/>All Results</div>
            {results.map((r,i)=>(
              <div key={i} style={{border:'1px solid #E2E8F0',borderRadius:'10px',marginBottom:'10px',overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',cursor:'pointer',background:expanded===i?'#F8FAFC':'#fff'}} onClick={()=>setExpanded(expanded===i?null:i)}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:'.95rem',color:'#0B1F3A'}}>{r.examName}</div>
                    <div style={{fontSize:'.78rem',color:'#64748B',marginTop:'2px'}}>{EXAM_LABEL[r.examType]||r.examType} · Grade {r.grade}{r.section||''} · {r.academicYear}</div>
                  </div>
                  <div style={{textAlign:'center',flexShrink:0}}>
                    <div style={{fontSize:'1.1rem',fontWeight:800,color:r.percentage>=75?'#10B981':r.percentage>=50?'#F59E0B':'#EF4444'}}>{r.percentage}%</div>
                    <span className={`bd ${r.result==='pass'?'bd-g':'bd-r'}`} style={{fontSize:'.7rem'}}>{r.result}</span>
                  </div>
                  <div style={{fontSize:'.82rem',color:'#94A3B8'}}>{r.totalObtained}/{r.totalMax}</div>
                  <i className={`fa-solid fa-chevron-${expanded===i?'up':'down'}`} style={{color:'#94A3B8',fontSize:'.75rem'}}/>
                </div>
                {expanded===i&&r.subjects?.length>0&&(
                  <div style={{borderTop:'1px solid #E2E8F0',padding:'12px 14px',background:'#F8FAFC'}}>
                    <div className="c-tw"><table className="c-t">
                      <thead><tr><th>Subject</th><th>Obtained</th><th>Max</th><th>%</th></tr></thead>
                      <tbody>{r.subjects.map((s,j)=>(
                        <tr key={j}>
                          <td><strong>{s.subject||s.name}</strong></td>
                          <td style={{fontWeight:700,color:s.obtained>=s.maxMarks*0.33?'#10B981':'#EF4444'}}>{s.obtained}</td>
                          <td className="mt">{s.maxMarks}</td>
                          <td><span className={`bd ${s.obtained/s.maxMarks>=0.33?'bd-g':'bd-r'}`}>{Math.round(s.obtained/s.maxMarks*100)}%</span></td>
                        </tr>
                      ))}</tbody>
                    </table></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>}
    </>
  );
}


function Messages(){
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');const [modal,setModal]=useState(false);
  const INIT={subject:'',message:'',type:'query',priority:'medium'};
  const [form,setForm]=useState(INIT);
  useEffect(()=>{ complaintService.mine().then(r=>setRows(r.data.complaints||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[]);
  async function send(ev){ ev.preventDefault();setErr('');setOk(''); try{await complaintService.create(form);setOk('Message sent!');setModal(false);setForm(INIT);complaintService.mine().then(r=>setRows(r.data.complaints||[])).catch(()=>{});}catch(ex){setErr(ex.message);} }
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'16px'}}>
        <button className="c-btn c-btn-dk" onClick={()=>setModal(true)}><i className="fa-solid fa-plus"/>New Message</button>
      </div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-comment-dots"/><p>No messages sent yet.</p></div>:rows.map(c=>(
          <div key={c._id} style={{border:'1px solid #E2E8F0',borderRadius:'10px',padding:'14px',marginBottom:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',flexWrap:'wrap'}}>
              <div>
                <h4 style={{fontSize:'.92rem',fontWeight:700}}>{c.subject}</h4>
                <p style={{fontSize:'.78rem',color:'#64748B',marginTop:'2px'}}>{new Date(c.createdAt).toLocaleString()}</p>
              </div>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                <span className={`bd ${c.type==='complaint'?'bd-r':c.type==='query'?'bd-b':'bd-g'}`}>{c.type}</span>
                <span className={`bd ${c.status==='resolved'?'bd-g':c.status==='open'?'bd-r':'bd-y'}`}>{c.status}</span>
              </div>
            </div>
            <p style={{fontSize:'.86rem',color:'#64748B',marginTop:'8px',lineHeight:1.65}}>{c.message}</p>
            {c.response&&<div style={{marginTop:'10px',background:'#F0FDF4',borderRadius:'8px',padding:'10px 12px',border:'1px solid #BBF7D0'}}>
              <p style={{fontSize:'.75rem',color:'#15803D',fontWeight:700,marginBottom:'3px'}}>Response from Admin</p>
              <p style={{fontSize:'.86rem',color:'#166534'}}>{c.response}</p>
            </div>}
          </div>
        ))}
      </div>
      {modal&&<div className="c-mo" onClick={e=>e.target===e.currentTarget&&setModal(false)}><div className="c-md">
        <div className="c-md-hd"><h3>New Message / Complaint</h3><button className="c-md-cl" onClick={()=>setModal(false)}>✕</button></div>
        <form onSubmit={send}>
          <div className="c-fg">
            <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Subject*</label><input required value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} pattern="[A-Za-z0-9 ,.'!?\\-]{3,200}" title="Alphanumeric, spaces, basic punctuation" maxLength={200}/></div>
            <div className="c-fgp" style={{gridColumn:'1/-1'}}><label>Message*</label><textarea required value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} maxLength={2000} style={{minHeight:'90px'}}/></div>
            <div className="c-fgp"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{['complaint','feedback','suggestion','query','appreciation'].map(t=><option key={t}>{t}</option>)}</select></div>
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
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [err,setErr]=useState('');const [ok,setOk]=useState('');
  useEffect(()=>{ studentService.notifications().then(r=>setRows(r.data.notifications||[])).catch(e=>setErr(e.message)).finally(()=>setLoading(false)); },[]);
  async function markRead(id){try{await studentService.markRead(id);setRows(r=>r.map(n=>n._id===id?{...n,isRead:true}:n));}catch(ex){setErr(ex.message);}}
  async function markAll(){try{await studentService.markAllRead();setRows(r=>r.map(n=>({...n,isRead:true})));setOk('All marked as read.');}catch(ex){setErr(ex.message);}}
  const TC={announcement:'#3B82F6',alert:'#EF4444',info:'#10B981',warning:'#F59E0B',system:'#8B5CF6'};
  return (
    <>
      <Err m={err}/><Ok m={ok}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'14px'}}>
        <button className="c-btn c-btn-gh c-btn-sm" onClick={markAll}><i className="fa-solid fa-check-double"/>Mark all read</button>
      </div>
      <div className="c-card">
        {loading?<Spin/>:rows.length===0?<div className="c-empty"><i className="fa-solid fa-bell"/><p>No notifications yet.</p></div>:rows.map(n=>(
          <div key={n._id} onClick={()=>!n.isRead&&markRead(n._id)} style={{padding:'13px 15px',borderRadius:'9px',background:n.isRead?'#F8FAFC':'#EFF6FF',marginBottom:'9px',borderLeft:`4px solid ${TC[n.type]||'#64748B'}`,cursor:n.isRead?'default':'pointer',transition:'background .2s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px'}}><strong style={{fontSize:'.88rem'}}>{n.title}</strong>{!n.isRead&&<span className="bd bd-b" style={{flexShrink:0}}>New</span>}</div>
            <p style={{fontSize:'.82rem',color:'#64748B',marginTop:'4px'}}>{n.message}</p>
            <p style={{fontSize:'.73rem',color:'#94A3B8',marginTop:'5px'}}>{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default function V2(){
  const loc=useLocation();
  let C=Overview;
  if(loc.pathname.includes('/profile'))    C=Profile;
  if(loc.pathname.includes('/attendance')) C=AttendanceView;
  if(loc.pathname.includes('/results'))    C=Results;
  if(loc.pathname.includes('/complaints')) C=Messages;
  if(loc.pathname.includes('/inbox'))      C=Inbox;
  return <Shell nav={NAV} title="Student Hub"><C/></Shell>;
}
