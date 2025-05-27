"use client";

import React, { useMemo, useState } from 'react';
import { StudySession } from './LearningHeatmap';
import { FaCode, FaArchway, FaLayerGroup, FaCog, FaTrophy, FaFireAlt, FaBullseye, FaCrown, FaRocket, FaGraduationCap, FaChartBar, FaChevronDown, FaChevronUp, FaArrowUp, FaArrowDown, FaCalendarAlt, FaClock, FaAward, FaInfoCircle } from 'react-icons/fa';

interface SeniorRolePreparationProps {
  data: StudySession[];
}

interface MonthlyProgressData {
  year: number;
  month: number;
  monthName: string;
  subjectMinutes: Record<string, number>;
  totalMinutes: number;
  totalHours: number;
  studyDays: number;
  consistencyPercentage: number;
  monthlyProgress: number;
  averageHoursPerDay: number;
}

interface OverallStats {
  subjectTotals: Record<string, number>;
  subjectDaysActive: Record<string, number>;
  subjectStreaks: Record<string, number>;
  totalHoursStudied: number;
  readinessScore: number;
  averageHoursPerSubject: number;
}

interface WeeklyGoal {
  achieved: number;
  total: number;
  percentage: number;
}

interface DetailedAnalyticsProps {
  data: StudySession[];
  monthlyProgress: MonthlyProgressData[];
  overallStats: OverallStats;
  weeklyGoals: Record<string, WeeklyGoal>;
}

// Define the senior role preparation subjects and their daily goals
const SENIOR_ROLE_SUBJECTS = {
  'DSA': { 
    goal: 180, // 3 hours
    icon: <FaCode className="text-green-400" />,
    color: 'green',
    description: 'Data Structures & Algorithms',
    masteryHours: 200, // Industry benchmark for senior level
    masteryDescription: '200+ hours of focused DSA practice'
  },
  'System Design': { 
    goal: 60, // 1 hour
    icon: <FaArchway className="text-blue-400" />,
    color: 'blue',
    description: 'System Design & Architecture',
    masteryHours: 100, // Complex systems understanding
    masteryDescription: '100+ hours of system design study'
  },
  'Scala': { 
    goal: 60, // 1 hour
    icon: <FaLayerGroup className="text-red-400" />,
    color: 'red',
    description: 'Scala Programming Language',
    masteryHours: 150, // Functional programming mastery
    masteryDescription: '150+ hours of Scala proficiency'
  },
  'Akka': { 
    goal: 60, // 1 hour
    icon: <FaCog className="text-purple-400" />,
    color: 'purple',
    description: 'Akka Framework',
    masteryHours: 80, // Framework specific knowledge
    masteryDescription: '80+ hours of Akka expertise'
  }
};

const TOTAL_DAILY_GOAL = Object.values(SENIOR_ROLE_SUBJECTS).reduce((sum, subject) => sum + subject.goal, 0); // 6 hours total

// Tooltip Component
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 text-sm text-white bg-gray-900 border border-gray-700 rounded-lg shadow-xl -top-2 left-full ml-2">
          <div className="absolute w-2 h-2 bg-gray-900 border-l border-b border-gray-700 transform rotate-45 -left-1 top-4"></div>
          {text}
        </div>
      )}
    </div>
  );
};

