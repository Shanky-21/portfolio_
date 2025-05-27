"use client";

import React, { useMemo } from 'react';
import { StudySession } from './LearningHeatmap';
import { 
  FaTrophy, FaMedal, FaFire, FaStar, FaCrown, FaRocket, 
  FaLightbulb, FaCalendarCheck, FaClock, FaChartLine,
  FaGem, FaAward, FaThumbsUp, FaHeart, FaBolt,
  FaGraduationCap, FaCode, FaArchway, FaLayerGroup, FaCog
} from 'react-icons/fa';

interface GamificationSystemProps {
  data: StudySession[];
}

// Define achievement types
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirement: (data: StudySession[]) => boolean;
  points: number;
  category: 'consistency' | 'milestone' | 'mastery' | 'special';
}

// Define level system
interface Level {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: React.ReactNode;
  benefits: string[];
}

const LEVELS: Level[] = [
  { level: 1, title: "Beginner", minPoints: 0, maxPoints: 99, color: "gray", icon: <FaGraduationCap />, benefits: ["Starting your journey"] },
  { level: 2, title: "Student", minPoints: 100, maxPoints: 299, color: "blue", icon: <FaLightbulb />, benefits: ["Basic progress tracking"] },
  { level: 3, title: "Learner", minPoints: 300, maxPoints: 599, color: "green", icon: <FaChartLine />, benefits: ["Advanced analytics"] },
  { level: 4, title: "Scholar", minPoints: 600, maxPoints: 999, color: "purple", icon: <FaGem />, benefits: ["Streak bonuses"] },
  { level: 5, title: "Expert", minPoints: 1000, maxPoints: 1999, color: "orange", icon: <FaAward />, benefits: ["Expert insights"] },
  { level: 6, title: "Master", minPoints: 2000, maxPoints: 3999, color: "red", icon: <FaCrown />, benefits: ["Master level features"] },
  { level: 7, title: "Grandmaster", minPoints: 4000, maxPoints: 9999, color: "yellow", icon: <FaTrophy />, benefits: ["Grandmaster status"] },
  { level: 8, title: "Legend", minPoints: 10000, maxPoints: Infinity, color: "rainbow", icon: <FaRocket />, benefits: ["Legendary achievements"] }
];

