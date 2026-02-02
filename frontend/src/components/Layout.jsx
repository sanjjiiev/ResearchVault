import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Upload, LogOut } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass flex flex-col border-r border-slate-800">
        <div className="p-6 flex items-center space-x-3 text-cyan-400">
          <ShieldCheck size={32} />
          <span className="text-2xl font-bold tracking-wider">ResearchVault</span>
        </div>

        <nav className="flex-1 px-4 space-y-4 mt-8">
          <NavLink to="/dashboard" icon={<FileText />} label="My Papers" />
          <NavLink to="/upload" icon={<Upload />} label="Secure Upload" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-400 hover:bg-red-500/10 w-full p-3 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link 
      to={to} 
      className="flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-cyan-500/10 rounded-xl transition-all duration-200"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}