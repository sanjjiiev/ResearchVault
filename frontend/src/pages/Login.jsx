import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false); // Toggle Login/Register
  const [step, setStep] = useState(1); 
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  
  // Temporary Storage for Multi-Step Process
  const [userId, setUserId] = useState(null);
  const [tempToken, setTempToken] = useState(null);
  const [tempRole, setTempRole] = useState(null);
  
  const navigate = useNavigate();

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email, password, full_name: fullName });
      toast.success("Account created! Please login.");
      setIsRegister(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  // Handle Login Step 1 (Password)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Capture data from backend
      setUserId(res.data.userId);
      setTempToken(res.data.tempToken); // Store Token
      setTempRole(res.data.role);       // Store Role (admin/faculty)
      
      setStep(2); // Move to OTP screen
      toast.success("Credentials valid. Check email for OTP.");
    } catch {
      toast.error("Invalid credentials");
    }
  };

  // Handle Login Step 2 (MFA OTP)
  const handleMFA = async (e) => {
    e.preventDefault();
    try {
      // Verify OTP
      await api.post('/auth/verify-otp', { userId, otp });

      // Save Token & Role to LocalStorage (Persist Session)
      if (tempToken && tempRole) {
        localStorage.setItem('token', tempToken);
        localStorage.setItem('role', tempRole);
        
        navigate('/dashboard');
        toast.success(`Welcome back, ${tempRole.toUpperCase()}!`);
      } else {
        toast.error("Session missing. Please login again.");
        setStep(1);
      }
    } catch  {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-cyan-50 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4 text-cyan-600">
            <Shield size={28} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">ResearchVault</h2>
          <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest font-medium">
            {isRegister ? "Create Account" : step === 1 ? "Secure Login" : "Multi-Factor Auth"}
          </p>
        </div>

        {/* FORMS */}
        {isRegister ? (
          // --- REGISTER FORM ---
          <form onSubmit={handleRegister} className="space-y-4">
            <Input icon={<User />} placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
            <Input icon={<Mail />} type="email" placeholder="University Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input icon={<Lock />} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            
            <Button text="Create Account" />
            
            <p className="text-center text-slate-500 text-sm mt-4 cursor-pointer hover:text-cyan-600 transition" onClick={() => setIsRegister(false)}>
              Already have an account? <span className="text-cyan-600 font-bold">Login</span>
            </p>
          </form>

        ) : step === 1 ? (
          // --- LOGIN STEP 1 FORM ---
          <form onSubmit={handleLogin} className="space-y-4">
            <Input icon={<Mail />} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input icon={<Lock />} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            
            <Button text="Verify Credentials" />
            
            <p className="text-center text-slate-500 text-sm mt-4 cursor-pointer hover:text-cyan-600 transition" onClick={() => setIsRegister(true)}>
              New User? <span className="text-cyan-600 font-bold">Create Account</span>
            </p>
          </form>

        ) : (
          // --- LOGIN STEP 2 FORM (OTP) ---
          <form onSubmit={handleMFA} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
              <p className="text-xs text-slate-500">Code sent to:</p>
              <p className="text-blue-600 font-mono text-sm font-bold">{email}</p>
            </div>

            <Input icon={<Shield />} placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} autoFocus />
            
            <Button text="Authenticate Access" />
            
            <p className="text-center text-slate-400 text-xs mt-4 cursor-pointer hover:text-slate-600" onClick={() => setStep(1)}>
              ← Back to Login
            </p>
          </form>
        )}

      </div>
    </div>
  );
}

// Reusable Components
function Input({ icon, ...props }) {
  return (
    <div className="relative group">
      <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-cyan-600 transition-colors">
        {icon}
      </div>
      <input 
        {...props} 
        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" 
      />
    </div>
  );
}

function Button({ text }) {
  return (
    <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-200 transition-all flex items-center justify-center space-x-2">
      <span>{text}</span>
      <ArrowRight size={18} />
    </button>
  );
}