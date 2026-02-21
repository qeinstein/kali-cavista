"use client";

import { useLoader } from "@/app/context/LoaderContext";
import SpagLoader from "@/components/SpagLoader";
import { AnimatePresence } from "framer-motion";

// Home Page Components
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Modules from "@/components/home/Modules";
import NutriSenseDeepDive from "@/components/home/NutriSenseDeepDive";
import UrbanBiometerDeepDive from "@/components/home/UrbanBiometerDeepDive";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";

export default function Home() {
  const { isLoaderDone } = useLoader();

  return (
    <>
      <SpagLoader />

      <AnimatePresence>
        {isLoaderDone && (
          <div className="flex flex-col w-full">
            <Hero />
            <About />
            <Modules />
            <NutriSenseDeepDive />
            <UrbanBiometerDeepDive />
            <CTA />
            <Footer />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