const ACHIEVEMENTS: Achievement[] = [
  // Consistency Achievements
  {
    id: 'first_session',
    title: 'First Steps',
    description: 'Complete your first study session',
    icon: <FaThumbsUp className="text-green-400" />,
    color: 'green',
    requirement: (data) => data.length >= 1,
    points: 10,
    category: 'milestone'
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Study for 7 consecutive days',
    icon: <FaFire className="text-orange-400" />,
    color: 'orange',
    requirement: (data) => {
      const dates = [...new Set(data.map(s => s.date))].sort();
      let maxStreak = 0;
      let currentStreak = 1;
      
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      return maxStreak >= 7;
    },
    points: 100,
    category: 'consistency'
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Study for 30 consecutive days',
    icon: <FaCalendarCheck className="text-blue-400" />,
    color: 'blue',
    requirement: (data) => {
      const dates = [...new Set(data.map(s => s.date))].sort();
      let maxStreak = 0;
      let currentStreak = 1;
      
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      return maxStreak >= 30;
    },
    points: 500,
    category: 'consistency'
  },
  // Milestone Achievements
  {
    id: 'hundred_hours',
    title: 'Century Club',
    description: 'Study for 100 total hours',
    icon: <FaClock className="text-purple-400" />,
    color: 'purple',
    requirement: (data) => {
      const totalMinutes = data.reduce((sum, session) => sum + session.minutes, 0);
      return totalMinutes >= 6000; // 100 hours
    },
    points: 200,
    category: 'milestone'
  },
  {
    id: 'five_hundred_hours',
    title: 'Elite Learner',
    description: 'Study for 500 total hours',
    icon: <FaMedal className="text-yellow-400" />,
    color: 'yellow',
    requirement: (data) => {
      const totalMinutes = data.reduce((sum, session) => sum + session.minutes, 0);
      return totalMinutes >= 30000; // 500 hours
    },
    points: 1000,
    category: 'milestone'
  },
  // Subject Mastery Achievements
  {
    id: 'dsa_master',
    title: 'DSA Master',
    description: 'Study DSA for 100 hours',
    icon: <FaCode className="text-green-400" />,
    color: 'green',
    requirement: (data) => {
      const dsaMinutes = data.filter(s => s.topic === 'DSA').reduce((sum, s) => sum + s.minutes, 0);
      return dsaMinutes >= 6000; // 100 hours
    },
    points: 300,
    category: 'mastery'
  },
  {
    id: 'system_design_master',
    title: 'System Design Expert',
    description: 'Study System Design for 50 hours',
    icon: <FaArchway className="text-blue-400" />,
    color: 'blue',
    requirement: (data) => {
      const sdMinutes = data.filter(s => s.topic === 'System Design').reduce((sum, s) => sum + s.minutes, 0);
      return sdMinutes >= 3000; // 50 hours
    },
    points: 250,
    category: 'mastery'
  },
  {
    id: 'scala_master',
    title: 'Scala Specialist',
    description: 'Study Scala for 50 hours',
    icon: <FaLayerGroup className="text-red-400" />,
    color: 'red',
    requirement: (data) => {
      const scalaMinutes = data.filter(s => s.topic === 'Scala').reduce((sum, s) => sum + s.minutes, 0);
      return scalaMinutes >= 3000; // 50 hours
    },
    points: 250,
    category: 'mastery'
  },
  {
    id: 'akka_master',
    title: 'Akka Architect',
    description: 'Study Akka for 50 hours',
    icon: <FaCog className="text-purple-400" />,
    color: 'purple',
    requirement: (data) => {
      const akkaMinutes = data.filter(s => s.topic === 'Akka').reduce((sum, s) => sum + s.minutes, 0);
      return akkaMinutes >= 3000; // 50 hours
    },
    points: 250,
    category: 'mastery'
  },
  // Special Achievements
  {
    id: 'marathon_session',
    title: 'Marathon Runner',
    description: 'Complete a 6+ hour study session',
    icon: <FaBolt className="text-yellow-400" />,
    color: 'yellow',
    requirement: (data) => data.some(session => session.minutes >= 360),
    points: 150,
    category: 'special'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Study before 6 AM',
    icon: <FaHeart className="text-pink-400" />,
    color: 'pink',
    requirement: (data) => {
      return data.some(session => {
        if (!session.startTime) return false;
        const hour = parseInt(session.startTime.split(':')[0]);
        return hour < 6;
      });
    },
    points: 75,
    category: 'special'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Study after 10 PM',
    icon: <FaStar className="text-indigo-400" />,
    color: 'indigo',
    requirement: (data) => {
      return data.some(session => {
        if (!session.startTime) return false;
        const hour = parseInt(session.startTime.split(':')[0]);
        return hour >= 22;
      });
    },
    points: 75,
    category: 'special'
  }
];

