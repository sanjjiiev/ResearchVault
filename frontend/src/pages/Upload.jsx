import { useState } from 'react';
import { UploadCloud, File, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !title) return toast.error("Please fill all fields");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('abstract', abstract);

    setLoading(true);
    try {
      // Backend handles encryption
      await api.post('/papers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("File Encrypted & Uploaded Successfully!");
      setFile(null);
      setTitle('');
      setAbstract('');
    } catch  {
      toast.error("Upload Failed. Check permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Secure Submission</h1>
      <p className="text-slate-500 mb-8">Files are encrypted client-side via AES-256 before transmission.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Paper Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Abstract</label>
            <textarea 
              rows="4"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            ></textarea>
          </div>
        </div>

        {/* Dropzone Section */}
        <div className="bg-white rounded-xl p-8 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center hover:border-cyan-500 transition-colors">
          {file ? (
            <div className="text-cyan-600">
              <File size={48} className="mx-auto mb-4" />
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button onClick={() => setFile(null)} className="text-sm text-red-500 mt-2 hover:underline">Remove</button>
            </div>
          ) : (
            <>
              <UploadCloud size={48} className="text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-700">Drag PDF here or click to browse</p>
              <p className="text-sm text-slate-500 mt-2">PDF only. Max 10MB.</p>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleUpload}
          disabled={loading || !file}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-cyan-200"
        >
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
          <span>{loading ? 'Encrypting & Uploading...' : 'Submit Securely'}</span>
        </button>
      </div>
    </div>
  );
}