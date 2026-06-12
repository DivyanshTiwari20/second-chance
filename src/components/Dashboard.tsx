import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  MessageSquare, 
  User, 
  Sparkles, 
  Send, 
  Heart, 
  CornerDownRight, 
  AlertCircle, 
  Share2, 
  PenTool, 
  ArrowRight,
  RefreshCw,
  Check,
  CheckCheck,
  CornerRightDown
} from 'lucide-react';
import { UserProfile, MatchProfile, ChatMessage, Connection } from '../types';
import { mockProfiles } from '../data/mockProfiles';

interface DashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onReset: () => void;
}

export default function Dashboard({ userProfile, onUpdateProfile, onReset }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'chats' | 'profile'>('feed');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  
  // Feed states
  const [feedProfiles, setFeedProfiles] = useState<MatchProfile[]>([]);
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const [echoText, setEchoText] = useState('');
  const [showMatchSuccess, setShowMatchSuccess] = useState<MatchProfile | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Typing simulator states
  const [typingConnectionId, setTypingConnectionId] = useState<string | null>(null);
  
  // Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>({ ...userProfile });
  const [editSuccessMessage, setEditSuccessMessage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chats & messages from localStorage on mount
  useEffect(() => {
    const savedConnections = localStorage.getItem('second_chance_connections');
    const savedMessages = localStorage.getItem('second_chance_messages');
    
    if (savedConnections) setConnections(JSON.parse(savedConnections));
    if (savedMessages) setMessages(JSON.parse(savedMessages));

    // Filter peer profiles based on compatibility or orientation
    const filtered = mockProfiles.filter(profile => {
      // Filter based on gender options
      const genderMatch = 
        userProfile.lookingForGender === 'Any' || 
        profile.gender === userProfile.lookingForGender;
      
      const peerGenderMatch = 
        profile.lookingForGender === 'Any' || 
        userProfile.gender === profile.lookingForGender;

      return genderMatch && peerGenderMatch;
    });

    setFeedProfiles(filtered.length > 0 ? filtered : mockProfiles);
  }, []);

  // Save to locale storage on state changes
  const saveState = (newConnections: Connection[], newMessages: ChatMessage[]) => {
    setConnections(newConnections);
    setMessages(newMessages);
    localStorage.setItem('second_chance_connections', JSON.stringify(newConnections));
    localStorage.setItem('second_chance_messages', JSON.stringify(newMessages));
  };

  // Scroll chats on refresh
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedConnectionId, typingConnectionId]);

  // Compatibility formulation logic
  const calculateCompatibility = (peer: MatchProfile): number => {
    let score = 50; // Neutral baseline
    if (userProfile.reason === peer.reason) score += 20; // Shared rupture alignment
    if (userProfile.duration === peer.duration) score += 10; // Shared recovery timeline
    if (userProfile.lookingFor === peer.lookingFor) score += 15; // Aligned intentions
    
    // Tiny random offset matching semantic text similarities, bounded
    const combinedLength = (userProfile.story.length + peer.story.length) % 5;
    score += combinedLength;

    return Math.min(score, 99);
  };

  // Skip Profile Action
  const handleSkip = () => {
    setEchoText('');
    setFeedbackMsg('');
    if (currentFeedIndex < feedProfiles.length - 1) {
      setCurrentFeedIndex(currentFeedIndex + 1);
    } else {
      setCurrentFeedIndex(0); // Loop back
    }
  };

  // Echo Send Action (Matching Event)
  const handleConnectEcho = (e: React.FormEvent) => {
    e.preventDefault();
    if (!echoText.trim()) return;

    const currentPeer = feedProfiles[currentFeedIndex];
    if (!currentPeer) return;

    // Check if connection already exists
    const existing = connections.find(c => c.matchId === currentPeer.id);
    if (existing) {
      setFeedbackMsg(`You are already in a written connection with ${currentPeer.name}. Checkout the chats tab!`);
      return;
    }

    const connectionId = `conn_${Date.now()}`;
    
    // Create connection object
    const newConnection: Connection = {
      id: connectionId,
      matchId: currentPeer.id,
      createdAt: Date.now(),
      lastMessageText: `Your Echo: "${echoText.slice(0, 40)}..."`,
      lastMessageAt: Date.now(),
      unreadCount: 0
    };

    // Create the dual messages (User note and counterpart response greeting)
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      connectionId,
      sender: 'user',
      text: echoText,
      createdAt: Date.now()
    };

    const peerGreetingMessage: ChatMessage = {
      id: `msg_peer_${Date.now() + 1}`,
      connectionId,
      sender: 'match',
      text: currentPeer.initialMessage,
      createdAt: Date.now() + 500
    };

    const updatedConnections = [newConnection, ...connections];
    const updatedMessages = [...messages, userMessage, peerGreetingMessage];

    saveState(updatedConnections, updatedMessages);
    setShowMatchSuccess(currentPeer);
    setEchoText('');
    
    // Remove match from the feed view pool until next cycle
    const nextList = feedProfiles.filter(p => p.id !== currentPeer.id);
    setFeedProfiles(nextList);
    if (currentFeedIndex >= nextList.length && nextList.length > 0) {
      setCurrentFeedIndex(0);
    }
  };

  // Chat message send
  const handleSendMessage = (e: React.FormEvent, connectionId: string) => {
    e.preventDefault();
    const inputEl = document.getElementById(`chat-input-${connectionId}`) as HTMLInputElement;
    if (!inputEl || !inputEl.value.trim()) return;

    const userText = inputEl.value;
    inputEl.value = '';

    const activeConn = connections.find(c => c.id === connectionId);
    if (!activeConn) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      connectionId,
      sender: 'user',
      text: userText,
      createdAt: Date.now()
    };

    const newMessages = [...messages, userMsg];
    const newConnections = connections.map(c => {
      if (c.id === connectionId) {
        return {
          ...c,
          lastMessageText: userText,
          lastMessageAt: Date.now()
        };
      }
      return c;
    });

    saveState(newConnections, newMessages);

    // Dynamic, simulated peer response with delay
    triggerSimulatedResponse(connectionId, activeConn.matchId, userText);
  };

  // Simulated peer chat response
  const triggerSimulatedResponse = (connectionId: string, matchId: string, userText: string) => {
    const peer = mockProfiles.find(p => p.id === matchId);
    if (!peer) return;

    setTypingConnectionId(connectionId);

    // Calculate response offset based on how many user messages sent so far
    const connectionMessages = messages.filter(m => m.connectionId === connectionId);
    const userMessageCount = connectionMessages.filter(m => m.sender === 'user').length;
    const answerIndex = userMessageCount % peer.followUpAnswers.length;
    const responseText = peer.followUpAnswers[answerIndex];

    setTimeout(() => {
      const peerMsg: ChatMessage = {
        id: `msg_peer_${Date.now()}`,
        connectionId,
        sender: 'match',
        text: responseText,
        createdAt: Date.now()
      };

      const updatedMsgs = [...localStorage.getItem('second_chance_messages') ? JSON.parse(localStorage.getItem('second_chance_messages')!) : messages, peerMsg];
      const updatedConns = (localStorage.getItem('second_chance_connections') ? JSON.parse(localStorage.getItem('second_chance_connections')!) : connections).map((c: Connection) => {
        if (c.id === connectionId) {
          return {
            ...c,
            lastMessageText: responseText,
            lastMessageAt: Date.now()
          };
        }
        return c;
      });

      saveState(updatedConns, updatedMsgs);
      setTypingConnectionId(null);
    }, 2800);
  };

  // Profile Edit Callback
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.story.trim() || !editForm.learnings.trim()) {
      alert('Crucial fields are missing contents');
      return;
    }
    const updated = {
      ...editForm,
      avatarSeed: editForm.name.charAt(0).toUpperCase()
    };
    onUpdateProfile(updated);
    setIsEditing(false);
    setEditSuccessMessage('Narrative refreshed successfully.');
    setTimeout(() => setEditSuccessMessage(''), 3000);
  };

  const currentProfileInFeed = feedProfiles[currentFeedIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      
      {/* Top Navigation Bar (Apple Minimalist) */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-8 h-8">
            <g transform="translate(136, 120) scale(0.48)">
              <path d="M 120 280 C 120 280 15 190 15 110 C 15 50 60 15 120 85 C 180 15 225 50 225 110 C 225 190 120 280 120 280 Z" fill="none" stroke="#111111" stroke-width="12" stroke-linecap="round"/>
              <path d="M 120 210 C 120 210 135 150 120 100 C 120 100 105 150 120 210" fill="none" stroke="#D97706" stroke-width="15" stroke-linecap="round"/>
            </g>
          </svg>
          <div>
            <h1 className="font-heading text-lg font-bold tracking-tight text-neutral-900 leading-none">
              Second Chance
            </h1>
            <span className="text-[10px] font-mono text-neutral-400">
              VULNERABILITY NETWORKS
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div id="tabs-main" className="flex items-center gap-1 bg-[#F2F2F7] p-1 rounded-2xl border border-[#E5E5EA]">
          {[
            { id: 'feed', label: 'Story Feed', icon: Compass },
            { id: 'chats', label: 'Echoes', icon: MessageSquare, badge: connections.length > 0 ? connections.length : undefined },
            { id: 'profile', label: 'My Narrative', icon: User }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                id={`tab-btn-${t.id}`}
                onClick={() => {
                  setActiveTab(t.id as any);
                  setSelectedConnectionId(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === t.id
                    ? 'bg-white text-black shadow-sm font-bold'
                    : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
                {t.badge && (
                  <span className="ml-1 bg-neutral-900 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* VIEW 1: STORY FEED */}
        {activeTab === 'feed' && (
          <div className="lg:col-span-12 max-w-2xl mx-auto w-full space-y-6">
            
            {showMatchSuccess ? (
              <motion.div 
                id="match-banner"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#E5E5EA] rounded-[2rem] p-10 text-center space-y-6 shadow-2xl shadow-black/5"
              >
                <div className="w-16 h-16 bg-[#1D1D1F] text-white font-heading font-semibold text-2xl flex items-center justify-center mx-auto rounded-2xl">
                  {showMatchSuccess.avatarSeed}
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold tracking-tight text-[#1D1D1F]">
                    Connection Echo Initiated
                  </h3>
                  <p className="text-sm text-[#8E8E93] mt-1 max-w-md mx-auto">
                    You shared a piece of your growth with {showMatchSuccess.name}. A reciprocal story channel has been created.
                  </p>
                </div>
                
                <div className="bg-[#F9F9FB] border border-[#E5E5EA] rounded-2xl p-6 text-left max-w-md mx-auto text-sm leading-relaxed">
                  <span className="font-semibold text-[#1D1D1F]">Your Letter started: </span>
                  <p className="text-[#8E8E93] italic mt-1 font-sans">
                    "{showMatchSuccess.initialMessage.slice(0, 110)}..."
                  </p>
                </div>

                <div className="flex gap-3 justify-center pt-3 max-w-sm mx-auto">
                  <button
                    id="btn-go-to-chats"
                    onClick={() => {
                      setShowMatchSuccess(null);
                      setActiveTab('chats');
                      const activeConn = connections.find(c => c.matchId === showMatchSuccess.id);
                      if (activeConn) {
                        setSelectedConnectionId(activeConn.id);
                      }
                    }}
                    className="flex-1 bg-black hover:bg-neutral-900 text-white text-xs font-bold py-3.5 px-4 rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.98]"
                  >
                    Go to Envelope
                  </button>
                  <button
                    id="btn-next-story"
                    onClick={() => setShowMatchSuccess(null)}
                    className="flex-1 border border-[#E5E5EA] hover:bg-[#F9F9FB] text-[#1D1D1F] text-xs font-semibold py-3.5 px-4 rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.98]"
                  >
                    View Another Story
                  </button>
                </div>
              </motion.div>
            ) : currentProfileInFeed ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProfileInFeed.id}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-[#E5E5EA] rounded-[1.8rem] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.04)]"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-[#E5E5EA] bg-[#FBFBFB] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-white border border-[#E5E5EA] text-[#1D1D1F] font-heading font-semibold rounded-2xl flex items-center justify-center shadow-xs">
                        {currentProfileInFeed.avatarSeed}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-[#1D1D1F] text-base leading-tight">
                          {currentProfileInFeed.name}, <span className="font-normal font-sans text-[#8E8E93]">{currentProfileInFeed.age}</span>
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] font-mono mt-0.5">
                          <span>{currentProfileInFeed.gender}</span>
                          <span>•</span>
                          <span>Seeking {currentProfileInFeed.lookingForGender}</span>
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Score Widget */}
                    <div className="text-right">
                      <span className="block text-[10px] font-mono text-[#8E8E93] tracking-wider">
                        ALIGNMENT
                      </span>
                      <span className="font-heading font-bold text-[#D97706] text-xl">
                        {calculateCompatibility(currentProfileInFeed)}%
                      </span>
                    </div>
                  </div>

                  {/* Narrative Body */}
                  <div className="p-6 sm:p-8 space-y-6">
                    
                    {/* Part 1: Breakup Narrative */}
                    <div id="narrative-breakup-group" className="space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-brand-accent flex items-center gap-1.5">
                        <CornerRightDown className="w-3 h-3" />
                        The Breakup Narrative
                      </span>
                      <p className="text-[15px] text-neutral-700 leading-relaxed font-sans font-light">
                        "{currentProfileInFeed.story}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                      {/* Reason */}
                      <div className="bg-[#FBFBFB] p-4 rounded-2xl border border-[#E5E5EA] space-y-1">
                        <span className="block text-[10px] uppercase font-mono text-[#8E8E93] tracking-wider">
                          Why It Severed
                        </span>
                        <span className="font-heading text-sm font-bold text-[#1D1D1F]">
                          {currentProfileInFeed.reason}
                        </span>
                      </div>
                      {/* Breakup Timeline */}
                      <div className="bg-[#FBFBFB] p-4 rounded-2xl border border-[#E5E5EA] space-y-1">
                        <span className="block text-[10px] uppercase font-mono text-[#8E8E93] tracking-wider">
                          Time Passed Since
                        </span>
                        <span className="font-heading text-sm font-bold text-[#1D1D1F]">
                          {currentProfileInFeed.duration}
                        </span>
                      </div>
                    </div>

                    {/* Part 2: Heart Learning */}
                    <div id="narrative-learn-group" className="pt-4 border-t border-[#E5E5EA] space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#1D1D1F] flex items-center gap-1.5 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        The Core Life Lesson Learned
                      </span>
                      <p className="text-[14px] text-neutral-600 leading-relaxed font-sans bg-[#FAF9FB] p-4 rounded-2xl border border-[#E5E5EA]">
                        {currentProfileInFeed.learnings}
                      </p>
                    </div>

                    {/* Intentions */}
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                      <span>Currently looking for:</span>
                      <span className="inline-block bg-[#F2F2F7] text-[#1D1D1F] px-3 py-1 rounded-full font-sans font-semibold text-[11px]">
                        {currentProfileInFeed.lookingFor}
                      </span>
                    </div>
                  </div>

                  {/* Match Connection Footer */}
                  <div className="p-6 bg-[#FBFBFB] border-t border-[#E5E5EA] space-y-4">
                    <form onSubmit={handleConnectEcho} className="space-y-3">
                      <label htmlFor="input-echo-response" className="block text-xs font-semibold text-[#8E8E93]">
                        Drop a meaningful response to {currentProfileInFeed.name}'s story...
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="input-echo-response"
                          type="text"
                          value={echoText}
                          onChange={e => setEchoText(e.target.value)}
                          placeholder="Your story resonated with me because..."
                          className="flex-1 bg-white border border-[#E5E5EA] hover:border-neutral-300 focus:border-black rounded-ex rounded-2xl px-4 py-3.5 text-xs text-neutral-800 shadow-xs"
                        />
                        <button
                          type="submit"
                          id="btn-submit-echo"
                          className="bg-black hover:bg-neutral-900 text-white font-semibold text-xs px-6 rounded-2xl flex items-center gap-1.5 cursor-pointer transition-all shrink-0 shadow-md shadow-black/5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Echo</span>
                        </button>
                      </div>
                    </form>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[11px] text-neutral-400">
                        {feedbackMsg ? (
                          <span className="text-brand-accent flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 inline" /> {feedbackMsg}
                          </span>
                        ) : (
                          "Connecting matches you directly. Selfies remain hidden."
                        )}
                      </span>
                      <button
                        id="btn-skip-profile"
                        onClick={handleSkip}
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Next Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto">
                <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
                <div>
                  <h3 className="font-heading text-lg font-semibold text-neutral-900">
                    No narrative remaining
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    You have read all open letters that match your standard filter preferences!
                  </p>
                </div>
                <button
                  id="btn-reload-stories"
                  onClick={() => {
                    setFeedProfiles(mockProfiles);
                    setCurrentFeedIndex(0);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium py-2 px-4 rounded-xl cursor-pointer"
                >
                  Reload All Stories
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CONVERSATIONS (CHATS) */}
        {activeTab === 'chats' && (
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[65vh]">
            
            {/* Left Queue: Envelopes */}
            <div className="md:col-span-4 bg-white border border-[#E5E5EA] rounded-[1.5rem] p-4 space-y-4 shadow-sm shadow-black/5">
              <h2 className="font-heading font-bold text-[#1D1D1F] text-xs px-1 border-b border-neutral-100 pb-3 flex items-center justify-between">
                <span>ECHO MAILBOX</span>
                <span className="text-[10px] font-mono text-[#8E8E93] font-semibold">
                  {connections.length} ENVELOPES
                </span>
              </h2>

              <div className="space-y-2 overflow-y-auto max-h-[550px] hide-scrollbar pr-1 pt-1">
                {connections.length > 0 ? (
                  connections.map(conn => {
                    const profile = mockProfiles.find(p => p.id === conn.matchId);
                    const isSelected = selectedConnectionId === conn.id;
                    const isTyping = typingConnectionId === conn.id;

                    if (!profile) return null;

                    return (
                      <button
                        key={conn.id}
                        id={`chat-item-${conn.id}`}
                        onClick={() => setSelectedConnectionId(conn.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-black border-black text-white shadow-md'
                            : 'bg-[#F9F9FB] border-[#E5E5EA] hover:bg-white text-neutral-900 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl font-heading text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-white/10 text-white' : 'bg-white border border-[#E5E5EA] text-neutral-900'
                        }`}>
                          {profile.avatarSeed}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-heading text-xs font-bold leading-none">
                              {profile.name}
                            </span>
                            <span className={`text-[9px] font-mono ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                              {new Date(conn.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <p className={`text-[11px] truncate mt-1.5 ${isSelected ? 'text-neutral-300' : 'text-[#8E8E93]'}`}>
                            {isTyping ? (
                              <span className="italic text-brand-accent animate-pulse font-semibold">Typing reply...</span>
                            ) : (
                              conn.lastMessageText
                            )}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-12 px-4 space-y-4 border border-dashed border-[#E5E5EA] rounded-2xl">
                    <p className="text-xs text-[#8E8E93]">
                      Your letterbox is clean and empty. Send some "Echoes" on the Story Feed.
                    </p>
                    <button
                      id="btn-goto-feed"
                      onClick={() => setActiveTab('feed')}
                      className="bg-black hover:bg-neutral-900 text-white text-[11px] font-bold py-2 px-4 rounded-xl cursor-pointer shadow-md shadow-black/5"
                    >
                      Discover Stories
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Message Thread */}
            <div className="md:col-span-8 bg-white border border-[#E5E5EA] rounded-[1.5rem] overflow-hidden flex flex-col justify-between min-h-[500px] shadow-sm shadow-black/5">
              {selectedConnectionId ? (
                (() => {
                  const conn = connections.find(c => c.id === selectedConnectionId);
                  const peer = conn ? mockProfiles.find(p => p.id === conn.matchId) : null;
                  const filteredMsgs = messages.filter(m => m.connectionId === selectedConnectionId);
                  
                  if (!conn || !peer) return null;

                  return (
                    <>
                      {/* Active Chat Header */}
                      <div className="p-4 border-b border-[#E5E5EA] bg-[#FBFBFB] flex justify-between items-center px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E5EA] font-heading text-xs font-bold flex items-center justify-center text-neutral-800 shadow-xs">
                            {peer.avatarSeed}
                          </div>
                          <div>
                            <h3 className="font-heading text-xs font-bold text-neutral-900">
                              Letter exchange with {peer.name}
                            </h3>
                            <span className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider font-semibold">
                              Why they parted: {peer.reason}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-neutral-500 bg-white border border-[#E5E5EA] p-1.5 px-3 rounded-full font-semibold">
                            Seeking: {peer.lookingFor}
                          </span>
                        </div>
                      </div>

                      {/* Active Chat Body */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[350px] hide-scrollbar bg-[#F9F9FB]">
                        {filteredMsgs.map(m => {
                          const isUser = m.sender === 'user';
                          return (
                            <div
                                key={m.id}
                                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                                isUser
                                  ? 'bg-black text-white rounded-tr-none shadow-sm'
                                  : 'bg-white border border-[#E5E5EA] text-neutral-800 rounded-tl-none font-sans shadow-xs'
                              }`}>
                                <p>{m.text}</p>
                                <span className="block text-[9px] font-mono mt-1.5 opacity-50 text-right">
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Simulated Typing State */}
                        {typingConnectionId === selectedConnectionId && (
                          <div className="flex justify-start">
                            <div className="bg-white border border-[#E5E5EA] text-neutral-500 rounded-2xl rounded-tl-none p-4 text-xs flex items-center gap-2 shadow-xs">
                              <span className="italic font-mono text-[10px] text-[#8E8E93]">{peer.name} is reading and compiling response...</span>
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-200"></span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Active Chat Input Footer */}
                      <div className="p-4 border-t border-[#E5E5EA] bg-[#FBFBFB]">
                        <form onSubmit={(e) => handleSendMessage(e, conn.id)}>
                          <div className="flex gap-2">
                            <input
                              id={`chat-input-${conn.id}`}
                              type="text"
                              autoComplete="off"
                              placeholder={`Draft a deep note back to {peer.name}...`}
                              className="flex-1 bg-white border border-[#E5E5EA] hover:border-neutral-300 focus:border-black rounded-2xl px-4 py-3.5 text-xs text-neutral-800 shadow-xs"
                            />
                            <button
                              type="submit"
                              id={`btn-chat-send-${conn.id}`}
                              className="bg-black hover:bg-neutral-9050 text-white px-5 rounded-2xl cursor-pointer flex items-center justify-center transition-all shrink-0 shadow-md shadow-black/5 active:scale-[0.98]"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-neutral-50/20">
                  <div className="w-12 h-12 rounded-full border border-neutral-200 border-dashed flex items-center justify-center text-neutral-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-neutral-700">
                      No envelope chosen
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                      Select a recipient from the left Echo Mailbox queue to exchange relationship reflections.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 3: PROFILE (MY NARRATIVE) */}
        {activeTab === 'profile' && (
          <div className="lg:col-span-12 max-w-2xl mx-auto w-full space-y-6">
            
            {editSuccessMessage && (
              <div id="toast-success" className="bg-neutral-900 text-white text-xs py-3 px-4 rounded-xl flex items-center justify-between shadow-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-brand-accent animate-pulse" />
                  <span>{editSuccessMessage}</span>
                </div>
              </div>
            )}

            {!isEditing ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-[#E5E5EA] rounded-[1.8rem] overflow-hidden shadow-sm"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#E5E5EA] bg-[#FBFBFB] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black text-white font-heading font-bold rounded-2xl flex items-center justify-center text-lg">
                      {userProfile.avatarSeed}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-[#1D1D1F] leading-tight">
                        {userProfile.name}, <span className="font-normal font-sans text-[#8E8E93]">{userProfile.age}</span>
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] font-mono mt-0.5">
                        <span>{userProfile.gender}</span>
                        <span>•</span>
                        <span>Open to: {userProfile.lookingForGender}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    id="btn-edit-narrative"
                    onClick={() => {
                      setEditForm({ ...userProfile });
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1.5 border border-[#E5E5EA] hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Edit Narrative</span>
                  </button>
                </div>

                {/* Narrative Details */}
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Part 1: Breakup Narrative */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-brand-accent flex items-center gap-1.5ClassName font-bold">
                      <CornerRightDown className="w-3.5 h-3.5 text-neutral-900" />
                      Your Breakup Narrative
                    </span>
                    <p className="text-sm text-neutral-700 leading-relaxed font-light">
                      "{userProfile.story}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FBFBFB] p-4 rounded-2xl border border-[#E5E5EA]">
                      <span className="block text-[10px] uppercase font-mono text-[#8E8E93] tracking-wider font-semibold mb-0.5">
                        Cause for Dissolution
                      </span>
                      <span className="font-heading font-bold text-neutral-800 text-sm">
                        {userProfile.reason}
                      </span>
                    </div>

                    <div className="bg-[#FBFBFB] p-4 rounded-2xl border border-[#E5E5EA]">
                      <span className="block text-[10px] uppercase font-mono text-[#8E8E93] tracking-wider font-semibold mb-0.5">
                        Breakup Duration
                      </span>
                      <span className="font-heading font-bold text-neutral-800 text-sm">
                        {userProfile.duration}
                      </span>
                    </div>
                  </div>

                  {/* Part 2: Heart Learning */}
                  <div className="space-y-2 pt-4 border-t border-[#E5E5EA]">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#1D1D1F] flex items-center gap-1.5 font-sans font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                      Core Life lesson Acquired
                    </span>
                    <p className="text-sm text-neutral-600 leading-relaxed font-light bg-[#FAF9FB] p-4 rounded-2xl border border-[#E5E5EA]">
                      {userProfile.learnings}
                    </p>
                  </div>

                  {/* Intentions */}
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
                    <span>What you seek now:</span>
                    <span className="bg-[#F2F2F7] text-[#1D1D1F] px-3 py-1 rounded-full font-sans font-semibold text-[11px]">
                      {userProfile.lookingFor}
                    </span>
                  </div>

                </div>

                {/* Reset Section for convenience review */}
                <div className="p-6 bg-[#FBFBFB] border-t border-[#E5E5EA] flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-700 font-sans">
                      Restart Onboarding Flow
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Clears local profile cookies and resets matching feed variables.
                    </p>
                  </div>
                  <button
                    id="btn-hard-reset"
                    onClick={() => {
                      if (confirm('Clear local profile and messages? This action is irreversible.')) {
                        onReset();
                      }
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-colors"
                  >
                    Reset App State
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                onSubmit={handleSaveProfile}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-[#E5E5EA] rounded-[1.8rem] p-6 sm:p-8 space-y-6 shadow-sm"
              >
                <div>
                  <h3 className="font-heading text-lg font-bold text-neutral-900">
                    Edit Your Emotional Profile
                  </h3>
                  <p className="text-xs text-[#8E8E93] mt-0.5 font-semibold">
                    Revise details or refine the narrative of your learnings. All calculations adapt immediately.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Name  */}
                  <div>
                    <label htmlFor="edit-name" className="block text-xs font-semibold text-neutral-600 mb-1.5 font-sans">Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-[#F9F9FB] border border-[#E5E5EA] hover:border-neutral-300 focus:border-black rounded-2xl px-4 py-3.5 text-xs text-neutral-800"
                    />
                  </div>

                  {/* Story */}
                  <div>
                    <label htmlFor="edit-story" className="block text-xs font-semibold text-neutral-600 mb-1.5 font-sans">Breakup Story</label>
                    <textarea
                      id="edit-story"
                      rows={6}
                      value={editForm.story}
                      onChange={e => setEditForm({ ...editForm, story: e.target.value })}
                      className="w-full bg-[#F9F9FB] border border-[#E5E5EA] hover:border-neutral-300 focus:border-black rounded-2xl p-4 text-xs text-neutral-800 leading-relaxed resize-none"
                    />
                  </div>

                  {/* Reason & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-reason" className="block text-xs font-semibold text-neutral-600 mb-1.5 font-sans">Rupture Cause</label>
                      <select
                        id="edit-reason"
                        value={editForm.reason}
                        onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                        className="w-full bg-[#F9F9FB] border border-[#E5E5EA] focus:border-black rounded-2xl px-4 py-3.5 text-xs text-neutral-800 appearance-none font-medium"
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

                    <div>
                      <label htmlFor="edit-duration" className="block text-xs font-semibold text-neutral-600 mb-1.5 font-sans">Breakup Duration</label>
                      <select
                        id="edit-duration"
                        value={editForm.duration}
                        onChange={e => setEditForm({ ...editForm, duration: e.target.value })}
                        className="w-full bg-[#F9F9FB] border border-[#E5E5EA] focus:border-black rounded-2xl px-4 py-3.5 text-xs text-neutral-800 appearance-none font-medium"
                      >
                        <option value="Less than 1 month">Less than 1 month</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6-12 months">6-12 months</option>
                        <option value="1+ years">1+ years</option>
                      </select>
                    </div>
                  </div>

                  {/* Learnings */}
                  <div>
                    <label htmlFor="edit-learnings" className="block text-xs font-semibold text-neutral-600 mb-1.5 font-sans">Valuable Learnings</label>
                    <textarea
                      id="edit-learnings"
                      rows={3}
                      value={editForm.learnings}
                      onChange={e => setEditForm({ ...editForm, learnings: e.target.value })}
                      className="w-full bg-[#F9F9FB] border border-[#E5E5EA] hover:border-neutral-300 focus:border-black rounded-2xl p-4 text-xs text-neutral-800 leading-relaxed resize-none"
                    />
                  </div>

                  {/* Looking For */}
                  <div>
                    <label htmlFor="edit-looking-for" className="block text-xs font-semibold text-neutral-600 mb-1.5 font-sans">What are you looking for now?</label>
                    <select
                      id="edit-looking-for"
                      value={editForm.lookingFor}
                      onChange={e => setEditForm({ ...editForm, lookingFor: e.target.value })}
                      className="w-full bg-[#F9F9FB] border border-[#E5E5EA] focus:border-black rounded-2xl px-4 py-3.5 text-xs text-neutral-800 appearance-none font-medium"
                    >
                      <option value="Serious Relationship">Serious Relationship</option>
                      <option value="Casual Dating">Casual Dating</option>
                      <option value="Friendship">Friendship</option>
                      <option value="Not Sure Yet">Not Sure Yet</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-[#E5E5EA]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-[#E5E5EA] hover:bg-[#F9F9FB] text-neutral-700 text-xs font-bold py-3 px-5 rounded-2xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-edit-save"
                    className="bg-black hover:bg-[#1D1D1F] text-white text-xs font-bold py-3 px-5 rounded-2xl cursor-pointer transition-colors shadow-md shadow-black/5"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
