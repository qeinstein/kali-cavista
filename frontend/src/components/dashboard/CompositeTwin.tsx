"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    Droplets,
    Heart,
    AlertTriangle,
    TrendingUp,
    Activity,
    Gauge,
    Moon,
    Footprints,
    Flame,
    Coffee,
    Clock,
} from "lucide-react";

// ─── Anonymous user seed data ───────────────────────────────────────────────
const USERS = [
    { id: "A7", color: "bg-emerald-500" },
    { id: "3K", color: "bg-primary" },
    { id: "R2", color: "bg-teal-500" },
    { id: "9X", color: "bg-lime-500" },
    { id: "M4", color: "bg-cyan-500" },
    { id: "P6", color: "bg-[#1b4332]" },
    { id: "T1", color: "bg-emerald-300" },
    { id: "B8", color: "bg-[#40916c]" },
];

/** Deterministic pseudo-random seeded from user id string */
function seededRandom(seed: string, index: number): number {
    let hash = 0;
    const str = seed + index;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash % 100) / 100;
}

function genUserData(userId: string) {
    const r = (i: number, min: number, max: number) =>
        Math.round(min + seededRandom(userId, i) * (max - min));

    const energy = r(1, 2, 10);
    const mealHoursAgo = r(2, 1, 8);
    const sleepQuality = r(3, 30, 95);
    const steps = r(4, 800, 14000);
    const hrv = r(5, 22, 88);

    const hydration = r(6, 25, 95);
    const ambientTemp = r(7, 65, 105);
    const caloriesBurned = r(8, 150, 900);
    const waterLogs = r(9, 1, 8);

    const moodScore = r(10, 20, 95);
    const sleepHours = r(11, 3, 9);
    const activityLevel = r(12, 10, 90);
    const timeSinceEating = r(13, 1, 9);

    // Derived insights
    const energyTrend = energy > 6 ? "stable" : energy > 3 ? "declining" : "critical";
    const hydrationDeficitIn =
        hydration < 40 ? `~${r(14, 10, 30)} min` : hydration < 65 ? `~${r(15, 45, 90)} min` : null;
    const stressRisk = sleepHours < 6 && timeSinceEating > 5 ? "high" : moodScore < 45 ? "moderate" : "low";

    return {
        energy,
        mealHoursAgo,
        sleepQuality,
        steps,
        hrv,
        hydration,
        ambientTemp,
        caloriesBurned,
        waterLogs,
        moodScore,
        sleepHours,
        activityLevel,
        timeSinceEating,
        energyTrend,
        hydrationDeficitIn,
        stressRisk,
    };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function FactorChip({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-2/5 border border-ink-2/8 text-[11px]">
            <span className="text-primary/80">{icon}</span>
            <span className="text-muted font-medium">{label}</span>
            <span className="font-bold text-ink-2 ml-0.5">{value}</span>
        </div>
    );
}

function RadialGauge({
    value,
    max = 10,
    color,
    size = 100,
}: {
    value: number;
    max?: number;
    color: string;
    size?: number;
}) {
    const pct = value / max;
    const r = 38;
    const circumference = 2 * Math.PI * r;
    const dash = pct * circumference;

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-ink-2/8" />
            <motion.circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - dash }}
                transition={{ duration: 1.4, ease: "easeOut" }}
            />
        </svg>
    );
}

