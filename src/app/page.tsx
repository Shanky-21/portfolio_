import About from "@/components/About";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import Hero from "@/components/Hero";
// import Image from "next/image"; // Removed unused import
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
// We will create and import other sections like Contact later

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact />
    </>
  );
}
