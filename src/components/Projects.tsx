"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaExternalLinkAlt, FaUsers, FaServer, FaCode, FaCreditCard, FaCogs, FaRocket, FaPalette } from 'react-icons/fa';
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
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 md:gap-12">
          {projectsData.map((project) => (
            <div 
              key={project.name} 
              className="bg-[#060C1D] rounded-lg shadow-xl overflow-hidden border border-gray-700 hover:border-[#00A3FF] transition-all duration-300 flex flex-col md:flex-row"
            >
              <div className="md:w-1/3 relative min-h-[250px] md:min-h-full">
                <Image 
                  src={project.image} 
                  alt={project.name} 
                  fill
                  className="object-contain"
                  sizes="(max-width: 767px) 100vw, 33vw"
                />
              </div>
              <div className="md:w-2/3 p-6 md:p-8 flex flex-col">
                <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">{project.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{project.period}</p>
                <p className="text-gray-300 mb-4 text-base leading-relaxed flex-grow">{project.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-200 mb-2">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    {project.features.slice(0, 4).map((feature, i) => <li key={i}>{feature}</li>)}
                    {project.features.length > 4 && <li>...and more!</li>}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-200 mb-2">Tech Stack:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => {
                      const Icon = iconMap[tech] || FaCogs;
                      return (
                        <span key={tech} className="flex items-center bg-gray-700 text-gray-200 px-3 py-1 rounded-md text-xs font-medium shadow-sm">
                          <Icon className="mr-1.5" /> {tech}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap gap-3 items-center">
                  {project.liveLink && (
                    <Link href={project.liveLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-[#0B8DCD] hover:bg-opacity-80 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors transform hover:scale-105">
                      <FaExternalLinkAlt className="mr-2" /> Live Demo
                    </Link>
                  )}
                  {project.githubLink && (
                    <Link href={project.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center border border-[#00A3FF] hover:bg-[#00A3FF] hover:text-[#00040F] text-[#00A3FF] py-2 px-4 rounded-md text-sm font-medium transition-colors transform hover:scale-105">
                      <FaGithub className="mr-2" /> GitHub
                    </Link>
                  )}
                  {project.chromeExtensionLink && (
                     <Link href={project.chromeExtensionLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center border border-purple-500 hover:bg-purple-500 hover:text-white text-purple-400 py-2 px-4 rounded-md text-sm font-medium transition-colors transform hover:scale-105">
                      <FaCogs className="mr-2" /> Chrome Extension
                    </Link>
                  )}
                </div>
                {(project.userCount || project.teamSize) && (
                    <div className="mt-4 text-xs text-gray-500 flex items-center gap-4">
                        {project.teamSize && <span><FaUsers className="inline mr-1" /> Team of {project.teamSize}</span>}
                        {project.userCount && <span><FaUsers className="inline mr-1" /> {project.userCount}</span>}
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects; 