function WaveFill({ pct }: { pct: number }) {
    return (
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-teal-400/30 bg-teal-50">
            <motion.div
                className="absolute bottom-0 left-0 right-0 bg-teal-400/70"
                initial={{ height: "0%" }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 1.6, ease: "easeOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-teal-700 tabular-nums">{pct}%</span>
            </div>
        </div>
    );
}

function MoodArc({ score }: { score: number }) {
    const angle = (score / 100) * 180 - 90; // -90 to +90 degrees
    const getColor = () => {
        if (score >= 65) return "#10b981"; // emerald
        if (score >= 40) return "#f59e0b"; // amber
        return "#ef4444"; // red
    };
    return (
        <div className="relative flex items-center justify-center w-28 h-14 overflow-hidden">
            <svg viewBox="0 0 120 60" className="w-full h-full">
                {/* Track */}
                <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="currentColor" strokeWidth="8" className="text-ink-2/8" strokeLinecap="round" />
                {/* Fill */}
                <motion.path
                    d="M 10 55 A 50 50 0 0 1 110 55"
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="157"
                    initial={{ strokeDashoffset: 157 }}
                    animate={{ strokeDashoffset: 157 - (score / 100) * 157 }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                />
                {/* Needle */}
                <motion.line
                    x1="60"
                    y1="55"
                    x2="60"
                    y2="15"
                    stroke={getColor()}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ rotate: -90, originX: "60px", originY: "55px" }}
                    animate={{ rotate: angle, originX: "60px", originY: "55px" }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                />
                <circle cx="60" cy="55" r="4" fill={getColor()} />
            </svg>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[11px] font-black text-ink-2 tabular-nums">
                {score}/100
            </div>
        </div>
    );
}

// ─── Model Cards ─────────────────────────────────────────────────────────────

function EnergyCard({ data }: { data: ReturnType<typeof genUserData> }) {
    const trendColors: Record<string, string> = {
        stable: "text-emerald-600 bg-emerald-50 border-emerald-200",
        declining: "text-amber-600 bg-amber-50 border-amber-200",
        critical: "text-danger bg-red-50 border-red-200",
    };
    const nudge =
        data.energyTrend === "critical"
            ? "Your focus is about to dip. A 10-min walk now will extend your productivity by an hour."
            : data.energyTrend === "declining"
                ? "Energy trending down. A light snack in the next 30 min is recommended."
                : "Energy levels are stable. Keep up the momentum!";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="flex-1 bg-bg-2/60 backdrop-blur-sm border border-ink-2/8 rounded-[24px] p-6 flex flex-col gap-5"
        >
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                    <Zap size={20} />
                </div>
                <div>
                    <h4 className="text-[13px] font-black text-ink-2 uppercase tracking-wider leading-none font-outfit">
                        Energy &amp; Focus
                    </h4>
                    <p className="text-[10px] text-muted uppercase tracking-[0.15em] mt-0.5 font-outfit">
                        The Battery Model
                    </p>
                </div>
                <div className={`ml-auto px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${trendColors[data.energyTrend]}`}>
                    {data.energyTrend}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <RadialGauge value={data.energy} max={10} color="#f59e0b" size={96} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90 -translate-x-px translate-y-px">
                        <span className="text-[22px] font-black text-ink-2 leading-none tabular-nums">{data.energy}</span>
                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider">/10</span>
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-[11px] text-muted font-outfit leading-relaxed">
                        Predicted level in next <span className="font-bold text-ink-2">2 hours</span>
                    </p>
                    <div className="mt-3 p-3 rounded-[14px] bg-primary/5 border border-primary/10">
                        <div className="flex items-start gap-2">
                            <TrendingUp size={13} className="text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-ink-2/80 font-outfit leading-snug italic">{nudge}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <FactorChip icon={<Coffee size={11} />} label="Last meal" value={`${data.mealHoursAgo}h ago`} />
                <FactorChip icon={<Moon size={11} />} label="Sleep" value={`${data.sleepQuality}%`} />
                <FactorChip icon={<Footprints size={11} />} label="Steps" value={data.steps.toLocaleString()} />
                <FactorChip icon={<Activity size={11} />} label="HRV" value={`${data.hrv}ms`} />
            </div>
        </motion.div>
    );
}

