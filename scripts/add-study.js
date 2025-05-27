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

// Create interactive interface
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
    // Sort data by date before writing
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
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
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to validate date format (YYYY-MM-DD) and check if it's a valid date
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  const isValid = date instanceof Date && !isNaN(date);
  
  if (!isValid) return false;
  
  // Check if date is in the future - compare date strings instead of Date objects
  const todayString = getTodayDate();
  
  if (dateString > todayString) {
    console.error(`${colors.red}Error: Cannot add study sessions for future dates${colors.reset}`);
    return false;
  }
  
  return true;
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

// Function to get all unique topics with frequency count
const getAllTopics = (data) => {
  const topicCount = {};
  
  data.forEach(session => {
    if (!topicCount[session.topic]) {
      topicCount[session.topic] = 0;
    }
    topicCount[session.topic]++;
  });
  
  // Sort by frequency (most used first)
  return Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);
};

// Function to print table of recent sessions
const printRecentSessions = (data, limit = 5) => {
  if (data.length === 0) {
    console.log(`${colors.yellow}No study sessions recorded yet.${colors.reset}`);
    return;
  }
  
  const recentSessions = data.slice(-limit).reverse();
  
  console.log(`\n${colors.cyan}${colors.bright}Recent Study Sessions:${colors.reset}`);
  console.log('┌──────────────┬────────────────────┬─────────┬─────────────────┐');
  console.log('│ Date         │ Topic              │ Minutes │ Notes           │');
  console.log('├──────────────┼────────────────────┼─────────┼─────────────────┤');
  
  recentSessions.forEach(session => {
    const date = session.date.padEnd(12, ' ');
    const topic = session.topic.padEnd(20, ' ');
    const minutes = String(session.minutes).padStart(7, ' ');
    const notes = session.notes ? session.notes.substring(0, 15).padEnd(15, ' ') : ''.padEnd(15, ' ');
    
    console.log(`│ ${date}│ ${topic}│ ${minutes} │ ${notes} │`);
  });
  
  console.log('└──────────────┴────────────────────┴─────────┴─────────────────┘');
};

// Function to handle topic autocomplete
const topicAutocomplete = (line, allTopics) => {
  const completions = allTopics.filter(t => 
    t.toLowerCase().startsWith(line.toLowerCase())
  );
  
  if (completions.length === 1) {
    return [completions, line];
  } else if (completions.length > 0) {
    // Find common prefix for multiple matches
    const prefix = findCommonPrefix(completions);
    if (prefix.length > line.length) {
      return [[prefix], prefix];
    }
    
    // Show all completions if there's no common prefix longer than input
    console.log('\n');
    completions.forEach(t => console.log(`  ${colors.cyan}${t}${colors.reset}`));
    console.log('');
    rl.prompt();
    return [completions, line];
  }
  
  return [[], line];
};

// Helper to find common prefix in a list of strings
const findCommonPrefix = (strings) => {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];
  
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (strings[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === '') return '';
    }
  }
  return prefix;
};

// Function to check if the selected date already has sessions
const getSessionsForDate = (data, date) => {
  return data.filter(session => session.date === date);
};

// Calculate total time for a given date
const getTotalTimeForDate = (data, date) => {
  return data
    .filter(session => session.date === date)
    .reduce((total, session) => total + session.minutes, 0);
};

