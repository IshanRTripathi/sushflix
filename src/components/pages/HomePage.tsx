import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../layout/Header'; // Import the Header component

interface UserProfile {
  username: string;
  email: string;
  posts: number;
  followers: number;
  subscribers: number;
  profilePic?: string;
}

export function HomePage() {
    console.log('HomePage loaded');
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
      const fetchProfile = async () => {
          try {
              const response = await fetch('/api/auth/me');
              const userData = await response.json()
              if (response.ok) {
                setProfile(userData);
              } else {
                  console.error('Failed to fetch profile');
              }
          } catch (error) {
              console.error('Error fetching profile:', error);
          }
        };
        fetchProfile();
      },[]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <Header /> {/* Use the Header component */}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center ">
          {/* Left: Text Content */}
          <div className="text-left ">
            <div className="flex items-center mb-4 text-left">
              <img src="/images/community_icons.png" alt="Community Icons" className="h-8 w-auto mr-4" />
              <span className="text-gray-700 uppercase text-xs font-semibold tracking-widest text-left">TRUSTED BY A DIVERSE COMMUNITY OF CREATORS</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Get paid to do what you love.
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Share your content on your own terms, and connect with your fans like never before.
            </p>
            <div className="flex space-x-4 ">
              <Link to="/signup?type=creator" className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition">
                Become a Creator
              </Link>
             <Link to="/signup?type=fan" className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition">
                  Sign up as a Fan
              </Link>          
            </div>
          </div>
          {/* Right: Profile Card */}
          <div className="relative">
            <img src="/images/yellow_stroke.png" alt="Yellow Stroke" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[650px] hidden md:block" />
            <div className="bg-white rounded-2xl shadow-lg p-6 relative z-10">
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img src={profile?.profilePic || "/images/profile_pic.png"} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{profile?.username || "Loading..."}</div>
                  <div className="text-gray-600 text-sm">{profile?.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm sm:text-base">
                <div>
                  <div className="font-bold">{profile?.posts || "0"}</div>
                  <div className="text-gray-600">posts</div>
                </div>
                <div>
                  <div className="font-bold">{profile?.followers || "0"}</div>
                  <div className="text-gray-600">followers</div>
                </div>
                <div>
                  <div className="font-bold">{profile?.subscribers || "0"}</div>
                  <div className="text-gray-600">subscribers</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 ">
                <button className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition w-full">
                  Watch Video
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition w-full">
                  Message
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition w-full ">
                  Send Tip 
                </button>
              </div>
               <button className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition w-full mt-4">
                  Subscribe <span className="font-bold">$499</span> per month
              </button>
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
