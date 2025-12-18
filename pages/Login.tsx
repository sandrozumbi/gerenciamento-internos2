
import React, { useState } from 'react';
import { Mail, Stethoscope, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { Digitizer } from '../types.js';
import { DigitizerDAO, AuthController } from '../db.js';

interface LoginPageProps {
  onLogin: (user: Digitizer) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name || !email) throw new Error('Preencha tudo.');
        const newDigitizer = { id: Math.random().toString(36).substr(2, 9), name, email };
        await DigitizerDAO.save(newDigitizer);
        onLogin(newDigitizer);
      } else {
        const users = await DigitizerDAO.find();
        const user = users.find(u => u.email === email);
        if (user) onLogin(user);
        else throw new Error('E-mail não encontrado.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-slate-900 rounded-3xl mb-4">
            <Stethoscope className="text-emerald-500 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black">UPA PEDIÁTRICA</h1>
          <p className="text-slate-400 text-sm">Controle de Triagem e Leitos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <input type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl" />
          )}
          <input type="email" placeholder="email@institucional.gov.br" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl" />
          
          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Criar Cadastro' : 'Acessar Banco de Dados')}
          </button>
        </form>

        <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-6 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
          {isRegistering ? 'Já tenho acesso' : 'Solicitar novo acesso'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
