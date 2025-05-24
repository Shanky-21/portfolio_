"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaExternalLinkAlt, FaUsers, FaServer, FaCode, FaCreditCard, FaCogs, FaRocket, FaPalette, FaCheck, FaClipboardCheck, FaClock } from 'react-icons/fa';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Project {
  name: string;
  description: string;
  image: string; // Path to image in /public folder
  period: string;
  techStack: string[];
  features: string[];
  liveLink?: string;
  githubLink?: string;
  chromeExtensionLink?: string;
  userCount?: string;
  teamSize?: number;
}

const projectsData: Project[] = [
  {
    name: "CodeSmart.in",
    description: "An online platform offering tailored hints, examples, and solutions for LeetCode questions via a Chrome extension, utilizing GPT-4 and Google Gemini.",
    image: "/images/projects/code_smart_home.png", // Updated image path
    period: "January 2024 – Present",
    techStack: ["React", "TypeScript", "TailwindCSS", "PostgreSQL", "GPT-4", "Gemini API", "Firebase Auth", "Chrome Extension"],
    features: [
      "Led a 5-person team and designed the system from scratch.",
      "Integrated Razorpay for payment handling.",
      "Implemented cron jobs for daily credit updates.",
      "Structured codebase using PostgreSQL (services, controllers, DAOs).",
      "Utilized GPT-4 and Google's Gemini API for Chrome extension features.",
      "Built frontend with React, TypeScript, TailwindCSS for a responsive UI.",
      "Implemented Firebase authentication."
    ],
    liveLink: "https://www.codesmart.in",
    chromeExtensionLink: "https://chromewebstore.google.com/detail/code-smart/iojhbhoaihedphnhjciogfpomhlckajo", // Updated link
    userCount: "100+ user logins, 50+ Chrome extension users",
    teamSize: 5,
  },
  // You can add more projects here in the future
];

const iconMap: { [key: string]: React.ElementType } = {
  "React": FaCode,
  "TypeScript": FaCode,
  "TailwindCSS": FaPalette,
  "PostgreSQL": FaServer,
  "GPT-4": FaRocket,
  "Gemini API": FaRocket,
  "Firebase Auth": FaUsers,
  "Chrome Extension": FaCogs,
  "Razorpay": FaCreditCard,
  "Cron Jobs": FaServer,
  "System Design": FaCogs,
};

const Projects = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation();

  return (
    <section 
      ref={sectionRef as React.Ref<HTMLElement>}
      id="projects" 
      className={`py-16 md:py-24 bg-[#00040F] transition-all duration-700 ease-out 
                  ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
            My Projects
          </span>
        </h2>
        <div className="grid grid-cols-1 gap-12 md:gap-16">
          {projectsData.map((project) => (
            <div 
              key={project.name} 
              className="bg-gradient-to-br from-[#0a162f] via-[#00040F] to-[#0a162f] rounded-2xl shadow-2xl overflow-hidden border border-[#1a2233] hover:border-[#00A3FF] transition-all duration-300 transform hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(0,163,255,0.15)]"
            >
              {/* Project header with title, period, links */}
              <div className="p-6 md:p-8 border-b border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">{project.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <FaClock className="text-[#00A3FF]" />
                      <p className="text-gray-400 text-sm">{project.period}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                    {project.liveLink && (
                      <Link href={project.liveLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-[#0B8DCD] hover:bg-opacity-80 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors transform hover:scale-105 shadow-md">
                        <FaExternalLinkAlt className="mr-2" /> Live Demo
                      </Link>
                    )}
                    {project.githubLink && (
                      <Link href={project.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center border border-[#00A3FF] hover:bg-[#00A3FF] hover:text-[#00040F] text-[#00A3FF] py-2 px-4 rounded-md text-sm font-medium transition-colors transform hover:scale-105 shadow-md">
                        <FaGithub className="mr-2" /> GitHub
                      </Link>
                    )}
                    {project.chromeExtensionLink && (
                      <Link href={project.chromeExtensionLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center border border-purple-500 hover:bg-purple-500 hover:text-white text-purple-400 py-2 px-4 rounded-md text-sm font-medium transition-colors transform hover:scale-105 shadow-md">
                        <FaCogs className="mr-2" /> Chrome Extension
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Project content */}
              <div className="flex flex-col lg:flex-row">
                {/* Image container - responsive */}
                <div className="lg:w-2/5 relative h-[240px] sm:h-[320px] lg:h-auto overflow-hidden bg-gradient-to-br from-[#060C1D] to-[#00040F]">
                  <Image 
                    src={project.image} 
                    alt={project.name} 
                    fill
                    className="object-contain p-4 transition-transform duration-500 ease-in-out transform hover:scale-105"
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 100vw, 40vw"
                  />
                </div>
                
                {/* Content container */}
                <div className="lg:w-3/5 p-6 md:p-8">
                  <p className="text-gray-300 mb-6 text-base leading-relaxed">{project.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-[#00A3FF] mb-3 flex items-center">
                      <FaClipboardCheck className="mr-2" /> Key Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {project.features.map((feature, i) => (
                        <div key={i} className="flex items-start text-gray-300 text-sm">
                          <FaCheck className="text-[#00A3FF] mt-1 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-[#00A3FF] mb-3 flex items-center">
                      <FaCode className="mr-2" /> Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => {
                        const Icon = iconMap[tech] || FaCogs;
                        return (
                          <span key={tech} className="flex items-center bg-[#1a2233] text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm border border-gray-700 hover:border-[#00A3FF] transition-colors duration-200">
                            <Icon className="mr-1.5 text-[#00A3FF]" /> {tech}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  {(project.userCount || project.teamSize) && (
                    <div className="mt-6 text-sm text-gray-400 flex items-center gap-6 border-t border-gray-800 pt-4">
                      {project.teamSize && <span className="flex items-center"><FaUsers className="text-[#00A3FF] mr-2" /> Team of {project.teamSize}</span>}
                      {project.userCount && <span className="flex items-center"><FaUsers className="text-[#00A3FF] mr-2" /> {project.userCount}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects; 