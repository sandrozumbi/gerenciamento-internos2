
import { Patient, Digitizer, BED_OPTIONS, ANTIBIOTIC_OPTIONS } from './types.js';

// Persistence simulation using LocalStorage
const STORAGE_KEYS = {
  PATIENTS: 'upa_patients',
  DIGITIZERS: 'upa_digitizers',
  CURRENT_USER: 'upa_current_user'
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const saveToStorage = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateSeedPatients = (): Patient[] => {
  const names = ["Enzo Gabriel", "Valentina Silva", "Arthur Oliveira", "Alice Santos", "Miguel Pereira", "Sophia Rodrigues", "Heitor Ferreira", "Laura Almeida", "Theo Carvalho", "Manuela Gomes"];
  const mothers = ["Maria Silva", "Ana Oliveira", "Carla Santos", "Juliana Pereira", "Fernanda Rodrigues", "Patrícia Ferreira", "Luciana Almeida", "Renata Carvalho", "Camila Gomes", "Beatriz Lima"];
  const diagnoses = [
    "Pneumonia comunitária grave", 
    "Amigdalite bacteriana aguda", 
    "Infecção do trato urinário (ITU)", 
    "Sinusite maxilar aguda", 
    "Otite média supurativa", 
    "Celulite em membro inferior", 
    "Traqueobronquite infecciosa", 
    "Gastroenterite com desidratação", 
    "Crise asmática associada a IVAS", 
    "Febre de origem indeterminada"
  ];

  return names.map((name, i) => {
    const isMale = i % 2 === 0;
    const entryDaysAgo = Math.floor(Math.random() * 5);
    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - entryDaysAgo);

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - (Math.floor(Math.random() * 12)));
    birthDate.setMonth(Math.floor(Math.random() * 12));
    birthDate.setDate(Math.floor(Math.random() * 28) + 1);

    const randomAntibiotics = [ANTIBIOTIC_OPTIONS[Math.floor(Math.random() * ANTIBIOTIC_OPTIONS.length)]];
    if (Math.random() > 0.7) {
      randomAntibiotics.push(ANTIBIOTIC_OPTIONS[Math.floor(Math.random() * ANTIBIOTIC_OPTIONS.length)]);
    }

    return {
      id: `seed-${i}`,
      name,
      birthDate: birthDate.toISOString().split('T')[0],
      gender: isMale ? 'M' : 'F',
      motherName: mothers[i],
      bed: BED_OPTIONS[i % BED_OPTIONS.length],
      diagnosis: diagnoses[i],
      antibiotics: Array.from(new Set(randomAntibiotics)),
      entryDate: entryDate.toISOString().split('T')[0],
      dischargeDate: null,
      digitizerId: '1',
      createdAt: new Date().toISOString()
    };
  });
};

export const PatientController = {
  getAll: (): Patient[] => {
    const patients = getFromStorage<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    if (patients.length === 0) {
      const seeds = generateSeedPatients();
      saveToStorage(STORAGE_KEYS.PATIENTS, seeds);
      return seeds;
    }
    return patients;
  },
  
  save: (patient: Patient): void => {
    const patients = PatientController.getAll();
    const index = patients.findIndex(p => p.id === patient.id);
    if (index > -1) {
      patients[index] = patient;
    } else {
      patients.push(patient);
    }
    saveToStorage(STORAGE_KEYS.PATIENTS, patients);
  },

  delete: (id: string): void => {
    const patients = PatientController.getAll();
    saveToStorage(STORAGE_KEYS.PATIENTS, patients.filter(p => p.id !== id));
  }
};

export const DigitizerController = {
  getAll: (): Digitizer[] => getFromStorage<Digitizer[]>(STORAGE_KEYS.DIGITIZERS, [
    { id: '1', name: 'Admin', email: 'admin@upa.gov.br' }
  ]),
  
  save: (digitizer: Digitizer): void => {
    const digitizers = DigitizerController.getAll();
    const index = digitizers.findIndex(d => d.id === digitizer.id);
    if (index > -1) {
      digitizers[index] = digitizer;
    } else {
      digitizers.push(digitizer);
    }
    saveToStorage(STORAGE_KEYS.DIGITIZERS, digitizers);
  },

  getById: (id: string): Digitizer | undefined => {
    return DigitizerController.getAll().find(d => d.id === id);
  }
};

export const AuthController = {
  getCurrentUser: (): Digitizer | null => getFromStorage<Digitizer | null>(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user: Digitizer | null): void => saveToStorage(STORAGE_KEYS.CURRENT_USER, user),
};
