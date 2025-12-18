
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Bed, Clock, ArrowUpRight, TrendingUp, AlertCircle, Loader2
} from 'lucide-react';
import { PatientDAO } from '../db.js';
import { Patient } from '../types.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Dashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await PatientDAO.find();
      setPatients(data);
      setLoading(false);
    };
    fetch();
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

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Carregando métricas do banco...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard de Controle</h1>
        <p className="text-slate-500 mt-1">Status em tempo real sincronizado com a base de dados.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Internados Hoje', value: stats.admitted, icon: Bed, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Histórico', value: stats.total, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Ocupação de Leitos', value: `${Math.round((stats.admitted / 12) * 100)}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Altas Recentes', value: patients.filter(p => p.dischargeDate).length, icon: ArrowUpRight, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold mt-2 text-slate-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-8">
            <AlertCircle className="text-blue-500" size={20} />
            Ocupação por Leito
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-8">Perfil Demográfico</h2>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Feminino', value: stats.female, color: '#ec4899' },
                    { name: 'Masculino', value: stats.male, color: '#3b82f6' }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#ec4899" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
              <span className="text-xs text-slate-500">Pacientes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
