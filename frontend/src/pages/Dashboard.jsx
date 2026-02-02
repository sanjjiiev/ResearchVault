import { useEffect, useState } from 'react';
import { FileText, Download, Clock } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await api.get('/papers');
        setPapers(res.data);
      } catch  {
        console.error("Failed to fetch papers");
      }
    };
    fetchPapers();
  }, []);

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
      alert("Decryption Failed!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Research Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <div key={paper.id} className="glass p-6 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-800 rounded-lg text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                <FileText size={24} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                paper.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {paper.status || 'Submitted'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{paper.title}</h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{paper.abstract}</p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
              <div className="flex items-center text-slate-500 text-xs">
                <Clock size={14} className="mr-1" />
                {new Date(paper.created_at).toLocaleDateString()}
              </div>
              
              <button 
                onClick={() => handleDownload(paper.id, paper.title)}
                className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <Download size={16} />
                <span>Decrypt & Download</span>
              </button>
            </div>
          </div>
        ))}
        
        {papers.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No research papers found. Upload one to get started.
          </div>
        )}
      </div>
    </div>
  );
}