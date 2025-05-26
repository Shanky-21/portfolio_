"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

// Corrected order to match page.tsx
const navLinks = [
  { href: "#about", label: "About", id: "about" },
  { href: "#skills", label: "Skills", id: "skills" },
  { href: "#experience", label: "Experience", id: "experience" },
  { href: "#projects", label: "Projects", id: "projects" },
  { href: "#contact", label: "Contact", id: "contact" },
];

// Separate array for page links (not hash links)
const pageLinks = [
  { href: "/learning", label: "Learning Journey", id: "learning" },
  { href: "/blog", label: "Blog", id: "blog" },
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const debounce = <F extends (...args: never[]) => void>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), waitFor);
    };
  };

  const handleScroll = useCallback(() => {
    // Only activate scroll detection on home page
    if (pathname !== '/') return;

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
  }, [activeSection, pathname]);

  useEffect(() => {
    const debouncedScrollHandler = debounce(handleScroll, 30); // Slightly faster debounce
    window.addEventListener('scroll', debouncedScrollHandler);
    debouncedScrollHandler();

    return () => window.removeEventListener('scroll', debouncedScrollHandler);
  }, [handleScroll]);

  const handleLogoClick = () => {
    closeMobileMenu();
    setActiveSection('');
    
    // If not on homepage, navigate to home
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleNavLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string, targetId: string) => {
    event.preventDefault(); 
    closeMobileMenu();
    
    // If on a different page, navigate to homepage with hash
    if (pathname !== '/') {
      router.push(`/${href}`);
      return;
    }
    
    // If already on homepage, do smooth scroll
    setActiveSection(targetId); 

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
    <header className="py-6 px-4 md:px-8 sticky top-0 z-50 bg-[#00040F] dark:bg-gray-950 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md shadow-md" role="banner">
      <nav className="container mx-auto flex justify-between items-center" aria-label="Main navigation">
        <Link href="/" className="text-2xl font-bold" onClick={handleLogoClick}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
            Shashank Dwivedi
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {/* Hash-based nav links */}
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`${linkBaseClasses} hover:text-[#00A3FF] dark:hover:text-sky-400 cursor-pointer ${pathname === '/' && activeSection === link.id ? 'text-[#00A3FF] dark:text-sky-400 font-semibold' : 'text-white dark:text-gray-300'}`}
              onClick={(e) => handleNavLinkClick(e, link.href, link.id)}
              aria-current={pathname === '/' && activeSection === link.id ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
          
          {/* Page links */}
          {pageLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`${linkBaseClasses} hover:text-[#00A3FF] dark:hover:text-sky-400 cursor-pointer ${pathname.startsWith(link.href) ? 'text-[#00A3FF] dark:text-sky-400 font-semibold' : 'text-white dark:text-gray-300'} group`}
              onClick={closeMobileMenu}
            >
              <span className="relative inline-block">
                {link.label}
                {link.id === "learning" && !pathname.startsWith("/learning") && (
                  <span className="absolute top-0 right-0 transform translate-x-full -translate-y-3/4 group-hover:scale-110 transition-transform duration-150">
                    <span className="inline-block bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-full leading-none animate-pulse">
                      NEW
                    </span>
                  </span>
                )}
              </span>
            </Link>
          ))}
          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            className="text-white dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00A3FF] dark:focus:ring-sky-400 p-2 rounded-md"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 bg-[#00040F] dark:bg-gray-950 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-md shadow-lg py-4 z-40" aria-label="Mobile navigation">
          <div className="container mx-auto flex flex-col items-center space-y-4 px-4">
            {/* Hash-based nav links */}
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`${linkBaseClasses} py-2 text-lg w-full text-center hover:text-[#00A3FF] dark:hover:text-sky-400 cursor-pointer ${pathname === '/' && activeSection === link.id ? 'text-[#00A3FF] dark:text-sky-400 font-semibold' : 'text-white dark:text-gray-300'}`}
                onClick={(e) => handleNavLinkClick(e, link.href, link.id)}
                aria-current={pathname === '/' && activeSection === link.id ? 'page' : undefined}
              >
                {link.label}
              </a>
            ))}
            
            {/* Page links */}
            {pageLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`${linkBaseClasses} py-2 text-lg w-full text-center hover:text-[#00A3FF] dark:hover:text-sky-400 cursor-pointer ${pathname.startsWith(link.href) ? 'text-[#00A3FF] dark:text-sky-400 font-semibold' : 'text-white dark:text-gray-300'} group`}
                onClick={closeMobileMenu}
              >
                <span className="relative inline-block">
                  {link.label}
                  {link.id === "learning" && !pathname.startsWith("/learning") && (
                    <span className="absolute top-0 right-0 transform translate-x-full -translate-y-3/4 group-hover:scale-110 transition-transform duration-150">
                      <span className="inline-block bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-full leading-none animate-pulse">
                        NEW
                      </span>
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header; 