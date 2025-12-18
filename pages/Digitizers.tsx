
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Digitizer } from '../types.js';
import { DigitizerDAO } from '../db.js';

const DigitizersPage: React.FC = () => {
  const [digitizers, setDigitizers] = useState<Digitizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDigitizer, setCurrentDigitizer] = useState<Partial<Digitizer>>({ name: '', email: '' });

  const loadDigitizers = async () => {
    setLoading(true);
    const data = await DigitizerDAO.find();
    setDigitizers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDigitizers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDigitizer.name || !currentDigitizer.email) return;

    const newDigitizer: Digitizer = {
      id: currentDigitizer.id || Math.random().toString(36).substr(2, 9),
      name: currentDigitizer.name!,
      email: currentDigitizer.email!
    };

    await DigitizerDAO.save(newDigitizer);
    setCurrentDigitizer({ name: '', email: '' });
    setIsEditing(false);
    loadDigitizers();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Gerenciar Digitadores</h1>
        <p className="text-slate-500 mt-1">Controle de acesso persistido no banco de dados.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={24} />
              {isEditing ? 'Editar' : 'Novo'} Cadastro
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <input type="text" placeholder="Nome" value={currentDigitizer.name} onChange={e => setCurrentDigitizer({...currentDigitizer, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <input type="email" placeholder="E-mail" value={currentDigitizer.email} onChange={e => setCurrentDigitizer({...currentDigitizer, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">Salvar</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {digitizers.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">{d.name.charAt(0)}</div>
                    <div>
                      <h3 className="font-bold text-slate-900">{d.name}</h3>
                      <p className="text-xs text-slate-500">{d.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { setCurrentDigitizer(d); setIsEditing(true); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitizersPage;
