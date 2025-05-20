import Link from 'next/link';

const Header = () => {
  return (
    <header className="py-6 px-4 md:px-8 sticky top-0 z-50 bg-[#00040F] bg-opacity-80 backdrop-blur-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold ">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A3FF] to-[#00FFF0]">
            Shashank Dwivedi
          </span>
        </Link>
        <div className="space-x-6">
          <Link href="#about" className="hover:text-[#00A3FF] transition-colors">About</Link>
          <Link href="#experience" className="hover:text-[#00A3FF] transition-colors">Experience</Link>
          <Link href="#projects" className="hover:text-[#00A3FF] transition-colors">Projects</Link>
          <Link href="#skills" className="hover:text-[#00A3FF] transition-colors">Skills</Link>
          <Link href="#contact" className="hover:text-[#00A3FF] transition-colors">Contact</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header; 