const GamificationSystem: React.FC<GamificationSystemProps> = ({ data }) => {
  // Calculate user stats
  const userStats = useMemo(() => {
    const unlockedAchievements = ACHIEVEMENTS.filter(achievement => 
      achievement.requirement(data)
    );
    
    const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
    
    const currentLevel = LEVELS.find(level => 
      totalPoints >= level.minPoints && totalPoints <= level.maxPoints
    ) || LEVELS[0];
    
    const nextLevel = LEVELS.find(level => level.level === currentLevel.level + 1);
    
    const progressToNextLevel = nextLevel 
      ? ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
      : 100;

    // Calculate streaks
    const dates = [...new Set(data.map(s => s.date))].sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    
    // Calculate current streak from today backwards
    const today = new Date().toISOString().split('T')[0];
    const sortedDatesDesc = dates.reverse();
    if (sortedDatesDesc[0] === today) {
      currentStreak = 1;
      for (let i = 1; i < sortedDatesDesc.length; i++) {
        const prevDate = new Date(sortedDatesDesc[i - 1]);
        const currDate = new Date(sortedDatesDesc[i]);
        const diffTime = prevDate.getTime() - currDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      totalPoints,
      currentLevel,
      nextLevel,
      progressToNextLevel,
      unlockedAchievements,
      currentStreak,
      maxStreak,
      totalHours: Math.floor(data.reduce((sum, s) => sum + s.minutes, 0) / 60),
      totalSessions: data.length
    };
  }, [data]);

  const getColorClasses = (color: string) => {
    const colors = {
      gray: { bg: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500' },
      blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
      green: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500' },
      red: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' },
      yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' },
      rainbow: { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400', border: 'border-purple-500' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const categoryIcons = {
    consistency: <FaFire className="text-orange-400" />,
    milestone: <FaTrophy className="text-yellow-400" />,
    mastery: <FaCrown className="text-purple-400" />,
    special: <FaStar className="text-blue-400" />
  };

  return (
    <div className="space-y-6">
      {/* Level and Progress */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
              userStats.currentLevel.color === 'rainbow' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : `bg-${userStats.currentLevel.color}-500`
            }`}>
              {userStats.currentLevel.icon}
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-white">
                Level {userStats.currentLevel.level}: {userStats.currentLevel.title}
              </h2>
              <p className="text-gray-300">{userStats.totalPoints} XP</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#00A3FF]">{userStats.totalHours}</div>
              <div className="text-sm text-gray-400">Hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{userStats.currentStreak}</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{userStats.unlockedAchievements.length}</div>
              <div className="text-sm text-gray-400">Achievements</div>
            </div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {userStats.nextLevel && (
          <div className="bg-[#101935] p-4 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Progress to {userStats.nextLevel.title}</span>
              <span className="text-gray-400">
                {userStats.totalPoints} / {userStats.nextLevel.minPoints} XP
              </span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]" 
                style={{ width: `${userStats.progressToNextLevel}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {userStats.nextLevel.minPoints - userStats.totalPoints} XP to next level
            </div>
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <FaTrophy className="mr-2 text-yellow-400" />
          Recent Achievements
        </h3>
        
        {userStats.unlockedAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userStats.unlockedAchievements.slice(-6).map((achievement) => (
              <div key={achievement.id} className="bg-[#101935] p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A2A50] flex items-center justify-center">
                    {achievement.icon}
                  </div>
                  <div className="ml-3">
                    <div className="text-white font-medium">{achievement.title}</div>
                    <div className="text-xs text-gray-400">+{achievement.points} XP</div>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{achievement.description}</p>
                <div className="mt-2 flex items-center">
                  {categoryIcons[achievement.category]}
                  <span className="ml-1 text-xs text-gray-400 capitalize">{achievement.category}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaTrophy className="mx-auto text-4xl text-gray-600 mb-4" />
            <p className="text-gray-400">Start studying to unlock your first achievement!</p>
          </div>
        )}
      </div>

      {/* All Achievements */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <FaMedal className="mr-2 text-purple-400" />
          Achievement Gallery
        </h3>
        
        <div className="space-y-6">
          {Object.entries(
            ACHIEVEMENTS.reduce((acc, achievement) => {
              if (!acc[achievement.category]) acc[achievement.category] = [];
              acc[achievement.category].push(achievement);
              return acc;
            }, {} as Record<string, Achievement[]>)
          ).map(([category, achievements]) => (
            <div key={category}>
              <h4 className="text-lg font-medium text-white mb-4 flex items-center capitalize">
                {categoryIcons[category as keyof typeof categoryIcons]}
                <span className="ml-2">{category} Achievements</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                  const isUnlocked = userStats.unlockedAchievements.some(a => a.id === achievement.id);
                  
                  return (
                    <div 
                      key={achievement.id} 
                      className={`p-4 rounded-lg border transition-all ${
                        isUnlocked 
                          ? 'bg-[#101935] border-gray-600 shadow-lg' 
                          : 'bg-[#0A0F1C] border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isUnlocked ? 'bg-[#1A2A50]' : 'bg-gray-800'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="ml-3">
                          <div className={`font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                            {achievement.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {isUnlocked ? `+${achievement.points} XP` : `${achievement.points} XP`}
                          </div>
                        </div>
                        {isUnlocked && (
                          <div className="ml-auto">
                            <FaTrophy className="text-yellow-400" />
                          </div>
                        )}
                      </div>
                      <p className={`text-sm ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <FaChartLine className="mr-2 text-green-400" />
          Your Learning Journey
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00A3FF] mb-2">{userStats.totalSessions}</div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{userStats.totalHours}</div>
            <div className="text-sm text-gray-400">Hours Studied</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">{userStats.maxStreak}</div>
            <div className="text-sm text-gray-400">Best Streak</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{userStats.totalPoints}</div>
            <div className="text-sm text-gray-400">Total XP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationSystem; 