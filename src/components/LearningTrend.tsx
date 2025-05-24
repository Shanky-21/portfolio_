"use client";

import React, { useMemo } from 'react';
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
  Filler
} from 'chart.js';
import { subDays, format, isWithinInterval, parseISO } from 'date-fns';
import { StudySession } from './LearningHeatmap';
import { FaChartLine } from 'react-icons/fa';

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
  const lastWeekStart = subDays(referenceDate, 6); // Get last 7 days including reference date
  
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
  
  // Chart data and options
  const chartData = {
    labels: recentData.map(day => day.formattedDate),
    datasets: [
      {
        label: selectedTopic === "All" ? 'All Topics' : selectedTopic,
        data: recentData.map(day => day.minutes),
        borderColor: '#00A3FF',
        backgroundColor: 'rgba(0, 163, 255, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#00A3FF',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  
  const chartOptions: any = {
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
          callback: function(value: any) {
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
          title: function(tooltipItems: any) {
            return tooltipItems[0].label;
          },
          label: function(context: any) {
            const minutes = context.parsed.y;
            return `${minutes} minutes studied`;
          }
        }
      }
    },
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
            Total: <span className="font-semibold text-white">{totalWeekMinutes} min</span>
          </div>
          
          {trendDirection !== "neutral" && (
            <div className={`text-sm px-3 py-1 rounded-md ${
              trendDirection === "up" 
                ? "bg-[#0e4429] text-[#39d353]" 
                : "bg-[#350c0c] text-[#f85149]"
            }`}>
              {trendDirection === "up" ? "Trending Up" : "Trending Down"}
            </div>
          )}
        </div>
      </div>
      
      {hasActivity ? (
        <div className="h-64 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="h-64 w-full flex items-center justify-center flex-col bg-[#101935] rounded-lg border border-gray-800">
          <p className="text-gray-400">No learning activity recorded in this period</p>
          {selectedTopic !== "All" && (
            <p className="text-gray-500 text-sm mt-2">Try selecting a different topic or "All"</p>
          )}
        </div>
      )}
      
      {hasActivity && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-[#101935] p-3 rounded-lg border border-gray-800">
            <p className="text-sm text-gray-400">Active Days</p>
            <p className="text-xl font-semibold text-white">{activeDays} of 7 days</p>
          </div>
          
          <div className="bg-[#101935] p-3 rounded-lg border border-gray-800">
            <p className="text-sm text-gray-400">Avg. Per Active Day</p>
            <p className="text-xl font-semibold text-white">{avgMinutesPerActiveDay} min</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningTrend; 