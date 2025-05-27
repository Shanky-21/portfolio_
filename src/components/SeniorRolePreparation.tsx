"use client";

import React, { useMemo } from 'react';
import { StudySession } from './LearningHeatmap';
import { FaCode, FaArchway, FaLayerGroup, FaCog, FaTrophy, FaFireAlt, FaBullseye, FaCrown, FaRocket, FaGraduationCap } from 'react-icons/fa';

interface SeniorRolePreparationProps {
  data: StudySession[];
}

// Define the senior role preparation subjects and their daily goals
const SENIOR_ROLE_SUBJECTS = {
  'DSA': { 
    goal: 180, // 3 hours
    icon: <FaCode className="text-green-400" />,
    color: 'green',
    description: 'Data Structures & Algorithms'
  },
  'System Design': { 
    goal: 60, // 1 hour
    icon: <FaArchway className="text-blue-400" />,
    color: 'blue',
    description: 'System Design & Architecture'
  },
  'Scala': { 
    goal: 60, // 1 hour
    icon: <FaLayerGroup className="text-red-400" />,
    color: 'red',
    description: 'Scala Programming Language'
  },
  'Akka': { 
    goal: 60, // 1 hour
    icon: <FaCog className="text-purple-400" />,
    color: 'purple',
    description: 'Akka Framework'
  }
};

const TOTAL_DAILY_GOAL = Object.values(SENIOR_ROLE_SUBJECTS).reduce((sum, subject) => sum + subject.goal, 0); // 6 hours total

