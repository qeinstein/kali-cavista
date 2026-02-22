"use client";

import { motion } from "framer-motion";
import { FiCalendar, FiAlertTriangle } from "react-icons/fi";

export default function NutriSenseDeepDive() {
    return (
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
                                <FiCalendar size={18} className="text-foreground/20" />
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
                                <FiAlertTriangle size={20} />
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
    );
}
