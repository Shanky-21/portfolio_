import { FaCode, FaPaintBrush, FaCog, FaUsers } from 'react-icons/fa'; // Example icons

interface SkillCategory {
  name: string;
  skills: string[];
  icon: React.ElementType;
}

const skillsData: SkillCategory[] = [
  {
    name: "Backend Development",
    skills: ["Scala", "Play", "Akka", "Pekko", "Python", "C++", "Flask"],
    icon: FaCode,
  },
  {
    name: "Frontend Development",
    skills: ["TypeScript", "React", "Redux", "Axios", "HTML", "CSS", "TailwindCSS"],
    icon: FaPaintBrush,
  },
  {
    name: "Miscellaneous",
    skills: [
      "CI/CD", "GCP Logs", "RabbitMQ", "PostgreSQL", "Scylla-cache", 
      "Functional Programming", "CloudFlare", "Chrome Extension", 
      "Machine Learning", "LLM", "OpenAI", "Redis", "Git", 
      "Dependency Injection", "Maven", "SBT", "REST API"
    ],
    icon: FaCog,
  },
  {
    name: "Soft Skills",
    skills: ["Collaborative", "Bias for Action", "Deliver Results", "End-to-End Ownership"],
    icon: FaUsers,
  },
];

const Skills = () => {
  return (
    <section id="skills" className="py-16 md:py-24 bg-[#00040F]">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
            My Skills
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {skillsData.map((category) => (
            <div 
              key={category.name} 
              className="bg-[#060C1D] p-6 md:p-8 rounded-lg shadow-xl border border-gray-700 hover:border-[#00A3FF] transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <category.icon className="text-[#00A3FF] text-3xl mr-4" />
                <h3 className="text-2xl md:text-3xl font-semibold text-white">{category.name}</h3>
              </div>
              <ul className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <li 
                    key={skill} 
                    className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded-md text-sm md:text-base font-medium shadow-md"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills; 