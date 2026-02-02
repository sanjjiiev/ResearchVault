import { useEffect, useState } from 'react';
import { BookOpen, Download, User, Calendar } from 'lucide-react';
import api from '../api';

export default function AcceptedPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccepted = async () => {
      try {
        // Fetch with mode=accepted to get only published papers
        const res = await api.get('/papers?mode=accepted');
        setPapers(res.data);
      } catch  {
        console.error("Failed to fetch accepted papers");
      } finally {
        setLoading(false);
      }
    };
    fetchAccepted();
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
    } catch {
      alert("Download failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <BookOpen className="text-cyan-400" size={40} />
          Published Research
        </h1>
        <p className="text-slate-400">Browse accepted academic papers and publications.</p>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 mt-10">Loading repository...</div>
      ) : papers.length === 0 ? (
        <div className="text-center text-slate-500 mt-10 p-10 glass rounded-xl">
          <p>No papers have been published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {papers.map((paper) => (
            <div key={paper.id} className="glass p-6 rounded-xl border border-slate-700 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{paper.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><User size={14} className="text-cyan-400"/> {paper.profiles?.full_name}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} className="text-cyan-400"/> {new Date(paper.created_at).toLocaleDateString()}</span>
                  <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs border border-green-500/20 uppercase font-bold">Peer Reviewed</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{paper.abstract}</p>
              </div>
              
              <div className="w-full md:w-auto flex-shrink-0">
                <button 
                  onClick={() => handleDownload(paper.id, paper.title)}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 bg-slate-800 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors border border-slate-600 hover:border-cyan-500"
                >
                  <Download size={18} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