// Detailed Analytics Component
const DetailedAnalytics: React.FC<DetailedAnalyticsProps> = ({ 
  data, 
  monthlyProgress, 
  overallStats, 
  weeklyGoals 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const detailedAnalytics = useMemo(() => {
    // Subject Distribution Analysis
    const subjectTotalsArray = Object.values(overallStats.subjectTotals as Record<string, number>);
    const totalMinutes = subjectTotalsArray.reduce((a: number, b: number) => a + b, 0);
    const subjectDistribution = Object.entries(overallStats.subjectTotals as Record<string, number>).map(([subject, minutes]) => ({
      subject,
      percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
      hours: Math.floor(minutes / 60)
    }));

    // Monthly Growth Analysis
    const monthlyGrowth = monthlyProgress.slice(1).map((month, index) => {
      const prevMonth = monthlyProgress[index];
      const growthRate = prevMonth.totalHours > 0 
        ? Math.round(((month.totalHours - prevMonth.totalHours) / prevMonth.totalHours) * 100)
        : month.totalHours > 0 ? 100 : 0;
      
      return {
        month: month.monthName,
        growthRate,
        isPositive: growthRate >= 0
      };
    });

    // Consistency Analysis
    const totalStudyDays = [...new Set(data.map(s => s.date))].length;
    const daysSinceFirstStudy = data.length > 0 
      ? Math.ceil((new Date().getTime() - new Date(data[0].date).getTime()) / (1000 * 3600 * 24))
      : 0;
    const overallConsistency = daysSinceFirstStudy > 0 ? Math.round((totalStudyDays / daysSinceFirstStudy) * 100) : 0;

    // Peak Performance Analysis
    const dailyTotals = [...new Set(data.map(s => s.date))].map(date => {
      const dayData = data.filter(s => s.date === date);
      return dayData.reduce((sum, session) => sum + session.minutes, 0);
    });
    const avgDailyMinutes = dailyTotals.length > 0 ? dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length : 0;
    const maxDailyMinutes = Math.max(...dailyTotals, 0);
    const peakPerformanceRate = avgDailyMinutes > 0 ? Math.round((maxDailyMinutes / avgDailyMinutes) * 100) : 0;

    // Goal Achievement Analysis
    const goalValues = Object.values(weeklyGoals);
    const weeklyAchievement = Math.round(goalValues.reduce((sum: number, goal: WeeklyGoal) => sum + goal.percentage, 0) / goalValues.length);
    
    // Time Distribution by Day of Week
    const totalDataMinutes = data.reduce((sum, s) => sum + s.minutes, 0);
    const dayOfWeekStats = Array.from({ length: 7 }, (_, i) => {
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i];
      const dayData = data.filter(session => new Date(session.date).getDay() === i);
      const dayMinutes = dayData.reduce((sum, session) => sum + session.minutes, 0);
      return {
        day: dayName,
        minutes: dayMinutes,
        percentage: totalDataMinutes > 0 ? Math.round((dayMinutes / totalDataMinutes) * 100) : 0
      };
    });

    // Streak Analysis
    const streakValues = Object.values(overallStats.subjectStreaks);
    const avgStreak = streakValues.length > 0 ? Math.round(streakValues.reduce((a: number, b: number) => a + b, 0) / streakValues.length) : 0;
    const maxStreak = Math.max(...streakValues, 0);

    // Subject Mastery Speed Analysis
    const masterySpeed = Object.entries(SENIOR_ROLE_SUBJECTS).map(([subject, config]) => {
      const totalHours = Math.floor(overallStats.subjectTotals[subject] / 60);
      const studyDays = overallStats.subjectDaysActive[subject];
      const avgHoursPerDay = studyDays > 0 ? totalHours / studyDays : 0;
      const remainingHours = Math.max(0, config.masteryHours - totalHours);
      const estimatedDays = avgHoursPerDay > 0 ? Math.ceil(remainingHours / avgHoursPerDay) : 0;
      
      return {
        subject,
        avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
        estimatedDays,
        efficiency: totalHours > 0 ? Math.round((totalHours / config.masteryHours) * 100) : 0
      };
    });

    return {
      subjectDistribution,
      monthlyGrowth,
      overallConsistency,
      peakPerformanceRate,
      weeklyAchievement,
      dayOfWeekStats,
      avgStreak,
      maxStreak,
      masterySpeed,
      avgDailyHours: Math.round((avgDailyMinutes / 60) * 10) / 10,
      maxDailyHours: Math.round((maxDailyMinutes / 60) * 10) / 10
    };
  }, [data, monthlyProgress, overallStats, weeklyGoals]);

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
    <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800">
      {/* Header with Toggle */}
      <div 
        className="p-6 cursor-pointer hover:bg-[#101935] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FaChartBar className="mr-2 text-cyan-400" />
            Detailed Analytics & Insights
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold text-cyan-400">{detailedAnalytics.weeklyAchievement}%</div>
              <div className="text-xs text-gray-400">Weekly Achievement</div>
            </div>
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
              {isExpanded ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
            </button>
          </div>
        </div>
        
        {!isExpanded && (
          <p className="text-gray-400 text-sm mt-2">
            Click to view comprehensive analytics including consistency patterns, growth trends, and performance insights
          </p>
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#101935] p-4 rounded-lg border border-gray-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <FaBullseye className="text-green-400" size={20} />
                <Tooltip text="Measures how consistently you study relative to the total days since you started. Higher percentages indicate more regular study habits.">
                  <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={12} />
                </Tooltip>
              </div>
              <div className="text-xl font-bold text-green-400">{detailedAnalytics.overallConsistency}%</div>
              <div className="text-xs text-gray-400">Overall Consistency</div>
            </div>
            
            <div className="bg-[#101935] p-4 rounded-lg border border-gray-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <FaArrowUp className="text-blue-400" size={20} />
                <Tooltip text="Compares your best study day to your average daily performance. Shows how much higher your peak performance is compared to your typical day.">
                  <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={12} />
                </Tooltip>
              </div>
              <div className="text-xl font-bold text-blue-400">{detailedAnalytics.peakPerformanceRate}%</div>
              <div className="text-xs text-gray-400">Peak vs Avg Performance</div>
            </div>
            
            <div className="bg-[#101935] p-4 rounded-lg border border-gray-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <FaFireAlt className="text-orange-400" size={20} />
                <Tooltip text="Your longest consecutive days of meeting daily goals for any subject. Streaks help build momentum and consistency in your learning routine.">
                  <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={12} />
                </Tooltip>
              </div>
              <div className="text-xl font-bold text-orange-400">{detailedAnalytics.maxStreak}</div>
              <div className="text-xs text-gray-400">Best Streak (days)</div>
            </div>
            
            <div className="bg-[#101935] p-4 rounded-lg border border-gray-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <FaClock className="text-purple-400" size={20} />
                <Tooltip text="The highest number of hours you've studied in a single day. This represents your maximum daily capacity and motivation.">
                  <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={12} />
                </Tooltip>
              </div>
              <div className="text-xl font-bold text-purple-400">{detailedAnalytics.maxDailyHours}h</div>
              <div className="text-xs text-gray-400">Best Daily Performance</div>
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaChartBar className="mr-2 text-cyan-400" />
              Subject Time Distribution
              <Tooltip text="Shows the percentage breakdown of your total study time across all subjects. Helps identify if you're spending balanced time on each area or focusing heavily on specific subjects.">
                <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={14} />
              </Tooltip>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {detailedAnalytics.subjectDistribution.map((item) => {
                const config = SENIOR_ROLE_SUBJECTS[item.subject as keyof typeof SENIOR_ROLE_SUBJECTS];
                const colors = getColorClasses(config.color);
                
                return (
                  <div key={item.subject} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {config.icon}
                      <span className="ml-2 text-white font-medium">{item.subject}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{item.percentage}%</div>
                    <div className="text-sm text-gray-400">{item.hours}h total</div>
                    <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full ${colors.bg}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Growth Trends */}
          <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaArrowUp className="mr-2 text-green-400" />
              Monthly Growth Analysis
              <Tooltip text="Compares each month's total study hours to the previous month. Positive percentages indicate increased study time, while negative shows decreased activity. Helps track your learning momentum over time.">
                <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={14} />
              </Tooltip>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailedAnalytics.monthlyGrowth.map((growth, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#0A1124] rounded-lg">
                  <span className="text-white">{growth.month}</span>
                  <div className="flex items-center">
                    {growth.isPositive ? (
                      <FaArrowUp className="mr-2 text-green-400" />
                    ) : (
                      <FaArrowDown className="mr-2 text-red-400" />
                    )}
                    <span className={`font-bold ${growth.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {growth.growthRate > 0 ? '+' : ''}{growth.growthRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day of Week Analysis */}
          <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-yellow-400" />
              Weekly Study Pattern
              <Tooltip text="Shows what percentage of your total study time occurs on each day of the week. Helps identify your most and least productive days, revealing patterns in your weekly routine.">
                <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={14} />
              </Tooltip>
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {detailedAnalytics.dayOfWeekStats.map((day) => (
                <div key={day.day} className="text-center">
                  <div className="text-white font-medium mb-2">{day.day}</div>
                  <div className="text-lg font-bold text-cyan-400">{day.percentage}%</div>
                  <div className="text-xs text-gray-400">{Math.floor(day.minutes / 60)}h</div>
                  <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      style={{ width: `${Math.max(10, day.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mastery Speed Analysis */}
          <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaAward className="mr-2 text-yellow-400" />
              Mastery Timeline & Efficiency
              <Tooltip text="Analyzes your learning efficiency for each subject. Shows daily averages, estimated time to mastery, and efficiency percentages based on industry benchmarks for senior-level proficiency.">
                <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={14} />
              </Tooltip>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailedAnalytics.masterySpeed.map((item) => {
                const config = SENIOR_ROLE_SUBJECTS[item.subject as keyof typeof SENIOR_ROLE_SUBJECTS];
                const colors = getColorClasses(config.color);
                
                return (
                  <div key={item.subject} className="p-4 bg-[#0A1124] rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {config.icon}
                        <span className="ml-2 text-white font-medium">{item.subject}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`font-bold ${colors.text}`}>{item.efficiency}%</span>
                        <Tooltip text="Percentage of the industry-standard mastery hours you've completed. Based on typical hours needed to reach senior-level proficiency in this subject.">
                          <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={12} />
                        </Tooltip>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-400">Daily Average</span>
                          <Tooltip text="Average hours studied per day when you were active in this subject. Higher averages indicate more intensive study sessions.">
                            <FaInfoCircle className="ml-1 text-gray-500 hover:text-gray-400" size={10} />
                          </Tooltip>
                        </div>
                        <span className="text-white">{item.avgHoursPerDay}h</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-400">Est. Days to Mastery</span>
                          <Tooltip text="Estimated days needed to reach mastery based on your current daily average. This helps plan your learning timeline and set realistic goals.">
                            <FaInfoCircle className="ml-1 text-gray-500 hover:text-gray-400" size={10} />
                          </Tooltip>
                        </div>
                        <span className="text-white">
                          {item.estimatedDays > 0 ? `${item.estimatedDays} days` : 'Complete!'}
                        </span>
                      </div>
                      
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors.bg}`}
                          style={{ width: `${item.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-r from-[#101935] to-[#1A2A50] p-5 rounded-lg border border-cyan-500 border-opacity-30">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaRocket className="mr-2 text-cyan-400" />
              Key Performance Insights
              <Tooltip text="AI-generated insights summarizing your study patterns, performance highlights, and consistency metrics. These help you understand your learning behavior and identify areas for improvement.">
                <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-300" size={14} />
              </Tooltip>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-[#0A1124] rounded-lg">
                <div className="text-cyan-400 font-medium mb-1">Study Efficiency</div>
                <div className="text-white">
                  You study an average of {detailedAnalytics.avgDailyHours}h per active day
                </div>
              </div>
              
              <div className="p-3 bg-[#0A1124] rounded-lg">
                <div className="text-green-400 font-medium mb-1">Best Performance</div>
                <div className="text-white">
                  Your peak day was {detailedAnalytics.maxDailyHours}h ({detailedAnalytics.peakPerformanceRate}% above average)
                </div>
              </div>
              
              <div className="p-3 bg-[#0A1124] rounded-lg">
                <div className="text-yellow-400 font-medium mb-1">Consistency Score</div>
                <div className="text-white">
                  You maintain {detailedAnalytics.overallConsistency}% consistency in your study schedule
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SeniorRolePreparation: React.FC<SeniorRolePreparationProps> = ({ data }) => {
  // Add state for 7-day progress expansion
  const [is7DayExpanded, setIs7DayExpanded] = useState(false);

  // Calculate monthly progress for the last 3 months
  const monthlyProgress = useMemo(() => {
    const last3Months = Array.from({ length: 3 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (2 - i));
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    });

    return last3Months.map(monthInfo => {
      const monthData = data.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getFullYear() === monthInfo.year && 
               sessionDate.getMonth() === monthInfo.month;
      });

      const subjectMinutes: Record<string, number> = {};
      let totalMinutes = 0;
      let totalDays = 0;
      const uniqueDates = new Set();

      Object.keys(SENIOR_ROLE_SUBJECTS).forEach(subject => {
        subjectMinutes[subject] = monthData
          .filter(session => session.topic === subject)
          .reduce((sum, session) => sum + session.minutes, 0);
        totalMinutes += subjectMinutes[subject];
      });

      // Count unique study days
      monthData.forEach(session => uniqueDates.add(session.date));
      totalDays = uniqueDates.size;

      // Calculate expected vs actual study days (assuming 22 working days per month)
      const expectedStudyDays = 22;
      const consistencyPercentage = (totalDays / expectedStudyDays) * 100;

      // Monthly goal (6 hours * 22 days = 132 hours = 7920 minutes)
      const monthlyGoal = TOTAL_DAILY_GOAL * 22;
      const monthlyProgress = Math.min(100, (totalMinutes / monthlyGoal) * 100);

      return {
        ...monthInfo,
        subjectMinutes,
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60),
        studyDays: totalDays,
        consistencyPercentage: Math.round(consistencyPercentage),
        monthlyProgress: Math.round(monthlyProgress),
        averageHoursPerDay: totalDays > 0 ? Math.round((totalMinutes / 60) / totalDays * 10) / 10 : 0
      };
    });
  }, [data]);

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

      {/* Weekly Progress & Daily Breakdown - Merged Section */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800">
        {/* Header with Toggle */}
        <div 
          className="p-6 cursor-pointer hover:bg-[#101935] transition-colors"
          onClick={() => setIs7DayExpanded(!is7DayExpanded)}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FaRocket className="mr-2 text-[#00A3FF]" />
              Weekly Progress & Daily Breakdown
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-bold text-[#00A3FF]">
                  {Math.round(recentProgress.reduce((sum, day) => sum + day.totalMinutes, 0) / 60)}h
                </div>
                <div className="text-xs text-gray-400">Weekly Total</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">
                  {Math.round(Object.values(weeklyGoals).reduce((sum: number, goal: WeeklyGoal) => sum + goal.percentage, 0) / Object.values(weeklyGoals).length)}%
                </div>
                <div className="text-xs text-gray-400">Weekly Goal</div>
              </div>
              <button className="text-[#00A3FF] hover:text-cyan-300 transition-colors">
                {is7DayExpanded ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
              </button>
            </div>
          </div>
          
          {!is7DayExpanded && (
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-4">
                Weekly goal achievement across all subjects and daily breakdown
              </p>
              
              {/* Weekly Subject Goals Summary - Collapsed View */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {Object.entries(weeklyGoals).map(([subject, goal]) => {
                  const config = SENIOR_ROLE_SUBJECTS[subject as keyof typeof SENIOR_ROLE_SUBJECTS];
                  const colors = getColorClasses(config.color);
                  
                  return (
                    <div key={subject} className="bg-[#101935] p-3 rounded-lg border border-gray-800">
                      <div className="flex items-center justify-center mb-2">
                        {config.icon}
                        <span className="ml-2 text-white font-medium text-sm">{subject}</span>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          {Math.floor(goal.achieved / 60)}h {goal.achieved % 60}m
                        </div>
                        <div className="text-xs text-gray-400">
                          of {Math.floor(goal.total / 60)}h
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full ${colors.bg}`}
                            style={{ width: `${goal.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs mt-1">
                          {goal.percentage >= 100 ? (
                            <span className="text-green-400 flex items-center justify-center">
                              <FaTrophy className="mr-1" size={10} />
                              Complete
                            </span>
                          ) : (
                            <span className={`${colors.text}`}>{Math.round(goal.percentage)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Daily Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#101935] p-3 rounded-lg border border-gray-800 text-center">
                  <div className="text-lg font-bold text-green-400">
                    {recentProgress.filter(day => day.totalMinutes > 0).length}/7
                  </div>
                  <div className="text-xs text-gray-400">Active Days</div>
                </div>
                
                <div className="bg-[#101935] p-3 rounded-lg border border-gray-800 text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    {recentProgress.filter(day => day.goalProgress >= 100).length}
                  </div>
                  <div className="text-xs text-gray-400">Perfect Days</div>
                </div>
                
                <div className="bg-[#101935] p-3 rounded-lg border border-gray-800 text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {Math.max(...recentProgress.map(day => Math.round(day.goalProgress)))}%
                  </div>
                  <div className="text-xs text-gray-400">Best Day</div>
                </div>
                
                <div className="bg-[#101935] p-3 rounded-lg border border-gray-800 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {Math.round(recentProgress.reduce((sum, day) => sum + day.totalMinutes, 0) / recentProgress.filter(day => day.totalMinutes > 0).length / 60 * 10) / 10 || 0}h
                  </div>
                  <div className="text-xs text-gray-400">Avg Per Active Day</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Content */}
        {is7DayExpanded && (
          <div className="px-6 pb-6 space-y-6">
            {/* Weekly Goals Detail */}
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaTrophy className="mr-2 text-yellow-400" />
                Weekly Subject Goals
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(weeklyGoals).map(([subject, goal]) => {
                  const config = SENIOR_ROLE_SUBJECTS[subject as keyof typeof SENIOR_ROLE_SUBJECTS];
                  const colors = getColorClasses(config.color);
                  
                  return (
                    <div key={subject} className="bg-[#0A1124] p-4 rounded-lg border border-gray-700">
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
                            {Math.floor(goal.total - goal.achieved) / 60}h {Math.round(goal.total - goal.achieved) % 60}m remaining
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-orange-400" />
                Daily Breakdown
              </h4>
              
              {/* Header Row */}
              <div className="grid grid-cols-6 gap-2 mb-3 text-xs text-gray-400 font-medium">
                <div>Day</div>
                <div className="text-center">Total</div>
                <div className="text-center text-green-400">DSA</div>
                <div className="text-center text-blue-400">System</div>
                <div className="text-center text-red-400">Scala</div>
                <div className="text-center text-purple-400">Akka</div>
              </div>
              
              {/* Progress Rows */}
              <div className="space-y-2">
                {recentProgress.slice().reverse().map((day) => (
                  <div key={day.date} className={`grid grid-cols-6 gap-2 p-3 rounded-lg border items-center ${
                    day.isToday ? 'bg-[#1A2A50] border-[#00A3FF]' : 'bg-[#0A1124] border-gray-700'
                  }`}>
                    {/* Day Column */}
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm">{day.formattedDate}</span>
                      {day.isToday && <span className="text-[#00A3FF] text-xs">Today</span>}
                    </div>
                    
                    {/* Total Column */}
                    <div className="text-center">
                      <div className="text-white font-bold text-sm">
                        {Math.floor(day.totalMinutes / 60)}h {day.totalMinutes % 60}m
                      </div>
                      <div className="text-xs text-gray-400">{Math.round(day.goalProgress)}%</div>
                      <div className="h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]" 
                          style={{ width: `${day.goalProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Subject Columns */}
                    {Object.entries(SENIOR_ROLE_SUBJECTS).map(([subject, config]) => {
                      const dayMinutes = day.subjectMinutes[subject] || 0;
                      const dayHours = Math.floor(dayMinutes / 60);
                      const remainingMinutes = dayMinutes % 60;
                      const progress = (dayMinutes / config.goal) * 100;
                      const colors = getColorClasses(config.color);
                      
                      return (
                        <div key={subject} className="text-center">
                          <div className="text-white font-medium text-sm">
                            {dayHours > 0 ? `${dayHours}h` : ''} {remainingMinutes}m
                          </div>
                          <div className="text-xs text-gray-400">{Math.round(progress)}%</div>
                          <div className="h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                            <div 
                              className={`h-full ${colors.bg}`}
                              style={{ width: `${Math.min(100, progress)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Weekly Summary Analysis */}
            <div className="bg-gradient-to-r from-[#101935] to-[#1A2A50] p-5 rounded-lg border border-[#00A3FF] border-opacity-30">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaChartBar className="mr-2 text-[#00A3FF]" />
                Weekly Performance Summary
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-[#0A1124] rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {Math.round(recentProgress.reduce((sum, day) => sum + day.totalMinutes, 0) / 60)}h
                  </div>
                  <div className="text-xs text-gray-400">Total Hours</div>
                  <div className="text-xs text-green-400 mt-1">
                    {Math.round((recentProgress.reduce((sum, day) => sum + day.totalMinutes, 0) / (TOTAL_DAILY_GOAL * 7)) * 100)}% of 42h goal
                  </div>
                </div>
                
                <div className="p-3 bg-[#0A1124] rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {recentProgress.filter(day => day.totalMinutes > 0).length}/7
                  </div>
                  <div className="text-xs text-gray-400">Active Days</div>
                  <div className="text-xs text-blue-400 mt-1">
                    {Math.round((recentProgress.filter(day => day.totalMinutes > 0).length / 7) * 100)}% consistency
                  </div>
                </div>
                
                <div className="p-3 bg-[#0A1124] rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {Math.round(recentProgress.reduce((sum, day) => sum + day.goalProgress, 0) / 7)}%
                  </div>
                  <div className="text-xs text-gray-400">Avg Daily Goal</div>
                  <div className="text-xs text-yellow-400 mt-1">
                    Target: 100%
                  </div>
                </div>
                
                <div className="p-3 bg-[#0A1124] rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {recentProgress.filter(day => day.goalProgress >= 100).length}
                  </div>
                  <div className="text-xs text-gray-400">Perfect Days</div>
                  <div className="text-xs text-purple-400 mt-1">
                    Goal: 7/7 days
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Streamlined Subject Mastery Progress */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FaGraduationCap className="mr-2 text-green-400" />
            Subject Mastery Progress
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round((overallStats.totalHoursStudied / Object.values(SENIOR_ROLE_SUBJECTS).reduce((sum, config) => sum + config.masteryHours, 0)) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Overall Readiness</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(SENIOR_ROLE_SUBJECTS).map(([subject, config]) => {
            const totalHours = Math.floor(overallStats.subjectTotals[subject] / 60);
            const colors = getColorClasses(config.color);
            const streak = overallStats.subjectStreaks[subject];
            
            // Calculate realistic mastery progress
            const masteryProgress = Math.min(100, (totalHours / config.masteryHours) * 100);
            const hoursToMastery = Math.max(0, config.masteryHours - totalHours);
            
            // Determine mastery level
            let masteryLevel = 'Beginner';
            let masteryColor = 'text-red-400';
            
            if (masteryProgress >= 80) {
              masteryLevel = 'Expert';
              masteryColor = 'text-green-400';
            } else if (masteryProgress >= 60) {
              masteryLevel = 'Advanced';
              masteryColor = 'text-blue-400';
            } else if (masteryProgress >= 30) {
              masteryLevel = 'Intermediate';
              masteryColor = 'text-yellow-400';
            }
            
            return (
              <div key={subject} className={`bg-[#101935] p-4 rounded-lg border ${colors.border} border-opacity-30`}>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A2A50] flex items-center justify-center mr-3">
                    {config.icon}
                  </div>
                  <div>
                    <div className="text-white font-medium">{subject}</div>
                    <div className={`text-xs font-semibold ${masteryColor}`}>{masteryLevel}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Progress</span>
                    <span className="text-white font-semibold">{totalHours}h / {config.masteryHours}h</span>
                  </div>
                  
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors.bg}`}
                      style={{ width: `${masteryProgress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{Math.round(masteryProgress)}% complete</span>
                    <span className="text-gray-500">{hoursToMastery}h left</span>
                  </div>
                  
                  {streak > 0 && (
                    <div className="flex items-center justify-center">
                      <FaFireAlt className={`mr-1 ${colors.text}`} />
                      <span className={`text-xs font-medium ${colors.text}`}>{streak} day streak</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Compact Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-[#101935] rounded-lg border border-gray-800">
          <div className="text-center">
            <div className="text-xl font-bold text-[#00A3FF]">{overallStats.totalHoursStudied}h</div>
            <div className="text-xs text-gray-400">Total Studied</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">
              {Object.values(SENIOR_ROLE_SUBJECTS).reduce((sum, config) => sum + config.masteryHours, 0)}h
            </div>
            <div className="text-xs text-gray-400">Target Hours</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">
              {Math.max(0, Object.values(SENIOR_ROLE_SUBJECTS).reduce((sum, config) => sum + config.masteryHours, 0) - overallStats.totalHoursStudied)}h
            </div>
            <div className="text-xs text-gray-400">Remaining</div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics - Expandable Section - Moved to 2nd Last */}
      <DetailedAnalytics data={data} monthlyProgress={monthlyProgress} overallStats={overallStats} weeklyGoals={weeklyGoals} />

      {/* 3-Month Performance Overview - Moved to Last */}
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <FaRocket className="mr-2 text-purple-400" />
          Last 3 Months Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {monthlyProgress.map((month, index) => (
            <div key={month.monthName} className={`p-5 rounded-lg border ${
              index === 2 ? 'bg-[#1A2A50] border-[#00A3FF]' : 'bg-[#101935] border-gray-800'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">{month.monthName}</h4>
                {index === 2 && <span className="text-xs bg-[#00A3FF] text-white px-2 py-1 rounded">Current</span>}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Hours</span>
                  <span className="text-white font-bold">{month.totalHours}h</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Study Days</span>
                  <span className="text-white font-bold">{month.studyDays}/22</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Consistency</span>
                  <span className="text-white font-bold">{month.consistencyPercentage}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Hours/Day</span>
                  <span className="text-white font-bold">{month.averageHoursPerDay}h</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Monthly Goal Progress</span>
                  <span className="text-white">{month.monthlyProgress}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]" 
                    style={{ width: `${month.monthlyProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {Object.entries(SENIOR_ROLE_SUBJECTS).map(([subject, config]) => {
                  const monthHours = Math.floor(month.subjectMinutes[subject] / 60);
                  const colors = getColorClasses(config.color);
                  
                  return (
                    <div key={subject} className="text-center p-2 bg-[#0A1124] rounded">
                      <div className={`${colors.text} font-medium`}>{subject}</div>
                      <div className="text-white">{monthHours}h</div>
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