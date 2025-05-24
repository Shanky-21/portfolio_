"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import LearningHeatmap, { StudySession } from '@/components/LearningHeatmap';
import LearningTrend from '@/components/LearningTrend';
import TopicFilter from '@/components/TopicFilter';
import YearFilter from '@/components/YearFilter';
import learningData from '@/data/learning-data.json';
import { FaChartLine, FaCalendarAlt, FaClock, FaLayerGroup, FaAward, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

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
                <p className="text-3xl font-bold text-white">{totalMinutes} min</p>
                <p className="text-gray-400 text-sm mt-1">
                  {Math.floor(totalMinutes / 60)} hours {totalMinutes % 60} minutes
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
                    <span className="text-gray-400">{minutes} min</span>
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
        
        <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
              Learning Trends
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h3 className="font-semibold text-white mb-2">Consistency</h3>
              <p className="text-gray-400 text-sm">
                You've logged {totalSessions} study sessions across {uniqueTopics} different topics
                {selectedYear !== "All" ? ` in ${selectedYear}` : ''}.
                Maintaining consistent study habits helps build skills effectively.
              </p>
            </div>
            
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h3 className="font-semibold text-white mb-2">Focus Area</h3>
              <p className="text-gray-400 text-sm">
                Your primary focus {selectedYear !== "All" ? `in ${selectedYear} ` : ''}has been on <span className="text-[#00A3FF]">{mostStudiedTopic.topic}</span> with 
                {' '}{Math.floor(mostStudiedTopic.minutes / 60)} hours {mostStudiedTopic.minutes % 60} minutes of dedicated study time.
              </p>
            </div>
            
            <div className="bg-[#101935] p-5 rounded-lg border border-gray-800">
              <h3 className="font-semibold text-white mb-2">Next Steps</h3>
              <p className="text-gray-400 text-sm">
                Consider exploring complementary topics to <span className="text-[#00A3FF]">{mostStudiedTopic.topic}</span> or 
                setting a goal to increase your average session length from {avgMinutesPerSession} minutes.
              </p>
            </div>
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
                      <span className="text-gray-400">{minutes} min</span>
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