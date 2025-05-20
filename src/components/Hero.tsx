import Link from 'next/link';
import { FaDownload } from 'react-icons/fa';

const Hero = () => {
  return (
    <section id="hero" className="container mx-auto min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center py-12 px-4 md:px-8">
      <div className="space-y-6 mb-10 md:mb-0 max-w-3xl">
        <h2 className="text-2xl md:text-[32px] font-bold text-neutral-400 tracking-[.09em] uppercase font-poppins">
          Hi, my name is
        </h2>
        <h1 className="text-4xl sm:text-5xl md:text-[72px] font-bold font-sora">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
            Shashank Dwivedi
          </span>
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-[72px] font-bold font-sora">
          I am a Software Engineer
        </h2>
        <p className="text-xl md:text-[28px] text-white font-sora max-w-xl mx-auto leading-relaxed">
          With 3+ years in tech, I&apos;m a product-focused Software Engineer. I leverage the latest technology and a business mindset to launch successful startups.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center pt-5">
          <Link
            href="#contact"
            className="bg-[#0B8DCD] hover:bg-opacity-80 text-white font-sora font-bold py-4 px-8 sm:py-5 sm:px-12 md:py-6 md:px-[72px] rounded-[5px] text-lg sm:text-xl md:text-[24px] shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            🚀 Let&apos;s Get Started!
          </Link>
          <a
            href="/Shashank_Dwivedi_Resume.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#00A3FF] hover:bg-[#00A3FF] hover:text-[#00040F] text-[#00A3FF] font-sora font-bold py-4 px-8 sm:py-5 sm:px-10 md:py-6 md:px-10 rounded-[5px] text-lg sm:text-xl md:text-[24px] shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <FaDownload />
            <span>Download Resume</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero; 