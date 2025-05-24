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

// Daily study goal in minutes
const DAILY_GOAL = 300; // 5 hours in minutes

const LearningTrend: React.FC<LearningTrendProps> = ({ data, selectedTopic }) => {
  // State for selected point on the chart
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  
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
  
  // Calculate trend direction
  const trendDirection = useMemo(() => {
    // Need at least 2 data points with activity to determine trend
    const daysWithActivity = recentData.filter(day => day.minutes > 0);
    if (daysWithActivity.length < 2) return "neutral";
    
    // Check if most recent day has activity
    const lastDay = recentData[recentData.length - 1];
    const secondLastDay = recentData[recentData.length - 2];
    
    // Simple trend based on last two days with activity
    if (lastDay.minutes > secondLastDay.minutes) return "up";
    if (lastDay.minutes < secondLastDay.minutes) return "down";
    return "neutral";
  }, [recentData]);
  
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
      if (minutes >= DAILY_GOAL) {
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
    const weeklyGoal = DAILY_GOAL * daysInWeek;
    const totalMinutes = recentData.reduce((sum, day) => sum + day.minutes, 0);
    const percentage = Math.min(100, Math.round((totalMinutes / weeklyGoal) * 100));
    
    return {
      percentage,
      isComplete: percentage >= 100,
      minutesNeeded: Math.max(0, weeklyGoal - totalMinutes)
    };
  }, [recentData]);
  
  // Chart data and options
  const chartData: ChartData<'line', number[], string> = {
    labels: recentData.map(day => day.formattedDate),
    datasets: [
      {
        label: selectedTopic === "All" ? 'All Topics' : selectedTopic,
        data: recentData.map(day => day.minutes),
        borderColor: '#00A3FF',
        backgroundColor: 'rgba(0, 163, 255, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: (context) => {
          // Highlight selected point
          return selectedPoint === context.dataIndex ? '#ffffff' : '#00A3FF';
        },
        pointBorderColor: (context) => {
          return selectedPoint === context.dataIndex ? '#00A3FF' : '#00A3FF';
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
        display: false,
      },
      tooltip: {
        backgroundColor: '#161b22',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#30363d',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: function(tooltipItems: TooltipItem<'line'>[]) {
            return tooltipItems[0].label;
          },
          label: function(context: TooltipItem<'line'>) {
            const minutes = context.parsed.y;
            if (minutes < 60) {
              return `${minutes} minutes studied`;
            } else {
              const hours = Math.floor(minutes / 60);
              const remainingMinutes = minutes % 60;
              if (remainingMinutes === 0) {
                return `${hours} hour${hours !== 1 ? 's' : ''} studied`;
              }
              return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} min studied`;
            }
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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <FaChartLine className="mr-2 text-[#00A3FF]" />
            Recent Trend
            {selectedTopic !== "All" && <span className="ml-2 text-sm font-normal text-gray-400">({selectedTopic})</span>}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{dateRangeText}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm px-3 py-1 rounded-md bg-[#101935] text-gray-300">
            Total: <span className="font-semibold text-white">
              {totalWeekMinutes >= 60 ? `${Math.floor(totalWeekMinutes / 60)}h ${totalWeekMinutes % 60}m` : `${totalWeekMinutes} min`}
            </span>
          </div>
          
          {trendDirection !== "neutral" && (
            <div className={`text-sm px-3 py-1 rounded-md flex items-center ${
              trendDirection === "up" 
                ? "bg-[#0e4429] text-[#39d353]" 
                : "bg-[#350c0c] text-[#f85149]"
            }`}>
              {trendDirection === "up" ? "↗ Trending Up" : "↘ Trending Down"}
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
                
                {selectedDayInfo.minutes >= DAILY_GOAL ? (
                  <div className="ml-auto text-[#39d353] flex items-center text-xs">
                    <FaCheck className="mr-1" />
                    Daily goal met
                  </div>
                ) : (
                  <div className="ml-auto text-[#f85149] flex items-center text-xs">
                    <FaExclamationTriangle className="mr-1" />
                    {DAILY_GOAL - selectedDayInfo.minutes}min to goal
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
                  Progress toward {DAILY_GOAL} minutes per day (weekly total).
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
    </div>
  );
};

export default LearningTrend; 