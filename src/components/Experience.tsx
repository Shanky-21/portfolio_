"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { FaCode, FaServer, FaPalette, FaUsers, FaCreditCard, FaCogs, FaRocket, FaDatabase, FaTools, FaMicrochip } from 'react-icons/fa';

interface ExperienceDetailPoint {
  text: string;
  highlights?: string[]; // Added for specific words/phrases to bold
}

interface ExperienceDetailGroup {
  subheading: string;
  points: ExperienceDetailPoint[];
}

interface ExperienceItem {
  role: string;
  company: string;
  companyLink?: string;
  period: string;
  location: string;
  detailGroups: ExperienceDetailGroup[]; // Changed from details: string[]
  isInternship?: boolean;
  techStack?: string[]; // Added tech stack array
}

// Map icons to tech stack items
const iconMap: { [key: string]: React.ElementType } = {
  "React": FaCode,
  "TypeScript": FaCode,
  "JavaScript": FaCode,
  "TailwindCSS": FaPalette,
  "PostgreSQL": FaDatabase,
  "Python": FaCode,
  "Scala": FaCode,
  "Play": FaServer,
  "Akka": FaServer,
  "Pekko": FaServer,
  "Flask": FaServer,
  "GPT-4": FaRocket,
  "Gemini API": FaRocket,
  "Firebase": FaServer,
  "RabbitMQ": FaServer,
  "Chrome Extension": FaCogs,
  "Frontend": FaCode,
  "Backend": FaServer,
  "OpenGL": FaMicrochip,
  "C++": FaCode,
  "Redis": FaDatabase,
  "CSS": FaPalette,
  "HTML": FaCode,
  "Twilio": FaServer,
  "Razorpay": FaCreditCard,
  "CI/CD": FaTools,
};

const experienceData: ExperienceItem[] = [
  {
    role: "Software Engineer",
    company: "SmartReach.io",
    companyLink: "https://smartreach.io/",
    period: "June 2022 – Present",
    location: "Remote",
    techStack: ["React", "TypeScript", "TailwindCSS", "Scala", "Play", "Akka", "PostgreSQL", "RabbitMQ", "Chrome Extension", "Twilio", "Frontend", "Backend"],
    detailGroups: [
      {
        subheading: "Frontend Development UI",
        points: [
          { text: "Built reusable components, making it easier to scale and maintain projects.", highlights: ["reusable components", "scale", "maintain"] },
          { text: "Shortened design time by 30% by using both functional and class-based components.", highlights: ["30%"] },
        ],
      },
      {
        subheading: "Backend Development API",
        points: [
          { text: "Created a system to automate campaign steps for LinkedIn, email, WhatsApp, and calls.", highlights: ["automate campaign steps"] },
          { text: "Designed efficient database schemas and improved PostgreSQL queries, cutting execution time by 30–70%.", highlights: ["database schemas", "PostgreSQL queries", "30–70%"] },
          { text: "Tested features thoroughly and fixed over 150 bugs, making the product more reliable.", highlights: ["150 bugs"] },
        ],
      },
      {
        subheading: "Third-Party API Integrations",
        points: [
          { text: "Set up Maildoso for email and Twilio for calls, making campaign setup 10x faster.", highlights: ["Maildoso", "Twilio", "10x"] },
          { text: "Added team call features (Listen, Barge-in, Whisper) with Twilio, improving team performance by 40%.", highlights: ["Listen", "Barge-in", "Whisper", "Twilio", "40%"] },
          { text: "Used RabbitMQ and Cron jobs to manage third-party rate limits.", highlights: ["RabbitMQ", "Cron jobs"] },
        ],
      },
      {
        subheading: "Chrome Extension Development",
        points: [
          { text: "Built the SmartReach Task Manager Chrome extension to help users automate tasks.", highlights: ["SmartReach Task Manager Chrome extension"] },
          { text: "The extension is now used by over 200 people.", highlights: ["200 people"] },
        ],
      },
      {
        subheading: "Software Development Best Practices",
        points: [
          { text: "Reviewed code to improve structure and maintainability.", highlights: ["code reviews"] },
          { text: "Separated business logic from input/output processes for easier updates and scaling.", highlights: ["business logic", "input/output processes"] },
        ],
      },
    ],
  },
  {
    role: "Software Engineer Intern",
    company: "SmartReach.io",
    companyLink: "https://smartreach.io/",
    period: "March 2022 – June 2022",
    location: "Remote",
    isInternship: true,
    techStack: ["React", "JavaScript", "PostgreSQL", "Stripe", "Backend", "Frontend"],
    detailGroups: [
      {
        subheading: "", // No specific subheading provided for all points, so keeping it general
        points: [
          { text: "Automated manual reporting using a custom reporting framework, improving metric retrieval speed by 75%.", highlights: ["custom reporting framework", "75%"] },
          { text: "Engineered a billing service with Stripe and FastSpring APIs and webhooks.", highlights: ["billing service", "Stripe", "FastSpring APIs"] },
          { text: "Simplified client billing and improved invoice visibility." },
        ],
      },
    ],
  },
  {
    role: "DRDO Apprenticeship",
    company: "DRDO", // Assuming DRDO is the company name based on context
    period: "January 2021 – June 2021",
    location: "Remote",
    techStack: ["Python", "OpenGL", "C++"],
    detailGroups: [
      {
        subheading: "", // No specific subheading provided for all points
        points: [
          { text: "Built a stampede management app using Python and OpenGL, reducing crowd risk by 40%.", highlights: ["stampede management app", "Python", "OpenGL", "40%"] },
          { text: "Simulated stampedes to identify dangerous zones, aiding in human behavior analysis during such events." },
        ],
      },
    ],
  },
];

