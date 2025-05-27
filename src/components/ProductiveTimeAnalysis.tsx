"use client";

import React, { useMemo } from 'react';
import { StudySession } from './LearningHeatmap';
import { FaClock, FaChartBar, FaFireAlt, FaSun, FaMoon, FaStopwatch } from 'react-icons/fa';

interface ProductiveTimeAnalysisProps {
  data: StudySession[];
  selectedTopic: string;
}

interface HourlyData {
  hour: number;
  totalMinutes: number;
  sessionCount: number;
  avgSessionLength: number;
  productivity: number; // minutes per session
}

const ProductiveTimeAnalysis: React.FC<ProductiveTimeAnalysisProps> = ({ data, selectedTopic }) => {
  // Filter data by topic and only include sessions with time data
  const filteredData = useMemo(() => {
    const filtered = selectedTopic === "All" ? data : data.filter(session => session.topic === selectedTopic);
    return filtered.filter(session => session.startTime && session.endTime);
  }, [data, selectedTopic]);

  // Calculate hourly productivity data
  const hourlyData = useMemo(() => {
    const hourlyStats: Record<number, { totalMinutes: number; sessionCount: number; sessions: StudySession[] }> = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyStats[i] = { totalMinutes: 0, sessionCount: 0, sessions: [] };
    }
    
    filteredData.forEach(session => {
      if (!session.startTime || !session.endTime) return;
      
      const startHour = parseInt(session.startTime.split(':')[0]);
      const endHour = parseInt(session.endTime.split(':')[0]);
      const startMinute = parseInt(session.startTime.split(':')[1]);
      const endMinute = parseInt(session.endTime.split(':')[1]);
      
      // Calculate session duration
      const sessionDuration = session.minutes;
      
      // For sessions spanning multiple hours, distribute the time
      if (startHour === endHour) {
        // Session within the same hour
        hourlyStats[startHour].totalMinutes += sessionDuration;
        hourlyStats[startHour].sessionCount += 1;
        hourlyStats[startHour].sessions.push(session);
      } else {
        // Session spans multiple hours - distribute proportionally
        const totalSessionMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        
        for (let hour = startHour; hour <= endHour; hour++) {
          let minutesInThisHour = 0;
          
          if (hour === startHour) {
            // First hour: from start time to end of hour
            minutesInThisHour = 60 - startMinute;
          } else if (hour === endHour) {
            // Last hour: from start of hour to end time
            minutesInThisHour = endMinute;
          } else {
            // Middle hours: full 60 minutes
            minutesInThisHour = 60;
          }
          
          // Calculate proportional contribution
          const proportion = minutesInThisHour / totalSessionMinutes;
          const contributedMinutes = sessionDuration * proportion;
          
          hourlyStats[hour].totalMinutes += contributedMinutes;
          hourlyStats[hour].sessionCount += (hour === startHour ? 1 : 0); // Count session only in start hour
          if (hour === startHour) {
            hourlyStats[hour].sessions.push(session);
          }
        }
      }
    });
    
    // Convert to array format with productivity metrics
    return Array.from({ length: 24 }, (_, hour): HourlyData => {
      const stats = hourlyStats[hour];
      const avgSessionLength = stats.sessionCount > 0 ? stats.totalMinutes / stats.sessionCount : 0;
      
      return {
        hour,
        totalMinutes: Math.round(stats.totalMinutes),
        sessionCount: stats.sessionCount,
        avgSessionLength: Math.round(avgSessionLength),
        productivity: Math.round(avgSessionLength) // Using avg session length as productivity metric
      };
    });
  }, [filteredData]);

  // Find peak hours
  const peakHours = useMemo(() => {
    const sortedByMinutes = [...hourlyData]
      .filter(h => h.totalMinutes > 0)
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
    
    const sortedByProductivity = [...hourlyData]
      .filter(h => h.productivity > 0)
      .sort((a, b) => b.productivity - a.totalMinutes);
    
    return {
      mostActive: sortedByMinutes.slice(0, 3),
      mostProductive: sortedByProductivity.slice(0, 3)
    };
  }, [hourlyData]);

  // Calculate time periods
  const timePeriods = useMemo(() => {
    const morning = hourlyData.slice(6, 12).reduce((sum, h) => sum + h.totalMinutes, 0);
    const afternoon = hourlyData.slice(12, 18).reduce((sum, h) => sum + h.totalMinutes, 0);
    const evening = hourlyData.slice(18, 24).reduce((sum, h) => sum + h.totalMinutes, 0);
    const night = [...hourlyData.slice(0, 6), ...hourlyData.slice(22, 24)].reduce((sum, h) => sum + h.totalMinutes, 0);
    
    const periods = [
      { name: 'Morning', time: '6AM-12PM', minutes: morning, icon: <FaSun className="text-yellow-400" /> },
      { name: 'Afternoon', time: '12PM-6PM', minutes: afternoon, icon: <FaSun className="text-orange-400" /> },
      { name: 'Evening', time: '6PM-12AM', minutes: evening, icon: <FaMoon className="text-blue-400" /> },
      { name: 'Night', time: '12AM-6AM', minutes: night, icon: <FaMoon className="text-purple-400" /> }
    ];
    
    return periods.sort((a, b) => b.minutes - a.minutes);
  }, [hourlyData]);

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const maxMinutes = Math.max(...hourlyData.map(h => h.totalMinutes));

  if (filteredData.length === 0) {
    return (
      <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
          <FaClock className="mr-3 text-[#00A3FF]" />
          Productive Time Analysis
        </h2>
        <div className="text-center py-8">
          <FaClock className="mx-auto text-gray-600 text-4xl mb-4" />
          <p className="text-gray-400">No session time data available yet.</p>
          <p className="text-gray-500 text-sm mt-2">Start adding sessions with start/end times to see your productivity patterns!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaClock className="mr-3 text-[#00A3FF]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
              Productive Time Analysis
            </span>
            {selectedTopic !== "All" && <span className="ml-2 text-lg font-normal text-gray-400">({selectedTopic})</span>}
          </h2>
          <p className="text-gray-300 mt-1">
            Based on {filteredData.length} sessions with time data
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Peak Hour</div>
            <div className="text-lg font-semibold text-[#00A3FF]">
              {peakHours.mostActive[0] ? formatHour(peakHours.mostActive[0].hour) : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Best Period</div>
            <div className="text-lg font-semibold text-[#00FFF0]">
              {timePeriods[0]?.name || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaChartBar className="mr-2 text-blue-400" />
          24-Hour Activity Pattern
        </h3>
        
        <div className="bg-[#101935] p-4 rounded-lg border border-gray-800">
          <div className="grid grid-cols-12 gap-1 mb-4">
            {hourlyData.map((hour, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-full bg-gray-800 rounded-t relative group cursor-pointer transition-all duration-300 hover:bg-gray-700"
                  style={{ 
                    height: '80px',
                    backgroundImage: hour.totalMinutes > 0 
                      ? `linear-gradient(to top, #00A3FF 0%, #00A3FF ${(hour.totalMinutes / maxMinutes) * 100}%, transparent ${(hour.totalMinutes / maxMinutes) * 100}%)`
                      : 'none'
                  }}
                >
                  {hour.totalMinutes > 0 && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#161b22] border border-gray-700 rounded px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      {hour.totalMinutes}min
                      {hour.sessionCount > 0 && (
                        <div className="text-gray-400">{hour.sessionCount} sessions</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-top-left">
                  {index % 3 === 0 ? formatHour(hour.hour).replace(' ', '') : ''}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>12AM</span>
            <span>6AM</span>
            <span>12PM</span>
            <span>6PM</span>
            <span>11PM</span>
          </div>
        </div>
      </div>

      {/* Time Period Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaFireAlt className="mr-2 text-orange-400" />
            Peak Performance Times
          </h3>
          
          <div className="space-y-3">
            {peakHours.mostActive.map((hour, index) => (
              <div key={hour.hour} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-gray-400 text-black' : 
                    'bg-amber-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 text-white font-medium">{formatHour(hour.hour)}</span>
                </div>
                <div className="text-right">
                  <div className="text-[#00A3FF] font-semibold">{hour.totalMinutes} min</div>
                  <div className="text-gray-400 text-xs">{hour.sessionCount} sessions</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaStopwatch className="mr-2 text-green-400" />
            Time Period Breakdown
          </h3>
          
          <div className="space-y-3">
            {timePeriods.map((period, index) => (
              <div key={period.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {period.icon}
                    <span className="ml-2 text-gray-300">{period.name}</span>
                    <span className="ml-1 text-gray-500 text-xs">({period.time})</span>
                  </div>
                  <span className="text-white font-semibold">
                    {period.minutes >= 60 ? `${Math.floor(period.minutes / 60)}h ${period.minutes % 60}m` : `${period.minutes}m`}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      index === 0 ? 'bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]' : 'bg-gray-600'
                    }`} 
                    style={{ 
                      width: `${Math.min(100, (period.minutes / (timePeriods[0]?.minutes || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-3">🎯 Productivity Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-gray-300 text-sm">
              <span className="text-[#00A3FF] font-semibold">Most productive period:</span> {timePeriods[0]?.name} 
              ({timePeriods[0]?.minutes >= 60 ? `${Math.floor(timePeriods[0]?.minutes / 60)}h ${timePeriods[0]?.minutes % 60}m` : `${timePeriods[0]?.minutes}m`})
            </p>
            <p className="text-gray-300 text-sm">
              <span className="text-[#00A3FF] font-semibold">Peak hour:</span> {peakHours.mostActive[0] ? formatHour(peakHours.mostActive[0].hour) : 'N/A'}
              {peakHours.mostActive[0] && ` (${peakHours.mostActive[0].totalMinutes} minutes)`}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-300 text-sm">
              <span className="text-[#00A3FF] font-semibold">Active hours:</span> {hourlyData.filter(h => h.totalMinutes > 0).length} out of 24
            </p>
            <p className="text-gray-300 text-sm">
              <span className="text-[#00A3FF] font-semibold">Avg session length:</span> {
                filteredData.length > 0 
                  ? Math.round(filteredData.reduce((sum, s) => sum + s.minutes, 0) / filteredData.length)
                  : 0
              } minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductiveTimeAnalysis; 