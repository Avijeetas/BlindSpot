import { useState, useEffect } from 'react';
import { createClient } from '../../lib/superbase/client';
import { User } from '@supabase/supabase-js';

const Chat: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session fetch error:', sessionError);
        return;
      }
      if (!session) {
        console.log('No session found');
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User fetch error:', userError);
      } else if (user) {
        console.log('User fetched:', user);
        setUser(user);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'INITIAL_SESSION') {
        if (session) {
          console.log('Initial session found:', session);
          setUser(session.user);
        } else {
          console.log('No initial session');
        }
      }
    });

    // Cleanup the listener on component unmount
    return () => {
      authListener?.unsubscribe();
    };
  }, []); // Empty dependency array to run only on mount

  return (
    <div>
      {isLoading ? <p>Loading...</p> : user ? <p>Welcome, {user.email}!</p> : <p>Please sign in.</p>}
    </div>
  );
};

export default Chat;
