"use client";

import React, { useMemo } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { StudySession } from './LearningHeatmap';

interface YearFilterProps {
  data: StudySession[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

const YearFilter: React.FC<YearFilterProps> = ({ data, selectedYear, onYearChange }) => {
  // Get current year for default selection
  const currentYear = new Date().getFullYear().toString();
  
  // Extract unique years from data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    
    // Add "All" option
    years.add("All");
    
    // Always add current year for the filter
    years.add(currentYear);
    
    // Extract years from dates
    data.forEach(session => {
      const year = session.date.substring(0, 4);
      years.add(year);
    });
    
    // Sort years in descending order (newest first)
    return Array.from(years)
      .sort()
      .reverse();
  }, [data, currentYear]);
  
  return (
    <div className="flex items-center space-x-3 mb-6">
      <div className="flex items-center text-white">
        <FaCalendarAlt className="text-[#00A3FF] mr-2" />
        <span className="font-medium">Year:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableYears.map(year => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              selectedYear === year
                ? 'bg-[#0B8DCD] text-white'
                : 'bg-[#101935] text-gray-300 hover:bg-[#162042]'
            }`}
          >
            {year === "All" ? "All Years" : year}
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearFilter; 