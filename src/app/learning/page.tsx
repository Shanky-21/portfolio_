"use client";

import React, { useState, useMemo } from 'react';
import LearningHeatmap, { StudySession } from '@/components/LearningHeatmap';
import LearningTrend from '@/components/LearningTrend';
import TopicFilter from '@/components/TopicFilter';
import YearFilter from '@/components/YearFilter';
import ProductiveTimeAnalysis from '@/components/ProductiveTimeAnalysis';
import SeniorRolePreparation from '@/components/SeniorRolePreparation';
import GamificationSystem from '@/components/GamificationSystem';
import DailyInspiration from '@/components/DailyInspiration';
import learningData from '@/data/learning-data.json';
import { 
  FaChartLine, FaCalendarAlt, FaClock, FaLayerGroup, FaAward, FaExternalLinkAlt, 
  FaTimes, FaTrophy, FaFireAlt, FaBullseye, FaCrown
} from 'react-icons/fa';

// Tab definitions
const TABS = [
  { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
  { id: 'productive-times', label: 'Productive Times', icon: <FaBullseye /> },
  { id: 'senior-prep', label: 'Senior Role Prep', icon: <FaCrown /> },
  { id: 'gamification', label: 'Achievements', icon: <FaTrophy /> }
];

// Utility function to format time in hours and minutes
const formatTimeDisplay = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} min`;
};

const LearningPage: React.FC = () => {
  // Get current year for default selection
  const currentYear = new Date().getFullYear().toString();
  
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
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
    document.body.style.overflow = 'hidden';
  };

  const closeTopicsModal = () => {
    setShowTopicsModal(false);
    document.body.style.overflow = 'auto';
  };

  // Calculate quick stats for header
  const quickStats = useMemo(() => {
    const totalHours = Math.floor(totalMinutes / 60);
    const currentStreak = (() => {
      const dates = [...new Set(typedLearningData.map(s => s.date))].sort().reverse();
      const today = new Date().toISOString().split('T')[0];
      
      if (dates[0] !== today) return 0;
      
      let streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffTime = prevDate.getTime() - currDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    })();

    return { totalHours, currentStreak };
  }, [totalMinutes, typedLearningData]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-10">
            {/* Heatmap */}
            <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 p-6">
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

            {/* Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                    <p className="text-3xl font-bold text-white">{totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes} min`}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {formatTimeDisplay(totalMinutes)}
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
                        <span className="text-gray-400">{minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`}</span>
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
            <LearningTrend 
              data={yearFilteredData}
              selectedTopic={selectedTopic}
            />
          </div>
        );

      case 'productive-times':
        return <ProductiveTimeAnalysis data={typedLearningData} selectedTopic={selectedTopic} />;

      case 'senior-prep':
        return <SeniorRolePreparation data={typedLearningData} />;

      case 'gamification':
        return <GamificationSystem data={typedLearningData} />;

      default:
        return null;
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 bg-[#060C1D] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
                My Learning Journey
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Comprehensive tracking and analysis of my programming study sessions
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
            <div className="inline-flex items-center px-4 py-2 bg-[#0B8DCD] rounded-lg text-white text-sm">
              <FaChartLine className="mr-2" />
              <span>{totalSessions} sessions</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-green-600 rounded-lg text-white text-sm">
              <FaClock className="mr-2" />
              <span>{quickStats.totalHours}h total</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-orange-600 rounded-lg text-white text-sm">
              <FaFireAlt className="mr-2" />
              <span>{quickStats.currentStreak} day streak</span>
            </div>
          </div>
        </div>

        {/* Daily Inspiration */}
        <DailyInspiration />

        {/* Tab Navigation */}
        <div className="bg-[#0A1124] rounded-lg shadow-xl border border-gray-800 mb-8">
          <div className="flex flex-wrap border-b border-gray-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-[#00A3FF] border-b-2 border-[#00A3FF] bg-[#101935]'
                    : 'text-gray-400 hover:text-white hover:bg-[#101935]'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>

        {/* Topics Modal */}
        {showTopicsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0A1124] rounded-lg shadow-2xl border border-gray-800 max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">All Topics Breakdown</h3>
                <button 
                  onClick={closeTopicsModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topicBreakdown.map(({ topic, minutes }, index) => (
                    <div key={topic} className="bg-[#101935] p-4 rounded-lg border border-gray-800">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{topic}</h4>
                        <span className="text-xs text-gray-400">#{index + 1}</span>
                      </div>
                      <div className="text-2xl font-bold text-[#00A3FF] mb-1">
                        {minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`}
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
      </div>
    </main>
  );
};

export default LearningPage; 