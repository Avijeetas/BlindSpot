'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '../lib/superbase/client';
import Image from 'next/image';
import { Sun, Moon, Menu, User, LogOut, Circle } from 'lucide-react';
import { useRouter } from 'next/router';
import '../../src/app/globals.css';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Technology', 'Books']);
  const [inputTopic, setInputTopic] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const [isProfileComplete, setIsProfileComplete] = useState(false); // Track if the profile is complete
  
  useEffect(() => {
    setMounted(true);
    const storedDarkMode = localStorage.getItem('darkMode');
    setDarkMode(storedDarkMode === 'false' ? false : true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('darkMode', darkMode.toString());
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode, mounted]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const fetchUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
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
  }, []);

  useEffect(() => {
    fetchUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata || {},
        });
        checkProfileComplete(session.user.id)
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser, supabase]);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };
  const checkProfileComplete = async (userId: string) => {
    const { data, error } = await supabase
      .from('users') // Assuming your users table is named 'users'
      .select('age_category, gender, occupation, location') // Include the necessary fields
      .eq('user_id', userId)
      .single(); // Assuming the user table has a unique id field

    if (error) {
      console.error('Error fetching user data:', error);
      return;
    }

    // Check if necessary fields are not empty
    if (data?.age_category && data?.gender && data?.occupation && data?.location) {
      
      setIsProfileComplete(true);
    } else {
      setIsProfileComplete(false);
    }
    

  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTopic = () => {
    if (inputTopic.trim() !== '' && !selectedTopics.includes(inputTopic)) {
      setSelectedTopics([...selectedTopics, inputTopic]);
      setInputTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics(selectedTopics.filter((t) => t !== topic));
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleProfileRedirect = () => {
    router.push('/Profile');
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  
  if (!mounted) return null;

  return (
    <div className={`${bgColor} ${textColor} min-h-screen transition-colors duration-200`}>
      {/* Top Bar */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} ${borderColor} border-b shadow-sm`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="cursor-pointer" size={20} />
            <h1 className="text-xl font-bold">BlindSpot</h1>
          </div>

          <div className="flex items-center gap-6 relative" ref={dropdownRef}>
            <button onClick={toggleDarkMode} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div
                  className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 border ${borderColor}`}
                >
                  <div className="px-4 py-2 text-sm">{user?.email}</div>
                  <div
                    onClick={handleProfileRedirect}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profile
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6">
        {/* Show "Let's get started" if the profile is not complete */}
        {!isProfileComplete && (
          <div className="lg:col-span-3 flex justify-center mb-6">
            <div className={`${cardBg} rounded-lg shadow p-6 ${borderColor} border w-full max-w-2xl`}>
              <h2 className="text-xl font-semibold mb-4 text-center">Let's get started</h2>
              <p className="text-center mb-4">To begin, set up your profile and preferences.</p>
              <ul className="space-y-3 mb-4">
                <li className="flex items-center gap-2 justify-center">
                  <Circle className="text-gray-500" size={18} />
                  <span
                    className="cursor-pointer text-blue-600"
                    onClick={() => router.push('/Profile')}
                  >
                    Setup user profile and preferences
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Analytics, Recent Activity, Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Analytics', 'Recent Activity', 'Tasks'].map((item) => (
            <div
              key={item}
              className={`${cardBg} rounded-lg shadow p-6 ${borderColor} border h-64 flex items-center justify-center`}
            >
              <p className="text-xl font-medium text-gray-400">{item} Section</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
