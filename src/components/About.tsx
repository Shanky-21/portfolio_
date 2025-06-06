"use client"; // Mark as Client Component

import Image from 'next/image';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation'; // Import the hook

const About = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation(); // Use hook defaults

  // Updated aboutMeText based on resume data
  const aboutMeText = "I'm a Software Engineer focused on turning ideas into efficient, reliable software solutions. Since June 2022 at SmartReach.io, I've worked on full-stack development, building scalable user interfaces, optimizing backend systems, and delivering robust API integrations—including improvements that accelerated campaign setups by 10x. I also enjoy creating practical tools, such as CodeSmart.in, a platform designed to help developers write better code.";

  return (
    <section 
      ref={sectionRef as React.Ref<HTMLElement>} 
      id="about" 
      className={`py-16 md:py-24 bg-[#060C1D] transition-all duration-1000 ease-out 
                  ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
    >
      <div className="container mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center justify-center gap-12 md:gap-[72px]">
        <div className={`relative w-full max-w-md md:w-[400px] lg:w-[450px] h-80 md:h-[400px] lg:h-[450px] rounded-[28.2px] overflow-hidden shadow-xl border-2 border-[#00A3FF]
                        transition-all duration-700 delay-200 ease-out
                        ${isSectionVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}> 
          <Image
            src="https://res.cloudinary.com/dxievocjq/image/upload/v1747728329/IMG_20250504_113647_x3ml73.jpg"
            alt="About Shashank Dwivedi"
            fill
            className="object-contain rounded-[28.2px]"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 400px, 450px"
          />
        </div>
        <div className={`md:w-1/2 text-center lg:text-left flex flex-col items-center lg:items-start gap-[24px]
                        transition-all duration-700 delay-300 ease-out
                        ${isSectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}> 
          <h2 className="text-5xl md:text-6xl font-extrabold mb-4 text-left w-full">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
              About Me
            </span>
          </h2>
          <p className="text-lg md:text-2xl font-normal leading-relaxed text-white mb-6 text-left">
            {aboutMeText}
          </p>
          <Link 
            href="/Shashank_Dwivedi_Resume.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0B8DCD] hover:bg-opacity-80 text-white font-bold py-4 px-8 sm:py-5 sm:px-12 md:py-6 md:px-[72px] rounded-[5px] text-lg sm:text-xl md:text-[24px] shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 inline-block mt-8"
          >
            😊 Download My Resume
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About; 