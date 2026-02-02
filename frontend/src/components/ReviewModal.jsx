import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function ReviewModal({ paperId, onClose, onSuccess }) {
  const [score, setScore] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/faculty/review', { paperId, score, comments });
      toast.success("Review submitted");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 p-6 rounded-xl w-full max-w-lg relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-slate-900 mb-4">Submit Review</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Score (1-10)</label>
            <input type="number" min="1" max="10" value={score} onChange={(e) => setScore(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-cyan-500 outline-none" />
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 mb-1">Comments</label>
            <textarea rows="4" value={comments} onChange={(e) => setComments(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-cyan-500 outline-none" placeholder="Enter your detailed review..." required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg transition shadow-md">
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}