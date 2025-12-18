
import { Patient, Digitizer } from './types.js';

/**
 * CONFIGURAÇÃO DE CONEXÃO
 * Em um ambiente real, estas variáveis seriam carregadas de process.env
 */
const DB_CONFIG = {
  API_URL: process.env.DATABASE_URL || 'https://api-upa-pediatrica.example.com',
  API_KEY: process.env.API_KEY || '',
  COLLECTIONS: {
    PATIENTS: 'patients',
    DIGITIZERS: 'digitizers'
  }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const STORAGE_KEYS = {
  PATIENTS: 'mongodb_upa_patients',
  DIGITIZERS: 'mongodb_upa_digitizers',
  CURRENT_USER: 'mongodb_upa_session'
};

// Helper genérico para persistência atual
const getCollection = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveCollection = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * PATIENT DAO (DATA ACCESS OBJECT)
 * Integrado com a estrutura de banco de dados
 */
export const PatientDAO = {
  async find(query: Partial<Patient> = {}): Promise<Patient[]> {
    // Simulação de chamada ao banco (MongoDB Atlas Data API ou similar)
    console.debug(`Conectando a ${DB_CONFIG.API_URL}/${DB_CONFIG.COLLECTIONS.PATIENTS}...`);
    await delay(300);
    const all = getCollection<Patient>(STORAGE_KEYS.PATIENTS);
    return all.filter(p => {
      return Object.entries(query).every(([key, value]) => (p as any)[key] === value);
    });
  },

  async findOne(id: string): Promise<Patient | null> {
    const all = await this.find();
    return all.find(p => p.id === id) || null;
  },

  async save(patient: Patient): Promise<void> {
    await delay(400);
    const all = getCollection<Patient>(STORAGE_KEYS.PATIENTS);
    const index = all.findIndex(p => p.id === patient.id);
    
    if (index > -1) {
      all[index] = { ...patient, updatedAt: new Date().toISOString() } as any;
    } else {
      all.push({ ...patient, createdAt: new Date().toISOString() });
    }
    
    saveCollection(STORAGE_KEYS.PATIENTS, all);
  },

  async deleteOne(id: string): Promise<void> {
    await delay(300);
    const all = getCollection<Patient>(STORAGE_KEYS.PATIENTS);
    saveCollection(STORAGE_KEYS.PATIENTS, all.filter(p => p.id !== id));
  }
};

/**
 * DIGITIZER DAO
 */
export const DigitizerDAO = {
  async find(): Promise<Digitizer[]> {
    await delay(200);
    const data = getCollection<Digitizer>(STORAGE_KEYS.DIGITIZERS);
    if (data.length === 0) {
      const defaultAdmin = [{ id: '1', name: 'Admin Central', email: 'admin@upa.gov.br' }];
      saveCollection(STORAGE_KEYS.DIGITIZERS, defaultAdmin);
      return defaultAdmin;
    }
    return data;
  },

  async save(digitizer: Digitizer): Promise<void> {
    const all = await this.find();
    const index = all.findIndex(d => d.id === digitizer.id);
    if (index > -1) all[index] = digitizer;
    else all.push(digitizer);
    saveCollection(STORAGE_KEYS.DIGITIZERS, all);
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