function HydrationCard({ data }: { data: ReturnType<typeof genUserData> }) {
    const isAlert = !!data.hydrationDeficitIn;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 bg-bg-2/60 backdrop-blur-sm border border-ink-2/8 rounded-[24px] p-6 flex flex-col gap-5"
        >
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-400/10 text-teal-600">
                    <Droplets size={20} />
                </div>
                <div>
                    <h4 className="text-[13px] font-black text-ink-2 uppercase tracking-wider leading-none font-outfit">
                        Hydration
                    </h4>
                    <p className="text-[10px] text-muted uppercase tracking-[0.15em] mt-0.5 font-outfit">
                        Equilibrium Model
                    </p>
                </div>
                {isAlert && (
                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border-red-200">
                        <AlertTriangle size={11} />
                        Deficit Soon
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">
                <WaveFill pct={data.hydration} />
                <div className="flex-1">
                    <p className="text-[11px] text-muted font-outfit leading-relaxed">
                        Predicted hydration score right now
                    </p>
                    {isAlert && (
                        <div className="mt-3 p-3 rounded-[14px] bg-red-50 border border-red-200">
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={12} className="text-danger mt-0.5 flex-shrink-0" />
                                <p className="text-[11px] text-danger/90 font-outfit leading-snug italic">
                                    Critical hydration deficit in {data.hydrationDeficitIn}. Active in{" "}
                                    {data.ambientTemp}°F weather — rehydrate now.
                                </p>
                            </div>
                        </div>
                    )}
                    {!isAlert && (
                        <div className="mt-3 p-3 rounded-[14px] bg-teal-50 border border-teal-200">
                            <p className="text-[11px] text-teal-700 font-outfit leading-snug italic">
                                Hydration equilibrium maintained. Current activity levels are sustainable.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <FactorChip icon={<Gauge size={11} />} label="Temp" value={`${data.ambientTemp}°F`} />
                <FactorChip icon={<Flame size={11} />} label="Cal burned" value={`${data.caloriesBurned}`} />
                <FactorChip icon={<Droplets size={11} />} label="Water logs" value={`${data.waterLogs} glasses`} />
            </div>
        </motion.div>
    );
}

function EmotionalCard({ data }: { data: ReturnType<typeof genUserData> }) {
    const riskColors: Record<string, string> = {
        high: "text-danger bg-red-50 border-red-200",
        moderate: "text-amber-600 bg-amber-50 border-amber-200",
        low: "text-emerald-600 bg-emerald-50 border-emerald-200",
    };
    const nudge =
        data.stressRisk === "high"
            ? `You slept ${data.sleepHours}h and haven't eaten in ${data.timeSinceEating}h. Based on your pattern, you're at high risk of a stress spike. Consider a light snack.`
            : data.stressRisk === "moderate"
                ? "Mood is slightly below baseline. Light movement or a meal can help stabilise."
                : "Emotional resilience looks solid. Your recent patterns are healthy.";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex-1 bg-bg-2/60 backdrop-blur-sm border border-ink-2/8 rounded-[24px] p-6 flex flex-col gap-5"
        >
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-400/10 text-emerald-600">
                    <Heart size={20} />
                </div>
                <div>
                    <h4 className="text-[13px] font-black text-ink-2 uppercase tracking-wider leading-none font-outfit">
                        Emotional Resilience
                    </h4>
                    <p className="text-[10px] text-muted uppercase tracking-[0.15em] mt-0.5 font-outfit">
                        The Vibe Model
                    </p>
                </div>
                <div className={`ml-auto px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${riskColors[data.stressRisk]}`}>
                    {data.stressRisk} risk
                </div>
            </div>

            <div className="flex items-center gap-6">
                <MoodArc score={data.moodScore} />
                <div className="flex-1">
                    <p className="text-[11px] text-muted font-outfit leading-relaxed">
                        Predicted mood &amp; stress state
                    </p>
                    <div className={`mt-3 p-3 rounded-[14px] border ${data.stressRisk === "high" ? "bg-red-50 border-red-200" : data.stressRisk === "moderate" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                        <div className="flex items-start gap-2">
                            <Heart size={12} className={data.stressRisk === "high" ? "text-danger mt-0.5 flex-shrink-0" : data.stressRisk === "moderate" ? "text-amber-600 mt-0.5 flex-shrink-0" : "text-emerald-600 mt-0.5 flex-shrink-0"} />
                            <p className={`text-[11px] font-outfit leading-snug italic ${data.stressRisk === "high" ? "text-danger/90" : data.stressRisk === "moderate" ? "text-amber-700" : "text-emerald-700"}`}>
                                {nudge}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <FactorChip icon={<Clock size={11} />} label="Last meal" value={`${data.timeSinceEating}h ago`} />
                <FactorChip icon={<Moon size={11} />} label="Sleep" value={`${data.sleepHours}h`} />
                <FactorChip icon={<Activity size={11} />} label="Activity" value={`${data.activityLevel}%`} />
            </div>
        </motion.div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function CompositeTwin() {
    const [activeUser, setActiveUser] = useState(USERS[0]);

    const data = useMemo(() => genUserData(activeUser.id), [activeUser.id]);

    return (
        <div className="bg-bg-2/50 backdrop-blur-xl rounded-[32px] p-4 md:p-8 border border-ink-2/5 shadow-sm flex flex-col gap-6 md:gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-ink-2 font-outfit uppercase tracking-wider leading-none mb-1">
                            Composite Digital Twin
                        </h3>
                        <p className="text-[10px] text-muted font-outfit uppercase tracking-[0.2em]">
                            Mobile App Intelligence · Live Predictions
                        </p>
                    </div>
                </div>

                {/* Anonymous User Pills */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                        Viewing
                    </span>
                    <div className="flex flex-row overflow-x-auto pb-2 md:pb-0 scrollbar-hide gap-2">
                        {USERS.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => setActiveUser(user)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 border whitespace-nowrap ${activeUser.id === user.id
                                    ? "bg-primary text-white border-primary shadow-md scale-105"
                                    : "bg-background text-ink-2 border-ink-2/10 hover:border-primary/50 hover:text-primary"
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${user.color} flex-shrink-0`} />
                                User #{user.id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Privacy Notice */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/5 border border-primary/10 w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] text-primary/80 font-outfit font-semibold uppercase tracking-widest">
                    All identities anonymised via ZK-Aggregate · Data sourced from mobile app logs
                </p>
            </div>

            {/* Three Model Cards */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeUser.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col lg:flex-row gap-5"
                >
                    <EnergyCard data={data} />
                    <HydrationCard data={data} />
                    <EmotionalCard data={data} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
