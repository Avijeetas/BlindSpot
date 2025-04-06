'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/superbase/client'; // make sure this points to your Supabase client

const Blindspot: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  
  const checkSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      router.push('/Dashboard');
    }
  }, [router, supabase]);
  
  useEffect(() => {
    checkSession();
    
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        router.push('/Dashboard');
      }
    });
    
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [checkSession, supabase, router]);
  
  const handleGoogleSignIn = async () => {
    // setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `http://zvxuskrcmnnspkiaobta.supabase.co/api/auth/callback`,
        }
      });
      if (error) console.error('Google Sign-In Error:', error.message);
    } catch (err) {
      console.error('Unexpected Sign-In Error:', err);
    } finally {
      // setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex justify-center items-center m-0 p-0 bg-gradient-to-br from-gray-900 to-gray-800 font-sans overflow-hidden">
      <div className="text-center text-white animate-fade-in">
        <h1 className="text-5xl font-bold mb-2 uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-pink-600 bg-clip-text text-transparent">
          Check Your Blindspot
        </h1>
        <p className="text-2xl text-gray-400 mb-4">
          Stay informed | Stay ahead
        </p>
        <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
          Get real-time news from to help you stay informed from every angle. Powered by AI. Curated by you.
        </p>
        <button 
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center px-6 py-3 text-lg text-white bg-blue-600 border-none rounded-full cursor-pointer transition-transform duration-300 hover:transform hover:scale-105 hover:shadow-lg"
        >
          <span className="w-5 h-5 mr-3 text-xl">G</span>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

// Add this to your tailwind.config.js to support the animation
// module.exports = {
//   theme: {
//     extend: {
//       animation: {
//         'fade-in': 'fadeIn 1.5s ease-in-out',
//       },
//       keyframes: {
//         fadeIn: {
//           '0%': { opacity: '0' },
//           '100%': { opacity: '1' },
//         },
//       },
//     },
//   },
//   plugins: [],
// }

export default Blindspot;