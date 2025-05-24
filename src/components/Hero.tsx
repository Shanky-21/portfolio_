"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

const Hero = () => {
  const [stars, setStars] = useState<Array<{id: number, x: number, y: number, size: number, opacity: number, speed: number, delay: number}>>([]);
  const [shootingStars, setShootingStars] = useState<Array<{id: number, x: number, y: number, length: number, speed: number, delay: number}>>([]);

  // Create stars on mount
  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const newStars = [];
      const count = window.innerWidth < 768 ? 100 : 200; // More stars for better effect
      
      for (let i = 0; i < count; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 1.2 + 0.2, // Even smaller size range for more subtle effect
          opacity: Math.random() * 0.3 + 0.05, // Very dim stars (0.05-0.35 opacity)
          speed: Math.random() * 5 + 3, // Varied twinkle speed (3-8s)
          delay: Math.random() * -10 // Random delay for twinkling so they don't all sync up
        });
      }
      setStars(newStars);
      
      // Generate a few shooting stars
      const newShootingStars = [];
      const shootingStarCount = window.innerWidth < 768 ? 1 : 3; // Increased number slightly
      
      for (let i = 0; i < shootingStarCount; i++) {
        newShootingStars.push(createShootingStar(i));
      }
      setShootingStars(newShootingStars);
    };
    
    // Create a shooting star
    const createShootingStar = (id: number) => ({
      id,
      x: Math.random() * 70, // Start position (avoid edges)
      y: Math.random() * 50, // Allow them to start from a larger area
      length: Math.random() * 15 + 8, // Longer trail (8-23px)
      speed: Math.random() * 3 + 3, // Speed of travel
      delay: Math.random() * 10 // Shorter delay for quicker appearance
    });

    generateStars();
    window.addEventListener('resize', generateStars);
    
    // Periodically regenerate shooting stars
    const shootingStarInterval = setInterval(() => {
      setShootingStars(current => {
        // Remove one star and add a new one
        if (current.length > 0) {
          const removeIndex = Math.floor(Math.random() * current.length);
          const newId = Date.now();
          const newStars = [...current];
          newStars[removeIndex] = createShootingStar(newId);
          return newStars;
        }
        return current;
      });
    }, 5000); // Regenerate more frequently
    
    return () => {
      window.removeEventListener('resize', generateStars);
      clearInterval(shootingStarInterval);
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center py-12 px-4 md:px-8 overflow-hidden bg-[#060C1D]">
      {/* Starry background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030917] to-[#0B1431]">
        {/* Stars */}
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size}px ${star.size/3}px rgba(255, 255, 255, 0.2)`,
              animation: `twinkle ${star.speed}s ease-in-out infinite alternate`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
        
        {/* Shooting stars */}
        {shootingStars.map(shootingStar => (
          <div
            key={shootingStar.id}
            className="absolute pointer-events-none"
            style={{
              left: `${shootingStar.x}%`,
              top: `${shootingStar.y}%`,
              width: `${shootingStar.length}px`,
              height: '2px', // Slightly thicker
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%)', // Brighter tail
              opacity: 0.5, // More visible
              transformOrigin: 'left',
              animation: `moveRight ${shootingStar.speed}s linear forwards`,
              animationDelay: `${shootingStar.delay}s`,
              transform: 'rotate(45deg)'
            }}
          />
        ))}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#060C1D] opacity-70"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto relative z-10">
        <div className="space-y-6 mb-10 md:mb-0 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-[32px] font-bold text-neutral-400 tracking-[.09em] uppercase font-poppins">
            Hi, my name is
          </h2>
          <h1 className="text-4xl sm:text-5xl md:text-[72px] font-bold font-sora">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
              Shashank Dwivedi
            </span>
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-[72px] font-bold font-sora">
            I am a Software Engineer
          </h2>
          <p className="text-xl md:text-[28px] text-white font-sora max-w-xl mx-auto leading-relaxed">
            With 3+ years in tech, I&apos;m a product-focused Software Engineer. I leverage the latest technology and a business mindset to launch successful startups.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center pt-5">
            <Link
              href="#contact"
              className="bg-[#0B8DCD] hover:bg-opacity-80 text-white font-sora font-bold py-4 px-8 sm:py-5 sm:px-12 md:py-6 md:px-[72px] rounded-[5px] text-lg sm:text-xl md:text-[24px] shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              🚀 Let&apos;s Get Started!
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 