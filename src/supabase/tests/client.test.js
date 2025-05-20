import supabaseClient from '../client';

describe('Supabase Client', () => {
  test('debería inicializarse sin errores', () => {
    expect(supabaseClient).toBeDefined();
    expect(typeof supabaseClient.from).toBe('function');
  });

  test('debería tener un método auth disponible', () => {
    expect(supabaseClient.auth).toBeDefined();
    expect(typeof supabaseClient.auth.getSession).toBe('function');
  });
}); 