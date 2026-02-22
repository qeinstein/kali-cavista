"use client";

import { motion } from "framer-motion";
import { Brain, ShieldCheck, ArrowRight } from "lucide-react";

export default function Modules() {
    return (
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
    );
}
