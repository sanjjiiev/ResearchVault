import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false); // Toggle Login/Register
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  
  // FIX: Added tempToken state to store the token from Step 1
  const [tempToken, setTempToken] = useState(null);
  
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

  // Handle Login Step 1
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setUserId(res.data.userId);
      
      // FIX: Capture the token sent from backend
      setTempToken(res.data.tempToken);
      
      setStep(2);
      toast.success("Check email for OTP.");
    } catch  {
      toast.error("Invalid credentials");
    }
  };

  // Handle Login Step 2 (MFA)
  const handleMFA = async (e) => {
    e.preventDefault();
    try {
      // 1. Verify OTP
      await api.post('/auth/verify-otp', { userId, otp });

      // 2. If successful, save the token we got in Step 1
      if (tempToken) {
        localStorage.setItem('token', tempToken);
        navigate('/dashboard');
        toast.success("Secure Access Granted.");
      } else {
        toast.error("Session missing. Please login again.");
        setStep(1);
      }
    } catch  {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md p-8 glass rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">ResearchVault</h2>
          <p className="text-slate-400 mt-2">{isRegister ? "Create Account" : "Secure Login"}</p>
        </div>

        {/* REMOVED AnimatePresence and motion.form */}
        {isRegister ? (
          // REGISTER FORM
          <form onSubmit={handleRegister} className="space-y-4">
            <Input icon={<User />} placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
            <Input icon={<Mail />} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input icon={<Lock />} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button text="Sign Up" />
            <p className="text-center text-slate-400 text-sm mt-4 cursor-pointer hover:text-cyan-400" onClick={() => setIsRegister(false)}>
              Already have an account? Login
            </p>
          </form>
        ) : step === 1 ? (
          // LOGIN FORM
          <form onSubmit={handleLogin} className="space-y-4">
            <Input icon={<Mail />} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input icon={<Lock />} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button text="Verify Credentials" />
            <p className="text-center text-slate-400 text-sm mt-4 cursor-pointer hover:text-cyan-400" onClick={() => setIsRegister(true)}>
              New User? Create Account
            </p>
          </form>
        ) : (
          // MFA FORM
          <form onSubmit={handleMFA} className="space-y-4">
            <div className="text-center text-cyan-300 text-sm mb-4">OTP sent to {email}</div>
            <Input icon={<Shield />} placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} autoFocus />
            <Button text="Authenticate" />
          </form>
        )}
      </div>
    </div>
  );
}

function Input({ icon, ...props }) {
  return (
    <div className="relative group">
      <div className="absolute left-3 top-3 text-slate-500">{icon}</div>
      <input {...props} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:outline-none focus:border-cyan-500 transition-all" />
    </div>
  );
}

function Button({ text }) {
  return (
    <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all">
      {text}
    </button>
  );
}