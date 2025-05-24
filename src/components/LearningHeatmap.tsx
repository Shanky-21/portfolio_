"use client";

import React, { useMemo } from 'react';
import CalendarHeatmap, { CalendarHeatmapValue } from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import { subDays, format, eachDayOfInterval, parseISO, isWithinInterval } from 'date-fns';
import 'react-calendar-heatmap/dist/styles.css';
import { FaRegCalendarAlt } from 'react-icons/fa';

// Types
export interface StudySession {
  date: string;
  topic: string;
  minutes: number;
}

interface LearningHeatmapProps {
  data: StudySession[];
  selectedTopic: string;
}

const LearningHeatmap: React.FC<LearningHeatmapProps> = ({ data, selectedTopic }) => {
  // Determine the date range based on the data
  const { startDate, endDate } = useMemo(() => {
    // Get the year from the first entry (assumes data is already filtered by year if needed)
    if (data.length === 0) {
      // Default to current year if no data
      const today = new Date();
      const yearStart = new Date(today.getFullYear(), 0, 1); // January 1st
      
      // Important: Set startDate to December 31st of the previous year to ensure Jan 1 shows
      const adjustedStart = new Date(yearStart);
      adjustedStart.setDate(adjustedStart.getDate() - 1);
      
      return {
        startDate: adjustedStart,
        endDate: today
      };
    }
    
    // Check if data seems to be filtered to a specific year
    const uniqueYears = new Set(data.map(item => item.date.substring(0, 4)));
    
    // If there's just one year in the data, show that full year
    if (uniqueYears.size === 1) {
      const year = Array.from(uniqueYears)[0];
      
      // Create January 1st of the year
      const yearStart = new Date(parseInt(year), 0, 1); // Month is 0-indexed (0 = January)
      
      // Important: Set startDate to December 31st of the previous year to ensure Jan 1 shows
      const adjustedStart = new Date(yearStart);
      adjustedStart.setDate(adjustedStart.getDate() - 1);
      
      // For year view, always show full year including future dates
      const yearEnd = new Date(parseInt(year), 11, 31); // December 31st
      
      return {
        startDate: adjustedStart,
        endDate: yearEnd
      };
    }
    
    // Otherwise show the last 365 days
    const today = new Date();
    const lastYear = subDays(today, 365);
    
    // Important: Set startDate to the day before the actual start date
    const adjustedStart = subDays(lastYear, 1);
    
    return {
      startDate: adjustedStart,
      endDate: today
    };
  }, [data]);
  
  // Filter by selected topic if not "All"
  const filteredData = useMemo(() => {
    if (selectedTopic === "All") {
      return data;
    }
    return data.filter(session => session.topic === selectedTopic);
  }, [data, selectedTopic]);
  
  // Generate all dates in the range to ensure every day has a value
  const allDatesInRange = useMemo(() => {
    // Get all dates in the range
    const dates = eachDayOfInterval({ 
      start: startDate, 
      end: endDate 
    });
    
    // Create a map with all dates initialized to 0 minutes
    const dateMap = new Map<string, { count: number; topics: Record<string, number> }>();
    
    // Important: Initialize the map with all dates in the range
    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      dateMap.set(dateStr, { count: 0, topics: {} });
    });
    
    // Add actual data
    filteredData.forEach(session => {
      // Only include data within our display range
      const sessionDate = parseISO(session.date);
      if (isWithinInterval(sessionDate, { start: startDate, end: endDate })) {
        const existing = dateMap.get(session.date) || { count: 0, topics: {} };
        existing.count += session.minutes;
        
        // Track minutes per topic for this day
        existing.topics[session.topic] = (existing.topics[session.topic] || 0) + session.minutes;
        
        dateMap.set(session.date, existing);
      }
    });
    
    // Convert to array for the heatmap
    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      topics: data.topics
    }));
  }, [filteredData, startDate, endDate]);
  
  // Display a counter at the top similar to GitHub
  const totalStudyMinutes = useMemo(() => 
    allDatesInRange.reduce((sum, { count }) => sum + count, 0),
    [allDatesInRange]
  );
  
  // Determine if we're showing a single year view
  const isSingleYearView = useMemo(() => {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    return startYear === endYear;
  }, [startDate, endDate]);
  
  // Determine the text to display for the date range
  const dateRangeText = useMemo(() => {
    if (isSingleYearView) {
      return `${totalStudyMinutes} minutes in ${startDate.getFullYear()}`;
    } else {
      // If showing data from more than one year, specify the range
      const fromYear = startDate.getFullYear();
      const toYear = endDate.getFullYear();
      return `${totalStudyMinutes} minutes from ${fromYear} to ${toYear}`;
    }
  }, [isSingleYearView, startDate, endDate, totalStudyMinutes]);
  
  // Format tooltip content
  const getTooltipContent = (value: CalendarHeatmapValue | null) => {
    if (!value || !value.date) {
      return 'Outside of range';
    }
    
    const dateObj = new Date(value.date);
    const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');
    
    if (!value.count || value.count === 0) {
      return `No activity on ${formattedDate}`;
    }
    
    let content = `<strong>${value.count} minutes</strong> on ${formattedDate}`;
    
    // If we're showing all topics and have topic breakdown, show it
    if (selectedTopic === "All" && value.topics) {
      const topicList = Object.entries(value.topics as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .map(([topic, mins]) => `<div class="ml-2 mt-1">• <span class="text-[#8b949e]">${topic}:</span> ${mins} min</div>`)
        .join('');
      
      if (topicList) {
        content += `<div class="mt-1 text-xs">Topics:</div>${topicList}`;
      }
    }
    
    return content;
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <FaRegCalendarAlt className="mr-2 text-[#00A3FF]" />
            Learning Activity
            {selectedTopic !== "All" && <span className="ml-2 text-sm font-normal text-gray-400">({selectedTopic})</span>}
          </h2>
          <p className="ml-4 text-sm text-gray-400">
            {dateRangeText}
          </p>
        </div>
        
        <div className="flex items-center gap-1 text-xs">
          <span className="text-gray-400">Less</span>
          <div className="w-3 h-3 bg-[#161b22] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#0e4429] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#006d32] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#26a641] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#39d353] rounded-sm"></div>
          <span className="text-gray-400">More</span>
        </div>
      </div>
      
      <div className="bg-[#0d1117] rounded-lg overflow-x-auto border border-gray-800">
        <div className="px-2 py-4 max-w-full">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={allDatesInRange as CalendarHeatmapValue[]}
            classForValue={(value) => {
              if (!value || value.count === undefined || value.count === 0) {
                return 'color-empty'; 
              }
              
              // GitHub style color mapping
              if (value.count < 30) {
                return 'color-scale-1';
              } else if (value.count < 60) {
                return 'color-scale-2';
              } else if (value.count < 120) {
                return 'color-scale-3';
              } else {
                return 'color-scale-4';
              }
            }}
            tooltipDataAttrs={(value) => ({
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-html': getTooltipContent(value)
            })}
            showWeekdayLabels={true}
            weekdayLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
            monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
            gutterSize={1}
          />
        </div>
      </div>
      
      <Tooltip id="heatmap-tooltip" className="tooltip" style={{ 
        backgroundColor: '#161b22', 
        color: 'white', 
        padding: '8px 10px', 
        borderRadius: '6px', 
        fontSize: '12px', 
        border: '1px solid #30363d',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
      }} />

      {/* Custom GitHub style for heatmap */}
      <style jsx global>{`
        /* Overall padding and layout */
        .react-calendar-heatmap {
          padding-top: 10px;
        }
        
        /* Weekday labels style */
        .react-calendar-heatmap .react-calendar-heatmap-weekday-labels {
          font-size: 9px;
          color: #7d8590;
          margin-right: 4px;
        }
        
        /* Month labels style */
        .react-calendar-heatmap .react-calendar-heatmap-month-labels {
          font-size: 10px;
          color: #7d8590;
          padding-top: 5px;
          padding-bottom: 10px;
        }
        
        /* Month label spacing */
        .react-calendar-heatmap .react-calendar-heatmap-month-label {
          margin-right: 0;
          padding-left: 4px;
        }
        
        /* Day labels spacing */
        .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
          margin-bottom: 6px;
          height: 20px;
          line-height: 14px;
        }
        
        /* Extra space between heatmap rows */
        .react-calendar-heatmap .react-calendar-heatmap-week {
          margin-bottom: 1px;
        }
        
        /* Cell empty color */
        .react-calendar-heatmap .color-empty {
          fill: #161b22;
        }
        
        /* Cell colors for activity levels */
        .react-calendar-heatmap .color-scale-1 {
          fill: #0e4429;
        }
        
        .react-calendar-heatmap .color-scale-2 {
          fill: #006d32;
        }
        
        .react-calendar-heatmap .color-scale-3 {
          fill: #26a641;
        }
        
        .react-calendar-heatmap .color-scale-4 {
          fill: #39d353;
        }
        
        /* Cell shape and size */
        .react-calendar-heatmap rect {
          rx: 2;
          ry: 2;
          width: 10px;
          height: 10px;
        }
        
        /* Adjust the overall width to be more compact */
        .react-calendar-heatmap text {
          font-size: 8px;
        }
        
        /* Make sure month labels align correctly with their month cells */
        .react-calendar-heatmap-month-label {
          text-anchor: start;
        }
      `}</style>
    </div>
  );
};

export default LearningHeatmap; 