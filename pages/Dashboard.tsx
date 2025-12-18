
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Bed, Clock, ArrowUpRight, TrendingUp, AlertCircle, Loader2, Database, RefreshCw
} from 'lucide-react';
import { PatientDAO } from '../db.js';
import { Patient } from '../types.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Dashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());

  const fetchData = async () => {
    setLoading(true);
    const data = await PatientDAO.find();
    setPatients(data);
    setLastSync(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const stats = useMemo(() => {
    const admitted = patients.filter(p => !p.dischargeDate).length;
    const total = patients.length;
    const female = patients.filter(p => p.gender === 'F').length;
    const male = patients.filter(p => p.gender === 'M').length;
    
    return { admitted, total, female, male };
  }, [patients]);

  const bedOccupancyData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.filter(p => !p.dischargeDate).forEach(p => {
      counts[p.bed] = (counts[p.bed] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  if (loading && patients.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Acessando base de dados central...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Status da Unidade</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">
              <Database size={10} /> Online
            </span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              Última sincronização: {lastSync}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-black hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Atualizar Dados
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Internados Hoje', value: stats.admitted, icon: Bed, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Histórico', value: stats.total, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Ocupação Atual', value: `${Math.round((stats.admitted / 12) * 100)}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Altas Concluídas', value: patients.filter(p => p.dischargeDate).length, icon: ArrowUpRight, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between group hover:border-blue-200 transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black mt-2 text-slate-900">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="text-blue-500" size={24} />
              Carga por Leito
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-10">Perfil de Gênero</h2>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Feminino', value: stats.female, color: '#ec4899' },
                    { name: 'Masculino', value: stats.male, color: '#3b82f6' }
                  ]}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#ec4899" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 leading-none">{stats.total}</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Total</span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-slate-600">Masculino</span>
              </div>
              <span className="text-xs font-black text-slate-900">{stats.male}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-xs font-bold text-slate-600">Feminino</span>
              </div>
              <span className="text-xs font-black text-slate-900">{stats.female}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
