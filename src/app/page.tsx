import About from "@/components/About";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import Hero from "@/components/Hero";
// import Image from "next/image"; // Removed unused import
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import ScrollEnhancements from "@/components/ScrollEnhancements";
// We will create and import other sections like Contact later

// Enhanced Portfolio with visual improvements
export default function Home() {
  return (
    <>
      <ScrollEnhancements />
      
      <Hero />
      
      {/* Main Content Sections */}
      <About />
      
      {/* Fun Facts Section */}
      <section className="py-16 bg-gradient-to-b from-[#060C1D] to-[#00040F]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
              Quick Facts About Me
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📚", title: "Book Lover", desc: "Passionate about continuous learning through reading" },
              { icon: "🏃‍♂️", title: "Health Focused", desc: "30 minutes daily running for physical wellness" },
              { icon: "🧘‍♂️", title: "Mindful Living", desc: "15 minutes daily meditation for mental clarity" },
              { icon: "🌟", title: "Problem Solver", desc: "Love turning complex problems into simple solutions" }
            ].map((fact, index) => (
              <div 
                key={index}
                className="bg-[#0A1124] border border-gray-800 rounded-lg p-6 hover:border-[#00A3FF] transition-all duration-300 hover:transform hover:scale-105 group"
              >
                <div className="text-4xl mb-3 group-hover:animate-bounce">{fact.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{fact.title}</h3>
                <p className="text-gray-400 text-sm">{fact.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Skills />
      <Experience />
      <Projects />
      
      {/* Learning Journey Highlight */}
      <section className="py-16 bg-[#060C1D] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#00A3FF] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#00FFF0] rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
              My Holistic Development Journey
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Committed to continuous growth through technical excellence, physical wellness, and mental clarity - building both a strong career and a balanced life.
          </p>
          
          {/* Technical Learning Goals */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center">
              <span className="mr-2">💻</span> Technical Learning Goals
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { label: "DSA", hours: "3h daily" },
                { label: "System Design", hours: "1h daily" },
                { label: "Scala", hours: "1h daily" },
                { label: "Akka", hours: "1h daily" }
              ].map((item, index) => (
                <div key={index} className="bg-[#0A1124] border border-gray-800 rounded-lg p-3">
                  <div className="text-[#00A3FF] font-bold">{item.label}</div>
                  <div className="text-gray-400 text-sm">{item.hours}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Wellness & Personal Development */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center">
              <span className="mr-2">🌱</span> Wellness & Personal Growth
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { label: "📚 Reading", goal: "Daily", desc: "Continuous learning through books" },
                { label: "🏃‍♂️ Running", goal: "30 min", desc: "Physical fitness & endurance" },
                { label: "🧘‍♂️ Meditation", goal: "15 min", desc: "Mental clarity & mindfulness" }
              ].map((item, index) => (
                <div key={index} className="bg-[#101935] border border-gray-700 rounded-lg p-4">
                  <div className="text-[#00FFF0] font-bold text-lg">{item.label}</div>
                  <div className="text-white font-semibold">{item.goal}</div>
                  <div className="text-gray-400 text-sm">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/learning"
              className="bg-gradient-to-r from-[#00A3FF] to-[#00FFF0] text-[#060C1D] font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              📊 View Learning Analytics
            </a>
            <a
              href="/learning"
              className="border border-[#00A3FF] text-[#00A3FF] font-bold py-3 px-8 rounded-lg hover:bg-[#00A3FF] hover:text-[#060C1D] transition-all duration-300"
            >
              🎯 Track Progress
            </a>
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}
