
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Stethoscope
} from 'lucide-react';
import { AuthState, Digitizer } from './types.js';
import { AuthController } from './db.js';
import LoginPage from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import PatientsPage from './pages/Patients.js';
import DigitizersPage from './pages/Digitizers.js';
import ReportsPage from './pages/Reports.js';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: AuthController.getCurrentUser(),
    isAuthenticated: !!AuthController.getCurrentUser()
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = (user: Digitizer) => {
    AuthController.setCurrentUser(user);
    setAuthState({ user, isAuthenticated: true });
  };

  const handleLogout = () => {
    AuthController.setCurrentUser(null);
    setAuthState({ user: null, isAuthenticated: false });
  };

  if (!authState.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'patients': return <PatientsPage currentUser={authState.user!} />;
      case 'digitizers': return <DigitizersPage />;
      case 'reports': return <ReportsPage />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'digitizers', label: 'Digitadores', icon: UserPlus },
    { id: 'reports', label: 'Relatórios', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Stethoscope className="text-emerald-400" size={24} />
          <span className="font-bold text-lg tracking-tight">UPA Pediátrica</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 text-slate-300 transition-transform duration-300 ease-in-out transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block border-r border-slate-800
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden md:flex items-center gap-3 mb-10 px-2">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl">
              <Stethoscope className="text-emerald-500 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl tracking-tight leading-none">UPA Pediátrica</h1>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Hospital Management</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/25' 
                    : 'hover:bg-slate-900 hover:text-white'}
                `}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-900">
            <div className="bg-slate-900/50 p-4 rounded-2xl mb-4 border border-slate-800/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3">Sessão Ativa</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-black text-white shadow-inner">
                  {authState.user?.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-white truncate">{authState.user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate font-medium">{authState.user?.email}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all font-bold text-sm"
            >
              <LogOut size={20} />
              <span>Encerrar Sessão</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <div className="p-5 md:p-12 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
