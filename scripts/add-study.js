#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const util = require('util');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to the learning data file - Updated path to use src/data
const dataFilePath = path.resolve(__dirname, '../src/data/learning-data.json');

// Function to read the current data
const readData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`${colors.red}Error reading data file:${colors.reset}`, error.message);
    // If file doesn't exist or is empty, return an empty array
    return [];
  }
};

// Function to write data back to the file
const writeData = (data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(dataFilePath, jsonData, 'utf8');
    return true;
  } catch (error) {
    console.error(`${colors.red}Error writing to data file:${colors.reset}`, error.message);
    return false;
  }
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Function to validate date format (YYYY-MM-DD)
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Function to get recent topics from data
const getRecentTopics = (data, limit = 5) => {
  const topics = new Set();
  
  // Get unique topics from most recent sessions
  for (const session of data.slice().reverse()) {
    topics.add(session.topic);
    if (topics.size >= limit) break;
  }
  
  return Array.from(topics);
};

// Function to print table of recent sessions
const printRecentSessions = (data, limit = 5) => {
  if (data.length === 0) {
    console.log(`${colors.yellow}No study sessions recorded yet.${colors.reset}`);
    return;
  }
  
  const recentSessions = data.slice(-limit).reverse();
  
  console.log(`\n${colors.cyan}${colors.bright}Recent Study Sessions:${colors.reset}`);
  console.log('┌──────────────┬────────────────────┬─────────┐');
  console.log('│ Date         │ Topic              │ Minutes │');
  console.log('├──────────────┼────────────────────┼─────────┤');
  
  recentSessions.forEach(session => {
    const date = session.date.padEnd(12, ' ');
    const topic = session.topic.padEnd(20, ' ');
    const minutes = String(session.minutes).padStart(7, ' ');
    
    console.log(`│ ${date}│ ${topic}│ ${minutes} │`);
  });
  
  console.log('└──────────────┴────────────────────┴─────────┘');
};

// Main function to add a study session
const addStudySession = () => {
  const currentData = readData();
  const defaultDate = getTodayDate();
  const recentTopics = getRecentTopics(currentData);
  
  console.log(`\n${colors.bright}${colors.cyan}=== Add New Study Session ===${colors.reset}`);
  
  // Show recent sessions for context
  printRecentSessions(currentData);
  
  rl.question(`\n${colors.bright}Date${colors.reset} (YYYY-MM-DD) [${defaultDate}]: `, (dateInput) => {
    const date = dateInput.trim() || defaultDate;
    
    if (!isValidDate(date)) {
      console.error(`${colors.red}Invalid date format. Please use YYYY-MM-DD.${colors.reset}`);
      rl.close();
      return;
    }
    
    // Show recent topics as suggestions
    if (recentTopics.length > 0) {
      console.log(`${colors.yellow}Recent topics: ${recentTopics.join(', ')}${colors.reset}`);
    }
    
    rl.question(`${colors.bright}Topic${colors.reset}: `, (topic) => {
      if (!topic.trim()) {
        console.error(`${colors.red}Topic is required!${colors.reset}`);
        rl.close();
        return;
      }
      
      rl.question(`${colors.bright}Minutes spent${colors.reset}: `, (minutesInput) => {
        const minutes = parseInt(minutesInput.trim(), 10);
        
        if (isNaN(minutes) || minutes <= 0) {
          console.error(`${colors.red}Minutes must be a positive number!${colors.reset}`);
          rl.close();
          return;
        }
        
        // Create new session
        const newSession = {
          date,
          topic,
          minutes
        };
        
        // Add to data and save
        currentData.push(newSession);
        
        if (writeData(currentData)) {
          console.log(`\n${colors.green}${colors.bright}✅ Added: ${minutes} minutes studying ${topic} on ${date}${colors.reset}`);
          
          // Show total study time for this topic
          const topicTotal = currentData
            .filter(session => session.topic === topic)
            .reduce((sum, session) => sum + session.minutes, 0);
            
          console.log(`${colors.green}Total time spent on ${topic}: ${topicTotal} minutes (${Math.floor(topicTotal/60)} hours, ${topicTotal % 60} minutes)${colors.reset}`);
        } else {
          console.error(`\n${colors.red}❌ Failed to save the study session.${colors.reset}`);
        }
        
        rl.close();
      });
    });
  });
};

// Run the script
addStudySession(); 