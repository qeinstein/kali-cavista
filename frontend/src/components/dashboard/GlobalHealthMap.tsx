"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGlobe, FiFilter, FiInfo } from 'react-icons/fi';

import { AnimatedMap, MAP_REGIONS } from '../shared/AnimatedMap';

export default function GlobalHealthMap() {
    const [selectedRegion, setSelectedRegion] = useState(MAP_REGIONS[1]);

    return (
        <div className="bg-bg-2/50 backdrop-blur-xl rounded-[32px] p-4 md:p-8 border border-ink-2/5 shadow-sm h-full flex flex-col overflow-hidden">
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

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-10 flex-1">
                {/* Visual Interconnected Map Representation */}
                <div className="xl:col-span-8 relative min-h-[300px] md:min-h-[400px] rounded-[24px] overflow-hidden shadow-inner">
                    <AnimatedMap
                        activeRegionId={selectedRegion.id}
                        onRegionSelect={setSelectedRegion}
                        interactive={true}
                    />

                    <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-background/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
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
                            <h4 className="text-2xl md:text-3xl font-black text-ink-2 font-outfit leading-tight mb-2 tracking-tighter">{selectedRegion.name}</h4>
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
