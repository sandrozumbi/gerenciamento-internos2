
export interface Digitizer {
  id: string;
  name: string;
  email: string;
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  motherName: string;
  bed: string;
  diagnosis: string;
  antibiotics: string[];
  entryDate: string;
  dischargeDate: string | null;
  digitizerId: string;
  createdAt: string;
}

export const BED_OPTIONS = [
  '01', '02', '03', '04', '05', '06', 
  '02.1', '02.2', 'ECG', 'Sutura', 'Nebolização'
];

export const ANTIBIOTIC_OPTIONS = [
  'Amoxicilina',
  'Ceftriaxona',
  'Azitromicina',
  'Claritromicina',
  'Penicilina Benzatina',
  'Ampicilina',
  'Gentamicina',
  'Cefalexina'
];

export interface AuthState {
  user: Digitizer | null;
  isAuthenticated: boolean;
}
