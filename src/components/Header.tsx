"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

// Corrected order to match page.tsx
const navLinks = [
  { href: "#about", label: "About", id: "about" },
  { href: "#skills", label: "Skills", id: "skills" },
  { href: "#experience", label: "Experience", id: "experience" },
  { href: "#projects", label: "Projects", id: "projects" },
  { href: "#contact", label: "Contact", id: "contact" },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), waitFor);
    };
  };

  const handleScroll = useCallback(() => {
    let newActiveSection = '';
    const offset = 70; // Threshold from the top of the viewport

    // Iterate navLinks from top to bottom (order in array = order on page)
    for (let i = 0; i < navLinks.length; i++) {
      const link = navLinks[i];
      const sectionElement = document.getElementById(link.id);
      if (sectionElement) {
        const rect = sectionElement.getBoundingClientRect();
        if (rect.top <= offset) {
          newActiveSection = link.id;
        } else {
          if (newActiveSection !== '') {
            break;
          }
        }
      }
    }
    
    const atBottom = (window.innerHeight + Math.ceil(window.scrollY)) >= (document.body.offsetHeight - 5);
    if (atBottom && navLinks.length > 0) {
      newActiveSection = navLinks[navLinks.length - 1].id;
    }

    if (activeSection !== newActiveSection) {
      setActiveSection(newActiveSection);
    }
  }, [activeSection]);

  useEffect(() => {
    const debouncedScrollHandler = debounce(handleScroll, 30); // Slightly faster debounce
    window.addEventListener('scroll', debouncedScrollHandler);
    debouncedScrollHandler();

    return () => window.removeEventListener('scroll', debouncedScrollHandler);
  }, [handleScroll]);

  const handleLogoClick = () => {
    closeMobileMenu();
    setActiveSection('');
  };

  const handleNavLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string, targetId: string) => {
    event.preventDefault(); 

    setActiveSection(targetId); 
    closeMobileMenu();    

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' }); 
    }

    if (window.location.hash !== href) {
      history.replaceState(null, '', href); 
    }
  };

  const linkBaseClasses = "transition-all duration-150 ease-in-out";

  return (
    <header className="py-6 px-4 md:px-8 sticky top-0 z-50 bg-[#00040F] bg-opacity-80 backdrop-blur-md shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold" onClick={handleLogoClick}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
            Shashank Dwivedi
          </span>
        </Link>

        <div className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`${linkBaseClasses} hover:text-[#00A3FF] cursor-pointer ${activeSection === link.id ? 'text-[#00A3FF] font-semibold' : 'text-white'}`}
              onClick={(e) => handleNavLinkClick(e, link.href, link.id)}
              aria-current={activeSection === link.id ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            className="text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00A3FF] p-2 rounded-md"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#00040F] bg-opacity-95 backdrop-blur-md shadow-lg py-4 z-40">
          <div className="container mx-auto flex flex-col items-center space-y-4 px-4">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`${linkBaseClasses} py-2 text-lg w-full text-center hover:text-[#00A3FF] cursor-pointer ${activeSection === link.id ? 'text-[#00A3FF] font-semibold' : 'text-white'}`}
                onClick={(e) => handleNavLinkClick(e, link.href, link.id)}
                aria-current={activeSection === link.id ? 'page' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 