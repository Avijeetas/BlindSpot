import  {createClient} from "../../../../lib/superbase/client";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
} 