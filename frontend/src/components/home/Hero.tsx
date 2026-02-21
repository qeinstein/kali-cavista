"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { containerVariants, itemVariants } from "./variants";
import Antigravity from "./Antigravity";

export default function Hero() {
    const letters = [
        { char: 'S', word: 'Sovereign', pos: 'top-right' },
        { char: 'P', word: 'Preventive', pos: 'top-left' },
        { char: 'A', word: 'AI', pos: 'bottom-right' },
        { char: 'G', word: 'Grid', pos: 'bottom-left' }
    ];

    return (
        <section id="hero" className="w-full relative overflow-hidden bg-background">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <Antigravity
                    count={250}
                    color="#2D6A4F"
                    particleSize={1.5}
                    magnetRadius={15}
                    ringRadius={12}
                    autoAnimate={true}
                />
            </div>

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

                {/* Central Letter Stack */}
                <motion.div
                    className="flex flex-col items-center gap-4 md:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {letters.map((item, index) => (
                        <motion.span
                            key={item.char}
                            variants={itemVariants}
                            className="text-6xl md:text-9xl font-black text-foreground select-none relative z-20"
                        >
                            {item.char}
                        </motion.span>
                    ))}
                </motion.div>

                {/* Corner Words */}
                <div className="absolute inset-x-8 inset-y-12 md:inset-x-24 md:inset-y-32 h-full">
                    {/* Top Left - Preventive */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute top-0 left-0 text-2xl md:text-4xl font-bold text-primary"
                    >
                        Preventive
                    </motion.div>

                    {/* Top Right - Sovereign */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute top-0 right-0 text-2xl md:text-4xl font-bold text-primary"
                    >
                        Sovereign
                    </motion.div>

                    {/* Bottom Left - Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-0 left-0 text-2xl md:text-4xl font-bold text-primary"
                    >
                        Grid
                    </motion.div>

                    {/* Bottom Right - AI */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-0 right-0 text-2xl md:text-4xl font-bold text-primary"
                    >
                        AI
                    </motion.div>
                </div>

                {/* SVG Arrows Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orientation="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-primary/40" />
                        </marker>
                    </defs>

                    {/* Arrow S -> Sovereign (Top Right) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        d="M 50 35 L 75 35 L 75 30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        strokeDasharray="1 1"
                        className="text-primary/30"
                        markerEnd="url(#arrowhead)"
                    />

                    {/* Arrow P -> Preventive (Top Left) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 1.8, duration: 1 }}
                        d="M 50 45 L 25 45 L 25 30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        strokeDasharray="1 1"
                        className="text-primary/30"
                        markerEnd="url(#arrowhead)"
                    />

                    {/* Arrow A -> AI (Bottom Right) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 2.1, duration: 1 }}
                        d="M 50 55 L 75 55 L 75 70"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        strokeDasharray="1 1"
                        className="text-primary/30"
                        markerEnd="url(#arrowhead)"
                    />

                    {/* Arrow G -> Grid (Bottom Left) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 2.4, duration: 1 }}
                        d="M 50 65 L 25 65 L 25 70"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        strokeDasharray="1 1"
                        className="text-primary/30"
                        markerEnd="url(#arrowhead)"
                    />
                </svg>

                {/* CTA Button Overlay */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3 }}
                    className="absolute bottom-12 pointer-events-auto"
                >
                    <Link href="/dashboard" className="group relative bg-primary hover:bg-primary-hover text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl text-lg font-bold transition-all shadow-xl hover:shadow-2xl active:scale-95 block">
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
