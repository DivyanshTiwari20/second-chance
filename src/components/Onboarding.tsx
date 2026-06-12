import { motion } from 'motion/react';
import { BookOpen, Heart, Shield, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onStart: () => void;
}

export default function Onboarding({ onStart }: OnboardingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 max-w-xl mx-auto py-12">
      {/* Visual Icon Header with Kintsugi Theme */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-200 shadow-xs mb-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-12 h-12">
          <g transform="translate(136, 120) scale(0.48)">
            <path d="M 120 280 C 120 280 15 190 15 110 C 15 50 60 15 120 85 C 180 15 225 50 225 110 C 225 190 120 280 120 280 Z" fill="none" stroke="#111111" stroke-width="12" stroke-linecap="round"/>
            <path d="M 120 210 C 120 210 135 150 120 100 C 120 100 105 150 120 210" fill="none" stroke="#D97706" stroke-width="15" stroke-linecap="round"/>
            <path d="M 120 135 C 135 125 155 120 160 105" fill="none" stroke="#D97706" stroke-width="13" stroke-linecap="round"/>
            <path d="M 120 165 C 105 155 85 150 80 135" fill="none" stroke="#D97706" stroke-width="13" stroke-linecap="round"/>
          </g>
        </svg>
      </motion.div>

      {/* Brand & Taglines */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="text-center"
      >
        <h1 id="app-title" className="font-heading text-4xl font-semibold tracking-tight text-neutral-900 mb-3">
          Second Chance
        </h1>
        <p className="font-sans text-lg text-neutral-500 font-medium tracking-tight mb-8">
          Meet people through stories, not selfies.
        </p>
      </motion.div>

      {/* Philosophy Points */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-6 w-full my-6 font-sans text-sm text-neutral-600"
      >
        <div id="feat-vulnerability" className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors duration-200">
          <div className="p-2 bg-neutral-100 rounded-lg text-neutral-800">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">Vulnerability First</h3>
            <p className="text-neutral-500 leading-relaxed">
              We match people based on their relationship journeys, breakup reflections, and emotional maturity. No face photos until you connect.
            </p>
          </div>
        </div>

        <div id="feat-narratives" className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors duration-200 font-sans">
          <div className="p-2 bg-neutral-100 rounded-lg text-neutral-800">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">Lessons as Bridges</h3>
            <p className="text-neutral-500 leading-relaxed">
              Discover companions who have navigated similar healing curves. Standard matches fail because they look for appearance; we focus on what you actually learned.
            </p>
          </div>
        </div>

        <div id="feat-safety" className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors duration-200">
          <div className="p-2 bg-neutral-100 rounded-lg text-neutral-800">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">A Safe Persona Space</h3>
            <p className="text-neutral-500 leading-relaxed">
              All data is held securely in your local browser state. No cloud servers, no databases, absolutely private and personal.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.button
        id="btn-get-started"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onStart}
        className="w-full mt-8 bg-neutral-900 hover:bg-neutral-800 text-white font-sans font-medium text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors duration-150"
      >
        <span>Begin Your Story</span>
        <ArrowRight className="w-4 h-4 text-neutral-300" />
      </motion.button>

      {/* Minimal Footer Signature */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-center text-xs font-mono mt-12 text-neutral-500"
      >
        Inspired by Kintsugi — Repair with Gold
      </motion.div>
    </div>
  );
}
