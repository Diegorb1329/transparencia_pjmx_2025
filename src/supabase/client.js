import { createClient } from '@supabase/supabase-js';

// Crear y exportar el cliente de Supabase usando variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificar que las credenciales estén disponibles
const hasCredentials = supabaseUrl && supabaseAnonKey;

// Crear un cliente mock para usar cuando no hay credenciales
const createMockClient = () => {
  console.warn('Credenciales de Supabase no configuradas. Usando cliente mock.');
  
  // Cliente mock que simula la API de Supabase pero no hace nada
  return {
    from: () => ({
      upsert: () => Promise.resolve({ data: null, error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      select: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    rpc: () => Promise.resolve({ data: null, error: null }),
  };
};

// Crear el cliente real o mock según corresponda
const supabaseClient = hasCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

export default supabaseClient; 