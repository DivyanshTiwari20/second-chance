import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, CornerDownLeft, Sparkles, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileBuilderProps {
  onComplete: (profile: UserProfile) => void;
}

export default function ProfileBuilder({ onComplete }: ProfileBuilderProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Omit<UserProfile, 'onboarded'>>({
    name: '',
    age: 26,
    gender: 'Female',
    lookingForGender: 'Male',
    story: '',
    reason: 'Lack of Communication',
    learnings: '',
    lookingFor: 'Serious Relationship',
    duration: '1-3 months',
    avatarSeed: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;
  const progressPercent = Math.round((step / (totalSteps - 1)) * 100);

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 0) {
      if (!formData.name.trim()) newErrors.name = 'Name is required.';
      if (!formData.age || formData.age < 18 || formData.age > 99) {
        newErrors.age = 'Must be 18 or older to enter.';
      }
    } else if (step === 1) {
      if (!formData.story.trim()) {
        newErrors.story = 'Please share your story. Getting it out is part of the healing process.';
      } else if (formData.story.length < 50) {
        newErrors.story = `Could you share a bit more? Try to make it at least 50 characters (currently: ${formData.story.length}).`;
      }
    } else if (step === 3) {
      if (!formData.learnings.trim()) {
        newErrors.learnings = 'Your learnings will help matches find core alignment. Please share some thoughts.';
      } else if (formData.learnings.length < 30) {
        newErrors.learnings = `A tiny bit more? Write at least 30 characters (currently: ${formData.learnings.length}).`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps - 1) {
        setStep(step + 1);
      } else {
        // Complete
        const finalProfile: UserProfile = {
          ...formData,
          avatarSeed: formData.name.charAt(0).toUpperCase() || 'U',
          onboarded: true,
        };
        onComplete(finalProfile);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const updateField = (key: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 font-sans min-h-[80vh] flex flex-col justify-between">
      
      {/* Top Header & Progress */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button 
            id="btn-back-step"
            onClick={handleBack}
            disabled={step === 0}
            className={`flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors ${step === 0 ? 'opacity-0 cursor-default' : 'cursor-pointer'}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          
          <span className="text-xs font-mono text-neutral-400">
            Step {step + 1} of {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-[3px] bg-[#F2F2F7] rounded-full mb-10 overflow-hidden">
          <motion.div 
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Form Screens */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div id="step-basics" className="space-y-5">
                <div>
                  <h2 className="font-heading text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    First, who are you?
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Your name and preferences are kept secure to render personalized local matches.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label htmlFor="input-name" className="block text-xs font-medium text-neutral-600 mb-1.5 font-sans">
                      First Name or Pseudonym
                    </label>
                    <input
                      id="input-name"
                      type="text"
                      value={formData.name}
                      onChange={e => updateField('name', e.target.value)}
                      placeholder="e.g. Robin"
                      className="w-full bg-[#F9F9FB] border border-[#E5E5EA] hover:border-neutral-300 focus:border-black rounded-2xl px-4 py-3.5 text-sm transition-all duration-150"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1.5 font-mono">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="input-age" className="block text-xs font-medium text-neutral-600 mb-1.5 font-sans">
                        Age
                      </label>
                      <input
                        id="input-age"
                        type="number"
                        min="18"
                        max="99"
                        value={formData.age}
                        onChange={e => updateField('age', parseInt(e.target.value) || 18)}
                        className="w-full bg-[#F9F9FB] border border-[#E5E5EA] hover:border-neutral-300 focus:border-black rounded-2xl px-4 py-3.5 text-sm transition-all duration-150"
                      />
                      {errors.age && (
                        <p className="text-red-500 text-xs mt-1.5 font-mono">{errors.age}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="select-gender" className="block text-xs font-medium text-neutral-600 mb-1.5 font-sans">
                        Your Gender
                      </label>
                      <select
                        id="select-gender"
                        value={formData.gender}
                        onChange={e => updateField('gender', e.target.value)}
                        className="w-full bg-[#F9F9FB] border border-[#E5E5EA] hover:border-neutral-300 focus:border-black rounded-2xl px-4 py-3.5 text-sm transition-all duration-150"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-Binary">Non-Binary</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label id="lbl-looking-gender" className="block text-xs font-medium text-neutral-600 mb-3 font-sans">
                      Who are you open to connecting with?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Male', 'Female', 'Any'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          id={`btn-look-${opt.toLowerCase()}`}
                          onClick={() => updateField('lookingForGender', opt)}
                          className={`border text-xs rounded-2xl py-3.5 justify-center text-center font-medium cursor-pointer transition-all ${
                            formData.lookingForGender === opt
                              ? 'bg-black border-black text-white shadow-sm font-bold ring-1 ring-black'
                              : 'bg-white border-[#E5E5EA] text-neutral-600 hover:bg-[#F9F9FB]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Breakup Story */}
            {step === 1 && (
              <div id="step-story" className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1 bg-brand-accent-faded text-brand-accent text-xs font-mono px-2 py-0.5 rounded-full mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Question 1 of 5</span>
                  </div>
                  <h2 className="font-heading text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Tell us your breakup story.
                  </h2>
                  <p className="text-sm text-neutral-400">
                    What starts off the narrative? Describe the journey, the turning points, and how you said goodbye.
                  </p>
                </div>

                <div className="space-y-2">
                  <textarea
                    id="input-story"
                    rows={8}
                    value={formData.story}
                    onChange={e => updateField('story', e.target.value)}
                    placeholder="We were together for two years. We started growing apart after a promotion... The key moment we realized it was ending was..."
                    className="w-full bg-[#F9F9FB] border border-[#E5E5EA] hover:border-[#D1D1D6] focus:border-black rounded-2xl p-4 text-sm leading-relaxed placeholder:text-neutral-400 resize-none transition-all duration-150"
                  />
                  
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>Try starting with honesty & details</span>
                    <span className={formData.story.length < 50 ? 'text-brand-accent' : 'text-neutral-500'}>
                      {formData.story.length} chars (min 50)
                    </span>
                  </div>

                  {errors.story && (
                    <p className="text-red-500 text-xs font-mono mt-1">{errors.story}</p>
                  )}
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-[13px] text-neutral-500 leading-relaxed font-sans">
                  <span className="font-semibold text-neutral-800">Pro-Tip for storytellers:</span> Focus on your side of the saga equally. High empathy profiles get 3x more meaningful echoes.
                </div>
              </div>
            )}

            {/* Step 2: Rupture reason & duration */}
            {step === 2 && (
              <div id="step-reasons" className="space-y-6">
                {/* Q2 */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1 bg-brand-accent-faded text-brand-accent text-xs font-mono px-2 py-0.5 rounded-full">
                    <span>Question 2 of 5</span>
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                      Why did the relationship end?
                    </h2>
                    <p className="text-sm text-neutral-400">
                      Select the primary factor that caused the relationship to part.
                    </p>
                  </div>

                  <select
                    id="select-reason"
                    value={formData.reason}
                    onChange={e => updateField('reason', e.target.value)}
                    className="w-full bg-[#F9F9FB] border border-[#E5E5EA] hover:border-[#D1D1D6] focus:border-black rounded-2xl px-4 py-3.5 text-sm transition-all duration-150 appearance-none font-medium text-neutral-800"
                  >
                    <option value="Cheating">Cheating</option>
                    <option value="Long Distance">Long Distance</option>
                    <option value="Lack of Communication">Lack of Communication</option>
                    <option value="Different Life Goals">Different Life Goals</option>
                    <option value="Toxic Relationship">Toxic Relationship</option>
                    <option value="Family Pressure">Family Pressure</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Q5 */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="inline-flex items-center gap-1 bg-brand-accent-faded text-brand-accent text-xs font-mono px-2 py-0.5 rounded-full">
                    <span>Question 5 of 5</span>
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-neutral-900 mb-1">
                      How long ago was the breakup?
                    </h2>
                    <p className="text-sm text-neutral-400">
                      We match people currently navigating similar stages of processing or renewal.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      'Less than 1 month',
                      '1-3 months',
                      '3-6 months',
                      '6-12 months',
                      '1+ years'
                    ].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        id={`btn-duration-${opt.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => updateField('duration', opt)}
                        className={`border text-[13px] rounded-2xl py-3.5 px-2 text-center font-medium cursor-pointer transition-all ${
                          formData.duration === opt
                            ? 'bg-black border-black text-white shadow-sm font-bold ring-1 ring-black'
                            : 'bg-white border-[#E5E5EA] text-[#8E8E93] hover:bg-[#F9F9FB]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Learnings & Goals */}
            {step === 3 && (
              <div id="step-learnings" className="space-y-6">
                {/* Q3 */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1 bg-brand-accent-faded text-brand-accent text-xs font-mono px-2 py-0.5 rounded-full">
                    <span>Question 3 of 5</span>
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                      What did you learn?
                    </h2>
                    <p className="text-sm text-neutral-400">
                      Reflect on what the rupture taught you about your needs, boundaries, or self-worth.
                    </p>
                  </div>

                  <div>
                    <textarea
                      id="input-learnings"
                      rows={4}
                      value={formData.learnings}
                      onChange={e => updateField('learnings', e.target.value)}
                      placeholder="I realized that I merit active presence. I learned how to stand my ground on communication schedules and value my own time..."
                      className="w-full bg-[#F9F9FB] border border-[#E5E5EA] hover:border-[#D1D1D6] focus:border-black rounded-2xl p-4 text-sm leading-relaxed placeholder:text-neutral-400 resize-none transition-all duration-150"
                    />
                    <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mt-1">
                      <span>Reflective, honest and forward-looking</span>
                      <span className={formData.learnings.length < 30 ? 'text-brand-accent' : 'text-neutral-500'}>
                        {formData.learnings.length} chars (min 30)
                      </span>
                    </div>
                    {errors.learnings && (
                      <p className="text-red-500 text-xs font-mono mt-1">{errors.learnings}</p>
                    )}
                  </div>
                </div>

                {/* Q4 */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="inline-flex items-center gap-1 bg-brand-accent-faded text-brand-accent text-xs font-mono px-2 py-0.5 rounded-full">
                    <span>Question 4 of 5</span>
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-neutral-900 mb-1">
                      What are you looking for now?
                    </h2>
                    <p className="text-sm text-neutral-400">
                      Be clear about your intentions. It keeps connections honest.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Serious Relationship',
                      'Casual Dating',
                      'Friendship',
                      'Not Sure Yet'
                    ].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        id={`btn-lookfor-${opt.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => updateField('lookingFor', opt)}
                        className={`border text-[13px] rounded-2xl py-3.5 px-4 text-left font-medium cursor-pointer transition-all flex items-center justify-between ${
                          formData.lookingFor === opt
                            ? 'bg-black border-black text-white shadow-sm font-semibold'
                            : 'bg-white border-[#E5E5EA] text-neutral-600 hover:bg-[#F9F9FB]'
                        }`}
                      >
                        <span>{opt}</span>
                        {formData.lookingFor === opt && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation bar */}
      <div className="flex items-center justify-end pt-8 mt-12 border-t border-neutral-100">
        <button
          id="btn-next-step"
          onClick={handleNext}
          className="bg-black hover:bg-neutral-950 text-white font-semibold text-sm py-4 px-8 rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg shadow-black/10 transition-all duration-150 active:scale-[0.98]"
        >
          <span>{step === totalSteps - 1 ? 'Publish Narrative' : 'Next Step'}</span>
          <ArrowRight className="w-4 h-4 text-neutral-300" />
        </button>
      </div>

    </div>
  );
}
