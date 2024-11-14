'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        router.push('/dashboard');
      }
    };
    
    checkUser();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/dashboard`
        }
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">Sign in to your account</h2>
          <p className="mt-2 text-gray-600">
            Use your Google account to continue
          </p>
        </div>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Image 
            src="https://www.google.com/favicon.ico"
            alt="Google"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          {loading ? 'Loading...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
} 