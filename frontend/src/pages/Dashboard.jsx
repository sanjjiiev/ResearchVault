import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Clock, PenTool, Plus, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import ReviewModal from '../components/ReviewModal';
import AdminControls from '../components/AdminControls';
import UploadModal from '../components/UploadModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  
  // FIX 1: Initialize role directly from localStorage to prevent cascading renders
  const [userRole] = useState(() => localStorage.getItem('role') || 'student');
  
  const [selectedPaper, setSelectedPaper] = useState(null); 
  const [showUpload, setShowUpload] = useState(false);

  // Fetch Papers
  const fetchPapers = useCallback(async () => {
    try {
      const res = await api.get('/papers');
      setPapers(res.data);
    } catch (err) {
      console.error("Failed to fetch papers", err);
      toast.error("Failed to load papers. Please check database connections.");
    }
  }, []);

  // FIX 2: useEffect now only handles data fetching, not role setting
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPapers();
  }, [fetchPapers]);

  const handleDownload = async (id, title) => {
    try {
      const response = await api.get(`/papers/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch  {
      alert("Decryption Failed or Access Denied!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {userRole === 'admin' ? 'Admin Control Center' : userRole === 'faculty' ? 'Review Dashboard' : 'My Research'}
        </h1>
        
        <div className="flex items-center gap-3">
          {userRole === 'student' && (
            <button onClick={() => setShowUpload(true)} className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition shadow-md shadow-cyan-200">
              <Plus size={20} />
              <span>Upload Paper</span>
            </button>
          )}
          <button onClick={handleLogout} className="flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg transition">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <div key={paper.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-cyan-50 rounded-lg text-cyan-600">
                <FileText size={24} />
              </div>
              <Badge status={paper.status} />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{paper.title}</h3>
            <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">{paper.abstract}</p>
            <div className="text-xs text-slate-400 mb-4 flex items-center font-medium">
               <Clock size={12} className="mr-1"/> {new Date(paper.created_at).toLocaleDateString()}
               <span className="ml-auto text-cyan-600">Author: {paper.profiles?.full_name || paper.profiles?.[0]?.full_name || 'Unknown'}</span>
            </div>

            {/* Admin View: Show Reviews */}
            {userRole === 'admin' && paper.reviews && paper.reviews.length > 0 && (
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Faculty Reviews</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {paper.reviews.map((review) => (
                    <div key={review.id} className="text-xs text-slate-600 border-b border-slate-200 last:border-0 pb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-cyan-700 font-medium">{review.profiles?.full_name || review.profiles?.[0]?.full_name || 'Faculty'}</span>
                        <span className={`font-bold ${review.score >= 7 ? 'text-green-600' : 'text-yellow-600'}`}>Score: {review.score}/10</span>
                      </div>
                      <p className="italic opacity-80">"{review.comments}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
              
              {/* Common: Download Button */}
              <button 
                onClick={() => handleDownload(paper.id, paper.title)}
                className="w-full flex items-center justify-center space-x-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition font-medium"
              >
                <Download size={16} />
                <span>Decrypt & Download</span>
              </button>

              {/* Faculty Action: Review Button */}
              {userRole === 'faculty' && paper.status !== 'accepted' && paper.status !== 'rejected' && (
                <button 
                  onClick={() => setSelectedPaper(paper.id)}
                  className="w-full flex items-center justify-center space-x-2 text-sm bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg transition shadow-sm"
                >
                  <PenTool size={16} />
                  <span>Submit Review</span>
                </button>
              )}

              {/* Admin Action: Decision Controls */}
              {userRole === 'admin' && (
                 <AdminControls paperId={paper.id} onSuccess={fetchPapers} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal Popup */}
      {selectedPaper && (
        <ReviewModal 
          paperId={selectedPaper} 
          onClose={() => setSelectedPaper(null)} 
          onSuccess={fetchPapers} 
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)}
          onSuccess={fetchPapers}
        />
      )}
    </div>
  );
}

// Simple Badge Component for Status
function Badge({ status }) {
  const colors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${colors[status] || colors.submitted}`}>
      {status?.replace('_', ' ') || 'Submitted'}
    </span>
  );
}