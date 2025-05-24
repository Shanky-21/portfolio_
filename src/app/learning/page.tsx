"use client";

import React, { useState, useMemo } from 'react';
import LearningHeatmap, { StudySession } from '@/components/LearningHeatmap';
import LearningTrend from '@/components/LearningTrend';
import TopicFilter from '@/components/TopicFilter';
import YearFilter from '@/components/YearFilter';
import learningData from '@/data/learning-data.json';
import { FaChartLine, FaCalendarAlt, FaClock, FaLayerGroup, FaAward, FaExternalLinkAlt, FaTimes, FaTrophy, FaUserGraduate, FaMedal, FaStar, FaCalendarCheck, FaChartBar, FaCrown, FaFireAlt } from 'react-icons/fa';

// Define daily/weekly/monthly goals
const DAILY_GOAL = 300; // minutes (5 hours per day)
const WEEKLY_GOAL = 2100; // minutes (35 hours per week)
const MONTHLY_GOAL = 9000; // minutes (150 hours per month)

// Utility function to format time in hours and minutes
const formatTimeDisplay = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} min`;
};

const LearningPage: React.FC = () => {
  // Get current year for default selection
  const currentYear = new Date().getFullYear().toString();
  
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  
  const typedLearningData = learningData as StudySession[];

  // Filter data by year first
  const yearFilteredData = useMemo(() => {
    if (selectedYear === "All") {
      return typedLearningData;
    }
    return typedLearningData.filter(session => session.date.startsWith(selectedYear));
  }, [typedLearningData, selectedYear]);
  
  // Then filter by topic
  const filteredData = useMemo(() => {
    if (selectedTopic === "All") {
      return yearFilteredData;
    }
    return yearFilteredData.filter(session => session.topic === selectedTopic);
  }, [yearFilteredData, selectedTopic]);

  // Calculate statistics
  const totalMinutes = useMemo(() => 
    filteredData.reduce((sum: number, session: StudySession) => sum + session.minutes, 0),
    [filteredData]
  );
  
  const totalSessions = filteredData.length;
  
  const uniqueTopics = useMemo(() => 
    new Set(filteredData.map((session: StudySession) => session.topic)).size,
    [filteredData]
  );
  
  // Calculate average minutes per session
  const avgMinutesPerSession = totalSessions > 0 
    ? Math.round(totalMinutes / totalSessions) 
    : 0;

  // Find most studied topic
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((session) => {
      counts[session.topic] = (counts[session.topic] || 0) + session.minutes;
    });
    return counts;
  }, [filteredData]);

  const mostStudiedTopic = useMemo(() => {
    if (Object.keys(topicCounts).length === 0) return { topic: 'None', minutes: 0 };
    
    return Object.entries(topicCounts).reduce(
      (max, [topic, minutes]) => minutes > max.minutes ? { topic, minutes } : max,
      { topic: '', minutes: 0 }
    );
  }, [topicCounts]);
  
  // Get topic breakdown for the chart
  const topicBreakdown = useMemo(() => {
    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, minutes]) => ({ topic, minutes }));
  }, [topicCounts]);
  
  // Get only top topics for compact display
  const topTopics = useMemo(() => {
    return topicBreakdown.slice(0, 5);
  }, [topicBreakdown]);
  
  // Check if we have more topics than we're displaying
  const hasMoreTopics = topicBreakdown.length > topTopics.length;

  const openTopicsModal = () => {
    setShowTopicsModal(true);
    // Prevent scrolling of the background when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeTopicsModal = () => {
    setShowTopicsModal(false);
    // Restore scrolling
    document.body.style.overflow = 'auto';
  };

  // Calculate time periods for achievements
  const timePeriods = useMemo(() => {
    // Get current date for calculating last periods
    const currentDate = new Date();
    
    // For topic-filtered sessions, use the filtered data based on the selected topic
    const topicFilteredData = selectedTopic === "All" 
      ? typedLearningData 
      : typedLearningData.filter(session => session.topic === selectedTopic);
    
    // -------------------------
    // WEEKLY PROGRESS CALCULATION
    // -------------------------
    // Get the most recent 4 full weeks (Sun-Sat) plus current week if incomplete
    
    // Find the most recent Saturday
    const mostRecentSaturday = new Date(currentDate);
    // If today is Saturday (6), keep today's date, otherwise go back to the previous Saturday
    const daysToLastSaturday = currentDate.getDay() === 6 ? 0 : (currentDate.getDay() + 1);
    mostRecentSaturday.setDate(currentDate.getDate() - daysToLastSaturday);
    mostRecentSaturday.setHours(23, 59, 59, 999); // End of day
    
    // Determine if we're showing 4 or 5 weeks based on whether today is Saturday
    const isCurrentWeekComplete = currentDate.getDay() === 6;
    const weeksToShow = isCurrentWeekComplete ? 4 : 5;
    
    // Find the Sunday for the start of our period (4 or 5 weeks ago)
    const startSunday = new Date(mostRecentSaturday);
    startSunday.setDate(mostRecentSaturday.getDate() - ((weeksToShow - 1) * 7) + 1);
    startSunday.setHours(0, 0, 0, 0); // Start of day
    
    // Define interfaces for our data structures
    interface WeekPeriod {
      start: Date;
      end: Date;
      key: string;
      minutes: number;
      isCurrentWeek: boolean;
    }
    
    interface MonthPeriod {
      key: string;
      month: number;
      year: number;
      name: string;
      minutes: number;
    }
    
    // Generate the week periods (4 completed weeks + current incomplete week if needed)
    const weekPeriods: WeekPeriod[] = [];
    
    for (let i = 0; i < weeksToShow; i++) {
      const weekStartSunday = new Date(startSunday);
      weekStartSunday.setDate(startSunday.getDate() + (i * 7));
      weekStartSunday.setHours(0, 0, 0, 0); // Start of day
      
      const weekEndSaturday = new Date(weekStartSunday);
      weekEndSaturday.setDate(weekStartSunday.getDate() + 6);
      weekEndSaturday.setHours(23, 59, 59, 999); // End of day
      
      // If this is the last week and it's incomplete, set the end date to today instead of Saturday
      if (i === weeksToShow - 1 && !isCurrentWeekComplete) {
        // Make sure the end date includes all of today
        const todayEnd = new Date(currentDate);
        todayEnd.setHours(23, 59, 59, 999);
        weekEndSaturday.setTime(todayEnd.getTime());
      }
      
      weekPeriods.push({
        start: new Date(weekStartSunday),
        end: new Date(weekEndSaturday),
        key: weekStartSunday.toISOString().substring(0, 10),
        minutes: 0,
        isCurrentWeek: i === weeksToShow - 1 && !isCurrentWeekComplete
      });
    }
    
    // -------------------------
    // MONTHLY PROGRESS CALCULATION
    // -------------------------
    // Get the current month and the two previous months
    
    const monthPeriods: MonthPeriod[] = [];
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = monthDate.toISOString().substring(0, 7); // YYYY-MM
      
      monthPeriods.push({
        key: monthKey,
        month: monthDate.getMonth() + 1, // 1-12
        year: monthDate.getFullYear(),
        name: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        minutes: 0
      });
    }
    
    // Calculate minutes for each period from the data
    topicFilteredData.forEach(session => {
      const sessionDate = new Date(session.date);
      // Set to noon to avoid any timezone issues
      sessionDate.setHours(12, 0, 0, 0);
      
      // Check if session falls within any of our week periods
      for (const weekPeriod of weekPeriods) {
        const weekStart = new Date(weekPeriod.start);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekPeriod.end);
        weekEnd.setHours(23, 59, 59, 999);
        
        if (sessionDate >= weekStart && sessionDate <= weekEnd) {
          weekPeriod.minutes += session.minutes;
        }
      }
      
      // Check if session falls within any of our month periods
      const sessionMonth = sessionDate.getMonth() + 1; // 1-12
      const sessionYear = sessionDate.getFullYear();
      
      for (const monthPeriod of monthPeriods) {
        if (sessionMonth === monthPeriod.month && sessionYear === monthPeriod.year) {
          monthPeriod.minutes += session.minutes;
        }
      }
    });
    
    // Sort months in reverse chronological order (newest first)
    monthPeriods.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    // Convert to the expected format
    return {
      weeks: weekPeriods.map(week => ({
        period: week.key,
        minutes: week.minutes,
        goalMet: week.minutes >= WEEKLY_GOAL,
        start: week.start,
        end: week.end,
        isCurrentWeek: week.isCurrentWeek
      })),
      months: monthPeriods.map(month => ({
        period: month.key,
        minutes: month.minutes,
        goalMet: month.minutes >= MONTHLY_GOAL,
        name: month.name
      })),
      isCurrentWeekComplete
    };
  }, [typedLearningData, selectedTopic]);
  
  // Achievements based on learning statistics and goals
  const achievements = useMemo(() => {
    // Calculate goal metrics
    const weeklyGoalsCount = timePeriods.weeks.filter(week => week.goalMet).length;
    const monthlyGoalsCount = timePeriods.months.filter(month => month.goalMet).length;
    
    // Consecutive weeks with met goals
    let maxConsecutiveWeeks = 0;
    let currentConsecutiveWeeks = 0;
    
    timePeriods.weeks.forEach(week => {
      if (week.goalMet) {
        currentConsecutiveWeeks++;
        maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, currentConsecutiveWeeks);
      } else {
        currentConsecutiveWeeks = 0;
      }
    });
    
    // Define possible achievements and their requirements
    const possibleAchievements = [
      {
        id: 'weekly-starter',
        title: 'Weekly Goal Starter',
        description: `Met your first weekly learning goal of ${Math.floor(WEEKLY_GOAL / 60)} hours`,
        icon: <FaCalendarCheck className="text-blue-400" />,
        unlocked: weeklyGoalsCount >= 1
      },
      {
        id: 'weekly-consistent',
        title: 'Weekly Warrior',
        description: 'Met your weekly goal at least 4 times',
        icon: <FaChartBar className="text-green-400" />,
        unlocked: weeklyGoalsCount >= 4
      },
      {
        id: 'weekly-streak',
        title: 'Streak Master',
        description: 'Met your weekly goal for 3 consecutive weeks',
        icon: <FaFireAlt className="text-orange-400" />,
        unlocked: maxConsecutiveWeeks >= 3
      },
      {
        id: 'monthly-achiever',
        title: 'Monthly Achiever',
        description: `Completed your first monthly goal of ${Math.floor(MONTHLY_GOAL / 60)} hours`,
        icon: <FaMedal className="text-yellow-400" />,
        unlocked: monthlyGoalsCount >= 1
      },
      {
        id: 'monthly-master',
        title: 'Learning Master',
        description: 'Completed 3 monthly goals',
        icon: <FaCrown className="text-amber-500" />,
        unlocked: monthlyGoalsCount >= 3
      },
      {
        id: 'daily-achiever',
        title: 'Daily Dedicated',
        description: `Completed at least ${Math.floor(DAILY_GOAL / 60)} hours of learning in a single day`,
        icon: <FaAward className="text-teal-400" />,
        unlocked: filteredData.some(session => {
          // Group sessions by date
          const dailyMinutes = filteredData
            .filter(s => s.date === session.date)
            .reduce((sum, s) => sum + s.minutes, 0);
          return dailyMinutes >= DAILY_GOAL;
        })
      },
      {
        id: 'diverse',
        title: 'Knowledge Explorer',
        description: 'Studied at least 5 different topics',
        icon: <FaUserGraduate className="text-indigo-400" />,
        unlocked: uniqueTopics >= 5
      },
      {
        id: 'focused',
        title: 'Deep Focus',
        description: `Spent at least ${Math.floor(3000 / 60)} hours studying ${mostStudiedTopic.topic}`,
        icon: <FaStar className="text-purple-400" />,
        unlocked: mostStudiedTopic.minutes >= 3000
      }
    ];
    
    // Return all achievements, sorted by unlock status
    return possibleAchievements.sort((a, b) => {
      if (a.unlocked === b.unlocked) return 0;
      return a.unlocked ? -1 : 1;
    });
  }, [timePeriods, uniqueTopics, mostStudiedTopic, filteredData]);
  
  const unlockedAchievements = useMemo(() => 
    achievements.filter(a => a.unlocked).length
  , [achievements]);
  
  // Calculate learning insights
  const learningInsights = useMemo(() => {
    // Only calculate insights if we have sufficient data
    if (totalSessions < 5) {
      return [];
    }
    
    const insights = [];
    
    // Check consistency
    const uniqueDates = new Set(filteredData.map(s => s.date)).size;
    const consistencyRate = Math.round((uniqueDates / totalSessions) * 100);
    
    if (consistencyRate > 75) {
      insights.push({
        type: 'consistency',
        text: 'You maintain a consistent study schedule, which helps build knowledge effectively.'
      });
    } else if (consistencyRate < 40) {
      insights.push({
        type: 'consistency',
        text: 'Try to establish a more consistent study routine for better results.'
      });
    }
    
    // Check session length
    if (avgMinutesPerSession < 30) {
      insights.push({
        type: 'duration',
        text: 'Your sessions are relatively short. Consider increasing focus time for deeper learning.'
      });
    } else if (avgMinutesPerSession > 90) {
      insights.push({
        type: 'duration',
        text: 'Your longer study sessions show strong commitment to learning.'
      });
    }
    
    // Check topic diversity
    if (uniqueTopics > 10) {
      insights.push({
        type: 'diversity',
        text: 'You\'re exploring many different topics, which builds a broad knowledge base.'
      });
    } else if (Object.keys(topicCounts).length > 0 && Object.values(topicCounts)[0] / totalMinutes > 0.7) {
      insights.push({
        type: 'focus',
        text: `You're heavily focused on ${mostStudiedTopic.topic}, which promotes expertise.`
      });
    }
    
    return insights;
  }, [filteredData, totalSessions, avgMinutesPerSession, uniqueTopics, topicCounts, totalMinutes, mostStudiedTopic]);

  return (
    <main className="container mx-auto px-4 py-12 bg-[#060C1D] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
                My Learning Journey
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Tracking my daily programming study sessions and progress over time
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-[#0B8DCD] rounded-lg text-white text-sm">
              <FaChartLine className="mr-2" />
              <span>{totalSessions} sessions tracked</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <YearFilter 
              data={typedLearningData}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
            
            <TopicFilter 
              data={yearFilteredData} 
              selectedTopic={selectedTopic} 
              onTopicChange={setSelectedTopic} 
            />
          </div>
          
          <LearningHeatmap 
            data={yearFilteredData} 
            selectedTopic={selectedTopic} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6 lg:col-span-3">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <FaChartLine className="mr-3 text-[#00A3FF]" />
              Learning Statistics
              {selectedYear !== "All" && <span className="ml-2 text-lg font-normal text-gray-400">({selectedYear})</span>}
              {selectedTopic !== "All" && <span className="ml-2 text-lg font-normal text-gray-400">({selectedTopic})</span>}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#101935] p-5 rounded-lg transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] border border-gray-800 group">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-400 mb-1">Total Study Time</p>
                  <FaClock className="text-gray-600 group-hover:text-[#00A3FF] transition-colors" />
                </div>
                <p className="text-3xl font-bold text-white">{totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes} min`}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {formatTimeDisplay(totalMinutes)}
                </p>
              </div>
              
              <div className="bg-[#101935] p-5 rounded-lg transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] border border-gray-800 group">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-400 mb-1">Total Sessions</p>
                  <FaCalendarAlt className="text-gray-600 group-hover:text-[#00A3FF] transition-colors" />
                </div>
                <p className="text-3xl font-bold text-white">{totalSessions}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {avgMinutesPerSession} min avg per session
                </p>
              </div>
              
              <div className="bg-[#101935] p-5 rounded-lg transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] border border-gray-800 group">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-400 mb-1">Unique Topics</p>
                  <FaLayerGroup className="text-gray-600 group-hover:text-[#00A3FF] transition-colors" />
                </div>
                <p className="text-3xl font-bold text-white">{uniqueTopics}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Diverse learning areas
                </p>
              </div>
              
              <div className="bg-[#101935] p-5 rounded-lg transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] border border-gray-800 group">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-400 mb-1">Most Studied Topic</p>
                  <FaAward className="text-gray-600 group-hover:text-[#00A3FF] transition-colors" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {selectedTopic === "All" ? mostStudiedTopic.topic : selectedTopic}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedTopic === "All" ? `${mostStudiedTopic.minutes} minutes total` : ''}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Topic Breakdown</h2>
              
              {hasMoreTopics && (
                <button 
                  onClick={openTopicsModal} 
                  className="text-sm text-[#00A3FF] hover:text-[#00FFF0] transition-colors flex items-center"
                >
                  View All
                  <FaExternalLinkAlt className="ml-1 text-xs" />
                </button>
              )}
            </div>
            
            <div className="space-y-4 mt-6">
              {topTopics.map(({ topic, minutes }) => (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{topic}</span>
                    <span className="text-gray-400">{minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]" 
                      style={{ 
                        width: `${Math.min(100, (minutes / (mostStudiedTopic.minutes || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {hasMoreTopics && (
                <div className="pt-2 border-t border-gray-800 mt-4">
                  <p className="text-gray-400 text-sm text-center">
                    +{topicBreakdown.length - topTopics.length} more topics
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Weekly trend chart */}
        <div className="mb-10">
          <LearningTrend 
            data={yearFilteredData}
            selectedTopic={selectedTopic}
          />
        </div>
        
        {/* Achievements section */}
        <div className="mb-10 bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaTrophy className="mr-3 text-[#FFD700]" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
                Learning Achievements
              </span>
              <span className="ml-3 text-lg font-normal text-gray-400">
                ({unlockedAchievements} of {achievements.length} unlocked)
              </span>
            </h2>
            
            <div className="mt-4 md:mt-0 flex items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-400">Weekly Goal</div>
                <div className="text-lg font-semibold text-white">{Math.floor(WEEKLY_GOAL / 60)} hours</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-400">Monthly Goal</div>
                <div className="text-lg font-semibold text-white">{Math.floor(MONTHLY_GOAL / 60)} hours</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border ${achievement.unlocked 
                  ? 'bg-[#101935] border-gray-700 hover:border-gray-600' 
                  : 'bg-[#0D1020] border-gray-800 opacity-60'
                } transition-all duration-300`}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? 'bg-[#1A2A50]' : 'bg-[#0F1428]'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="ml-3">
                    <h3 className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-gray-400">{achievement.description}</p>
                  </div>
                </div>
                <div className={`mt-2 px-2 py-1 rounded-full text-xs text-center ${
                  achievement.unlocked 
                  ? 'bg-[#1A2A50] text-[#00A3FF]' 
                  : 'bg-[#0F1428] text-gray-500'
                }`}>
                  {achievement.unlocked ? 'Unlocked' : 'Locked'}
                </div>
              </div>
            ))}
          </div>
          
          {/* Weekly & Monthly Goal Progress Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Goals Section */}
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <FaCalendarCheck className="mr-2 text-blue-400" />
                Weekly Goal Progress
                <span className="text-xs text-gray-400 ml-2">
                  {!timePeriods.isCurrentWeekComplete ? "(Last 4 weeks + current week)" : "(Last 4 weeks)"}
                </span>
              </h3>
              
              <div className="space-y-4">
                {timePeriods.weeks.length > 0 ? (
                  timePeriods.weeks.map((week, index) => {
                    const weekLabel = `${week.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${week.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                    const progressPercent = Math.min(100, Math.round((week.minutes / WEEKLY_GOAL) * 100));
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">
                            {weekLabel}
                            {week.isCurrentWeek && <span className="ml-2 text-xs text-blue-400">(In progress)</span>}
                          </span>
                          <span className={`${week.goalMet ? 'text-green-400' : 'text-gray-400'}`}>
                            {formatTimeDisplay(week.minutes)} / {Math.floor(WEEKLY_GOAL / 60)}h
                            {week.goalMet && ' ✓'}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${week.isCurrentWeek ? 'bg-blue-400' : (week.goalMet ? 'bg-green-500' : 'bg-blue-500')}`} 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">No weekly data available</p>
                )}
              </div>
            </div>
            
            {/* Monthly Goals Section */}
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-amber-400" />
                Monthly Goal Progress
                <span className="text-xs text-gray-400 ml-2">(Last 3 months, including current month)</span>
              </h3>
              
              <div className="space-y-4">
                {timePeriods.months.length > 0 ? (
                  timePeriods.months.map((month, index) => {
                    const progressPercent = Math.min(100, Math.round((month.minutes / MONTHLY_GOAL) * 100));
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{month.name}</span>
                          <span className={`${month.goalMet ? 'text-green-400' : 'text-gray-400'}`}>
                            {formatTimeDisplay(month.minutes)} / {Math.floor(MONTHLY_GOAL / 60)}h
                            {month.goalMet && ' ✓'}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${month.goalMet ? 'bg-gradient-to-r from-amber-500 to-yellow-300' : 'bg-amber-600'}`} 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">No monthly data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
              Learning Insights
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h3 className="font-semibold text-white mb-2">Consistency</h3>
              <p className="text-gray-400 text-sm">
                You&apos;ve logged {totalSessions} study sessions across {uniqueTopics} different topics
                {selectedYear !== "All" ? ` in ${selectedYear}` : ''}.
                Maintaining consistent study habits helps build skills effectively.
              </p>
            </div>
            
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h3 className="font-semibold text-white mb-2">Focus Area</h3>
              <p className="text-gray-400 text-sm">
                Your primary focus {selectedYear !== "All" ? `in ${selectedYear} ` : ''}has been on <span className="text-[#00A3FF]">{mostStudiedTopic.topic}</span> with 
                {' '}{mostStudiedTopic.minutes >= 60 ? `${Math.floor(mostStudiedTopic.minutes / 60)} hours${mostStudiedTopic.minutes % 60 > 0 ? ` ${mostStudiedTopic.minutes % 60} minutes` : ''}` : `${mostStudiedTopic.minutes} minutes`} of dedicated study time.
              </p>
            </div>
            
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h3 className="font-semibold text-white mb-2">Next Steps</h3>
              <p className="text-gray-400 text-sm">
                Consider exploring complementary topics to <span className="text-[#00A3FF]">{mostStudiedTopic.topic}</span> or 
                setting a goal to increase your average session length from {avgMinutesPerSession >= 60 ? `${Math.floor(avgMinutesPerSession / 60)} hours${avgMinutesPerSession % 60 > 0 ? ` ${avgMinutesPerSession % 60} minutes` : ''}` : `${avgMinutesPerSession} minutes`}.
              </p>
            </div>
            
            {learningInsights.length > 0 && learningInsights.map((insight, index) => (
              <div key={index} className="bg-[#101935] p-5 rounded-lg border border-gray-800">
                <h3 className="font-semibold text-white mb-2">
                  {insight.type === 'consistency' && 'Study Pattern'}
                  {insight.type === 'duration' && 'Session Length'}
                  {insight.type === 'diversity' && 'Topic Range'}
                  {insight.type === 'focus' && 'Focus'}
                </h3>
                <p className="text-gray-400 text-sm">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for All Topics */}
      {showTopicsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-[#0A1124] rounded-xl shadow-2xl border border-gray-800 w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">
                All Learning Topics
                {selectedYear !== "All" && <span className="ml-2 text-lg font-normal text-gray-400">({selectedYear})</span>}
              </h3>
              <button 
                onClick={closeTopicsModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topicBreakdown.map(({ topic, minutes }) => (
                  <div key={topic} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{topic}</span>
                      <span className="text-gray-400">{minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]" 
                        style={{ 
                          width: `${Math.min(100, (minutes / (mostStudiedTopic.minutes || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-800 bg-[#101935]">
              <div className="flex justify-between items-center">
                <p className="text-gray-300 text-sm">
                  Total Topics: <span className="text-white font-semibold">{topicBreakdown.length}</span>
                </p>
                <button 
                  onClick={closeTopicsModal}
                  className="px-4 py-2 bg-[#0B8DCD] hover:bg-opacity-80 rounded text-white text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default LearningPage; 