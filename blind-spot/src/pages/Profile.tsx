'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Menu, Search, Bell, User, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { createClient } from '../lib/superbase/client';

const ageOptions = ['Under 18', '18–25', '26–35', '36–50', '50+'];

const Profile = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [fullName, setFullName] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [inputInterest, setInputInterest] = useState('');
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    setDarkMode(storedDarkMode !== 'false');
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
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
    };
    
    fetchUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata || {},
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const addInterest = () => {
    if (inputInterest.trim() !== '' && !interests.includes(inputInterest)) {
      setInterests([...interests, inputInterest.trim()]);
      setInputInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
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
    router.push('/profile'); // Redirect to profile page
  };

  const handleSubmit = async () => {
    const profileData = {
      fullName,
      ageCategory,
      interests,
    };

    console.log('Submitting Profile:', profileData);

    // Save profile data to the backend or database (e.g., Supabase or your backend)
    try {
      // Example: Using Supabase to update profile data
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: fullName,
          age_category: ageCategory,
          interests: interests,
        });

      if (error) {
        console.error('Error saving profile:', error);
      } else {
        console.log('Profile updated successfully:', data);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };
  const navigateToDashboard = () => {
    router.push('/Dashboard'); // Redirect to profile page
  };

  const inputClass = `${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded px-4 py-2 w-full`;

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${bgColor} ${textColor} min-h-screen`}>
      {/* Top Bar */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} ${borderColor} border-b shadow-sm`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="cursor-pointer" size={20} />
            <h1 className="text-xl font-bold" onClick={navigateToDashboard}>BlindSpot</h1>
          </div>

          <div className="flex items-center gap-6 relative" ref={dropdownRef}>
            
            <button onClick={() => setDarkMode(!darkMode)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
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
                <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 border ${borderColor}`}>
                  <div className="px-4 py-2 text-sm">
                    {user?.email}
                  </div>
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

      {/* Profile Form */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded shadow-lg border border-gray-200 dark:border-gray-700 mt-6">
        <h1 className="text-2xl font-semibold mb-6">Profile Information</h1>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Full Name</label>
          <input
            type="text" disabled
            value={fullName || user?.user_metadata?.full_name || ''}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>

        {/* Age Category */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Age Category</label>
          <select
            value={ageCategory}
            onChange={(e) => setAgeCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">Select your age group</option>
            {ageOptions.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>

        {/* Interests */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Area of Interest</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={inputInterest}
              onChange={(e) => setInputInterest(e.target.value)}
              placeholder="e.g., AI, Robotics"
              className={`${inputClass} flex-grow`}
            />
            <button
              onClick={addInterest}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <div
                key={interest}
                className="bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="text-xs ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
