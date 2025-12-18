
import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Search,
  CheckCircle2,
  XCircle,
  Stethoscope,
  // Fix: Adding missing Clock icon import
  Clock
} from 'lucide-react';
import { PatientController } from '../db';
import { Patient, BED_OPTIONS, ANTIBIOTIC_OPTIONS } from '../types';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    name: '',
    bed: '',
    antibiotic: '',
    status: 'all' // all, admitted, discharged
  });

  const patients = useMemo(() => PatientController.getAll(), []);

  const filteredData = useMemo(() => {
    return patients.filter(p => {
      const matchesName = p.name.toLowerCase().includes(filters.name.toLowerCase()) || 
                          p.motherName.toLowerCase().includes(filters.name.toLowerCase());
      const matchesBed = filters.bed ? p.bed === filters.bed : true;
      const matchesAntibiotic = filters.antibiotic ? p.antibiotics.includes(filters.antibiotic) : true;
      const matchesStatus = filters.status === 'all' 
                            ? true 
                            : filters.status === 'admitted' 
                              ? !p.dischargeDate 
                              : !!p.dischargeDate;
      
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
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('UPA Pediátrica - Relatório de Atendimentos', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 27);
    doc.text(`Período: ${filters.startDate || 'Todo período'} até ${filters.endDate || 'Presente'}`, 14, 32);

    // Table
    autoTable(doc, {
      startY: 40,
      head: [['Paciente', 'Entrada', 'Status', 'Leito', 'Diagnóstico']],
      body: filteredData.map(p => [
        p.name,
        format(new Date(p.entryDate), 'dd/MM/yyyy'),
        p.dischargeDate ? 'Alta' : 'Internado',
        p.bed,
        p.diagnosis.length > 30 ? p.diagnosis.substring(0, 30) + '...' : p.diagnosis
      ]),
      headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 40 },
    });

    doc.save(`relatorio_upa_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatórios Estratégicos</h1>
          <p className="text-slate-500 mt-1">Gere análises detalhadas e exporte em PDF.</p>
        </div>
        <button 
          onClick={exportPDF}
          disabled={filteredData.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
        >
          <Download size={20} />
          Exportar PDF
        </button>
      </header>

      {/* Advanced Filters */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Filter size={20} />
          <h2 className="text-sm font-bold uppercase tracking-widest">Parâmetros de Filtragem</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Paciente ou Filiação</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value})}
                placeholder="Nome da criança ou mãe..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Início</label>
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Fim</label>
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Leito</label>
              <select 
                value={filters.bed}
                onChange={(e) => setFilters({...filters, bed: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">Todos</option>
                {BED_OPTIONS.map(b => <option key={b} value={b}>Leito {b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="all">Todos</option>
                <option value="admitted">Internados</option>
                <option value="discharged">Altas</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-3">
             <label className="block text-sm font-semibold text-slate-700 mb-1">Uso de Antibiótico</label>
             <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilters({...filters, antibiotic: ''})}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filters.antibiotic === '' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  Todos
                </button>
                {ANTIBIOTIC_OPTIONS.map(ant => (
                  <button 
                    key={ant}
                    onClick={() => setFilters({...filters, antibiotic: ant})}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filters.antibiotic === ant ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {ant}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resultados</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{filteredData.length}</p>
          </div>
          <FileText className="text-blue-500" size={32} />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Internados</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{filteredData.filter(p => !p.dischargeDate).length}</p>
          </div>
          <Clock className="text-amber-500" size={32} />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Altas</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{filteredData.filter(p => p.dischargeDate).length}</p>
          </div>
          <CheckCircle2 className="text-emerald-500" size={32} />
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Paciente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Período</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Leito</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Nenhum registro corresponde aos filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredData.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500">Mãe: {patient.motherName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(patient.entryDate), 'dd/MM/yyyy')}
                      {patient.dischargeDate && ` - ${format(new Date(patient.dischargeDate), 'dd/MM/yyyy')}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-xs">
                        {patient.bed}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 truncate max-w-xs">{patient.diagnosis}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
