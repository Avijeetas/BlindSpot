'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../../lib/superbase/client';
import Image from 'next/image';
import { FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface UserProfile {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

const Chat: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode ?? true); // Default to true if not set
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('darkMode', isDarkMode.toString());
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode, mounted]);

  const fetchUser = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          user_metadata: user.user_metadata || {},
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  }, [supabase.auth]);

  useEffect(() => {
    fetchUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata || {},
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [fetchUser, supabase.auth]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://zvxuskrcmnnspkiaobta.supabase.co/api/auth/callback',
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-100 to-gray-50'}`}>
      {/* Topbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'} border-b shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="group flex items-center space-x-3 hover:bg-gray-800/50 p-2 rounded-xl transition-all duration-300">
                  <div className="relative">
                    <Image
                      src={user.user_metadata.avatar_url || '/default-avatar.png'}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-offset-2 ring-offset-gray-900 ring-cyan-500 group-hover:ring-pink-500 transition-all"
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-gray-900"></span>
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.user_metadata.full_name || 'User'}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">B</span>
                  </div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Guest</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-gray-800/20 text-gray-800 hover:bg-gray-800/30'}`}
                title="Toggle Theme"
              >
                {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105`}
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FcGoogle size={24} />
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!user ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center">
              <h1 className="text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 animate-gradient-x">
                Check Your Blindspot
              </h1>
              <p className="text-2xl mb-4 font-medium text-gray-300">Stay informed | Stay ahead</p>
              <p className="text-lg mb-8 max-w-2xl text-gray-400 leading-relaxed">
                Get real-time news to help you stay informed from every angle. Powered by AI. Curated by you.
              </p>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`flex items-center space-x-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-3xl ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FcGoogle size={28} />
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
                Your Dashboard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for dashboard content */}
                <div className="p-6 bg-gray-800/50 rounded-xl shadow-lg hover:bg-gray-800/70 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-cyan-400">News Feed</h3>
                  <p className="text-gray-300 mt-2">Real-time updates tailored to you.</p>
                </div>
                <div className="p-6 bg-gray-800/50 rounded-xl shadow-lg hover:bg-gray-800/70 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-pink-400">Insights</h3>
                  <p className="text-gray-300 mt-2">AI-driven analysis at your fingertips.</p>
                </div>
                <div className="p-6 bg-gray-800/50 rounded-xl shadow-lg hover:bg-gray-800/70 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-blue-400">Settings</h3>
                  <p className="text-gray-300 mt-2">Customize your experience.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline styles for animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Chat;