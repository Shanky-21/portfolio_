const Footer = () => {
  return (
    <footer className="py-8 bg-[#060C1D] text-center text-gray-400">
      <div className="container mx-auto">
        <p>
          &copy; {new Date().getFullYear()} Shashank Dwivedi. All rights reserved.
        </p>
        <p className="mt-2">
          Designed with inspiration from Figma, built with Next.js & Tailwind CSS.
        </p>
        {/* TODO: Add social links from resume */}
      </div>
    </footer>
  );
};

export default Footer; 