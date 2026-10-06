import { createSupabaseContext } from '@supabase/server';

export async function getAuthenticatedSupabaseContext(expressRequest) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(expressRequest.headers)) {
    if (typeof value === 'string') headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(', '));
  }

  const request = new Request('http://localhost/api/auth-context', { method: 'GET', headers });
  return createSupabaseContext(request, { auth: 'user' });
}
