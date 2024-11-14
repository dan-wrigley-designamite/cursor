import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { upsertUser } from '@/lib/supabase';

export async function GET(request) {
  console.log('=================');
  console.log('CALLBACK ROUTE HIT');
  console.log('=================');
  console.log('Auth callback initiated');
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    console.log('Auth code received');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Exchange the code for a session
    console.log('Attempting to exchange code for session...');
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError) {
      console.error('Auth error during session exchange:', authError);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    console.log('Full auth response:', data);
    const user = data.user;
    
    if (user) {
      console.log('Full user object:', user);
      console.log('User metadata:', user.user_metadata);
      
      try {
        const userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          image: user.user_metadata?.avatar_url || user.user_metadata?.picture
        };
        console.log('Prepared user data for upsert:', userData);
        
        // Test direct database access
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('*')
          .limit(1);
        console.log('Database access test:', { data: testData, error: testError });
        
        const result = await upsertUser(userData);
        console.log('Upsert result:', result);
      } catch (error) {
        console.error('Error saving user data:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
} 