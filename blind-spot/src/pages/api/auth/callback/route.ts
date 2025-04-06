import { createClient } from "../../../../lib/superbase/server";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  
  if (code) {
    const supabase = createClient(req, res);
    const { error } = await supabase.auth.exchangeCodeForSession(String(code));
    
    if (!error) {
      res.redirect('/');
      return;
    }
  }

  res.redirect('/');
}