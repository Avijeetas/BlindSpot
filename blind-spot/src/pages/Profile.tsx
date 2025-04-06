'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Menu, User, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { createClient } from '../lib/superbase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ageOptions = ['Under 18', '18–25', '26–35', '36–50', '50+'];
const genderOptions = ['Male', 'Female'];
const occupationOptions = ['Student', 'Engineer', 'Doctor', 'Artist', 'Other', 'Politician'];
const locationOptions = ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Texas', 'Other'];

type UserType = {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
};

const Profile = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [fullName, setFullName] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
//   const [inputInterest, setInputInterest] = useState('');
  const [user, setUser] = useState<UserType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    setDarkMode(storedDarkMode !== 'false');
  }, []);
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single(); // Fetch a single profile by user_id
      
      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        if (data) {
          setFullName(data.full_name || '');
          setAgeCategory(data.age_category || '');
          setGender(data.gender || '');
          setOccupation(data.occupation || '');
          setLocation(data.location || '');
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

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
          fetchUserProfile(user.id)
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

//   const addInterest = () => {
//     if (inputInterest.trim() !== '' && !interests.includes(inputInterest)) {
//       setInterests([...interests, inputInterest.trim()]);
//       setInputInterest('');
//     }
//   };

//   const removeInterest = (interest: string) => {
//     setInterests(interests.filter((i) => i !== interest));
//   };

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
    router.push('/profile');
  };

 
  const handleSubmit = async () => {
    const profileData = {
      fullName,
      ageCategory,
      gender,
      occupation,
      location,
      
    };

    console.log('Submitting Profile:', profileData);

    try {
      const { data, error } = await supabase
        .from('users') // Insert into 'users' table now
        .upsert({
          user_id: user?.id, // Ensure we're saving the profile under the correct user ID
          age_category: ageCategory,
          gender: gender,
          occupation: occupation,
          location: location,
        });
        if (error) {
            console.error('Error saving profile:', error);
            toast.error('Error saving profile');
          } else {
            console.log('Profile updated successfully:', data);
            toast.success('Profile updated successfully');
          }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };
  const navigateToDashboard = () => {
    router.push('/Dashboard');
  };

  const inputClass = `${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded px-4 py-2 w-full`;
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${bgColor} ${textColor} min-h-screen`}>
        <ToastContainer />
      {/* Top Bar */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} ${borderColor} border-b shadow-sm`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="cursor-pointer" size={20} />
            <h1 className="text-xl font-bold cursor-pointer" onClick={navigateToDashboard}>BlindSpot</h1>
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
            type="text"
            disabled
            value={fullName || user?.user_metadata?.full_name || ''}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={inputClass}
          >
            <option value="">Select your gender</option>
            {genderOptions.map((genderOption) => (
              <option key={genderOption} value={genderOption}>
                {genderOption}
              </option>
            ))}
          </select>
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

        {/* Occupation */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Occupation</label>
          <select
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className={inputClass}
          >
            <option value="">Select your occupation</option>
            {occupationOptions.map((occupationOption) => (
              <option key={occupationOption} value={occupationOption}>
                {occupationOption}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          >
            <option value="">Select your location</option>
            {locationOptions.map((locationOption) => (
              <option key={locationOption} value={locationOption}>
                {locationOption}
              </option>
            ))}
          </select>
        </div>

        {/* Interests */}
        {/* <div className="mb-4">
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
            {interests.map((interest, index) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full cursor-pointer"
                onClick={() => removeInterest(interest)}
              >
                {interest} <span className="ml-1 text-red-500">&times;</span>
              </span>
            ))}
          </div>
        </div> */}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
