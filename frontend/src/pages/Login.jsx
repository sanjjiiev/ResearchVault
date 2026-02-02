import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Login() {
  const [step, setStep] = useState(1); // 1: Creds, 2: MFA
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setUserId(res.data.userId);
      setStep(2);
      toast.success("Credentials valid. Check email for OTP.");
    } catch  {
      toast.error("Invalid credentials.");
    }
  };

  const handleMFA = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp });
      // In a real app, the token comes from here or session
      // For this demo, we assume the backend set the session or returned a token
      // We'll mock saving a token if the backend didn't send one explicitly in the snippet
      localStorage.setItem('token', res.data.token || 'mock-session-token');
      navigate('/dashboard');
      toast.success("Secure Access Granted.");
    } catch  {
      toast.error("Invalid OTP.");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md p-8 glass rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <div className="bg-cyan-500/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4 text-cyan-400">
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white">ResearchVault</h2>
          <p className="text-slate-400 mt-2">NIST Compliant Security System</p>
        </div>

        <AnimatePresence mode='wait'>
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <Input icon={<Mail />} type="email" placeholder="University Email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input icon={<Lock />} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <Button text="Verify Credentials" />
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleMFA}
              className="space-y-4"
            >
              <div className="text-center text-cyan-300 text-sm mb-4">
                Enter the OTP sent to {email}
              </div>
              <Input icon={<Shield />} type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} autoFocus />
              <Button text="Authenticate" />
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Input({ icon, ...props }) {
  return (
    <div className="relative group">
      <div className="absolute left-3 top-3 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
        {icon}
      </div>
      <input 
        {...props}
        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
      />
    </div>
  );
}

function Button({ text }) {
  return (
    <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2">
      <span>{text}</span>
      <ArrowRight size={18} />
    </button>
  );
}