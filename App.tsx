
import React, { useState, useEffect, useCallback } from 'react';
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
import { AuthState, Digitizer } from './types';
import { AuthController } from './db';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/Patients';
import DigitizersPage from './pages/Digitizers';
import ReportsPage from './pages/Reports';

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
          <Stethoscope className="text-emerald-400" />
          <span className="font-bold text-lg">UPA Pediátrica</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden md:flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Stethoscope className="text-emerald-500 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">UPA Pediátrica</h1>
              <p className="text-slate-500 text-xs">Sistema de Controle</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="px-4 mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Usuário</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                  {authState.user?.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-white truncate">{authState.user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{authState.user?.email}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
