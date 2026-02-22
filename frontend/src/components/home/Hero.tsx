"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { containerVariants, itemVariants } from "./variants";

export default function Hero() {
    return (
        <section id="hero" className="w-full relative overflow-hidden bg-background">
            {/* SPAG Layout Container */}
            <div className="relative z-10 w-full min-h-[calc(100vh-72px)] flex flex-col items-center justify-center pointer-events-none">

                {/* Status Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-12 md:top-24 pointer-events-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Spag Is Online
                    </div>
                </motion.div>

                {/* Central Horizontal Character Container (SVG Unified) */}
                <motion.div
                    className="flex flex-row items-center gap-6 md:gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {[
                        { char: 'S', d: "M 82,34 C 82,20 70,13 54,13 C 34,13 18,26 18,44 C 18,62 34,72 60,80 C 84,88 94,100 88,118 C 82,134 68,143 50,143 C 32,143 18,134 18,122" },
                        { char: 'P', d: "M 32,13 C 30,50 34,100 32,143 M 32,13 C 85,13 95,40 85,55 C 75,70 50,85 32,90" },
                        { char: 'A', d: "M 55,13 C 40,40 25,100 18,143 M 55,13 C 70,40 85,100 92,143 M 32,95 C 45,95 65,95 78,95" },
                        { char: 'G', d: "M 88,40 C 80,18 64,13 54,13 C 30,13 18,45 18,78 C 18,111 30,143 54,143 C 78,143 90,123 90,103 L 55,103" }
                    ].map(({ char, d }) => (
                        <motion.span
                            key={char}
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: { duration: 0.5 }
                                }
                            }}
                            className="select-none relative z-20 flex items-center justify-center"
                        >
                            <svg
                                className="w-[124px] h-[184px] md:w-[155px] md:h-[230px]"
                                viewBox="0 0 110 165"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <motion.path
                                    d={d}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                                />
                            </svg>
                        </motion.span>
                    ))}
                </motion.div>

                {/* Corner Words (BALANCED EXPANSION) */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Top Left - Sovereign */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            y: [-3, 3],
                        }}
                        transition={{
                            opacity: { delay: 1, duration: 0.5 },
                            y: { repeat: Infinity, repeatType: "reverse", duration: 4, ease: "easeInOut" }
                        }}
                        style={{ left: '25%', top: '25%' }}
                        className="absolute -translate-x-[calc(100%+28px)] -translate-y-1/2 text-xl md:text-3xl font-extrabold text-primary/80 font-outfit"
                    >
                        Sovereign
                    </motion.div>

                    {/* Top Right - Preventive */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            y: [3, -3],
                        }}
                        transition={{
                            opacity: { delay: 1.2, duration: 0.5 },
                            y: { repeat: Infinity, repeatType: "reverse", duration: 4.5, ease: "easeInOut" }
                        }}
                        style={{ left: '75%', top: '25%' }}
                        className="absolute translate-x-[28px] -translate-y-1/2 text-xl md:text-3xl font-extrabold text-primary/80 font-outfit"
                    >
                        Preventive
                    </motion.div>

                    {/* Bottom Left - AI */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            y: [3, -3],
                        }}
                        transition={{
                            opacity: { delay: 1.4, duration: 0.5 },
                            y: { repeat: Infinity, repeatType: "reverse", duration: 4.2, ease: "easeInOut" }
                        }}
                        style={{ left: '25%', top: '75%' }}
                        className="absolute -translate-x-[calc(100%+28px)] -translate-y-1/2 text-xl md:text-3xl font-extrabold text-primary/80 font-outfit"
                    >
                        AI
                    </motion.div>

                    {/* Bottom Right - Grid */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            y: [-3, 3],
                        }}
                        transition={{
                            opacity: { delay: 1.6, duration: 0.5 },
                            y: { repeat: Infinity, repeatType: "reverse", duration: 4.8, ease: "easeInOut" }
                        }}
                        style={{ left: '75%', top: '75%' }}
                        className="absolute translate-x-[28px] -translate-y-1/2 text-xl md:text-3xl font-extrabold text-primary/80 font-outfit"
                    >
                        Grid
                    </motion.div>
                </div>

                {/* SVG Arrows Overlay (BALANCED RECALIBRATION) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-fill" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orientation="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-primary/40" />
                        </marker>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* From S -> Top Left (Sovereign) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        d="M 38 45 L 38 25 L 25 25"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.15"
                        strokeDasharray="1 1"
                        className="text-primary/30"
                        filter="url(#glow)"
                        markerEnd="url(#arrowhead)"
                    />

                    {/* From P -> Top Right (Preventive) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 1.8, duration: 1 }}
                        d="M 46 45 L 46 25 L 75 25"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.15"
                        strokeDasharray="1 1"
                        className="text-primary/30"
                        filter="url(#glow)"
                        markerEnd="url(#arrowhead)"
                    />

                    {/* From A -> Bottom Left (AI) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 2.1, duration: 1 }}
                        d="M 54 55 L 54 75 L 25 75"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.15"
                        strokeDasharray="1 1"
                        className="text-primary/30"
                        filter="url(#glow)"
                        markerEnd="url(#arrowhead)"
                    />

                    {/* From G -> Bottom Right (Grid) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 2.4, duration: 1 }}
                        d="M 62 55 L 62 75 L 75 75"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.15"
                        strokeDasharray="1 1"
                        className="text-primary/30"
                        filter="url(#glow)"
                        markerEnd="url(#arrowhead)"
                    />
                </svg>

                {/* CTA Button Overlay (GLASSY) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3 }}
                    className="absolute bottom-12 pointer-events-auto"
                >
                    <Link
                        href="/dashboard"
                        className="group relative bg-primary/10 backdrop-blur-xl border border-primary/20 text-primary px-8 md:px-12 py-4 md:py-6 rounded-2xl text-lg font-bold transition-all shadow-lg hover:shadow-primary/20 hover:bg-primary/20 active:scale-95 block"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Enter Dashboard
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}
