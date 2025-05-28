"use client";

import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend,
  Filler,
  ChartOptions,
  TooltipItem,
  ChartData
} from 'chart.js';
import { subDays, format, parseISO } from 'date-fns';
import { StudySession } from './LearningHeatmap';
import { FaChartLine, FaInfoCircle, FaFireAlt, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { TOTAL_DAILY_GOAL_MINUTES, SENIOR_ROLE_SUBJECTS } from '@/constants/learningGoals';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface LearningTrendProps {
  data: StudySession[];
  selectedTopic: string;
}

const LearningTrend: React.FC<LearningTrendProps> = ({ data, selectedTopic }) => {
  // State for selected point on the chart
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  // State for collapsible Weekly Insights
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  
  // Get current date or most recent date in data
  const getMostRecentDate = useMemo(() => {
    if (data.length === 0) {
      return new Date();
    }
    
    // Get the most recent date from data
    const dates = data.map(session => new Date(session.date));
    return new Date(Math.max(...dates.map(date => date.getTime())));
  }, [data]);
  
  // Use most recent date as the reference for "today"
  const referenceDate = getMostRecentDate;
  
  // Filter data for the last week and by selected topic
  const recentData = useMemo(() => {
    // Filter data by selected topic if not "All"
    const topicFilteredData = selectedTopic === "All" 
      ? data 
      : data.filter(session => session.topic === selectedTopic);
    
    // Create an array of the last 7 days
    const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(referenceDate, 6 - i);
      return format(date, 'yyyy-MM-dd');
    });
    
    // Initialize minutes for each day to 0
    const dailyMinutes: Record<string, number> = {};
    lastSevenDays.forEach(day => {
      dailyMinutes[day] = 0;
    });
    
    // Add actual minutes from study sessions
    topicFilteredData.forEach(session => {
      if (lastSevenDays.includes(session.date)) {
        dailyMinutes[session.date] = (dailyMinutes[session.date] || 0) + session.minutes;
      }
    });
    
    // Convert to array with formatted dates
    return lastSevenDays.map(day => ({
      date: day,
      formattedDate: format(parseISO(day), 'EEE, MMM d'),
      minutes: dailyMinutes[day]
    }));
  }, [data, selectedTopic, referenceDate]);
  
  // Calculate trend direction with more sophisticated analysis
  const trendAnalysis = useMemo(() => {
    // Need at least 3 data points for meaningful trend analysis
    const daysWithActivity = recentData.filter(day => day.minutes > 0);
    if (daysWithActivity.length < 2) {
      return { 
        type: "insufficient", 
        message: "Building momentum", 
        description: "Start logging sessions to see trends",
        color: "text-gray-400"
      };
    }

    // Calculate various trend metrics
    const totalMinutes = recentData.reduce((sum, day) => sum + day.minutes, 0);
    const avgDaily = totalMinutes / 7;
    const goalMinutes = selectedTopic === "All" ? TOTAL_DAILY_GOAL_MINUTES : SENIOR_ROLE_SUBJECTS[selectedTopic as keyof typeof SENIOR_ROLE_SUBJECTS]?.goal || TOTAL_DAILY_GOAL_MINUTES;
    
    // Get recent 3 days vs previous 4 days for comparison
    const recent3Days = recentData.slice(-3);
    const previous4Days = recentData.slice(0, 4);
    
    const recent3DaysAvg = recent3Days.reduce((sum, day) => sum + day.minutes, 0) / 3;
    const previous4DaysAvg = previous4Days.reduce((sum, day) => sum + day.minutes, 0) / 4;
    
    // Check consistency (how many days met goal)
    const daysMetGoal = recentData.filter(day => day.minutes >= goalMinutes).length;
    const consistencyRate = daysMetGoal / 7;
    
    // Check if there's been activity in last 2 days
    const lastTwoDays = recentData.slice(-2);
    const hasRecentActivity = lastTwoDays.some(day => day.minutes > 0);
    
    // Calculate weekly goal progress
    const weeklyGoal = goalMinutes * 7;
    const weeklyProgress = totalMinutes / weeklyGoal;
    
    // Check recent trend direction
    const isIncreasing = recent3DaysAvg > previous4DaysAvg * 1.2;
    const isDecreasing = recent3DaysAvg < previous4DaysAvg * 0.7;
    
    // Determine trend type and message with better context
    if (!hasRecentActivity) {
      return {
        type: "inactive",
        message: "Need to restart",
        description: "No activity in last 2 days",
        color: "text-[#f85149]"
      };
    }
    
    // Excellent performance: high consistency AND meeting weekly goals
    if (consistencyRate >= 0.8 && weeklyProgress >= 0.8) {
      return {
        type: "excellent",
        message: "Excellent consistency",
        description: `${daysMetGoal}/7 days met goal`,
        color: "text-[#39d353]"
      };
    }
    
    // Good performance with strong momentum: decent progress AND increasing trend
    if (weeklyProgress >= 0.6 && isIncreasing && recent3DaysAvg >= goalMinutes * 0.8) {
      return {
        type: "accelerating",
        message: "Strong momentum",
        description: "Recent days show increased focus",
        color: "text-[#39d353]"
      };
    }
    
    // Concerning decline: decreasing trend OR very low recent activity
    if (isDecreasing || recent3DaysAvg < goalMinutes * 0.3) {
      return {
        type: "declining",
        message: "Momentum slowing",
        description: "Consider adjusting schedule",
        color: "text-[#f85149]"
      };
    }
    
    // Moderate improvement: increasing but still below optimal
    if (isIncreasing && weeklyProgress >= 0.3) {
      return {
        type: "improving",
        message: "Building momentum",
        description: "Recent improvement noted",
        color: "text-[#ffa657]"
      };
    }
    
    // Steady good performance: meeting most goals consistently
    if (avgDaily >= goalMinutes * 0.8) {
      return {
        type: "steady_good",
        message: "Steady progress",
        description: "Maintaining good pace",
        color: "text-[#00FFF0]"
      };
    }
    
    // Moderate activity: some progress but room for improvement
    if (avgDaily >= goalMinutes * 0.5 || weeklyProgress >= 0.4) {
      return {
        type: "steady_moderate",
        message: "Building habits",
        description: "Room for improvement",
        color: "text-[#ffa657]"
      };
    }
    
    // Low activity: needs significant improvement
    return {
      type: "low_activity",
      message: "Needs attention",
      description: "Below target pace",
      color: "text-[#f85149]"
    };
  }, [recentData, selectedTopic]);
  
  // Calculate streak information
  const streak = useMemo(() => {
    // Get all dates in data sorted chronologically
    const dateCounts = new Map<string, number>();
    data.forEach(session => {
      const existing = dateCounts.get(session.date) || 0;
      dateCounts.set(session.date, existing + session.minutes);
    });
    
    // Convert to array and sort
    const sortedDates = Array.from(dateCounts.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    
    if (sortedDates.length === 0) {
      return { current: 0, longest: 0, goalsMet: 0 };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let goalsMet = 0;
    let prevDate: Date | null = null;
    
    // Process dates in reverse to get current streak
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const [dateStr, minutes] = sortedDates[i];
      const date = new Date(dateStr);
      
      // Check if date meets goal
      if (minutes >= TOTAL_DAILY_GOAL_MINUTES) {
        goalsMet++;
      }
      
      // If this is the first date, initialize streak
      if (prevDate === null) {
        currentStreak = 1;
        prevDate = date;
        continue;
      }
      
      // Check if dates are consecutive
      const dayDiff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        currentStreak++;
        prevDate = date;
      } else {
        break; // Streak broken
      }
    }
    
    // Calculate longest streak
    let tempStreak = 0;
    prevDate = null;
    
    for (let i = 0; i < sortedDates.length; i++) {
      const [dateStr] = sortedDates[i];
      const date = new Date(dateStr);
      
      if (prevDate === null) {
        tempStreak = 1;
        prevDate = date;
        continue;
      }
      
      const dayDiff = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
      
      prevDate = date;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { current: currentStreak, longest: longestStreak, goalsMet };
  }, [data]);
  
  // Calculate weekly goal progress
  const weeklyGoalProgress = useMemo(() => {
    const daysInWeek = 7;
    const weeklyGoal = TOTAL_DAILY_GOAL_MINUTES * daysInWeek;
    const totalMinutes = recentData.reduce((sum, day) => sum + day.minutes, 0);
    const percentage = Math.min(100, Math.round((totalMinutes / weeklyGoal) * 100));
    
    return {
      percentage,
      isComplete: percentage >= 100,
      minutesNeeded: Math.max(0, weeklyGoal - totalMinutes)
    };
  }, [recentData]);
  
  // Enhanced weekly insights
  const weeklyInsights = useMemo(() => {
    const insights = [];
    const goalMinutes = selectedTopic === "All" ? TOTAL_DAILY_GOAL_MINUTES : SENIOR_ROLE_SUBJECTS[selectedTopic as keyof typeof SENIOR_ROLE_SUBJECTS]?.goal || TOTAL_DAILY_GOAL_MINUTES;
    const activeDays = recentData.filter(day => day.minutes > 0).length;
    const daysMetGoal = recentData.filter(day => day.minutes >= goalMinutes).length;
    
    // Consistency insight
    if (daysMetGoal >= 5) {
      insights.push({
        icon: "🎯",
        text: "Excellent goal achievement rate",
        type: "positive"
      });
    } else if (daysMetGoal >= 3) {
      insights.push({
        icon: "📈",
        text: "Good progress, aim for more consistency",
        type: "neutral"
      });
    } else if (activeDays >= 4) {
      insights.push({
        icon: "⚡",
        text: "Active but need longer sessions",
        type: "neutral"
      });
    } else {
      insights.push({
        icon: "🔄",
        text: "Focus on building daily habits",
        type: "improvement"
      });
    }
    
    // Weekend vs weekday pattern
    const weekendDays = [recentData[0], recentData[6]]; // Assuming Sunday and Saturday
    const weekdayDays = recentData.slice(1, 6);
    const weekendAvg = weekendDays.reduce((sum, day) => sum + day.minutes, 0) / 2;
    const weekdayAvg = weekdayDays.reduce((sum, day) => sum + day.minutes, 0) / 5;
    
    if (weekendAvg > weekdayAvg * 1.5) {
      insights.push({
        icon: "📅",
        text: "Strong weekend learner",
        type: "positive"
      });
    } else if (weekdayAvg > weekendAvg * 1.5) {
      insights.push({
        icon: "💼",
        text: "Consistent weekday routine",
        type: "positive"
      });
    }
    
    // Best day insight
    const bestDay = recentData.reduce((max, day) => day.minutes > max.minutes ? day : max, recentData[0]);
    if (bestDay.minutes > 0) {
      insights.push({
        icon: "⭐",
        text: `Best day: ${bestDay.formattedDate.split(',')[0]} (${bestDay.minutes >= 60 ? `${Math.floor(bestDay.minutes / 60)}h ${bestDay.minutes % 60}m` : `${bestDay.minutes}m`})`,
        type: "highlight"
      });
    }
    
    return insights.slice(0, 3); // Limit to 3 insights
  }, [recentData, selectedTopic]);
  
  // Chart data and options
  const chartData: ChartData<'line', number[], string> = {
    labels: recentData.map(day => day.formattedDate),
    datasets: [
      {
        label: selectedTopic === "All" ? 'Actual Study Time' : `${selectedTopic} Study Time`,
        data: recentData.map(day => day.minutes),
        borderColor: '#00A3FF',
        backgroundColor: 'rgba(0, 163, 255, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: (context) => {
          const minutes = context.parsed.y;
          const goalMinutes = selectedTopic === "All" ? TOTAL_DAILY_GOAL_MINUTES : SENIOR_ROLE_SUBJECTS[selectedTopic as keyof typeof SENIOR_ROLE_SUBJECTS]?.goal || TOTAL_DAILY_GOAL_MINUTES;
          // Highlight selected point or color based on goal achievement
          if (selectedPoint === context.dataIndex) return '#ffffff';
          return minutes >= goalMinutes ? '#39d353' : '#00A3FF';
        },
        pointBorderColor: (context) => {
          const minutes = context.parsed.y;
          const goalMinutes = selectedTopic === "All" ? TOTAL_DAILY_GOAL_MINUTES : SENIOR_ROLE_SUBJECTS[selectedTopic as keyof typeof SENIOR_ROLE_SUBJECTS]?.goal || TOTAL_DAILY_GOAL_MINUTES;
          if (selectedPoint === context.dataIndex) return '#00A3FF';
          return minutes >= goalMinutes ? '#39d353' : '#00A3FF';
        },
        pointBorderWidth: (context) => {
          return selectedPoint === context.dataIndex ? 2 : 1;
        },
        pointRadius: (context) => {
          return selectedPoint === context.dataIndex ? 6 : 4;
        },
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#00A3FF',
        pointHoverBorderWidth: 2,
      },
      {
        label: 'Daily Goal',
        data: recentData.map(() => selectedTopic === "All" ? TOTAL_DAILY_GOAL_MINUTES : SENIOR_ROLE_SUBJECTS[selectedTopic as keyof typeof SENIOR_ROLE_SUBJECTS]?.goal || TOTAL_DAILY_GOAL_MINUTES),
        borderColor: '#f85149',
        backgroundColor: 'rgba(248, 81, 73, 0.05)',
        borderDash: [5, 5],
        tension: 0,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderWidth: 2,
      },
    ],
  };
  
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#7d8590',
          callback: function(value: number | string) {
            return `${value} min`;
          },
        },
        title: {
          display: true,
          text: 'Minutes',
          color: '#7d8590',
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#7d8590',
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#7d8590',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#161b22',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#30363d',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          title: function(tooltipItems: TooltipItem<'line'>[]) {
            return tooltipItems[0].label;
          },
          label: function(context: TooltipItem<'line'>) {
            if (context.datasetIndex === 1) {
              // Goal line
              const goalMinutes = context.parsed.y;
              const goalHours = Math.floor(goalMinutes / 60);
              const goalRemainingMinutes = goalMinutes % 60;
              return `Goal: ${goalHours > 0 ? `${goalHours}h ` : ''}${goalRemainingMinutes}m`;
            } else {
              // Actual study time
              const minutes = context.parsed.y;
              const goalMinutes = selectedTopic === "All" ? TOTAL_DAILY_GOAL_MINUTES : SENIOR_ROLE_SUBJECTS[selectedTopic as keyof typeof SENIOR_ROLE_SUBJECTS]?.goal || TOTAL_DAILY_GOAL_MINUTES;
              
              let timeText = '';
              if (minutes < 60) {
                timeText = `${minutes} minutes`;
              } else {
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                if (remainingMinutes === 0) {
                  timeText = `${hours} hour${hours !== 1 ? 's' : ''}`;
                } else {
                  timeText = `${hours}h ${remainingMinutes}m`;
                }
              }
              
              const percentage = Math.round((minutes / goalMinutes) * 100);
              return `Studied: ${timeText} (${percentage}% of goal)`;
            }
          },
          afterBody: function(tooltipItems: TooltipItem<'line'>[]) {
            const actualItem = tooltipItems.find(item => item.datasetIndex === 0);
            if (actualItem) {
              const minutes = actualItem.parsed.y;
              const goalMinutes = selectedTopic === "All" ? TOTAL_DAILY_GOAL_MINUTES : SENIOR_ROLE_SUBJECTS[selectedTopic as keyof typeof SENIOR_ROLE_SUBJECTS]?.goal || TOTAL_DAILY_GOAL_MINUTES;
              
              if (minutes >= goalMinutes) {
                const excess = minutes - goalMinutes;
                if (excess > 0) {
                  const excessHours = Math.floor(excess / 60);
                  const excessMins = excess % 60;
                  return `✅ Goal exceeded by ${excessHours > 0 ? `${excessHours}h ` : ''}${excessMins}m`;
                } else {
                  return '✅ Daily goal achieved!';
                }
              } else {
                const needed = goalMinutes - minutes;
                const neededHours = Math.floor(needed / 60);
                const neededMins = needed % 60;
                return `⚠️ Need ${neededHours > 0 ? `${neededHours}h ` : ''}${neededMins}m more`;
              }
            }
            return '';
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        setSelectedPoint(prevIndex => prevIndex === clickedIndex ? null : clickedIndex);
      } else {
        setSelectedPoint(null);
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    transitions: {
      active: {
        animation: {
          duration: 300
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };
  
  // Check if there is any activity in the past week
  const hasActivity = recentData.some(day => day.minutes > 0);
  
  // Get total minutes for the past week
  const totalWeekMinutes = recentData.reduce((sum, day) => sum + day.minutes, 0);
  
  // Get average minutes per active day
  const activeDays = recentData.filter(day => day.minutes > 0).length;
  const avgMinutesPerActiveDay = activeDays > 0 
    ? Math.round(totalWeekMinutes / activeDays) 
    : 0;
  
  // Get the reference date range for display
  const dateRangeText = useMemo(() => {
    const firstDay = recentData[0]?.formattedDate;
    const lastDay = recentData[recentData.length - 1]?.formattedDate;
    return `${firstDay} - ${lastDay}`;
  }, [recentData]);
  
  // Information about selected day
  const selectedDayInfo = useMemo(() => {
    if (selectedPoint === null) return null;
    return recentData[selectedPoint];
  }, [selectedPoint, recentData]);
  
  return (
    <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <FaChartLine className="mr-2 text-[#00A3FF]" />
            Recent Trend
            {selectedTopic !== "All" && <span className="ml-2 text-sm font-normal text-gray-400">({selectedTopic})</span>}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{dateRangeText}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm px-3 py-1 rounded-md bg-[#101935] text-gray-300">
            Total: <span className="font-semibold text-white">
              {totalWeekMinutes >= 60 ? `${Math.floor(totalWeekMinutes / 60)}h ${totalWeekMinutes % 60}m` : `${totalWeekMinutes} min`}
            </span>
          </div>
          
          {trendAnalysis.type !== "insufficient" && (
            <div className={`text-sm px-3 py-1 rounded-md border ${
              trendAnalysis.type === "excellent" || trendAnalysis.type === "accelerating" || trendAnalysis.type === "steady_good"
                ? "bg-[#0e4429] border-[#39d353] text-[#39d353]"
                : trendAnalysis.type === "inactive" || trendAnalysis.type === "declining" || trendAnalysis.type === "low_activity"
                ? "bg-[#350c0c] border-[#f85149] text-[#f85149]"
                : "bg-[#1f2937] border-[#ffa657] text-[#ffa657]"
            }`}>
              <div className="font-medium">{trendAnalysis.message}</div>
              <div className="text-xs opacity-80">{trendAnalysis.description}</div>
            </div>
          )}
        </div>
      </div>
      
      {hasActivity ? (
        <div className="h-64 w-full">
          <Line data={chartData} options={chartOptions} />
          {selectedDayInfo && (
            <div className="mt-3 p-3 bg-[#101935] rounded-md border border-gray-700 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div className="font-medium text-white">{selectedDayInfo.formattedDate}</div>
                <button 
                  onClick={() => setSelectedPoint(null)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Clear Selection
                </button>
              </div>
              <div className="mt-1 flex items-center">
                <div className="w-2 h-2 bg-[#00A3FF] rounded-full mr-2"></div>
                <span className="text-[#00A3FF] font-semibold">
                  {selectedDayInfo.minutes >= 60 
                    ? `${Math.floor(selectedDayInfo.minutes / 60)}h ${selectedDayInfo.minutes % 60}m` 
                    : `${selectedDayInfo.minutes} minutes`}
                </span>
                <span className="ml-1 text-gray-400 text-sm">of learning</span>
                
                {selectedDayInfo.minutes >= TOTAL_DAILY_GOAL_MINUTES ? (
                  <div className="ml-auto text-[#39d353] flex items-center text-xs">
                    <FaCheck className="mr-1" />
                    Daily goal met
                  </div>
                ) : (
                  <div className="ml-auto text-[#f85149] flex items-center text-xs">
                    <FaExclamationTriangle className="mr-1" />
                    {TOTAL_DAILY_GOAL_MINUTES - selectedDayInfo.minutes}min to goal
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-64 w-full flex items-center justify-center flex-col bg-[#101935] rounded-lg border border-gray-800">
          <p className="text-gray-400">No learning activity recorded in this period</p>
          {selectedTopic !== "All" && (
            <p className="text-gray-500 text-sm mt-2">Try selecting a different topic or &quot;All&quot;</p>
          )}
        </div>
      )}
      
      {hasActivity && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#101935] p-3 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 hover:bg-[#131C3D]">
            <div className="flex items-center mb-1">
              <p className="text-sm text-gray-400">Active Days</p>
              <div className="ml-1 text-gray-500 cursor-help group relative">
                <FaInfoCircle size={12} />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-[#161b22] text-xs text-gray-300 rounded border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  Days with at least one study session recorded.
                </div>
              </div>
            </div>
            <p className="text-xl font-semibold text-white">{activeDays} of 7 days</p>
          </div>
          
          <div className="bg-[#101935] p-3 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 hover:bg-[#131C3D]">
            <div className="flex items-center mb-1">
              <p className="text-sm text-gray-400">Avg. Per Active Day</p>
              <div className="ml-1 text-gray-500 cursor-help group relative">
                <FaInfoCircle size={12} />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-[#161b22] text-xs text-gray-300 rounded border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  Average minutes spent studying on days with activity.
                </div>
              </div>
            </div>
            <p className="text-xl font-semibold text-white">
              {avgMinutesPerActiveDay >= 60 
                ? `${Math.floor(avgMinutesPerActiveDay / 60)}h ${avgMinutesPerActiveDay % 60}m`
                : `${avgMinutesPerActiveDay} min`}
            </p>
          </div>
          
          <div className="bg-[#101935] p-3 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 hover:bg-[#131C3D]">
            <div className="flex items-center mb-1">
              <p className="text-sm text-gray-400">Current Streak</p>
              <div className="ml-1 text-gray-500 cursor-help group relative">
                <FaInfoCircle size={12} />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-[#161b22] text-xs text-gray-300 rounded border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  Consecutive days with learning activity.
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <p className="text-xl font-semibold text-white">{streak.current} days</p>
              {streak.current > 0 && <FaFireAlt className="ml-2 text-orange-400" />}
            </div>
            <p className="text-xs text-gray-400 mt-1">Longest: {streak.longest} days</p>
          </div>
          
          <div className="bg-[#101935] p-3 rounded-lg border border-gray-800 transition-all duration-300 hover:border-gray-700 hover:bg-[#131C3D]">
            <div className="flex items-center mb-1">
              <p className="text-sm text-gray-400">Weekly Goal</p>
              <div className="ml-1 text-gray-500 cursor-help group relative">
                <FaInfoCircle size={12} />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-[#161b22] text-xs text-gray-300 rounded border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  Progress toward {TOTAL_DAILY_GOAL_MINUTES} minutes per day (weekly total).
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mt-2 mb-2">
              <div 
                className={`h-full ${weeklyGoalProgress.isComplete ? 'bg-gradient-to-r from-[#39d353] to-[#00FFF0]' : 'bg-[#00A3FF]'}`}
                style={{ width: `${weeklyGoalProgress.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">{weeklyGoalProgress.percentage}%</span>
              {weeklyGoalProgress.isComplete ? (
                <span className="text-[#39d353]">Completed</span>
              ) : (
                <span className="text-gray-400">
                  {weeklyGoalProgress.minutesNeeded >= 60 
                    ? `${Math.floor(weeklyGoalProgress.minutesNeeded / 60)}h ${weeklyGoalProgress.minutesNeeded % 60}m needed`
                    : `${weeklyGoalProgress.minutesNeeded}min needed`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Weekly Insights Section */}
      {hasActivity && weeklyInsights.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-[#101935] to-[#0A1124] p-6 rounded-xl border border-gray-700 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00A3FF] to-[#00FFF0] opacity-5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#00FFF0] to-[#00A3FF] opacity-3 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-[#00A3FF] to-[#00FFF0] rounded-lg flex items-center justify-center mr-3">
                  <span className="text-sm">💡</span>
                </div>
                Weekly Insights
              </h3>
              <div className="flex items-center space-x-3">
                <div className="text-xs text-gray-400 bg-[#0A1124] px-3 py-1 rounded-full border border-gray-700">
                  {weeklyInsights.length} insight{weeklyInsights.length !== 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
                  className="p-2 rounded-lg bg-[#0A1124] border border-gray-700 text-gray-400 hover:text-[#00A3FF] hover:border-[#00A3FF] transition-all duration-300 group"
                  title={isInsightsExpanded ? "Collapse insights" : "Expand insights"}
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${isInsightsExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out ${
              isInsightsExpanded 
                ? 'max-h-[1000px] opacity-100' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
              <div className="grid grid-cols-1 gap-4">
                {weeklyInsights.map((insight, index) => {
                  const getInsightStyle = (type: string) => {
                    switch (type) {
                      case "positive":
                        return {
                          bg: "bg-gradient-to-r from-[#0e4429] to-[#0a3d1f]",
                          border: "border-[#39d353]",
                          text: "text-[#39d353]",
                          icon: "bg-[#39d353]",
                          glow: "shadow-[0_0_20px_rgba(57,211,83,0.1)]"
                        };
                      case "improvement":
                        return {
                          bg: "bg-gradient-to-r from-[#350c0c] to-[#2d0a0a]",
                          border: "border-[#f85149]",
                          text: "text-[#f85149]",
                          icon: "bg-[#f85149]",
                          glow: "shadow-[0_0_20px_rgba(248,81,73,0.1)]"
                        };
                      case "highlight":
                        return {
                          bg: "bg-gradient-to-r from-[#1f2937] to-[#1a202c]",
                          border: "border-[#00A3FF]",
                          text: "text-[#00A3FF]",
                          icon: "bg-[#00A3FF]",
                          glow: "shadow-[0_0_20px_rgba(0,163,255,0.1)]"
                        };
                      default:
                        return {
                          bg: "bg-gradient-to-r from-[#1f2937] to-[#1a202c]",
                          border: "border-gray-600",
                          text: "text-gray-300",
                          icon: "bg-gray-600",
                          glow: "shadow-[0_0_10px_rgba(107,114,128,0.1)]"
                        };
                    }
                  };
                  
                  const style = getInsightStyle(insight.type);
                  
                  return (
                    <div 
                      key={index} 
                      className={`${style.bg} ${style.glow} p-4 rounded-lg border ${style.border} border-opacity-30 hover:border-opacity-50 transition-all duration-300 hover:transform hover:scale-[1.02] group`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 ${style.icon} bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <span className="text-lg">{insight.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`${style.text} font-medium leading-relaxed`}>
                            {insight.text}
                          </p>
                          {insight.type === "positive" && (
                            <div className="mt-2 text-xs text-green-400 opacity-75">
                              Keep up the excellent work! 🚀
                            </div>
                          )}
                          {insight.type === "improvement" && (
                            <div className="mt-2 text-xs text-red-400 opacity-75">
                              Small changes can make a big difference 💪
                            </div>
                          )}
                          {insight.type === "highlight" && (
                            <div className="mt-2 text-xs text-blue-400 opacity-75">
                              Celebrating your achievements! 🎉
                            </div>
                          )}
                        </div>
                        <div className={`w-2 h-2 ${style.icon} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Summary footer */}
              <div className="mt-6 pt-4 border-t border-gray-700 border-opacity-50">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Based on your last 7 days of activity</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#00A3FF] rounded-full animate-pulse"></div>
                    <span>Live insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningTrend; 