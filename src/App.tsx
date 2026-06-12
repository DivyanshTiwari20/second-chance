import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import ProfileBuilder from './components/ProfileBuilder';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentStage, setCurrentStage] = useState<'onboarding' | 'builder' | 'dashboard'>('onboarding');
  const [loading, setLoading] = useState(true);

  // Initialize and check local storage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('second_chance_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as UserProfile;
        if (parsed && parsed.onboarded) {
          setUserProfile(parsed);
          setCurrentStage('dashboard');
        }
      }
    } catch (e) {
      console.error('Failed to parse user profile from localStorage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartOnboarding = () => {
    setCurrentStage('builder');
  };

  const handleCompleteProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('second_chance_user_profile', JSON.stringify(profile));
    setCurrentStage('dashboard');
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('second_chance_user_profile', JSON.stringify(profile));
  };

  const handleResetState = () => {
    localStorage.removeItem('second_chance_user_profile');
    localStorage.removeItem('second_chance_connections');
    localStorage.removeItem('second_chance_messages');
    setUserProfile(null);
    setCurrentStage('onboarding');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-neutral-400">Restoring Narrative Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-between">
      {/* Dynamic Screen Render */}
      <main className="flex-grow">
        {currentStage === 'onboarding' && (
          <Onboarding onStart={handleStartOnboarding} />
        )}
        {currentStage === 'builder' && (
          <ProfileBuilder onComplete={handleCompleteProfile} />
        )}
        {currentStage === 'dashboard' && userProfile && (
          <Dashboard 
            userProfile={userProfile} 
            onUpdateProfile={handleUpdateProfile} 
            onReset={handleResetState} 
          />
        )}
      </main>

      {/* Footer Branding Signature (Common minimal footer) */}
      <footer className="py-6 border-t border-neutral-100 text-center text-[10px] font-mono text-neutral-400">
        <p className="tracking-widest">SECOND CHANCE V1.0.0 © 2026. ALL STORIES RECORDED LOCALLY.</p>
      </footer>
    </div>
  );
}
