
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Calendar,
  X,
  Stethoscope,
  Bed,
  Users,
  Clock,
  UserPlus,
  LogOut
} from 'lucide-react';
import { Patient, Digitizer, BED_OPTIONS, ANTIBIOTIC_OPTIONS } from '../types';
import { PatientController } from '../db';
import { format, differenceInYears, isBefore, startOfDay } from 'date-fns';

interface PatientsPageProps {
  currentUser: Digitizer;
}

const PatientsPage: React.FC<PatientsPageProps> = ({ currentUser }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatientForDischarge, setSelectedPatientForDischarge] = useState<Patient | null>(null);

  const loadPatients = () => {
    setPatients(PatientController.getAll());
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

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este registro?')) {
      PatientController.delete(id);
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
          <p className="text-slate-500">Gerencie o registro e acompanhamento clínico.</p>
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
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
          <Filter size={20} />
          Filtros
        </button>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
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
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Users className="text-slate-300" size={40} />
                      </div>
                      <p className="text-slate-400 font-medium">Nenhum paciente encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{patient.name}</p>
                        <p className="text-xs text-slate-500">{calculateAge(patient.birthDate)} anos • {patient.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
                      </div>
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
                        {!patient.dischargeDate && (
                          <button 
                            title="Dar Alta"
                            onClick={() => handleOpenDischargeModal(patient)}
                            className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
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
      </div>

      {isModalOpen && (
        <PatientModal 
          patient={editingPatient} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => {
            loadPatients();
            setIsModalOpen(false);
          }}
          currentUser={currentUser}
        />
      )}

      {isDischargeModalOpen && selectedPatientForDischarge && (
        <DischargeModal
          patient={selectedPatientForDischarge}
          onClose={() => setIsDischargeModalOpen(false)}
          onSave={() => {
            loadPatients();
            setIsDischargeModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Quick Discharge Modal
interface DischargeModalProps {
  patient: Patient;
  onClose: () => void;
  onSave: () => void;
}

const DischargeModal: React.FC<DischargeModalProps> = ({ patient, onClose, onSave }) => {
  // Default to today
  const [dischargeDate, setDischargeDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleConfirmDischarge = () => {
    if (!dischargeDate) return;

    // Validation: Discharge date cannot be before entry date
    if (isBefore(new Date(dischargeDate), startOfDay(new Date(patient.entryDate)))) {
      alert('A data de alta não pode ser anterior à data de entrada.');
      return;
    }

    const updatedPatient: Patient = {
      ...patient,
      dischargeDate: dischargeDate
    };

    PatientController.save(updatedPatient);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Confirmar Alta</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <p className="text-slate-600">
            Você está registrando a alta para o paciente <span className="font-bold text-slate-900">{patient.name}</span>.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Data da Alta</label>
            <input 
              type="date" 
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <p className="mt-2 text-xs text-slate-500">
              Data de entrada registrada: {format(new Date(patient.entryDate), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        <footer className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirmDischarge}
            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            Confirmar Alta
          </button>
        </footer>
      </div>
    </div>
  );
};

// Modal Component for Patient Form
interface PatientModalProps {
  patient: Patient | null;
  onClose: () => void;
  onSave: () => void;
  currentUser: Digitizer;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose, onSave, currentUser }) => {
  const [formData, setFormData] = useState<Partial<Patient>>(
    patient || {
      name: '',
      birthDate: '',
      gender: 'M',
      motherName: '',
      bed: BED_OPTIONS[0],
      diagnosis: '',
      antibiotics: [],
      entryDate: format(new Date(), 'yyyy-MM-dd'),
      dischargeDate: null,
      digitizerId: currentUser.id
    }
  );
  const [customAntibiotic, setCustomAntibiotic] = useState('');

  const validateAge = (date: string) => {
    const years = differenceInYears(new Date(), new Date(date));
    return years >= 0 && years <= 12;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthDate || !formData.motherName || !formData.diagnosis) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!validateAge(formData.birthDate!)) {
      alert('Sistema restrito a pacientes de 0 a 12 anos.');
      return;
    }

    // Date validation for manual entry
    if (formData.dischargeDate && isBefore(new Date(formData.dischargeDate), startOfDay(new Date(formData.entryDate!)))) {
      alert('A data de alta não pode ser anterior à data de entrada.');
      return;
    }

    const patientData: Patient = {
      id: patient?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      birthDate: formData.birthDate!,
      gender: formData.gender as 'M' | 'F',
      motherName: formData.motherName!,
      bed: formData.bed!,
      diagnosis: formData.diagnosis!,
      antibiotics: formData.antibiotics!,
      entryDate: formData.entryDate!,
      dischargeDate: formData.dischargeDate!,
      digitizerId: formData.digitizerId!,
      createdAt: patient?.createdAt || new Date().toISOString()
    };

    PatientController.save(patientData);
    onSave();
  };

  const toggleAntibiotic = (ant: string) => {
    const current = formData.antibiotics || [];
    if (current.includes(ant)) {
      setFormData({ ...formData, antibiotics: current.filter(a => a !== ant) });
    } else {
      setFormData({ ...formData, antibiotics: [...current, ant] });
    }
  };

  const addCustomAntibiotic = () => {
    if (customAntibiotic.trim()) {
      const current = formData.antibiotics || [];
      if (!current.includes(customAntibiotic)) {
        setFormData({ ...formData, antibiotics: [...current, customAntibiotic] });
      }
      setCustomAntibiotic('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{patient ? 'Editar Registro' : 'Novo Registro Pediátrico'}</h2>
              <p className="text-xs text-slate-500">Digitador: {currentUser.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Dados Pessoais */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Users size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Dados Pessoais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Nascimento *</label>
                <input 
                  required
                  type="date" 
                  value={formData.birthDate} 
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Sexo *</label>
                <select 
                  value={formData.gender} 
                  onChange={(e) => setFormData({...formData, gender: e.target.value as 'M' | 'F'})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Filiação (Mãe) *</label>
                <input 
                  required
                  type="text" 
                  value={formData.motherName} 
                  onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Registro Clínico */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Stethoscope size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Registro Clínico</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Leito *</label>
                <div className="grid grid-cols-3 gap-2">
                  {BED_OPTIONS.map(bed => (
                    <button
                      key={bed}
                      type="button"
                      onClick={() => setFormData({...formData, bed})}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                        formData.bed === bed 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                      }`}
                    >
                      {bed}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Suspeita Diagnóstica *</label>
                <textarea 
                  required
                  maxLength={250}
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-[100px] resize-none"
                  placeholder="Máximo 250 caracteres..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Antibióticos</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ANTIBIOTIC_OPTIONS.map(ant => (
                    <button
                      key={ant}
                      type="button"
                      onClick={() => toggleAntibiotic(ant)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        formData.antibiotics?.includes(ant)
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ant}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Outro antibiótico..."
                    value={customAntibiotic}
                    onChange={(e) => setCustomAntibiotic(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button 
                    type="button"
                    onClick={addCustomAntibiotic}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Entrada *</label>
                <input 
                  required
                  type="date" 
                  value={formData.entryDate} 
                  onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Alta (Opcional)</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={formData.dischargeDate || ''} 
                    onChange={(e) => setFormData({...formData, dischargeDate: e.target.value || null})}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  {formData.dischargeDate && (
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, dischargeDate: null})}
                      className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </form>

        <footer className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            {patient ? 'Salvar Alterações' : 'Finalizar Registro'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PatientsPage;
