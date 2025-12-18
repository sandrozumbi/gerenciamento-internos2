
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Filter, Edit, Trash2, CheckCircle2, X,
  Stethoscope, Users, Clock, UserPlus, Sparkles, Loader2
} from 'lucide-react';
import { Patient, Digitizer, BED_OPTIONS, ANTIBIOTIC_OPTIONS } from '../types.js';
import { PatientDAO } from '../db.js';
import { format, differenceInYears, isBefore, startOfDay } from 'date-fns';
import { GoogleGenAI, Type } from '@google/genai';

interface PatientsPageProps {
  currentUser: Digitizer;
}

const PatientsPage: React.FC<PatientsPageProps> = ({ currentUser }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatientForDischarge, setSelectedPatientForDischarge] = useState<Patient | null>(null);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await PatientDAO.find();
      setPatients(data);
    } catch (err) {
      console.error("Erro ao carregar pacientes:", err);
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
    if (confirm('Deseja realmente excluir este registro no banco de dados?')) {
      await PatientDAO.deleteOne(id);
      loadPatients();
    }
  };

  const handleOpenModal = (patient: Patient | null = null) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleOpenDischargeModal = (patient: Patient) => {
    setSelectedPatientForDischarge(patient);
    setIsDischargeModalOpen(true);
  };

  const calculateAge = (birthDate: string) => {
    return differenceInYears(new Date(), new Date(birthDate));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-slate-500">Gestão de prontuários persistidos no sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          Novo Registro
        </button>
      </header>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-slate-400 font-medium">Sincronizando com o banco de dados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Paciente</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Leito</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Entrada</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                      Nenhum paciente encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-500">{calculateAge(patient.birthDate)} anos • {patient.gender}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                          Leito {patient.bed}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {patient.dischargeDate ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full w-fit">
                            <CheckCircle2 size={14} />
                            Alta em {format(new Date(patient.dischargeDate), 'dd/MM')}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-3 py-1 rounded-full w-fit">
                            <Clock size={14} />
                            Internado
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-600">{format(new Date(patient.entryDate), 'dd/MM/yyyy')}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(patient)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(patient.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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

      {isDischargeModalOpen && selectedPatientForDischarge && (
        <DischargeModal
          patient={selectedPatientForDischarge}
          onClose={() => setIsDischargeModalOpen(false)}
          onSave={loadPatients}
        />
      )}
    </div>
  );
};

// Modal with AI Integration
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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const getAiHelp = async () => {
    if (!formData.diagnosis || !formData.birthDate) {
      alert("Preencha idade e diagnóstico para usar a IA.");
      return;
    }

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const age = differenceInYears(new Date(), new Date(formData.birthDate!));
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Como assistente pediátrico, analise: Paciente de ${age} anos com diagnóstico "${formData.diagnosis}". Quais são os 3 pontos de atenção clínica cruciais e quais antibióticos da lista [${ANTIBIOTIC_OPTIONS.join(', ')}] costumam ser indicados? Responda de forma curta e técnica em JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pontos_atencao: { type: Type.ARRAY, items: { type: Type.STRING } },
              antibioticos_sugeridos: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["pontos_atencao", "antibioticos_sugeridos"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setAiSuggestion(result.pontos_atencao.join(' | '));
      // Pre-select suggested antibiotics if they exist in our list
      const suggested = result.antibioticos_sugeridos.filter((a: string) => ANTIBIOTIC_OPTIONS.includes(a));
      if (suggested.length > 0) {
        setFormData(prev => ({ ...prev, antibiotics: Array.from(new Set([...(prev.antibiotics || []), ...suggested])) }));
      }
    } catch (err) {
      console.error("Erro na IA:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const finalData: Patient = {
      id: patient?.id || Math.random().toString(36).substr(2, 9),
      ...formData as Patient
    };
    await PatientDAO.save(finalData);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{patient ? 'Editar' : 'Novo'} Registro</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
        </header>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-bold text-slate-700">Nome do Paciente</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">Nascimento</label>
              <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">Leito</label>
              <select value={formData.bed} onChange={e => setFormData({...formData, bed: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {BED_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">Diagnóstico Suspeito</label>
              <button 
                type="button" 
                onClick={getAiHelp} 
                disabled={isAiLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Assistente IA
              </button>
            </div>
            <textarea 
              required
              value={formData.diagnosis} 
              onChange={e => setFormData({...formData, diagnosis: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none"
              placeholder="Descreva a suspeita clínica..."
            />
            {aiSuggestion && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 font-medium animate-in fade-in slide-in-from-top-1">
                <strong>Sugestão IA:</strong> {aiSuggestion}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Antibióticos Prescritos</label>
            <div className="flex flex-wrap gap-2">
              {ANTIBIOTIC_OPTIONS.map(ant => (
                <button
                  key={ant}
                  type="button"
                  onClick={() => {
                    const current = formData.antibiotics || [];
                    setFormData({...formData, antibiotics: current.includes(ant) ? current.filter(a => a !== ant) : [...current, ant]});
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${formData.antibiotics?.includes(ant) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                >
                  {ant}
                </button>
              ))}
            </div>
          </div>
        </form>

        <footer className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl">Cancelar</button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
          >
            {isSaving && <Loader2 size={18} className="animate-spin" />}
            {patient ? 'Atualizar no Banco' : 'Salvar Registro'}
          </button>
        </footer>
      </div>
    </div>
  );
};

const DischargeModal: React.FC<{ patient: Patient, onClose: () => void, onSave: () => void }> = ({ patient, onClose, onSave }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  const handleDischarge = async () => {
    setLoading(true);
    await PatientDAO.save({ ...patient, dischargeDate: date });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 space-y-6">
        <h2 className="text-xl font-bold">Confirmar Alta</h2>
        <p className="text-slate-500">Registrar saída para <strong>{patient.name}</strong>?</p>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 p-3 font-bold text-slate-500">Voltar</button>
          <button onClick={handleDischarge} disabled={loading} className="flex-1 bg-emerald-600 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Confirmar Alta
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
