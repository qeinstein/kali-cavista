"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGlobe, FiFilter, FiInfo } from 'react-icons/fi';

const REGIONS = [
    { id: 'na', name: 'North America', stability: 74, hydration: 62, activity: 85, color: 'bg-emerald-500', pos: { t: '30%', l: '20%' } },
    { id: 'eu', name: 'Europe', stability: 82, hydration: 78, activity: 72, color: 'bg-primary', pos: { t: '25%', l: '50%' } },
    { id: 'as', name: 'Asia Pacific', stability: 68, hydration: 54, activity: 91, color: 'bg-amber-500', pos: { t: '40%', l: '75%' } },
    { id: 'af', name: 'Africa', stability: 61, hydration: 42, activity: 88, color: 'bg-danger', pos: { t: '55%', l: '50%' } },
    { id: 'sa', name: 'South America', stability: 71, hydration: 59, activity: 79, color: 'bg-blue-500', pos: { t: '65%', l: '35%' } },
];

const CONNECTIONS = [
    { from: 'na', to: 'eu' },
    { from: 'eu', to: 'as' },
    { from: 'eu', to: 'af' },
    { from: 'af', to: 'sa' },
    { from: 'sa', to: 'na' },
];

export default function GlobalHealthMap() {
    const [selectedRegion, setSelectedRegion] = useState(REGIONS[1]);

    // Semi-circle path generator
    const getCurvePath = (x1: string, y1: string, x2: string, y2: string) => {
        const x1n = parseFloat(x1);
        const y1n = parseFloat(y1);
        const x2n = parseFloat(x2);
        const y2n = parseFloat(y2);

        // Control point for the curve (midpoint + perpendicular offset)
        const mx = (x1n + x2n) / 2;
        const my = (y1n + y2n) / 2 - 15; // Offset upwards for the semi-circle effect

        return `M ${x1n} ${y1n} Q ${mx} ${my} ${x2n} ${y2n}`;
    };

    return (
        <div className="bg-bg-2/50 backdrop-blur-xl rounded-[32px] p-8 border border-ink-2/5 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                        <FiGlobe size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-ink-2 font-outfit uppercase tracking-wider leading-none mb-1">Global Intelligence Grid</h3>
                        <p className="text-[10px] text-muted font-outfit uppercase tracking-[0.2em]">Sovereign Health Consensus</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-ink-2/5 bg-white/50 text-[10px] font-bold text-ink-2/60 uppercase tracking-widest">
                    <FiFilter size={14} />
                    <span>Real-time Pulse Calibration</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 flex-1">
                {/* Visual Interconnected Map Representation */}
                <div className="xl:col-span-8 relative min-h-[400px] bg-[#020817] rounded-[24px] overflow-hidden border border-primary/20 shadow-inner">
                    {/* CIA-style Orbiting Map Grid */}
                    <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-20"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0229BF_0%,transparent_70%)]" />
                    </motion.div>

                    {/* Technical Blue Map Atmosphere */}
                    <div className="absolute inset-0 bg-[#020817]/40 pointer-events-none" />

                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <filter id="glow-white">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Animated Semi-circle Connections */}
                        {CONNECTIONS.slice(0, 3).map((conn, i) => {
                            const from = REGIONS.find(r => r.id === conn.from)!;
                            const to = REGIONS.find(r => r.id === conn.to)!;
                            return (
                                <motion.path
                                    key={i}
                                    d={getCurvePath(from.pos.l, from.pos.t, to.pos.l, to.pos.t)}
                                    stroke="#FFFFFF"
                                    strokeWidth="1.2"
                                    strokeDasharray="4 4"
                                    fill="transparent"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.6 }}
                                    transition={{ duration: 3, delay: i * 1, repeat: Infinity }}
                                    className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                />
                            );
                        })}
                    </svg>

                    {/* Top-tier Strategic Nodes (Top 3 as requested) */}
                    <div className="relative w-full h-full">
                        {REGIONS.slice(0, 3).map((region) => (
                            <div
                                key={region.id}
                                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                style={{ top: region.pos.t, left: region.pos.l }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.3 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedRegion(region)}
                                    className="relative z-10 w-4 h-4 rounded-full border-2 border-white bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all"
                                />
                                {/* Node Pulse */}
                                <motion.div
                                    animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full border border-white -z-10"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-[#020817]/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Security Protocol: Active</span>
                            <span className="text-[7px] text-white/50 font-bold uppercase tracking-tighter mt-1">Grid Alpha Node Validation</span>
                        </div>
                    </div>
                </div>

                {/* Region Analysis Section */}
                <div className="xl:col-span-4 flex flex-col justify-between">
                    <motion.div
                        key={selectedRegion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1"
                    >
                        <div className="mb-8">
                            <h4 className="text-3xl font-black text-ink-2 font-outfit leading-tight mb-2 tracking-tighter">{selectedRegion.name}</h4>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(2,41,191,0.4)]" />
                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Network Consensus Verified</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <StatProgress label="Metabolic Grid Sync" value={selectedRegion.stability} color="bg-primary" />
                            <StatProgress label="Anonymity Integrity" value={selectedRegion.hydration} color="bg-primary/60" />
                            <StatProgress label="Environmental Defense" value={selectedRegion.activity} color="bg-primary/30" />
                        </div>
                    </motion.div>

                    <div className="mt-8 p-5 rounded-[24px] bg-bg-2 border border-ink-2/5 flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                            <FiInfo size={18} />
                        </div>
                        <p className="text-[10px] text-ink-2/70 font-outfit leading-relaxed italic">
                            Tactical health consensus derived from ZK-Aggregate biometrics.
                            Policy simulation active across selected geographical health sectors.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatProgress({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold text-ink-2/60 font-outfit uppercase tracking-widest leading-none">{label}</span>
                <span className="text-base font-black text-ink-2 font-outfit tabular-nums leading-none tracking-tighter">{value}%</span>
            </div>
            <div className="h-2 w-full bg-ink-2/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full`}
                />
            </div>
        </div>
    );
}
