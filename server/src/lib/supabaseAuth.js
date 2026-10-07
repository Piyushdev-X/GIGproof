import { createSupabaseContext } from '@supabase/server';

export async function getAuthenticatedSupabaseContext(expressRequest) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(expressRequest.headers)) {
    if (typeof value === 'string') headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(', '));
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  const env = {
    ...(supabaseUrl ? { url: supabaseUrl } : {}),
    ...(publishableKey ? { publishableKey } : {}),
    ...(secretKey ? { secretKey } : {}),
  };

  const request = new Request('http://localhost/api/auth-context', { method: 'GET', headers });
  return createSupabaseContext(request, { auth: 'user', env });
}
