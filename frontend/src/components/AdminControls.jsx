// frontend/src/components/AdminControls.jsx
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function AdminControls({ paperId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDecision = async (status) => {
    if(!confirm(`Are you sure you want to ${status} this paper? This will be digitally signed.`)) return;
    
    setLoading(true);
    try {
      await api.post('/admin/decision', { paperId, status });
      toast.success(`Paper ${status} successfully!`);
      onSuccess();
    } catch {
      toast.error("Failed to publish decision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-3 mt-4 pt-4 border-t border-slate-800">
      <button 
        onClick={() => handleDecision('accepted')}
        disabled={loading}
        className="flex-1 bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600 hover:text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-all"
      >
        <CheckCircle size={16} /> <span>Accept</span>
      </button>
      
      <button 
        onClick={() => handleDecision('rejected')}
        disabled={loading}
        className="flex-1 bg-red-600/20 text-red-400 border border-red-600/50 hover:bg-red-600 hover:text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-all"
      >
        <XCircle size={16} /> <span>Reject</span>
      </button>
    </div>
  );
}