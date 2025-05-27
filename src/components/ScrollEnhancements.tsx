"use client";

import { useState, useEffect } from 'react';

const ScrollEnhancements = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setScrollProgress(scrollPercent);
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#00A3FF] to-[#00FFF0] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Navigation Dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
        <nav className="flex flex-col space-y-3">
          {[
            { href: "#hero", label: "Home" },
            { href: "#about", label: "About" },
            { href: "#skills", label: "Skills" },
            { href: "#experience", label: "Experience" },
            { href: "#projects", label: "Projects" },
            { href: "#contact", label: "Contact" }
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative block w-3 h-3 rounded-full bg-gray-600 hover:bg-[#00A3FF] transition-all duration-300 hover:scale-125"
              title={item.label}
            >
              <span className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-[#0A1124] text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </a>
          ))}
        </nav>
      </div>

      {/* Quick Stats Floating Card */}
      <div className="fixed bottom-6 left-6 z-40 hidden xl:block">
        <div className="bg-[#0A1124] border border-gray-800 rounded-lg p-4 shadow-xl backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all duration-300">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#00A3FF]">3+</div>
            <div className="text-xs text-gray-400">Years Experience</div>
          </div>
          <div className="mt-2 text-center">
            <div className="text-lg font-bold text-[#00FFF0]">4+</div>
            <div className="text-xs text-gray-400">Projects Built</div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#00A3FF] hover:bg-[#00FFF0] text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-40 animate-bounce"
          title="Back to Top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </>
  );
};

export default ScrollEnhancements; 