"use client";

import React, { useMemo } from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

interface Quote {
  quote: string;
  author: string;
}

const DailyInspiration: React.FC = () => {
  // Get quote based on current date (one quote per day)
  const todaysQuote = useMemo(() => {
    // Motivational quotes for inspiration
    const motivationalQuotes: Quote[] = [
      {
        quote: "The expert in anything was once a beginner.",
        author: "Helen Hayes"
      },
      {
        quote: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier"
      },
      {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      },
      {
        quote: "Learning never exhausts the mind.",
        author: "Leonardo da Vinci"
      },
      {
        quote: "The future belongs to those who learn more skills and combine them in creative ways.",
        author: "Robert Greene"
      },
      {
        quote: "Consistency is the mother of mastery.",
        author: "Robin Sharma"
      },
      {
        quote: "Every master was once a disaster.",
        author: "T. Harv Eker"
      },
      {
        quote: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
        author: "Brian Herbert"
      },
      {
        quote: "Progress, not perfection.",
        author: "Anonymous"
      },
      {
        quote: "Small daily improvements over time lead to stunning results.",
        author: "Robin Sharma"
      },
      {
        quote: "The journey of a thousand miles begins with one step.",
        author: "Lao Tzu"
      },
      {
        quote: "What we learn with pleasure we never forget.",
        author: "Alfred Mercier"
      },
      {
        quote: "Discipline is choosing between what you want now and what you want most.",
        author: "Abraham Lincoln"
      },
      {
        quote: "The beautiful thing about learning is that no one can take it away from you.",
        author: "B.B. King"
      },
      {
        quote: "Success isn't always about greatness. It's about consistency. Consistent hard work leads to success.",
        author: "Dwayne Johnson"
      },
      {
        quote: "Education is the most powerful weapon which you can use to change the world.",
        author: "Nelson Mandela"
      },
      {
        quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
        author: "Dr. Seuss"
      },
      {
        quote: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius"
      },
      {
        quote: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins"
      },
      {
        quote: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson"
      },
      {
        quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
      },
      {
        quote: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney"
      },
      {
        quote: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs"
      },
      {
        quote: "Your limitation—it's only your imagination.",
        author: "Anonymous"
      },
      {
        quote: "Push yourself, because no one else is going to do it for you.",
        author: "Anonymous"
      },
      {
        quote: "Great things never come from comfort zones.",
        author: "Anonymous"
      },
      {
        quote: "Dream it. Wish it. Do it.",
        author: "Anonymous"
      },
      {
        quote: "Success doesn't just find you. You have to go out and get it.",
        author: "Anonymous"
      },
      {
        quote: "The harder you work for something, the greater you'll feel when you achieve it.",
        author: "Anonymous"
      },
      {
        quote: "Dream bigger. Do bigger.",
        author: "Anonymous"
      },
      {
        quote: "Don't stop when you're tired. Stop when you're done.",
        author: "Anonymous"
      }
    ];

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % motivationalQuotes.length;
    return motivationalQuotes[quoteIndex];
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#101935] to-[#0A1124] p-6 rounded-lg border border-gray-800 relative overflow-hidden mb-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00A3FF] to-[#00FFF0] opacity-5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-white flex items-center mb-4">
          <FaQuoteLeft className="mr-2 text-[#00A3FF]" />
          Daily Inspiration
        </h3>
        
        <div className="space-y-4">
          <blockquote className="text-lg md:text-xl text-gray-200 italic leading-relaxed">
            &ldquo;{todaysQuote.quote}&rdquo;
          </blockquote>
          
          <cite className="text-[#00FFF0] font-medium not-italic">
            — {todaysQuote.author}
          </cite>
        </div>
      </div>
    </div>
  );
};

export default DailyInspiration; 