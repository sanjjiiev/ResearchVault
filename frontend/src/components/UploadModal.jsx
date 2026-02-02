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
    } catch  {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 p-6 rounded-xl w-full max-w-lg relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><UploadCloud className="text-cyan-600" /> Upload Research</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Paper Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-cyan-500 outline-none" required />
          <textarea placeholder="Abstract" rows="3" value={abstract} onChange={e => setAbstract(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-cyan-500 outline-none" required />
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-cyan-500 transition cursor-pointer relative">
            <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            <p className="text-slate-400 text-sm">{file ? file.name : "Drop PDF here or click to browse"}</p>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition shadow-md">{loading ? "Encrypting & Uploading..." : "Secure Upload"}</button>
        </form>
      </div>
    </div>
  );
}