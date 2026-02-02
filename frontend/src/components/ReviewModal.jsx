// frontend/src/components/ReviewModal.jsx
import { useState } from 'react';
import { X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function ReviewModal({ paperId, onClose, onSuccess }) {
  const [score, setScore] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/faculty/review', { paperId, score, comments });
      toast.success("Review Submitted");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass w-full max-w-md p-6 rounded-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Submit Review</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Score (1-10)</label>
            <input 
              type="number" min="1" max="10" 
              value={score} onChange={e => setScore(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Comments</label>
            <textarea 
              rows="4"
              value={comments} onChange={e => setComments(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
              placeholder="Critique this paper..."
            ></textarea>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2"
          >
            {loading ? <span>Submitting...</span> : <><Check size={18} /><span>Submit Review</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}