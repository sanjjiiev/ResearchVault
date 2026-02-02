import { useState } from 'react';
import { Check, X } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function AdminControls({ paperId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleDecision = async (status) => {
    setLoading(true);
    try {
      await api.post('/admin/decision', { paperId, status });
      toast.success(`Paper ${status} successfully`);
      onSuccess();
    } catch (err) {
      toast.error("Failed to publish decision");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2 mt-2">
      <button 
        onClick={() => handleDecision('accepted')}
        disabled={loading}
        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg flex items-center justify-center space-x-1 text-xs transition"
      >
        <Check size={14} />
        <span>Accept</span>
      </button>
      <button 
        onClick={() => handleDecision('rejected')}
        disabled={loading}
        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg flex items-center justify-center space-x-1 text-xs transition"
      >
        <X size={14} />
        <span>Reject</span>
      </button>
    </div>
  );
}