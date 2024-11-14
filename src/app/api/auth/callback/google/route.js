import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('Callback Error:', error);
      return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
    }
  }

  return NextResponse.redirect(new URL('/login?error=no_code', request.url));
} 