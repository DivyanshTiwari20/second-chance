export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  lookingForGender: string;
  story: string; // Question 1
  reason: string; // Question 2
  learnings: string; // Question 3
  lookingFor: string; // Question 4
  duration: string; // Question 5
  avatarSeed: string; // To generate unique elegant minimal avatar/initials
  onboarded: boolean;
}

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  lookingForGender: string;
  story: string;
  reason: string;
  learnings: string;
  lookingFor: string;
  duration: string;
  avatarSeed: string;
  compatibilityDetails: string;
  initialMessage: string;
  followUpAnswers: string[]; // Mock list of responses for simulated chat conversation
}

export interface ChatMessage {
  id: string;
  connectionId: string;
  sender: 'user' | 'match';
  text: string;
  createdAt: number;
}

export interface Connection {
  id: string;
  matchId: string;
  createdAt: number;
  lastMessageText: string;
  lastMessageAt: number;
  unreadCount: number;
}
