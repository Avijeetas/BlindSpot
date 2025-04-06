import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../../lib/superbase/server';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(req, res);
  const { code } = req.query;

  
  if (typeof code !== 'string') {
    console.error('Invalid code:', code);
    res.setHeader('Location', '/?error=Invalid callback');
    res.status(302).end();
    return;
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Exchange error:', error);
      res.setHeader('Location', '/?error=Authentication failed');
      res.status(302).end();
      return;
    }

    res.setHeader('Location', '/');
    res.status(302).end();
  } catch (err) {
    console.error('Unexpected error:', err);
    res.setHeader('Location', '/?error=Server error');
    res.status(302).end();
  }
}