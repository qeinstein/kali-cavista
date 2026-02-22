import React from 'react';
import { motion } from 'framer-motion';

export const MAP_REGIONS = [
    { id: 'na', name: 'North America', stability: 74, hydration: 62, activity: 85, color: 'bg-emerald-500', pos: { t: '30%', l: '20%' } },
    { id: 'eu', name: 'Europe', stability: 82, hydration: 78, activity: 72, color: 'bg-primary', pos: { t: '25%', l: '50%' } },
    { id: 'as', name: 'Asia Pacific', stability: 68, hydration: 54, activity: 91, color: 'bg-amber-500', pos: { t: '40%', l: '75%' } },
    { id: 'af', name: 'Africa', stability: 61, hydration: 42, activity: 88, color: 'bg-danger', pos: { t: '55%', l: '50%' } },
    { id: 'sa', name: 'South America', stability: 71, hydration: 59, activity: 79, color: 'bg-teal-500', pos: { t: '65%', l: '35%' } },
];

export const MAP_CONNECTIONS = [
    { from: 'na', to: 'eu' },
    { from: 'eu', to: 'as' },
    { from: 'eu', to: 'af' },
    { from: 'af', to: 'sa' },
    { from: 'sa', to: 'na' },
];

interface AnimatedMapProps {
    onRegionSelect?: (region: typeof MAP_REGIONS[0]) => void;
    activeRegionId?: string;
    interactive?: boolean;
}

export function AnimatedMap({ onRegionSelect, activeRegionId, interactive = true }: AnimatedMapProps) {
    // Generate an elliptical arc path simulating the curvature of the earth
    const getArcPath = (x1: string, y1: string, x2: string, y2: string) => {
        const x1n = parseFloat(x1);
        const y1n = parseFloat(y1);
        const x2n = parseFloat(x2);
        const y2n = parseFloat(y2);

        // Distance determines arc size
        const dx = x2n - x1n;
        const dy = y2n - y1n;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Sweep flag for upward curve vs downward
        const sweep = x1n < x2n ? 1 : 0;
        const rx = dist * 0.7; // X radius
        const ry = dist * 0.5; // Y radius (slight flattening for 3D trajectory)

        return `M ${x1n} ${y1n} A ${rx} ${ry} 0 0 ${sweep} ${x2n} ${y2n}`;
    };

    return (
        <div className="absolute inset-0 bg-[#062716] overflow-hidden w-full h-full">
            {/* Dark Green Solid Background overriding theme background */}

            {/* Subtle Grid and Radial gradient for depth */}
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-30"
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#52b788_1px,transparent_1px),linear-gradient(to_bottom,#52b788_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1b4332_0%,transparent_70%)]" />
            </motion.div>

            {/* Simulated World Map Points (Dot Matrix Layout) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #52b788 1.5px, transparent 1.5px)', backgroundSize: '15px 15px' }} />

            <div className="absolute inset-0 bg-[#062716]/60 pointer-events-none" />

            {/* SVG Layer for Arcs (Uses viewBox 0 0 100 100 to map percentages properly) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <filter id="glow-white">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Animated Flight-path Arcs */}
                {MAP_CONNECTIONS.slice(0, 3).map((conn, i) => {
                    const from = MAP_REGIONS.find(r => r.id === conn.from)!;
                    const to = MAP_REGIONS.find(r => r.id === conn.to)!;
                    return (
                        <motion.path
                            key={i}
                            d={getArcPath(from.pos.l, from.pos.t, to.pos.l, to.pos.t)}
                            stroke="#FFFFFF"
                            strokeWidth="0.4"
                            strokeDasharray="1 1.5"
                            fill="transparent"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 0.8 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 2, delay: i * 1.5 + 0.5, ease: "easeInOut" }}
                            filter="url(#glow-white)"
                        />
                    );
                })}
            </svg>

            {/* Interactive Nodes */}
            <div className="relative w-full h-full">
                {MAP_REGIONS.slice(0, 3).map((region) => {
                    const isActive = region.id === activeRegionId;
                    return (
                        <div
                            key={region.id}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 ${interactive ? 'cursor-pointer group' : ''}`}
                            style={{ top: region.pos.t, left: region.pos.l }}
                        >
                            <motion.button
                                whileHover={interactive ? { scale: 1.3 } : {}}
                                whileTap={interactive ? { scale: 0.9 } : {}}
                                onClick={() => interactive && onRegionSelect && onRegionSelect(region)}
                                className={`relative z-10 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white bg-white transition-all ${isActive ? 'shadow-[0_0_20px_rgba(255,255,255,1)] scale-125' : 'shadow-[0_0_10px_rgba(255,255,255,0.6)]'}`}
                                disabled={!interactive}
                            />
                            {/* Node Pulse */}
                            <motion.div
                                animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 4, repeat: Infinity, delay: Math.random() * 2 }}
                                className="absolute inset-0 rounded-full border border-white -z-10"
                            />

                            {/* City Label */}
                            {isActive && interactive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-lg border border-white/20"
                                >
                                    {region.name}
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