// Main function to add a study session
const addStudySession = () => {
  const currentData = readData();
  const defaultDate = getTodayDate();
  const recentTopics = getRecentTopics(currentData);
  const allTopics = getAllTopics(currentData);
  
  console.log(`\n${colors.bright}${colors.cyan}=== Add New Study Session ===${colors.reset}`);
  
  // Show recent sessions for context
  printRecentSessions(currentData);
  
  // Configure readline to use autocomplete for topics
  rl.completer = (line) => topicAutocomplete(line, allTopics);
  
  rl.question(`\n${colors.bright}Date${colors.reset} (YYYY-MM-DD) [${defaultDate}]: `, (dateInput) => {
    const date = dateInput.trim() || defaultDate;
    
    if (!isValidDate(date)) {
      console.error(`${colors.red}Invalid date format or future date. Please use YYYY-MM-DD and choose today or a past date.${colors.reset}`);
      rl.close();
      return;
    }
    
    // Show existing sessions for the selected date
    const existingSessions = getSessionsForDate(currentData, date);
    if (existingSessions.length > 0) {
      console.log(`\n${colors.yellow}Existing sessions for ${date}:${colors.reset}`);
      existingSessions.forEach(session => {
        const notesInfo = session.notes ? ` - Notes: ${session.notes}` : '';
        console.log(`  • ${session.topic}: ${session.minutes} minutes${notesInfo}`);
      });
      const totalTime = getTotalTimeForDate(currentData, date);
      console.log(`  ${colors.yellow}Total: ${totalTime} minutes${colors.reset}\n`);
    }
    
    // Show recent topics as suggestions
    if (recentTopics.length > 0) {
      console.log(`${colors.yellow}Recent topics: ${recentTopics.join(', ')}${colors.reset}`);
      console.log(`${colors.yellow}Tip: Use TAB for topic autocomplete${colors.reset}`);
    }
    
    rl.question(`${colors.bright}Topic${colors.reset}: `, (topic) => {
      if (!topic.trim()) {
        console.error(`${colors.red}Topic is required!${colors.reset}`);
        rl.close();
        return;
      }
      
      rl.question(`${colors.bright}Start time (HH:MM)${colors.reset}: `, (startTimeInput) => {
        const startTime = startTimeInput.trim();
        if (!startTime) {
          console.error(`${colors.red}Start time is required!${colors.reset}`);
          rl.close();
          return;
        }
        if (!/^\d{2}:\d{2}$/.test(startTime)) {
          console.error(`${colors.red}Invalid start time format. Please use HH:MM.${colors.reset}`);
          rl.close();
          return;
        }

        rl.question(`${colors.bright}End time (HH:MM)${colors.reset}: `, (endTimeInput) => {
          const endTime = endTimeInput.trim();
          if (!endTime) {
            console.error(`${colors.red}End time is required!${colors.reset}`);
            rl.close();
            return;
          }
          if (!/^\d{2}:\d{2}$/.test(endTime)) {
            console.error(`${colors.red}Invalid end time format. Please use HH:MM.${colors.reset}`);
            rl.close();
            return;
          }

          // Calculate minutes from startTime and endTime
          const startDateObj = new Date(`${date}T${startTime}:00`);
          const endDateObj = new Date(`${date}T${endTime}:00`);

          if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            console.error(`${colors.red}Invalid date/time values for calculation.${colors.reset}`);
            rl.close();
            return;
          }

          let minutes = (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60);

          // Handle cases where end time is on the next day (e.g. session crosses midnight)
          // For now, we assume if endTime is earlier than startTime, it's on the next day.
          // A more robust solution might involve asking for endDate if session spans multiple days.
          if (minutes < 0) {
            // Assuming it crossed midnight, add 24 hours worth of minutes
            // This is a simplification. For sessions > 24h or more complex scenarios,
            // explicit end date input would be better.
            const nextDayEndDateObj = new Date(endDateObj);
            nextDayEndDateObj.setDate(endDateObj.getDate() + 1);
            minutes = (nextDayEndDateObj.getTime() - startDateObj.getTime()) / (1000*60);
          }
          
          if (minutes <= 0) {
            console.error(`${colors.red}End time must be after start time, resulting in positive duration.${colors.reset}`);
            rl.close();
            return;
          }

          rl.question(`${colors.bright}Notes${colors.reset} (optional): `, (notes) => {
            // Create new session
            const newSession = {
              date,
              topic,
              minutes: Math.round(minutes), // Store calculated minutes
              startTime,
              endTime,
            };

            // Add notes if provided
            if (notes.trim()) {
              newSession.notes = notes.trim();
            }
            
            // Add to data and save
            currentData.push(newSession);
            
            if (writeData(currentData)) {
              console.log(`\n${colors.green}${colors.bright}✅ Added: ${minutes} minutes studying ${topic} on ${date}${colors.reset}`);
              
              // Show total study time for this topic
              const topicTotal = currentData
                .filter(session => session.topic === topic)
                .reduce((sum, session) => sum + session.minutes, 0);
                
              console.log(`${colors.green}Total time spent on ${topic}: ${topicTotal} minutes (${Math.floor(topicTotal/60)} hours, ${topicTotal % 60} minutes)${colors.reset}`);
              
              // Show updated daily total
              const updatedDailyTotal = getTotalTimeForDate(currentData, date);
              console.log(`${colors.green}Total time spent on ${date}: ${updatedDailyTotal} minutes${colors.reset}`);
            } else {
              console.error(`\n${colors.red}❌ Failed to save the study session.${colors.reset}`);
            }
            
            rl.close();
          });
        });
      });
    });
  });
};

// Run the script
addStudySession(); 