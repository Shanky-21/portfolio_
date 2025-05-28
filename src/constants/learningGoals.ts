// Learning Goals and Targets Configuration
// This file centralizes all learning-related goals and targets used across the application

import React from 'react';
import { FaCode, FaArchway, FaLayerGroup, FaCog } from 'react-icons/fa';

export const SENIOR_ROLE_SUBJECTS = {
  'DSA': { 
    goal: 180, // 3 hours in minutes
    icon: React.createElement(FaCode, { className: "text-green-400" }),
    color: 'green',
    description: 'Data Structures & Algorithms',
    masteryHours: 200, // Industry benchmark for senior level
    masteryDescription: '200+ hours of focused DSA practice'
  },
  'System Design': { 
    goal: 60, // 1 hour in minutes
    icon: React.createElement(FaArchway, { className: "text-blue-400" }),
    color: 'blue',
    description: 'System Design & Architecture',
    masteryHours: 100, // Complex systems understanding
    masteryDescription: '100+ hours of system design study'
  },
  'Scala': { 
    goal: 60, // 1 hour in minutes
    icon: React.createElement(FaLayerGroup, { className: "text-red-400" }),
    color: 'red',
    description: 'Scala Programming Language',
    masteryHours: 150, // Functional programming mastery
    masteryDescription: '150+ hours of Scala proficiency'
  },
  'Akka': { 
    goal: 60, // 1 hour in minutes
    icon: React.createElement(FaCog, { className: "text-purple-400" }),
    color: 'purple',
    description: 'Akka Framework',
    masteryHours: 80, // Framework specific knowledge
    masteryDescription: '80+ hours of Akka expertise'
  }
} as const;

// Calculate total daily goal from all subjects
export const TOTAL_DAILY_GOAL_MINUTES = Object.values(SENIOR_ROLE_SUBJECTS).reduce(
  (sum, subject) => sum + subject.goal, 
  0
); // 360 minutes (6 hours total)

export const TOTAL_DAILY_GOAL_HOURS = TOTAL_DAILY_GOAL_MINUTES / 60; // 6 hours

// Weekly and monthly targets
export const WEEKLY_GOAL_MINUTES = TOTAL_DAILY_GOAL_MINUTES * 7; // 2520 minutes (42 hours)
export const MONTHLY_GOAL_MINUTES = TOTAL_DAILY_GOAL_MINUTES * 22; // 7920 minutes (132 hours, assuming 22 working days)

// Goal achievement thresholds
export const GOAL_ACHIEVEMENT_THRESHOLDS = {
  DAILY_MINIMUM: TOTAL_DAILY_GOAL_MINUTES * 0.5, // 50% of daily goal (3 hours)
  DAILY_TARGET: TOTAL_DAILY_GOAL_MINUTES, // 100% of daily goal (6 hours)
  WEEKLY_TARGET: WEEKLY_GOAL_MINUTES, // 100% of weekly goal (42 hours)
  MONTHLY_TARGET: MONTHLY_GOAL_MINUTES // 100% of monthly goal (132 hours)
} as const;

// Subject color configuration for UI consistency
export const SUBJECT_COLORS = {
  'DSA': {
    color: 'green',
    bg: 'bg-green-500',
    text: 'text-green-400',
    border: 'border-green-500'
  },
  'System Design': {
    color: 'blue',
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-500'
  },
  'Scala': {
    color: 'red',
    bg: 'bg-red-500',
    text: 'text-red-400',
    border: 'border-red-500'
  },
  'Akka': {
    color: 'purple',
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-500'
  }
} as const;

// Helper function to get color classes for a subject
export const getSubjectColorClasses = (subject: keyof typeof SENIOR_ROLE_SUBJECTS) => {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS['System Design']; // Default to blue
};

// Helper function to format minutes to hours and minutes
export const formatMinutesToHoursAndMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

// Helper function to calculate goal progress percentage
export const calculateGoalProgress = (achieved: number, target: number): number => {
  return Math.min(100, Math.round((achieved / target) * 100));
}; 