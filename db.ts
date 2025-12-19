
import { Patient, Digitizer } from './types.js';

/**
 * CONFIGURAÇÃO DO MONGODB ATLAS DATA API
 * Estas variáveis devem estar configuradas no painel do Vercel.
 */
const DB_CONFIG = {
  ENDPOINT: process.env.DATABASE_URL || '', // URL base do Atlas Data API
  API_KEY: process.env.API_KEY || '',       // Chave de API gerada no Atlas
  DATABASE: 'upa_pediatrica',                // Nome do seu banco de dados
  DATA_SOURCE: 'Cluster0',                  // Nome do seu Cluster no Atlas
};

/**
 * Helper para realizar requisições ao MongoDB Atlas Data API
 */
async function atlasRequest(action: string, body: any) {
  if (!DB_CONFIG.ENDPOINT || !DB_CONFIG.API_KEY) {
    console.warn('Configurações de banco de dados ausentes. Usando fallback local.');
    return null;
  }

  const response = await fetch(`${DB_CONFIG.ENDPOINT}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': DB_CONFIG.API_KEY,
    },
    body: JSON.stringify({
      dataSource: DB_CONFIG.DATA_SOURCE,
      database: DB_CONFIG.DATABASE,
      ...body
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro na comunicação com MongoDB');
  }

  return response.json();
}

/**
 * PATIENT DAO - CONTROLADOR DE ACESSO AOS DADOS (PERSISTÊNCIA REAL)
 */
export const PatientDAO = {
  async find(query: any = {}): Promise<Patient[]> {
    try {
      const result = await atlasRequest('find', {
        collection: 'patients',
        filter: query,
        sort: { createdAt: -1 }
      });

      if (result) return result.documents;
    } catch (err) {
      console.error('Erro ao buscar no MongoDB:', err);
    }

    // Fallback para LocalStorage se a API não estiver configurada
    return JSON.parse(localStorage.getItem('db_upa_patients') || '[]');
  },

  async save(patientData: Partial<Patient>): Promise<Patient> {
    const now = new Date().toISOString();
    const collection = 'patients';

    try {
      if (patientData.id) {
        // UPDATE no MongoDB
        await atlasRequest('updateOne', {
          collection,
          filter: { id: patientData.id },
          update: {
            $set: {
              ...patientData,
              updatedAt: now
            }
          }
        });
        
        // Atualiza local também para consistência imediata
        const all = JSON.parse(localStorage.getItem('db_upa_patients') || '[]');
        const idx = all.findIndex((p: any) => p.id === patientData.id);
        if (idx > -1) all[idx] = { ...all[idx], ...patientData, updatedAt: now };
        localStorage.setItem('db_upa_patients', JSON.stringify(all));
        
        return patientData as Patient;
      } else {
        // INSERT no MongoDB
        const newId = 'oid_' + Math.random().toString(36).substr(2, 9);
        const newPatient = {
          ...patientData,
          id: newId,
          createdAt: now,
          updatedAt: now
        };

        await atlasRequest('insertOne', {
          collection,
          document: newPatient
        });

        // Salva localmente (fallback/cache)
        const all = JSON.parse(localStorage.getItem('db_upa_patients') || '[]');
        all.push(newPatient);
        localStorage.setItem('db_upa_patients', JSON.stringify(all));

        return newPatient as Patient;
      }
    } catch (err) {
      console.error('Erro ao salvar no MongoDB:', err);
      throw err;
    }
  },

  async deleteOne(id: string): Promise<void> {
    try {
      await atlasRequest('deleteOne', {
        collection: 'patients',
        filter: { id: id }
      });
      
      const all = JSON.parse(localStorage.getItem('db_upa_patients') || '[]');
      localStorage.setItem('db_upa_patients', JSON.stringify(all.filter((p: any) => p.id !== id)));
    } catch (err) {
      console.error('Erro ao deletar no MongoDB:', err);
      throw err;
    }
  }
};

/**
 * DIGITIZER DAO
 */
export const DigitizerDAO = {
  async find(): Promise<Digitizer[]> {
    try {
      const result = await atlasRequest('find', { collection: 'digitizers' });
      if (result && result.documents.length > 0) return result.documents;
    } catch (err) {
      console.error('Erro ao buscar digitadores:', err);
    }

    // Fallback padrão
    let data = JSON.parse(localStorage.getItem('db_upa_digitizers') || '[]');
    if (data.length === 0) {
      data = [{ id: 'admin_1', name: 'Administrador UPA', email: 'admin@upa.gov.br' }];
      localStorage.setItem('db_upa_digitizers', JSON.stringify(data));
    }
    return data;
  },

  async save(digitizer: Digitizer): Promise<void> {
    try {
      await atlasRequest('updateOne', {
        collection: 'digitizers',
        filter: { id: digitizer.id },
        update: { $set: digitizer },
        upsert: true
      });
    } catch (err) {
      console.error('Erro ao salvar digitador:', err);
    }
    
    const all = await this.find();
    const index = all.findIndex(d => d.id === digitizer.id);
    if (index > -1) all[index] = digitizer;
    else all.push(digitizer);
    localStorage.setItem('db_upa_digitizers', JSON.stringify(all));
  }
};

export const AuthController = {
  getCurrentUser: (): Digitizer | null => {
    const user = localStorage.getItem('db_upa_session');
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser: (user: Digitizer | null): void => {
    if (user) localStorage.setItem('db_upa_session', JSON.stringify(user));
    else localStorage.removeItem('db_upa_session');
  },
};
