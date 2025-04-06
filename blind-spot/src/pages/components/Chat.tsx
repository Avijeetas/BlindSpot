'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/superbase/client'; // make sure this points to your Supabase client
import { User } from '@supabase/supabase-js';

const Chat: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('User fetch error:', error);
        setUser(null);
      } else {
        setUser(user);
      }
    } catch (err) {
      console.error('Unexpected error in fetchUser:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `http://zvxuskrcmnnspkiaobta.supabase.co/api/auth/callback`,
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {user ? (
        <div>
          <h2>Welcome, {user.user_metadata?.full_name || 'User'}!</h2>
          <p>Email: {user.email}</p>
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          )}
          <button onClick={handleSignOut} style={{ padding: '8px 16px', marginTop: '10px' }}>
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          style={{ padding: '10px 20px' }}
        >
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      )}
    </div>
  );
};

export default Chat;
