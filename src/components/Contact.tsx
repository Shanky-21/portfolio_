import { FaEnvelope, FaPhone, FaGithub, FaLinkedin } from 'react-icons/fa';

const contactDetails = {
  email: "shashankdwivedi9648@gmail.com",
  phone: "+91 6386 9905 63",
  github: "https://github.com/Shanky-21",
  linkedin: "https://www.linkedin.com/in/shashankdcode",
  tagline: "I am a product-oriented Software Engineer with a business mindset from bringing the latest tech to launching successful startups! Let's connect and discuss how I can help bring your ideas to life."
};

const Contact = () => {
  return (
    <section id="contact" className="py-16 md:py-24 bg-[#060C1D]">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
            Contact Me
          </span>
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          {contactDetails.tagline}
        </p>
        {/* Contact Methods: Email and Phone */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 max-w-2xl mx-auto mb-12">
          <a 
            href={`mailto:${contactDetails.email}`}
            className="flex items-center justify-center p-4 bg-[#00040F] border border-gray-700 rounded-lg hover:border-[#00A3FF] transition-colors duration-300 transform hover:scale-105 w-full md:w-auto"
          >
            <FaEnvelope className="text-[#00A3FF] text-xl md:text-2xl mr-3" />
            <span className="text-base md:text-lg text-gray-200">{contactDetails.email}</span>
          </a>
          <div 
            className="flex items-center justify-center p-4 bg-[#00040F] border border-gray-700 rounded-lg hover:border-[#00A3FF] transition-colors duration-300 transform hover:scale-105 group w-full md:w-auto"
          >
            <FaPhone className="text-[#00A3FF] text-xl md:text-2xl mr-3" />
            <span className="text-base md:text-lg text-gray-200 group-hover:hidden">{contactDetails.phone}</span>
            <a href={`tel:${contactDetails.phone.replace(/\s+/g, '')}`} className="text-base md:text-lg text-gray-200 hidden group-hover:inline hover:underline">Call Now</a>
          </div>
        </div>
        <div className="flex justify-center space-x-8 md:space-x-10">
          <a 
            href={contactDetails.github} 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="GitHub Profile"
            className="text-gray-400 hover:text-[#00A3FF] transition-colors duration-300 transform hover:scale-110"
          >
            <FaGithub size={36} />
          </a>
          <a 
            href={contactDetails.linkedin} 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="LinkedIn Profile"
            className="text-gray-400 hover:text-[#00A3FF] transition-colors duration-300 transform hover:scale-110"
          >
            <FaLinkedin size={36} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact; 