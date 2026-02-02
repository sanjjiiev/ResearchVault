import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = "http://localhost:5000";

function App() {
  const [step, setStep] = useState('login');
  const [user, setUser] = useState({ username: '', password: '', role: 'Researcher' });
  const [session, setSession] = useState(null); // { userId, role }
  const [otpInput, setOtpInput] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  
  // Data State
  const [publicPapers, setPublicPapers] = useState([]);
  const [pendingPapers, setPendingPapers] = useState([]); 
  const [myRequests, setMyRequests] = useState([]); 
  const [file, setFile] = useState(null);
  const [viewUrl, setViewUrl] = useState(null);

  // --- AUTH ---
  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, user);
      setServerOtp(res.data.debug_otp);
      setSession({ userId: res.data.userId, role: res.data.role });
      setStep('mfa');
      alert(`OTP Sent (Check Console/Alert): ${res.data.debug_otp}`);
    } catch { alert("Login Failed"); }
  };

  const verifyMfa = () => {
    if (otpInput === serverOtp) {
      setStep('home');
      loadHomeData(session.userId, session.role);
    } else alert("Wrong OTP");
  };

  // --- DATA LOADING ---
  const loadHomeData = (uid, role) => {
    fetchPublicPapers(uid);
    if(role === 'Researcher') fetchIncomingRequests(uid);
    if(role === 'Reviewer') fetchPendingApprovals(uid);
  };

  const fetchPublicPapers = async (uid) => {
    try {
        const res = await axios.get(`${API_URL}/public-papers`, { headers: { 'x-user-id': uid } });
        const papers = res.data || [];
        
        // Check Access Status for each paper
        const updated = await Promise.all(papers.map(async (p) => {
            if (p.ownerId === uid) return { ...p, access: 'owner' };
            try {
                const s = await axios.get(`${API_URL}/my-access-status?userId=${uid}&paperId=${p.id}`);
                return { ...p, access: s.data.status };
            } catch { return { ...p, access: 'none' }; }
        }));
        setPublicPapers(updated);
    } catch  { console.error("Load failed"); }
  };

  const fetchPendingApprovals = async (uid) => {
      const res = await axios.get(`${API_URL}/pending-papers`, { headers: { 'x-user-id': uid } });
      setPendingPapers(res.data);
  };

  const fetchIncomingRequests = async (uid) => {
      const res = await axios.get(`${API_URL}/incoming-requests`, { headers: { 'x-user-id': uid } });
      setMyRequests(res.data);
  };

  // --- ACTIONS ---
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('paper', file);
    formData.append('userId', session.userId);
    formData.append('title', "New Research Paper");
    
    try {
      await axios.post(`${API_URL}/upload`, formData);
      alert("Uploaded! Waiting for Reviewer Approval.");
      setFile(null);
    } catch { alert("Upload Failed"); }
  };

  const staffApprove = async (paperId) => {
      await axios.post(`${API_URL}/review-approve`, { paperId, role: 'Reviewer' });
      fetchPendingApprovals(session.userId);
      fetchPublicPapers(session.userId);
  };

  const requestAccess = async (paperId) => {
      await axios.post(`${API_URL}/request-access`, { userId: session.userId, paperId });
      alert("Request Sent to Owner.");
      fetchPublicPapers(session.userId);
  };

  const grantAccess = async (requestId) => {
      await axios.post(`${API_URL}/grant-access`, { requestId });
      fetchIncomingRequests(session.userId);
  };

  const viewPaper = async (paperId) => {
    try {
        const res = await axios.post(`${API_URL}/view-paper`, 
            { paperId, userId: session.userId }, 
            { responseType: 'blob' }
        );
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        setViewUrl(url); 
    } catch { alert("Access Denied."); }
  };

  const deletePaper = async (paperId) => {
      if(!confirm("Are you sure?")) return;
      await axios.post(`${API_URL}/delete-paper`, { paperId, userId: session.userId });
      fetchPublicPapers(session.userId);
  };

  // --- UI ---
  return (
    <div className="container">
      {step === 'login' && (
        <div className="auth-card">
          <h1>University Portal</h1>
          <input placeholder="Username" onChange={e=>setUser({...user, username:e.target.value})} />
          <input type="password" placeholder="Password" onChange={e=>setUser({...user, password:e.target.value})} />
          <select onChange={e=>setUser({...user, role:e.target.value})}>
             <option>Researcher</option><option>Reviewer</option>
          </select>
          <button onClick={login}>Login</button>
          <button className="secondary" onClick={() => axios.post(`${API_URL}/register`, user).then(() => alert("Registered!"))}>Register</button>
        </div>
      )}

      {step === 'mfa' && (
        <div className="auth-card">
          <h3>Security Check</h3>
          <p>Enter the code sent to your console/alert.</p>
          <input placeholder="OTP Code" onChange={e=>setOtpInput(e.target.value)} />
          <button onClick={verifyMfa}>Verify Identity</button>
        </div>
      )}

      {step === 'home' && (
        <div>
           <div style={{display:'flex', justifyContent:'space-between'}}>
              <h2>Welcome, {session.role}</h2>
              <button className="secondary" onClick={() => window.location.reload()}>Logout</button>
           </div>

           {/* PDF OVERLAY */}
           {viewUrl && (
             <div className="pdf-overlay">
                <div className="pdf-header"><span>Secure View Mode (Download Disabled)</span> <button onClick={() => setViewUrl(null)}>Close</button></div>
                <iframe src={`${viewUrl}#toolbar=0`} title="Secure Viewer"></iframe>
             </div>
           )}

           {/* STAFF DASHBOARD */}
           {session.role === 'Reviewer' && pendingPapers.length > 0 && (
              <div className="request-box">
                  <h3>⚠️ Pending Approvals</h3>
                  <ul className="paper-list">
                      {pendingPapers.map(p => (
                          <li key={p.id} className="paper-item">
                              <span>{p.title}</span>
                              <div>
                                  <button className="secondary" onClick={() => viewPaper(p.id)}>Check</button>
                                  <button style={{marginLeft:10}} onClick={() => staffApprove(p.id)}>Approve</button>
                              </div>
                          </li>
                      ))}
                  </ul>
              </div>
           )}

           {/* RESEARCHER UPLOAD */}
           {session.role === 'Researcher' && (
              <div style={{background:'#eee', padding:20, borderRadius:8, marginBottom:20}}>
                  <h4>Upload Paper</h4>
                  <input type="file" onChange={e=>setFile(e.target.files[0])} />
                  <button onClick={handleUpload} disabled={!file}>Encrypt & Upload</button>
                  
                  {/* INCOMING REQUESTS */}
                  {myRequests.length > 0 && (
                      <div className="request-box" style={{marginTop:20}}>
                          <h4>🔔 Access Requests</h4>
                          {myRequests.map(req => (
                              <div key={req.id} style={{padding:10, borderBottom:'1px solid #ccc'}}>
                                  User <strong>{req.users.username}</strong> wants to view <em>{req.papers.title}</em>
                                  <button style={{marginLeft:20}} onClick={() => grantAccess(req.id)}>Grant</button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
           )}

           {/* PUBLIC LIST */}
           <h3>📄 Published Papers</h3>
           <ul className="paper-list">
               {publicPapers.map(p => (
                   <li key={p.id} className="paper-item">
                       <div>
                           <strong>{p.title}</strong>
                           {p.access === 'owner' && <span className="badge owner">Owner</span>}
                           {p.access === 'granted' && <span className="badge granted">Granted</span>}
                           {p.access === 'pending' && <span className="badge pending">Requested</span>}
                       </div>
                       <div>
                           {(p.access === 'owner' || p.access === 'granted' || session.role === 'Reviewer') ? (
                               <>
                                   <button onClick={() => viewPaper(p.id)}>View</button>
                                   {p.access === 'owner' && <button className="secondary" style={{background:'red'}} onClick={() => deletePaper(p.id)}>Delete</button>}
                               </>
                           ) : p.access === 'pending' ? (
                               <button disabled>Pending...</button>
                           ) : (
                               <button onClick={() => requestAccess(p.id)}>Request Access</button>
                           )}
                       </div>
                   </li>
               ))}
           </ul>
        </div>
      )}
    </div>
  );
}

export default App;