import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Upload, LogOut, BookOpen } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'student';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col border-r border-slate-200 shadow-sm z-10">
        <div className="p-6 flex items-center space-x-3 text-cyan-600">
          <ShieldCheck size={32} />
          <span className="text-2xl font-bold tracking-wider">ResearchVault</span>
        </div>

        <nav className="flex-1 px-4 space-y-4 mt-8">
          <NavLink to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
          <NavLink to="/accepted" icon={<BookOpen />} label="Published Research" />
          {role === 'student' && (
            <NavLink to="/upload" icon={<Upload />} label="Secure Upload" />
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-500 hover:bg-red-50 w-full p-3 rounded-lg transition font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link 
      to={to} 
      className="flex items-center space-x-3 p-3 text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-xl transition-all duration-200"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}