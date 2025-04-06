// lib/superbase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { serialize } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';

export function createClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookie = serialize(name, value, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: options.maxAge,
          });
          res.setHeader('Set-Cookie', cookie);
        },
        remove(name: string) {
          const cookie = serialize(name, '', {
            path: '/',
            maxAge: 0,
          });
          res.setHeader('Set-Cookie', cookie);
        },
      },
    }
  );
}
