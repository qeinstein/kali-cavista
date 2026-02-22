"use client";

import { motion } from "framer-motion";
import { Wind, Volume2, ShieldCheck, Map as MapIcon, AlertCircle } from "lucide-react";

export default function UrbanBiometerDeepDive() {
    return (
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
    );
}
