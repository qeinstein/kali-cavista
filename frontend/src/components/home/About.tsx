"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiActivity, FiShield } from "react-icons/fi";
import { FaBrain, FaStethoscope } from "react-icons/fa6";
import { flowLineVariants } from "./variants";

export default function About() {
    const { t } = useTranslation();

    return (
        <section id="about" className="w-full">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div>
                        <h2 className="text-sm uppercase tracking-widest text-primary font-bold mb-4">
                            {t('about.badge', "What is SPAG")}
                        </h2>
                        <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                            {t('about.title', "The National Prevention Engine")}
                        </h3>
                        <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                            {t('about.desc1', "SPAG is not about treating diseases; it's about predicting and preventing them before symptoms ever appear.")}
                        </p>
                        <p className="text-lg text-foreground/70 leading-relaxed">
                            {t('about.desc2', "By seamlessly collecting your everyday health data, SPAG runs it through our advanced AI risk engine to identify anomalies. If a risk is detected, the data is instantly bridged to your doctor's dashboard for preemptive action.")}
                        </p>
                    </div>

                    {/* Right Content - Flow Diagram */}
                    <div className="relative flex justify-center md:justify-end">
                        {/* SVG Connecting Line */}
                        <svg
                            className="absolute left-[50%] md:left-[60%] top-6 bottom-6 w-2 -translate-x-[50%] md:-translate-x-0 z-0 hidden sm:block"
                            height="100%"
                            width="4px"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <motion.line
                                x1="2"
                                y1="0"
                                x2="2"
                                y2="100%"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="8 8"
                                className="opacity-50 text-primary"
                                initial="hidden"
                                animate="visible"
                                variants={flowLineVariants}
                            />
                        </svg>

                        {/* Flow Nodes Container */}
                        <div className="flex flex-col gap-10 relative z-10 w-full max-w-sm">
                            <div className="flex items-center gap-4 bg-bg-2/60 backdrop-blur-md border border-foreground/5 p-4 rounded-2xl shadow-sm">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                                    <FiActivity size={24} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-semibold text-base">{t('about.nodes.collection', "Daily Data Collection")}</h4>
                                    <p className="text-sm text-foreground/60">{t('about.nodes.vitals', "Wearables & vitals")}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-bg-2/60 backdrop-blur-md border border-foreground/5 p-4 rounded-2xl shadow-sm">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                                    <FaBrain size={24} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-semibold text-base">{t('about.nodes.nutrisense', "NutriSense AI")}</h4>
                                    <p className="text-sm text-foreground/60">{t('about.nodes.metabolic', "Metabolic processing")}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-bg-2/60 backdrop-blur-md border border-foreground/5 p-4 rounded-2xl shadow-sm">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                                    <FiShield size={24} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-semibold text-base">{t('about.nodes.risk_engine', "SPAG Risk Engine")}</h4>
                                    <p className="text-sm text-foreground/60">{t('about.nodes.anomaly', "Anomaly detection")}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-bg-2/60 backdrop-blur-md border border-foreground/5 p-4 rounded-2xl shadow-sm">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                                    <FaStethoscope size={24} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-semibold text-base">{t('about.nodes.doctor', "Doctor Dashboard")}</h4>
                                    <p className="text-sm text-foreground/60">{t('about.nodes.preemptive', "Preemptive care")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
