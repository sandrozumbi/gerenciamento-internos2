
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Download, Filter, Search, CheckCircle2, Loader2, Clock
} from 'lucide-react';
import { PatientDAO } from '../db.js';
import { Patient, BED_OPTIONS, ANTIBIOTIC_OPTIONS } from '../types.js';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '', endDate: '', name: '', bed: '', antibiotic: '', status: 'all'
  });

  useEffect(() => {
    const fetch = async () => {
      const data = await PatientDAO.find();
      setPatients(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filteredData = useMemo(() => {
    return patients.filter(p => {
      const matchesName = p.name.toLowerCase().includes(filters.name.toLowerCase()) || 
                          p.motherName.toLowerCase().includes(filters.name.toLowerCase());
      const matchesBed = filters.bed ? p.bed === filters.bed : true;
      const matchesAntibiotic = filters.antibiotic ? p.antibiotics.includes(filters.antibiotic) : true;
      const matchesStatus = filters.status === 'all' ? true : filters.status === 'admitted' ? !p.dischargeDate : !!p.dischargeDate;
      
      let matchesDate = true;
      if (filters.startDate && filters.endDate) {
        const entryDate = new Date(p.entryDate);
        matchesDate = isWithinInterval(entryDate, {
          start: startOfDay(new Date(filters.startDate)),
          end: endOfDay(new Date(filters.endDate))
        });
      }
      return matchesName && matchesBed && matchesAntibiotic && matchesStatus && matchesDate;
    });
  }, [patients, filters]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Relatório UPA Pediátrica', 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Paciente', 'Entrada', 'Status', 'Leito', 'Diagnóstico']],
      body: filteredData.map(p => [
        p.name,
        format(new Date(p.entryDate), 'dd/MM/yyyy'),
        p.dischargeDate ? 'Alta' : 'Internado',
        p.bed,
        p.diagnosis
      ]),
    });
    doc.save(`relatorio_${Date.now()}.pdf`);
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2" /> Carregando base de dados...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <button onClick={exportPDF} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Download size={20} /> Exportar
        </button>
      </header>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" placeholder="Buscar nome..." value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} className="p-3 bg-slate-50 rounded-xl" />
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="p-3 bg-slate-50 rounded-xl">
          <option value="all">Todos os Status</option>
          <option value="admitted">Internados</option>
          <option value="discharged">Altas</option>
        </select>
        <select value={filters.bed} onChange={e => setFilters({...filters, bed: e.target.value})} className="p-3 bg-slate-50 rounded-xl">
          <option value="">Todos os Leitos</option>
          {BED_OPTIONS.map(b => <option key={b} value={b}>Leito {b}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500">PACIENTE</th>
              <th className="p-4 text-xs font-bold text-slate-500">LEITO</th>
              <th className="p-4 text-xs font-bold text-slate-500">STATUS</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-right">ENTRADA</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(p => (
              <tr key={p.id} className="border-t border-slate-50">
                <td className="p-4 font-bold">{p.name}</td>
                <td className="p-4">{p.bed}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.dischargeDate ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {p.dischargeDate ? 'ALTA' : 'INTERNADO'}
                  </span>
                </td>
                <td className="p-4 text-right text-slate-500">{format(new Date(p.entryDate), 'dd/MM/yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
