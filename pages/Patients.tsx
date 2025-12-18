
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, CheckCircle2, X,
  Clock, Loader2, Database, ShieldCheck
} from 'lucide-react';
import { Patient, Digitizer, BED_OPTIONS, ANTIBIOTIC_OPTIONS } from '../types.js';
import { PatientDAO } from '../db.js';
import { format, differenceInYears } from 'date-fns';

interface PatientsPageProps {
  currentUser: Digitizer;
}

const PatientsPage: React.FC<PatientsPageProps> = ({ currentUser }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await PatientDAO.find();
      setPatients(data);
    } catch (err) {
      console.error("Falha na conexão com o banco:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const handleDelete = async (id: string) => {
    if (confirm('Atenção: Esta ação excluirá permanentemente o registro do banco de dados. Confirmar?')) {
      await PatientDAO.deleteOne(id);
      loadPatients();
    }
  };

  const handleOpenModal = (patient: Patient | null = null) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pacientes</h1>
            <span className="flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
              <Database size={10} /> Database Online
            </span>
          </div>
          <p className="text-slate-500 font-medium">Controle de registros clínicos e prontuários.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Novo Registro
        </button>
      </header>

      {/* Search area */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, mãe ou diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Patients List with Database Sync Feedback */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" size={16} />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Consultando Banco de Dados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Leito / Local</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Interno</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center text-slate-300">
                        <Database size={48} className="mb-4 opacity-20" />
                        <p className="font-bold">Nenhum dado encontrado no banco.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-base">{patient.name}</span>
                          <span className="text-xs text-slate-500 font-medium">Mãe: {patient.motherName || 'Não informada'}</span>
                          <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <ShieldCheck size={10} /> ID: {patient.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-black shadow-sm">
                            LEITO {patient.bed}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {patient.dischargeDate ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] bg-emerald-50 px-3 py-1.5 rounded-full w-fit uppercase tracking-wider border border-emerald-100">
                            <CheckCircle2 size={12} strokeWidth={3} />
                            Alta Concedida
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] bg-amber-50 px-3 py-1.5 rounded-full w-fit uppercase tracking-wider border border-amber-100">
                            <Clock size={12} strokeWidth={3} />
                            Em Tratamento
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleOpenModal(patient)}
                            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                            title="Editar no Banco"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(patient.id)}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Excluir do Banco"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <PatientModal 
          patient={editingPatient} 
          onClose={() => setIsModalOpen(false)} 
          onSave={loadPatients}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

const PatientModal: React.FC<{ patient: Patient | null, onClose: () => void, onSave: () => void, currentUser: Digitizer }> = ({ patient, onClose, onSave, currentUser }) => {
  const [formData, setFormData] = useState<Partial<Patient>>(
    patient || {
      name: '', birthDate: '', gender: 'M', motherName: '', 
      bed: BED_OPTIONS[0], diagnosis: '', antibiotics: [], 
      entryDate: format(new Date(), 'yyyy-MM-dd'), dischargeDate: null, 
      digitizerId: currentUser.id
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.diagnosis) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setIsSaving(true);
    try {
      await PatientDAO.save(formData as Patient);
      onSave();
      onClose();
    } catch (err) {
      alert("Erro ao persistir dados no banco. Verifique sua conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
        <header className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {patient ? 'Atualizar Registro' : 'Novo Registro no Banco'}
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Prontuário Digital UPA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={28} /></button>
        </header>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome Completo do Paciente</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900" placeholder="Digite o nome completo" />
            </div>
            
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Mãe</label>
              <input type="text" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900" placeholder="Nome da mãe ou responsável" />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Data de Nascimento</label>
              <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900" />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Leito de Destino</label>
              <select value={formData.bed} onChange={e => setFormData({...formData, bed: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 appearance-none">
                {BED_OPTIONS.map(b => <option key={b} value={b}>Leito {b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quadro Clínico / Diagnóstico</label>
            <textarea 
              required
              value={formData.diagnosis} 
              onChange={e => setFormData({...formData, diagnosis: e.target.value})}
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl h-32 resize-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
              placeholder="Descreva detalhadamente a suspeita clínica ou diagnóstico confirmado..."
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Esquema Antimicrobiano</label>
            <div className="flex flex-wrap gap-2">
              {ANTIBIOTIC_OPTIONS.map(ant => (
                <button
                  key={ant}
                  type="button"
                  onClick={() => {
                    const current = formData.antibiotics || [];
                    setFormData({...formData, antibiotics: current.includes(ant) ? current.filter(a => a !== ant) : [...current, ant]});
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${formData.antibiotics?.includes(ant) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}
                >
                  {ant}
                </button>
              ))}
            </div>
          </div>
        </form>

        <footer className="p-10 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-8 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase text-xs tracking-widest">Cancelar</button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 hover:bg-blue-700 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Gravando...
              </>
            ) : (
              <>
                <Database size={16} />
                Confirmar no Banco
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PatientsPage;