const SeniorRolePreparation: React.FC<SeniorRolePreparationProps> = ({ data }) => {
  // Calculate daily progress for the last 7 days
  const recentProgress = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayData = data.filter(session => session.date === date);
      
      const subjectMinutes: Record<string, number> = {};
      Object.keys(SENIOR_ROLE_SUBJECTS).forEach(subject => {
        subjectMinutes[subject] = dayData
          .filter(session => session.topic === subject)
          .reduce((sum, session) => sum + session.minutes, 0);
      });

      const totalMinutes = Object.values(subjectMinutes).reduce((sum, minutes) => sum + minutes, 0);
      const goalProgress = (totalMinutes / TOTAL_DAILY_GOAL) * 100;
      
      return {
        date,
        formattedDate: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        subjectMinutes,
        totalMinutes,
        goalProgress: Math.min(100, goalProgress),
        isToday: date === new Date().toISOString().split('T')[0]
      };
    });
  }, [data]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const subjectTotals: Record<string, number> = {};
    const subjectDaysActive: Record<string, number> = {};
    const subjectStreaks: Record<string, number> = {};
    
    Object.keys(SENIOR_ROLE_SUBJECTS).forEach(subject => {
      subjectTotals[subject] = 0;
      subjectDaysActive[subject] = 0;
      subjectStreaks[subject] = 0;
    });

    // Calculate totals and active days
    data.forEach(session => {
      if (session.topic in SENIOR_ROLE_SUBJECTS) {
        subjectTotals[session.topic] += session.minutes;
      }
    });

    // Calculate days active for each subject
    const uniqueDates = [...new Set(data.map(s => s.date))].sort();
    uniqueDates.forEach(date => {
      const dayData = data.filter(session => session.date === date);
      Object.keys(SENIOR_ROLE_SUBJECTS).forEach(subject => {
        const subjectMinutes = dayData
          .filter(session => session.topic === subject)
          .reduce((sum, session) => sum + session.minutes, 0);
        
        if (subjectMinutes > 0) {
          subjectDaysActive[subject]++;
        }
      });
    });

    // Calculate current streaks (from most recent data backwards)
    const sortedDates = uniqueDates.reverse();
    Object.keys(SENIOR_ROLE_SUBJECTS).forEach(subject => {
      let streak = 0;
      for (const date of sortedDates) {
        const dayData = data.filter(session => session.date === date);
        const subjectMinutes = dayData
          .filter(session => session.topic === subject)
          .reduce((sum, session) => sum + session.minutes, 0);
        
        if (subjectMinutes >= SENIOR_ROLE_SUBJECTS[subject as keyof typeof SENIOR_ROLE_SUBJECTS].goal) {
          streak++;
        } else {
          break;
        }
      }
      subjectStreaks[subject] = streak;
    });

    // Calculate readiness score
    const totalHoursStudied = Object.values(subjectTotals).reduce((sum, minutes) => sum + minutes, 0) / 60;
    const averageHoursPerSubject = totalHoursStudied / Object.keys(SENIOR_ROLE_SUBJECTS).length;
    const consistencyScore = Object.values(subjectDaysActive).reduce((sum, days) => sum + days, 0) / Object.keys(SENIOR_ROLE_SUBJECTS).length;
    
    // Simple readiness calculation (you can make this more sophisticated)
    const readinessScore = Math.min(100, (totalHoursStudied / 200) * 50 + (consistencyScore / 30) * 50); // Assume 200 hours total needed

    return {
      subjectTotals,
      subjectDaysActive,
      subjectStreaks,
      totalHoursStudied: Math.round(totalHoursStudied),
      readinessScore: Math.round(readinessScore),
      averageHoursPerSubject: Math.round(averageHoursPerSubject)
    };
  }, [data]);

  // Today's progress
  const todayProgress = recentProgress.find(day => day.isToday);

  // Calculate weekly goal achievement
  const weeklyGoals = useMemo(() => {
    const weeklySubjectGoals: Record<string, { achieved: number; total: number; percentage: number }> = {};
    
    Object.keys(SENIOR_ROLE_SUBJECTS).forEach(subject => {
      const weeklyTotal = recentProgress.reduce((sum, day) => sum + day.subjectMinutes[subject], 0);
      const weeklyGoal = SENIOR_ROLE_SUBJECTS[subject as keyof typeof SENIOR_ROLE_SUBJECTS].goal * 7;
      
      weeklySubjectGoals[subject] = {
        achieved: weeklyTotal,
        total: weeklyGoal,
        percentage: Math.min(100, (weeklyTotal / weeklyGoal) * 100)
      };
    });

    return weeklySubjectGoals;
  }, [recentProgress]);

  const getColorClasses = (color: string) => {
    const colors = {
      green: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' },
      blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
      red: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header with Readiness Score */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaCrown className="mr-3 text-yellow-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                Senior Role Preparation
              </span>
            </h2>
            <p className="text-gray-300 mt-1">
              Track your daily 6-hour goal: DSA (3h) • System Design (1h) • Scala (1h) • Akka (1h)
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-gray-400">Readiness Score</div>
              <div className="text-2xl font-bold text-yellow-400">{overallStats.readinessScore}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Total Hours</div>
              <div className="text-2xl font-bold text-[#00A3FF]">{overallStats.totalHoursStudied}h</div>
            </div>
          </div>
        </div>

        {/* Today's Progress */}
        {todayProgress && (
          <div className="bg-[#101935] p-5 rounded-lg border border-gray-800 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FaBullseye className="mr-2 text-orange-400" />
                Today&apos;s Progress
              </h3>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {Math.floor(todayProgress.totalMinutes / 60)}h {todayProgress.totalMinutes % 60}m
                </div>
                <div className="text-sm text-gray-400">of 6h goal</div>
              </div>
            </div>
            
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]" 
                style={{ width: `${todayProgress.goalProgress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(SENIOR_ROLE_SUBJECTS).map(([subject, config]) => {
                const todayMinutes = todayProgress.subjectMinutes[subject] || 0;
                const progress = (todayMinutes / config.goal) * 100;
                const colors = getColorClasses(config.color);
                
                return (
                  <div key={subject} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {config.icon}
                      <span className="ml-2 text-sm text-white font-medium">{subject}</span>
                    </div>
                    <div className="text-lg font-bold text-white">{todayMinutes}m</div>
                    <div className="text-xs text-gray-400">of {config.goal}m</div>
                    <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full ${colors.bg}`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <FaRocket className="mr-2 text-[#00A3FF]" />
          Weekly Goal Progress
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(weeklyGoals).map(([subject, goal]) => {
            const config = SENIOR_ROLE_SUBJECTS[subject as keyof typeof SENIOR_ROLE_SUBJECTS];
            const colors = getColorClasses(config.color);
            
            return (
              <div key={subject} className="bg-[#101935] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {config.icon}
                    <div className="ml-3">
                      <div className="text-white font-medium">{subject}</div>
                      <div className="text-xs text-gray-400">{config.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {Math.floor(goal.achieved / 60)}h {goal.achieved % 60}m
                    </div>
                    <div className="text-xs text-gray-400">
                      of {Math.floor(goal.total / 60)}h
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full ${colors.bg}`}
                    style={{ width: `${goal.percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{Math.round(goal.percentage)}% complete</span>
                  {goal.percentage >= 100 ? (
                    <span className="text-green-400 flex items-center">
                      <FaTrophy className="mr-1" />
                      Goal Met!
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      {Math.floor((goal.total - goal.achieved) / 60)}h {(goal.total - goal.achieved) % 60}m remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Deep Dive */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <FaGraduationCap className="mr-2 text-green-400" />
          Subject Mastery Progress
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(SENIOR_ROLE_SUBJECTS).map(([subject, config]) => {
            const totalHours = Math.floor(overallStats.subjectTotals[subject] / 60);
            const colors = getColorClasses(config.color);
            const streak = overallStats.subjectStreaks[subject];
            
            return (
              <div key={subject} className={`bg-[#101935] p-4 rounded-lg border ${colors.border} border-opacity-30`}>
                <div className="text-center mb-3">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#1A2A50] flex items-center justify-center">
                    {config.icon}
                  </div>
                  <div className="text-white font-medium">{subject}</div>
                  <div className="text-xs text-gray-400">{config.description}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Total Time</span>
                    <span className="text-white font-semibold">{totalHours}h</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Days Active</span>
                    <span className="text-white font-semibold">{overallStats.subjectDaysActive[subject]}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Goal Streak</span>
                    <span className={`font-semibold flex items-center ${colors.text}`}>
                      {streak > 0 && <FaFireAlt className="mr-1" />}
                      {streak} days
                    </span>
                  </div>
                </div>
                
                {/* Simple mastery indicator */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Mastery Level</div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors.bg}`}
                      style={{ width: `${Math.min(100, (totalHours / 50) * 100)}%` }} // Assume 50 hours = mastery
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((totalHours / 50) * 100)}% to mastery
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Progress Chart */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <FaFireAlt className="mr-2 text-orange-400" />
          Last 7 Days Progress
        </h3>
        
        <div className="space-y-4">
          {recentProgress.map((day) => (
            <div key={day.date} className={`p-4 rounded-lg border ${
              day.isToday ? 'bg-[#1A2A50] border-[#00A3FF]' : 'bg-[#101935] border-gray-800'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <span className="text-white font-medium">{day.formattedDate}</span>
                  {day.isToday && <span className="ml-2 text-xs bg-[#00A3FF] text-white px-2 py-1 rounded">Today</span>}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {Math.floor(day.totalMinutes / 60)}h {day.totalMinutes % 60}m
                  </div>
                  <div className="text-xs text-gray-400">{Math.round(day.goalProgress)}% of goal</div>
                </div>
              </div>
              
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]" 
                  style={{ width: `${day.goalProgress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-xs">
                {Object.entries(SENIOR_ROLE_SUBJECTS).map(([subject, config]) => {
                  const dayMinutes = day.subjectMinutes[subject] || 0;
                  const colors = getColorClasses(config.color);
                  
                  return (
                    <div key={subject} className="text-center">
                      <div className={`${colors.text} font-medium`}>{subject}</div>
                      <div className="text-white">{dayMinutes}m</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeniorRolePreparation; 