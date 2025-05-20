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
}

const experienceData: ExperienceItem[] = [
  {
    role: "Software Engineer",
    company: "SmartReach.io",
    companyLink: "https://smartreach.io/",
    period: "June 2022 – Present",
    location: "Remote",
    detailGroups: [
      {
        subheading: "Frontend Development UI",
        points: [
          { text: "Designed reusable components, increasing scalability and reusability across projects.", highlights: ["reusable components", "scalability", "reusability"] },
          { text: "Reduced design time by 30% using functional and class-based components.", highlights: ["30%"] },
        ],
      },
      {
        subheading: "Backend Development API",
        points: [
          { text: "Developed task scheduling to automate LinkedIn, email, WhatsApp, and call campaign steps.", highlights: ["task scheduling", "LinkedIn, email, WhatsApp, and call campaign steps"] },
          { text: "Built efficient schema designs and optimized PostgreSQL queries, reducing execution time by 30–70%.", highlights: ["schema designs", "PostgreSQL queries", "30–70%"] },
          { text: "Conducted comprehensive testing and resolved 150+ bugs, enhancing feature reliability.", highlights: ["150+ bugs"] },
        ],
      },
      {
        subheading: "Third-Party API Integrations",
        points: [
          { text: "Integrated Maildoso for email infrastructure and Twilio APIs for cold calling, accelerating campaign setup by 10x.", highlights: ["Maildoso", "Twilio APIs", "10x"] },
          { text: "Built collaborative call features using Twilio SDK: Listen mode, Barge-in mode, Whisper mode, Improved team performance by 40%.", highlights: ["Twilio SDK", "Listen mode", "Barge-in mode", "Whisper mode", "40%"] },
          { text: "Created hyper-personalized outreach using LLMs, based on prospect and campaign data.", highlights: ["LLMs"] },
          { text: "Used RabbitMQ with Cron to handle rate limits from third-party libraries.", highlights: ["RabbitMQ", "Cron"] },
        ],
      },
      {
        subheading: "Chrome Extension Development",
        points: [
          { text: "Created SmartReach Task Manager Chrome extension to automate user tasks.", highlights: ["SmartReach Task Manager Chrome extension"] },
          { text: "Currently used by over 200+ users.", highlights: ["200+ users"] },
        ],
      },
      {
        subheading: "Software Development Best Practices",
        points: [
          { text: "Performed code reviews to optimize structure.", highlights: ["code reviews"] },
          { text: "Separated business logic from I/O processes (in DAOs and controllers) for better maintainability and scalability.", highlights: ["DAOs and controllers"] },
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
const HighlightedText = ({ text, highlights }: { text: string; highlights?: string[] }) => {
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
    parts.push(<strong key={highlight.index} className="text-amber-400">{highlight.text}</strong>);
    lastIndex = highlight.index + highlight.text.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
};

const Experience = () => {
  return (
    <section id="experience" className="py-16 md:py-24 bg-[#060C1D]">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
            Work Experience
          </span>
        </h2>
        <div className="max-w-3xl mx-auto">
          {experienceData.map((item, index) => (
            <div 
              key={index} 
              className="mb-10 p-6 md:p-8 bg-[#00040F] rounded-lg shadow-xl border border-gray-700 hover:border-[#00A3FF] transition-colors duration-300 relative"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00A3FF] to-[#00FFF0] rounded-l-lg"></div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-2xl md:text-3xl font-semibold text-white mb-1">
                  {item.role} 
                  {item.isInternship && <span className="text-lg text-gray-400"> (Intern)</span>}
                </h3>
                <div className="mb-2">
                  {item.companyLink ? (
                    <a 
                      href={item.companyLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xl text-[#00A3FF] hover:underline font-medium"
                    >
                      {item.company}
                    </a>
                  ) : (
                    <span className="text-xl text-gray-300 font-medium">{item.company}</span>
                  )}
                  <span className="text-gray-400 text-sm ml-2">| {item.location}</span>
                </div>
                <p className="text-gray-500 text-sm mb-4">{item.period}</p>
                {item.detailGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-3">
                    {group.subheading && (
                      <h4 className="text-lg md:text-xl font-semibold text-sky-300 mb-1 mt-3">
                        {group.subheading}
                      </h4>
                    )}
                    <ul className="list-disc list-inside space-y-2 text-gray-300 text-base md:text-lg pl-4">
                      {group.points.map((point, pointIndex) => (
                        <li key={pointIndex}>
                          <HighlightedText text={point.text} highlights={point.highlights} />
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
    </section>
  );
};

export default Experience; 