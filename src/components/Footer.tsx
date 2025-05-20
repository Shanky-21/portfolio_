"use client";

import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const socialLinks = [
  {
    href: "https://github.com/Shanky-21",
    icon: FaGithub,
    label: "GitHub Profile",
  },
  {
    href: "https://www.linkedin.com/in/shashankdcode",
    icon: FaLinkedin,
    label: "LinkedIn Profile",
  },
  {
    href: "mailto:shashankdwivedi9648@gmail.com",
    icon: FaEnvelope,
    label: "Send an Email",
  },
];

const Footer = () => {
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-10 md:py-12 bg-[#060C1D] text-gray-400 border-t border-gray-700">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          
          <div className="text-center md:text-left">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Shashank Dwivedi. All rights reserved.
            </p>
            <p className="mt-1 text-xs">
              Inspired by Figma, built with Next.js & Tailwind CSS.
            </p>
          </div>

          <div className="flex space-x-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-gray-400 hover:text-[#00A3FF] transition-colors duration-300 transform hover:scale-110"
              >
                <social.icon size={24} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="#top"
            onClick={scrollToTop}
            className="text-sm hover:text-[#00A3FF] transition-colors group"
          >
            Back to Top 
            <span className="inline-block transition-transform group-hover:-translate-y-1 ml-1">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 