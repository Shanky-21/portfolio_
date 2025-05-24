"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { StudySession } from './LearningHeatmap';
import { FaFilter, FaSearch, FaTimes, FaSortAmountDown } from 'react-icons/fa';

interface TopicFilterProps {
  data: StudySession[];
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

type GroupedTopics = {
  [key: string]: {
    minutes: number;
    topics: string[];
  }
};

const TopicFilter: React.FC<TopicFilterProps> = ({ data, selectedTopic, onTopicChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Extract unique topics and their total minutes
  const { topics, topicMinutes } = useMemo(() => {
    const uniqueTopics = new Set<string>();
    const minutesByTopic: Record<string, number> = {};
    
    data.forEach(session => {
      uniqueTopics.add(session.topic);
      minutesByTopic[session.topic] = (minutesByTopic[session.topic] || 0) + session.minutes;
    });
    
    return {
      topics: ['All', ...Array.from(uniqueTopics)].sort(),
      topicMinutes: minutesByTopic
    };
  }, [data]);
  
  // Group topics by category (first word) for large sets
  const groupedTopics = useMemo(() => {
    const grouped: GroupedTopics = {};
    
    // Skip "All" which is at index 0
    topics.slice(1).forEach(topic => {
      // Try to get a category from the topic (first word or before a separator)
      const category = topic.split(/[\s-_]/)[0] || 'Other';
      
      if (!grouped[category]) {
        grouped[category] = {
          minutes: 0,
          topics: []
        };
      }
      
      grouped[category].topics.push(topic);
      grouped[category].minutes += topicMinutes[topic] || 0;
    });
    
    return grouped;
  }, [topics, topicMinutes]);
  
  // Filter topics based on search term
  const filteredTopics = useMemo(() => {
    if (!searchTerm) return topics;
    
    return topics.filter(topic => 
      topic.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topics, searchTerm]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };
  
  const handleSelectTopic = (topic: string) => {
    onTopicChange(topic);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  const hasMultipleCategories = Object.keys(groupedTopics).length > 1;
  const hasLotsOfTopics = topics.length > 10;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <label className="block mb-2 md:mb-0 text-sm font-medium text-gray-300 flex items-center">
          <FaFilter className="mr-2 text-[#00A3FF]" />
          Filter by Topic:
        </label>
        
        <div className="relative w-full md:w-64" ref={dropdownRef}>
          {/* Current selection button */}
          <button
            onClick={handleToggleDropdown}
            className="flex items-center justify-between w-full p-3 text-white bg-[#101935] border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition-all duration-300 hover:bg-[#132145]"
          >
            <span className="truncate">
              {selectedTopic}
              {selectedTopic !== "All" && (
                <span className="ml-2 text-xs text-gray-400">({topicMinutes[selectedTopic] || 0} min)</span>
              )}
            </span>
            <FaFilter className="text-gray-400" />
          </button>
          
          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-[#0A1124] border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-hidden">
              {/* Search box for many topics */}
              {hasLotsOfTopics && (
                <div className="p-3 border-b border-gray-700">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm text-white bg-[#101935] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3FF]"
                    />
                    <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="max-h-80 overflow-y-auto py-2 scrollbar-thin">
                {/* "All" option is always shown first */}
                <button
                  className={`flex items-center justify-between w-full px-4 py-2 text-left hover:bg-[#132145] ${selectedTopic === 'All' ? 'bg-[#132145] text-[#00A3FF]' : 'text-white'}`}
                  onClick={() => handleSelectTopic('All')}
                >
                  <span>All Topics</span>
                  <span className="text-xs text-gray-400">
                    {topics.length - 1} topics
                  </span>
                </button>
                
                {/* Divider */}
                <div className="my-1 border-t border-gray-700"></div>
                
                {hasLotsOfTopics && hasMultipleCategories ? (
                  // Show topics grouped by category for large sets
                  Object.entries(groupedTopics)
                    .sort(([,a], [,b]) => b.minutes - a.minutes)
                    .map(([category, { topics: categoryTopics, minutes }]) => {
                      // Filter category topics by search term
                      const filteredCategoryTopics = searchTerm
                        ? categoryTopics.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
                        : categoryTopics;
                        
                      if (filteredCategoryTopics.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-2">
                          <div className="px-4 py-1 text-xs text-gray-400 flex items-center justify-between">
                            <span>{category}</span>
                            <span>{minutes} min</span>
                          </div>
                          {filteredCategoryTopics
                            .sort((a, b) => (topicMinutes[b] || 0) - (topicMinutes[a] || 0))
                            .map(topic => (
                              <button
                                key={topic}
                                className={`flex items-center justify-between w-full px-6 py-2 text-left hover:bg-[#132145] ${selectedTopic === topic ? 'bg-[#132145] text-[#00A3FF]' : 'text-white'}`}
                                onClick={() => handleSelectTopic(topic)}
                              >
                                <span className="truncate">{topic}</span>
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                  {topicMinutes[topic]} min
                                </span>
                              </button>
                            ))
                          }
                        </div>
                      );
                    })
                ) : (
                  // Show flat list for fewer topics or when searching
                  filteredTopics
                    .filter(topic => topic !== 'All') // "All" is already shown
                    .sort((a, b) => (topicMinutes[b] || 0) - (topicMinutes[a] || 0))
                    .map(topic => (
                      <button
                        key={topic}
                        className={`flex items-center justify-between w-full px-4 py-2 text-left hover:bg-[#132145] ${selectedTopic === topic ? 'bg-[#132145] text-[#00A3FF]' : 'text-white'}`}
                        onClick={() => handleSelectTopic(topic)}
                      >
                        <span className="truncate">{topic}</span>
                        <span className="text-xs text-gray-400">
                          {topicMinutes[topic]} min
                        </span>
                      </button>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {selectedTopic !== "All" && (
        <div className="mt-4 px-4 py-2 bg-[#101935] border border-gray-700 rounded-lg inline-flex items-center">
          <span className="text-sm text-gray-300">Viewing sessions for topic: </span>
          <span className="ml-1 text-sm font-semibold text-[#00A3FF]">{selectedTopic}</span>
          <button 
            onClick={() => onTopicChange("All")}
            className="ml-3 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicFilter; 