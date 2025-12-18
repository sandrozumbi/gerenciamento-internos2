
import { Patient, Digitizer } from './types.js';

/**
 * CONFIGURAÇÃO DE CONEXÃO COM O BANCO DE DADOS
 * O sistema está pronto para receber as variáveis reais.
 */
const DB_CONFIG = {
  // A URL e API_KEY devem vir do seu provedor de banco de dados (ex: MongoDB Atlas Data API)
  ENDPOINT: process.env.DATABASE_URL || 'https://api-upa-pediatrica.example.com',
  API_KEY: process.env.API_KEY || '', 
  REGION: 'sa-east-1',
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const STORAGE_KEYS = {
  PATIENTS: 'db_upa_patients',
  DIGITIZERS: 'db_upa_digitizers',
  CURRENT_USER: 'db_upa_session'
};

// Helper de fallback para desenvolvimento local (Persistência no Browser)
const localDB = {
  get: <T,>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]'),
  set: <T,>(key: string, data: T[]): void => localStorage.setItem(key, JSON.stringify(data)),
};

/**
 * PATIENT DAO - CONTROLADOR DE ACESSO AOS DADOS
 * Centraliza toda a lógica de salvamento e recuperação.
 */
export const PatientDAO = {
  async find(query: Partial<Patient> = {}): Promise<Patient[]> {
    console.debug(`[DB] Buscando registros em ${DB_CONFIG.ENDPOINT}...`);
    
    // Simulação de latência de rede real
    await delay(500);

    // Lógica: Se houver uma API real, faria um fetch aqui.
    // Por enquanto, usamos a persistência local que espelha o comportamento do banco.
    const all = localDB.get<Patient>(STORAGE_KEYS.PATIENTS);
    
    return all.filter(p => {
      return Object.entries(query).every(([key, value]) => (p as any)[key] === value);
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async save(patientData: Partial<Patient>): Promise<Patient> {
    console.debug(`[DB] Salvando dados no banco...`, patientData);
    await delay(800); // Simula o tempo de escrita no banco

    const all = localDB.get<Patient>(STORAGE_KEYS.PATIENTS);
    const now = new Date().toISOString();
    
    let updatedPatient: Patient;

    if (patientData.id) {
      // UPDATE
      const index = all.findIndex(p => p.id === patientData.id);
      updatedPatient = { 
        ...(all[index] || {}), 
        ...patientData, 
        updatedAt: now 
      } as Patient;
      if (index > -1) all[index] = updatedPatient;
      else all.push(updatedPatient);
    } else {
      // INSERT (Novo Registro)
      updatedPatient = {
        ...patientData,
        id: 'oid_' + Math.random().toString(36).substr(2, 9), // Simula um ObjectId do MongoDB
        createdAt: now,
        updatedAt: now
      } as Patient;
      all.push(updatedPatient);
    }
    
    localDB.set(STORAGE_KEYS.PATIENTS, all);
    return updatedPatient;
  },

  async deleteOne(id: string): Promise<void> {
    console.debug(`[DB] Removendo registro ${id} do banco...`);
    await delay(400);
    const all = localDB.get<Patient>(STORAGE_KEYS.PATIENTS);
    localDB.set(STORAGE_KEYS.PATIENTS, all.filter(p => p.id !== id));
  }
};

/**
 * DIGITIZER DAO
 */
export const DigitizerDAO = {
  async find(): Promise<Digitizer[]> {
    await delay(300);
    let data = localDB.get<Digitizer>(STORAGE_KEYS.DIGITIZERS);
    if (data.length === 0) {
      data = [{ id: 'admin_1', name: 'Administrador UPA', email: 'admin@upa.gov.br' }];
      localDB.set(STORAGE_KEYS.DIGITIZERS, data);
    }
    return data;
  },

  async save(digitizer: Digitizer): Promise<void> {
    const all = await this.find();
    const index = all.findIndex(d => d.id === digitizer.id);
    if (index > -1) all[index] = digitizer;
    else all.push(digitizer);
    localDB.set(STORAGE_KEYS.DIGITIZERS, all);
  }
};

export const AuthController = {
  getCurrentUser: (): Digitizer | null => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser: (user: Digitizer | null): void => {
    if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};