// Helper function to render text with highlights
const HighlightedText = ({ text, highlights, highlightClassName }: { text: string; highlights?: string[]; highlightClassName?: string }) => {
  if (!highlights || highlights.length === 0) {
    return <>{text}</>;
  }

  let lastIndex = 0;
  const parts = [];

  // Create a sorted array of highlights by their start index in the text
  const sortedHighlights = highlights
    .map(h => ({ text: h, index: text.indexOf(h) }))
    .filter(h => h.index !== -1)
    .sort((a, b) => a.index - b.index);

  sortedHighlights.forEach(highlight => {
    if (highlight.index > lastIndex) {
      parts.push(text.substring(lastIndex, highlight.index));
    }
    parts.push(
      <strong key={highlight.index} className={highlightClassName ? highlightClassName : "text-yellow-500"}>
        {highlight.text}
      </strong>
    );
    lastIndex = highlight.index + highlight.text.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

const Experience = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation();

  return (
    <section 
      ref={sectionRef as React.Ref<HTMLElement>}
      id="experience" 
      className={`py-16 md:py-24 bg-[#060C1D] transition-all duration-700 ease-out 
                  ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
            Work Experience
          </span>
        </h2>
        <div className="relative max-w-3xl mx-auto">
          {/* Timeline vertical line - thinner on mobile */}
          <div className="absolute left-4 sm:left-8 top-0 w-[2px] bg-gradient-to-b from-[#00A3FF]/60 to-[#00FFF0]/30 h-full rounded-full z-0 transform -translate-x-1/2" />
          <div className="flex flex-col gap-12 sm:gap-16">
            {experienceData.map((item, index) => (
              <div key={index} className="relative flex items-start">
                {/* Timeline dot container - narrower on mobile */}
                <div className="flex-shrink-0 w-8 sm:w-16 flex flex-col items-center">
                  {/* Timeline dot - slightly smaller on mobile */}
                  <div className={`z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[3px] shadow-lg ${
                    index === 0 
                      ? 'bg-gradient-to-br from-[#00FFF0] to-[#00A3FF] border-[#060C1D] ring-2 ring-[#00FFF0]/30 animate-pulse' 
                      : 'bg-gradient-to-br from-[#00A3FF] to-[#00FFF0] border-[#060C1D]'
                  }`} />
                </div>
                {/* Card content */}
                <div className="ml-3 sm:ml-6 flex-1 bg-gradient-to-br from-[#0a162f] via-[#00040F] to-[#0a162f] rounded-2xl shadow-2xl border border-[#1a2233] hover:border-[#00A3FF] transition-colors duration-300 p-4 sm:p-7 md:p-10">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2">
                    {item.role} 
                    {item.isInternship && <span className="text-base sm:text-lg text-gray-400"> (Intern)</span>}
                  </h3>
                  <div className="mb-2 sm:mb-3 flex flex-wrap items-center gap-2">
                    {item.companyLink ? (
                      <a 
                        href={item.companyLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lg sm:text-xl text-[#00A3FF] hover:underline font-medium"
                      >
                        {item.company}
                      </a>
                    ) : (
                      <span className="text-lg sm:text-xl text-gray-300 font-medium">{item.company}</span>
                    )}
                    <span className="text-gray-400 text-xs sm:text-sm">| {item.location}</span>
                  </div>
                  
                  {/* Period badge */}
                  <span className="inline-block bg-[#00A3FF]/10 text-[#00A3FF] text-xs font-semibold rounded-full px-2 sm:px-3 py-1 mb-3 sm:mb-4">
                    {item.period}
                  </span>

                  {/* Tech Stack Section */}
                  {item.techStack && item.techStack.length > 0 && (
                    <div className="mb-4 sm:mb-5">
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.techStack.map((tech) => {
                          const Icon = iconMap[tech] || FaCogs;
                          return (
                            <span key={tech} className="flex items-center bg-[#1a2233] text-gray-200 px-2 py-1 rounded-md text-xs font-medium shadow-sm border border-gray-700 hover:border-[#00A3FF] transition-colors duration-200">
                              <Icon className="mr-1 text-[#00A3FF]" size={12} /> {tech}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {item.detailGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-3 sm:mb-4">
                      {group.subheading && (
                        <h4 className="text-base sm:text-lg md:text-xl font-semibold text-sky-300 mb-1 sm:mb-2 mt-3 sm:mt-4">
                          {group.subheading}
                        </h4>
                      )}
                      <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-gray-300 text-sm sm:text-base md:text-lg pl-2 sm:pl-4 leading-relaxed">
                        {group.points.map((point, pointIndex) => (
                          <li key={pointIndex}>
                            <HighlightedText 
                              text={point.text} 
                              highlights={point.highlights} 
                              highlightClassName="bg-[#00A3FF]/20 text-[#00A3FF] px-1 rounded"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience; 