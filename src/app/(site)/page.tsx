import About from "@/components/About";
import Blog from "@/components/Blog";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Cta from "@/components/Cta";
import Faq from "@/components/Faq";
import Features from "@/components/Features";
import HeroArea from "@/components/HeroArea";
import Pricing from "@/components/Pricing";
import Screens from "@/components/Screens";
import Testimonials from "@/components/Testimonials";
import WorkProcess from "@/components/WorkProcess";
import { integrations } from "@integrations-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appline - Next.js App & Software Template and Starter Kit",
  description:
    "Website template and starter kit crafted to build fully functional mobile app landing pages and software websites",
};

export default function Home() {
  return (
    <main>
      <HeroArea />
      <Features />
      <About />
      <WorkProcess />
      <Pricing />
      <Screens />
      <Cta />
      <Testimonials />
      <Faq />
      {integrations.isSanityEnabled && <Blog />}
      <Clients />
      <Contact />
    </main>
  );
}
