"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useLoader } from "@/app/context/LoaderContext";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function TopNav() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isLoaderDone } = useLoader();
    const { theme, toggleTheme } = useTheme();

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "About", href: "/#about" },
        { name: "Modules", href: "/#modules" },
    ];

    return (
        <AnimatePresence>
            {isLoaderDone && (
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={clsx(
                        "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
                        isScrolled
                            ? "bg-background/80 backdrop-blur-md border-b border-foreground/5 shadow-lg shadow-black/5"
                            : "bg-transparent border-b border-transparent"
                    )}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-[72px]">
                            {/* Logo Section */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <Link href="/" className="flex items-center gap-2 group">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
                                        <span className="text-primary font-bold text-xl tracking-tighter">S</span>
                                    </div>
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

                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/70 transition-colors"
                                    aria-label="Toggle theme"
                                >
                                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                            </nav>

                            {/* Right Action (CTA)
                            <div className="hidden md:flex items-center">
                                <Link href="/dashboard" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-[0_0_15px_rgba(45,106,79,0.1)] hover:shadow-[0_0_20px_rgba(45,106,79,0.2)] active:scale-95">
                                   Dashboard
                                </Link>
                            </div> */}

                            {/* Hamburger Menu Toggle (Mobile/Tablet) */}
                            <div className="flex md:hidden items-center gap-2">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/70 transition-colors"
                                    aria-label="Toggle theme"
                                >
                                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
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
                                            Get Started
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
