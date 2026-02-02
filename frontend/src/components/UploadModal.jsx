import { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function UploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a PDF file");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('abstract', abstract);

    setLoading(true);
    try {
      await api.post('/papers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Paper uploaded securely!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
        
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><UploadCloud className="text-cyan-400" /> Upload Research</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Paper Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" required />
          <textarea placeholder="Abstract" rows="3" value={abstract} onChange={e => setAbstract(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" required />
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-cyan-500/50 transition cursor-pointer relative">
            <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            <p className="text-slate-400 text-sm">{file ? file.name : "Drop PDF here or click to browse"}</p>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition">{loading ? "Encrypting & Uploading..." : "Secure Upload"}</button>
        </form>
      </div>
    </div>
  );
}