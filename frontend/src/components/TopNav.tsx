"use client";

import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoader } from "@/app/context/LoaderContext";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export default function TopNav() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isLoaderDone } = useLoader();
    const { t } = useTranslation();

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: t("nav.about"), href: "/#about" },
        { name: t("nav.modules"), href: "/#modules" },
    ];

    return (
        <AnimatePresence>
            {isLoaderDone && (
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${isScrolled
                        ? "bg-background/80 backdrop-blur-md border-b border-foreground/5 shadow-lg shadow-black/5"
                        : "bg-transparent border-b border-transparent"
                        }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-[72px]">
                            {/* Logo Section */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <Link href="/" className="flex items-center gap-2 group text-primary hover:text-primary-hover transition-colors">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:scale-105 transition-transform duration-300">
                                        <rect x="4" y="3" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M18 6.5 V12 H6 V17.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <rect x="4" y="17.5" width="16" height="3.5" rx="1" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                                {/* Language Toggle */}
                                <div className="flex items-center gap-4">
                                    <LanguageSwitcher />
                                </div>
                            </nav>

                            {/* Right Action (CTA)
                            <div className="hidden md:flex items-center">
                                <Link href="/dashboard" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-[0_0_15px_rgba(45,106,79,0.1)] hover:shadow-[0_0_20px_rgba(45,106,79,0.2)] active:scale-95">
                                   Dashboard
                                </Link>
                            </div> */}

                            {/* Hamburger Menu Toggle (Mobile/Tablet) */}
                            <div className="flex md:hidden items-center gap-2">
                                <LanguageSwitcher />
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="text-foreground/70 hover:text-primary p-2 transition-colors focus:outline-none"
                                    aria-label="Toggle menu"
                                >
                                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden border-b border-foreground/10 bg-background/95 backdrop-blur-xl overflow-hidden"
                            >
                                <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-3 py-4 text-base font-medium text-foreground/80 hover:text-primary hover:bg-foreground/5 rounded-xl transition-all"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                    <div className="pt-4 mt-2 border-t border-foreground/5">
                                        <Link href="/dashboard" className="block w-full text-center bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white px-5 py-3 rounded-xl text-base font-medium transition-all duration-200">
                                            {t("hero.enter")}
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.header>
            )}
        </AnimatePresence>
    );
}
