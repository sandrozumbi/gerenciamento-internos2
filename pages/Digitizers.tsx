
import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Edit2, Trash2, ShieldCheck, Search } from 'lucide-react';
import { Digitizer } from '../types';
import { DigitizerController } from '../db';

const DigitizersPage: React.FC = () => {
  const [digitizers, setDigitizers] = useState<Digitizer[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDigitizer, setCurrentDigitizer] = useState<Partial<Digitizer>>({ name: '', email: '' });

  const loadDigitizers = () => {
    setDigitizers(DigitizerController.getAll());
  };

  useEffect(() => {
    loadDigitizers();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDigitizer.name || !currentDigitizer.email) return;

    const newDigitizer: Digitizer = {
      id: currentDigitizer.id || Math.random().toString(36).substr(2, 9),
      name: currentDigitizer.name,
      email: currentDigitizer.email
    };

    DigitizerController.save(newDigitizer);
    setCurrentDigitizer({ name: '', email: '' });
    setIsEditing(false);
    loadDigitizers();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Gerenciar Digitadores</h1>
        <p className="text-slate-500 mt-1">Controle de acesso e identificação nos registros.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-lg font-bold">{isEditing ? 'Editar Digitador' : 'Adicionar Digitador'}</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={currentDigitizer.name}
                  onChange={(e) => setCurrentDigitizer({...currentDigitizer, name: e.target.value})}
                  placeholder="Nome do digitador"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail Institucional</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={currentDigitizer.email}
                    onChange={(e) => setCurrentDigitizer({...currentDigitizer, email: e.target.value})}
                    placeholder="email@upa.gov.br"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                >
                  {isEditing ? 'Atualizar Digitador' : 'Salvar Cadastro'}
                </button>
                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentDigitizer({ name: '', email: '' });
                    }}
                    className="w-full text-slate-500 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
             <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Filtrar digitadores..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {digitizers.map((digitizer) => (
              <div key={digitizer.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {digitizer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{digitizer.name}</h3>
                    <p className="text-xs text-slate-500">{digitizer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setCurrentDigitizer(digitizer);
                      setIsEditing(true);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitizersPage;
