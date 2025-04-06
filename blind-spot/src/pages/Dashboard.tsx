'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '../lib/superbase/client';
import Image from 'next/image';
import { Sun, Moon, Menu, User, Circle } from 'lucide-react';

import { useRouter } from 'next/router';

import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}
interface Prompt {
  prompt_id: string; // Unique identifier for the prompt
  prompt: string;    // The actual prompt text
  perspective: string; // Additional perspective or context related to the prompt
}

const TopicDiscussion = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [perspectives, setPerspectives] = useState({
    negative: {
      text: 'Education should not be free because it devalues the quality of education. If it were free, institutions might not have the necessary funding for resources, teachers, or infrastructure.',
      thumbsUp: 0,
      thumbsDown: 0,
    },
    positive: {
      text: 'Education should be free because everyone deserves equal access to learning regardless of their financial situation. Free education could lead to a more educated society and reduce inequality.',
      thumbsUp: 0,
      thumbsDown: 0,
    },
  });

  const handleTopicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(event.target.value);
  };

  const handleGenerateContent = () => {
    if (topic.trim() === '') return;

    // Dummy logic for generating perspectives based on the topic
    // Ideally, this can be integrated with a knowledge model or API that generates perspectives

    // For demonstration purposes, I am hardcoding the logic.
    if (topic === 'Education should not be free') {
      setPerspectives({
        negative: {
          text: 'Education should not be free because it devalues the quality of education. If it were free, institutions might not have the necessary funding for resources, teachers, or infrastructure.',
          thumbsUp: 0,
          thumbsDown: 0,
        },
        positive: {
          text: 'Education should be free because everyone deserves equal access to learning regardless of their financial situation. Free education could lead to a more educated society and reduce inequality.',
          thumbsUp: 0,
          thumbsDown: 0,
        },
      });

      // For simplicity, we'll hardcode some keywords here
      setKeywords(['Education', 'Access', 'Equality', 'Funding', 'Quality']);
    } else {
      setPerspectives({
        negative: {
          text: 'No perspective available.',
          thumbsUp: 0,
          thumbsDown: 0,
        },
        positive: {
          text: 'No perspective available.',
          thumbsUp: 0,
          thumbsDown: 0,
        },
      });
      setKeywords([]);
    }
  };

  // Increment thumbs-up for each perspective
  const handleThumbsUp = (perspective: 'negative' | 'positive') => {
    setPerspectives(prevState => ({
      ...prevState,
      [perspective]: {
        ...prevState[perspective],
        thumbsUp: prevState[perspective].thumbsUp ^ 1 ,
        thumpsDown: 0
      },
    }));
  };

  // Increment thumbs-down for each perspective
  const handleThumbsDown = (perspective: 'negative' | 'positive') => {
    setPerspectives(prevState => ({
      ...prevState,
      [perspective]: {
        ...prevState[perspective],
        thumbsDown: prevState[perspective].thumbsDown ^ 1,
        thumpsUp: 0
      },
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Enter topic..."
          value={topic}
          onChange={handleTopicChange}
          className="p-4 text-xl rounded-md text-black  border border-gray-400 w-full md:w-1/2"
        />
        <button
          onClick={handleGenerateContent}
          className="ml-2 p-4 bg-blue-500  rounded-md"
        >
          Generate Perspectives
        </button>
      </div>


      {/* Perspectives */}
      {topic && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-300 rounded-md">
            <h3 className="font-semibold text-xl mb-2">Why it should not be free</h3>
            <p>{perspectives.negative.text}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleThumbsUp('negative')}
                className="flex items-center gap-2 text-green-500 hover:text-green-600"
              >
                👍 {perspectives.negative.thumbsUp}
              </button>
              <button
                onClick={() => handleThumbsDown('negative')}
                className="flex items-center gap-2 text-red-500 hover:text-red-600"
              >
                👎 {perspectives.negative.thumbsDown}
              </button>
            </div>
          </div>
          <div className="p-6 border border-gray-300 rounded-md">
            <h3 className="font-semibold text-xl mb-2">Why it should be free</h3>
            <p>{perspectives.positive.text}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleThumbsUp('positive')}
                className="flex items-center gap-2 text-green-500 hover:text-green-600"
              >
                👍 {perspectives.positive.thumbsUp}
              </button>
              <button
                onClick={() => handleThumbsDown('positive')}
                className="flex items-center gap-2 text-red-500 hover:text-red-600"
              >
                👎 {perspectives.positive.thumbsDown}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">Relevant Keywords:</h4>
          <div className="flex gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-4 py-2 rounded-full bg-blue-100 text-blue-600"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


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
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  
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
  }, [supabase]);
 
  useEffect(() => {
    const fetchPrompt = async (userId: string) => {
      const { data, error } = await supabase
        .from('prompts')
        .select('prompt_id, prompt, prespective')
        .eq('user_id', userId)
        .single();
  
      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }
  
      if (data) {
        setPrompts(data);
        setInputTopic(data.prompt);
      }
     
    };
    const checkProfileComplete = async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('age_category, gender, occupation, location')
        .eq('user_id', userId)
        .single();
  
      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }
  
      if (data?.age_category && data?.gender && data?.occupation && data?.location) {
        setIsProfileComplete(true);
      } else {
        setIsProfileComplete(false);
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
        checkProfileComplete(session.user.id)
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser, supabase,]);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
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
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <ul className="py-2 text-gray-800 dark:text-white">
                  <li className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" >
                      {user?.email}
                    </li>
                    <li className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      {isProfileComplete ? (
                        <Link href="/Profile">Go to Profile</Link>
                      ) : (
                        <span onClick={handleProfileRedirect}>Complete your Profile</span>
                      )}
                    </li>
                    <li className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleSignOut}>
                      Sign Out
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      { user && 
            <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 gap-8">
              {/* Dashboard Content */}
              <div className="flex flex-col gap-6">
                
              {!isProfileComplete && (
              <div className={`${cardBg} mx-auto rounded-lg shadow p-6 ${borderColor} border w-full max-w-2xl`}>
              <h2 className="text-xl font-semibold mb-4 text-center">Let`s get started</h2>
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

            ) }
                { isProfileComplete && <>
                <TopicDiscussion />
    
                {/* Topics List */}
                <div>
                  <h3 className="text-xl font-semibold">Your Selected Topics</h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTopics.map((topic) => (
                      <div key={topic} className="flex items-center gap-2 p-2 bg-blue-100 rounded-md">
                        <span>{topic}</span>
                        <button onClick={() => removeTopic(topic)} className="text-red-500">
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
    
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add a topic"
                      value={inputTopic}
                      onChange={(e) => setInputTopic(e.target.value)}
                      className="p-2 rounded-md border border-gray-400"
                    />
                    <button onClick={addTopic} className="bg-blue-500 text-white p-2 rounded-md">
                      Add
                    </button>
                  </div>
                </div>
                </>/* Topic Discussion Section */}
                
              </div>
            </div>
          </div>
    

      }
    </div>
  );
};

export default Dashboard;
