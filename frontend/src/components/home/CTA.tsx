"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
    return (
        <section id="cta" className="w-full relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="max-w-4xl mx-auto px-4 text-center py-32 md:py-48"
            >
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8">
                    This is prevention intelligence. <br /> Not reaction.
                </h2>
                <p className="text-xl text-ink-2 mb-12 max-w-2xl mx-auto">
                    SPAG is already learning. Your health data is already speaking.
                </p>
                <div className="flex flex-col items-center gap-6">
                    <Link
                        href="/dashboard"
                        className="bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-full text-lg font-bold transition-all shadow-[0_20px_40px_rgba(45,106,79,0.1)] active:scale-95 text-center"
                    >
                        Enter Dashboard
                    </Link>
                    <p className="text-sm font-medium text-foreground/30 italic">
                        NutriSense + Urban Biometer — active inside SPAG.
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
