
import React, { useState } from 'react';
import { Mail, Lock, Stethoscope, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Digitizer } from '../types';
import { DigitizerController } from '../db';

interface LoginPageProps {
  onLogin: (user: Digitizer) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!name || !email) {
        setError('Preencha todos os campos.');
        return;
      }
      const newDigitizer: Digitizer = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email
      };
      DigitizerController.save(newDigitizer);
      onLogin(newDigitizer);
    } else {
      const users = DigitizerController.getAll();
      const user = users.find(u => u.email === email);
      if (user) {
        onLogin(user);
      } else {
        setError('E-mail não cadastrado. Verifique ou crie uma conta.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800/50">
          <div className="p-10">
            <div className="flex flex-col items-center mb-10">
              <div className="p-4 bg-slate-900 rounded-3xl mb-6 shadow-xl shadow-blue-500/10">
                <Stethoscope className="text-emerald-500 w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">UPA PEDIÁTRICA</h1>
              <p className="text-slate-500 font-medium">Sistema Integrado de Controle</p>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => setIsRegistering(false)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isRegistering ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Acessar
              </button>
              <button 
                onClick={() => setIsRegistering(true)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isRegistering ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Novo Cadastro
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegistering && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <UserPlus size={20} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ex: João Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">E-mail Institucional</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="digitador@upa.gov.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isRegistering ? 'Criar Minha Conta' : 'Entrar no Sistema'}
                {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
              </button>
            </form>
          </div>
          
          <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-wider font-bold">
               Acesso exclusivo para profissionais autorizados.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
