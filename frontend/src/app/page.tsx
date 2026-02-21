"use client";

import { useLoader } from "@/app/context/LoaderContext";
import SpagLoader from "@/components/SpagLoader";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Activity,
  Brain,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Wind,
  Volume2,
  Map as MapIcon,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isLoaderDone } = useLoader();

  // Container for staggering children (Hero)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  // Variants for scroll-in sections
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // Connecting dashed line animation for the flow diagram
  const flowLineVariants = {
    hidden: { strokeDashoffset: 100 },
    visible: {
      strokeDashoffset: 0,
      transition: { duration: 2, ease: "linear", repeat: Infinity },
    },
  };

  return (
    <>
      {/* The global loader manages its own unmount via Context now */}
      <SpagLoader />

      {/* Main Content Reveal */}
      <AnimatePresence>
        {isLoaderDone && (
          <div className="flex flex-col w-full">
            {/* HERO SECTION */}
            <section id="hero" className="w-full">
              <motion.div
                className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Spag AI is Online
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-5xl md:text-7xl font-bold tracking-tight text-center max-w-4xl text-foreground mb-6"
                >
                  Data to Prevention <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-hover to-primary">
                    AI as your Health Partner
                  </span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-lg md:text-xl text-center text-foreground/60 max-w-2xl mb-10"
                >
                  Experience the premium, personalized approach to your wellbeing with real-time insights and preemptive care.
                </motion.p>

                <motion.div variants={itemVariants} className="flex items-center gap-4">
                  <Link href="/dashboard" className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full text-base font-semibold transition-all shadow-[0_0_20px_rgba(45,106,79,0.15)] hover:shadow-[0_0_30px_rgba(45,106,79,0.25)] active:scale-95 text-center">
                    Enter Dashboard
                  </Link>
                  <button className="bg-foreground/5 hover:bg-foreground/10 text-foreground border border-foreground/10 px-8 py-4 rounded-full text-base font-semibold transition-all">
                    Learn More
                  </button>
                </motion.div>
              </motion.div>
            </section>

            {/* WHAT IS SPAG SECTION */}
            <section id="about" className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: "easeOut" }
                }}
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  {/* Left Content */}
                  <div>
                    <h2 className="text-sm uppercase tracking-widest text-primary font-bold mb-4">
                      What is SPAG
                    </h2>
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                      The National <br /> Prevention Engine
                    </h3>
                    <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                      SPAG is not about treating diseases; it's about predicting and preventing them before symptoms ever appear.
                    </p>
                    <p className="text-lg text-foreground/70 leading-relaxed">
                      By seamlessly collecting your everyday health data, SPAG runs it through our advanced AI risk engine to identify anomalies. If a risk is detected, the data is instantly bridged to your doctor's dashboard for preemptive action.
                    </p>
                  </div>

                  {/* Right Content - Flow Diagram */}
                  <div className="relative flex justify-center md:justify-end">
                    {/* SVG Connecting Line */}
                    <svg
                      className="absolute left-[50%] md:left-[60%] top-6 bottom-6 w-2 -translate-x-[50%] md:-translate-x-0 z-0 hidden sm:block"
                      height="100%"
                      width="4px"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <motion.line
                        x1="2"
                        y1="0"
                        x2="2"
                        y2="100%"
                        stroke="#2D6A4F"
                        strokeWidth="2"
                        strokeDasharray="8 8"
                        className="opacity-50"
                        initial={{ strokeDashoffset: 100 }}
                        animate={{
                          strokeDashoffset: 0,
                          transition: { duration: 2, ease: "linear", repeat: Infinity }
                        }}
                      />
                    </svg>

                    {/* Flow Nodes Container */}
                    <div className="flex flex-col gap-10 relative z-10 w-full max-w-sm">
                      {/* Nodes... */}
                      <div className="flex items-center gap-4 bg-bg-2/60 backdrop-blur-md border border-foreground/5 p-4 rounded-2xl shadow-sm">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                          <Activity size={24} />
                        </div>
                        <div>
                          <h4 className="text-foreground font-semibold text-base">Daily Data Collection</h4>
                          <p className="text-sm text-foreground/60">Wearables & vitals</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-bg-2/60 backdrop-blur-md border border-foreground/5 p-4 rounded-2xl shadow-sm">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                          <Brain size={24} />
                        </div>
                        <div>
                          <h4 className="text-foreground font-semibold text-base">NutriSense AI</h4>
                          <p className="text-sm text-foreground/60">Metabolic processing</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-bg-2/60 backdrop-blur-md border border-foreground/5 p-4 rounded-2xl shadow-sm">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h4 className="text-foreground font-semibold text-base">SPAG Risk Engine</h4>
                          <p className="text-sm text-foreground/60">Anomaly detection</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-bg-2/60 backdrop-blur-md border border-foreground/5 p-4 rounded-2xl shadow-sm">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                          <Stethoscope size={24} />
                        </div>
                        <div>
                          <h4 className="text-foreground font-semibold text-base">Doctor Dashboard</h4>
                          <p className="text-sm text-foreground/60">Preemptive care</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* MEET THE MODULES SECTION */}
            <section id="modules" className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: "easeOut" }
                }}
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32"
              >
                <div className="text-center mb-16 md:mb-24">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                    Two Modules. One Prevention System.
                  </h2>
                  <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {/* NutriSense Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="group relative bg-bg-2/40 backdrop-blur-sm border border-foreground/5 p-8 md:p-12 rounded-[2.5rem] transition-all duration-500 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(26,23,20,0.05)]"
                  >
                    <div className="flex flex-col h-full">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <Brain size={32} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">NutriSense</h3>
                      <p className="text-lg text-ink-2 leading-relaxed mb-8 flex-1">
                        Your daily nutrition and hydration intelligence layer. Tracks meal timing, hydration patterns, and converts lifestyle rhythm into long-term disease risk signals.
                      </p>
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
                        Explore <ArrowRight size={20} />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] -z-10"></div>
                  </motion.div>

                  {/* Urban Biometer Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="group relative bg-bg-2/40 backdrop-blur-sm border border-foreground/5 p-8 md:p-12 rounded-[2.5rem] transition-all duration-500 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(26,23,20,0.05)]"
                  >
                    <div className="flex flex-col h-full">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <ShieldCheck size={32} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Urban Biometer</h3>
                      <p className="text-lg text-ink-2 leading-relaxed mb-8 flex-1">
                        Transforms cities into anonymous health sensing networks. Air quality, noise stress, traffic patterns, and crowdsourced biometrics — combined into real-time health heatmaps.
                      </p>
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
                        Explore <ArrowRight size={20} />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] -z-10"></div>
                  </motion.div>
                </div>
              </motion.div>
            </section>

            {/* NUTRISENSE DEEP DIVE */}
            <section id="nutrisense" className="w-full bg-bg-2/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="bg-background backdrop-blur-md border border-foreground/5 p-6 rounded-3xl shadow-lg shadow-black/5">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-foreground font-semibold">Today's Timeline</h4>
                        <Calendar size={18} className="text-foreground/20" />
                      </div>
                      <div className="flex items-center justify-between relative px-2">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-foreground/5 -translate-y-1/2 z-0"></div>
                        <div className="flex flex-col items-center gap-2 relative z-10">
                          <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(45,106,79,0.3)]"></div>
                          <span className="text-[10px] uppercase tracking-tighter text-foreground/40 font-bold">Breakfast</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 relative z-10">
                          <div className="w-4 h-4 rounded-full bg-danger shadow-[0_0_10px_rgba(193,18,31,0.3)]"></div>
                          <span className="text-[10px] uppercase tracking-tighter text-foreground/40 font-bold">Lunch</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 relative z-10">
                          <div className="w-4 h-4 rounded-full border-2 border-foreground/10 bg-background"></div>
                          <span className="text-[10px] uppercase tracking-tighter text-foreground/40 font-bold">Dinner</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background backdrop-blur-md border border-danger/10 p-5 rounded-2xl flex gap-4 items-start shadow-sm shadow-danger/5">
                      <div className="w-10 h-10 bg-danger/5 rounded-xl flex items-center justify-center text-danger border border-danger/10">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Pattern Detected</p>
                        <p className="text-xs text-ink-2 leading-relaxed mt-1">
                          You've skipped lunch 3 times this week. Metabolic risk score updated.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <h3 className="text-3xl font-bold tracking-tight text-foreground mb-8">The prevention loop in action</h3>
                    <ol className="space-y-6">
                      {[
                        "Skipped meals detected as anomaly",
                        "NutriSense identifies potential pattern",
                        "SPAG updates your metabolic risk profile",
                        "Doctor sees regional metabolic trends",
                        "Prevention plan recommended via Dashboard"
                      ].map((step, idx) => (
                        <li key={idx} className="flex gap-4 items-start group">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold group-hover:bg-primary group-hover:text-white transition-all">{idx + 1}</span>
                          <p className="text-lg text-foreground/70 pt-0.5">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* URBAN BIOMETER DEEP DIVE */}
            <section id="biometer" className="w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-center max-w-3xl mx-auto mb-16"
                >
                  <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">Your City Is Watching Over You</h3>
                  <p className="text-lg text-ink-2">SPAG's Urban Biometer turns anonymous city data into a personal health shield.</p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {[
                    { label: "Air Quality Index", value: "42 AQI", color: "bg-[#2D6A4F]", icon: <Wind size={20} /> },
                    { label: "Noise Stress Level", value: "Subtle (35dB)", color: "bg-[#B5540A]", icon: <Volume2 size={20} /> },
                    { label: "Outbreak Proximity", value: "None Detected", color: "bg-[#2D6A4F]", icon: <ShieldCheck size={20} /> }
                  ].map((stat, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-bg-2/30 border border-foreground/5 p-6 rounded-2xl flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-foreground/30 uppercase tracking-tighter font-bold">{stat.label}</span>
                        <span className="text-lg font-bold text-foreground">{stat.value}</span>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-primary/30">{stat.icon}</div>
                        <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-bg-2 border border-foreground/5 overflow-hidden rounded-3xl relative h-[400px] shadow-lg shadow-black/5">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #2D6A4F 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                  <div className="absolute top-6 left-6 bg-background/80 backdrop-blur-md px-4 py-2 rounded-lg border border-foreground/5 flex items-center gap-3 shadow-sm">
                    <MapIcon size={16} className="text-primary" />
                    <span className="text-sm font-semibold tracking-wide">Live Health Heatmap — Lagos</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md px-6 py-3 rounded-full border border-foreground/5 flex items-center gap-6 shadow-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#2D6A4F]"></div><span className="text-[10px] uppercase font-bold text-foreground/40">Healthy</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#B5540A]"></div><span className="text-[10px] uppercase font-bold text-foreground/40">Elevated Stress</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#C1121F]"></div><span className="text-[10px] uppercase font-bold text-foreground/40">High Risk</span></div>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-center gap-4 justify-center">
                  <AlertCircle size={18} className="text-primary" />
                  <span className="text-sm font-medium text-ink-2">Pollution hotspot detected on your usual route. Alternative path suggested.</span>
                </motion.div>
              </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section id="cta" className="w-full relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center -z-10"><div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div></div>
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="max-w-4xl mx-auto px-4 text-center py-32 md:py-48">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8">This is prevention intelligence. <br /> Not reaction.</h2>
                <p className="text-xl text-ink-2 mb-12 max-w-2xl mx-auto">SPAG is already learning. Your health data is already speaking.</p>
                <div className="flex flex-col items-center gap-6">
                  <Link href="/dashboard" className="bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-full text-lg font-bold transition-all shadow-[0_20px_40px_rgba(45,106,79,0.1)] active:scale-95 text-center">Enter Dashboard</Link>
                  <p className="text-sm font-medium text-foreground/30 italic">NutriSense + Urban Biometer — active inside SPAG.</p>
                </div>
              </motion.div>
            </section>

            {/* FOOTER */}
            <footer className="w-full border-t border-foreground/5 py-12 px-4 text-center">
              <p className="text-sm text-foreground/20">© 2026 SPAG — National Prevention Engine. All rights reserved.</p>
            </footer>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
