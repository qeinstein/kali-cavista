"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FiGlobe, FiChevronDown, FiSearch, FiCheck } from "react-icons/fi";

const LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "pt", label: "Português", flag: "🇵🇹" },
    { code: "pcm", label: "Pidgin", flag: "🇳🇬" },
];

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredLanguages = LANGUAGES.filter((lang) =>
        lang.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t(`languages.${lang.code}`).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
        setSearchQuery("");
    };

    const currentLanguage = LANGUAGES.find((l) => l.code === (i18n.resolvedLanguage || "en")) || LANGUAGES[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-xl bg-background border border-foreground/10 hover:border-primary/40 transition-colors shadow-sm"
                aria-label="Select language"
            >
                <FiGlobe className="text-primary/70" size={18} />
                <span className="text-sm font-medium text-foreground uppercase hidden sm:block">
                    {currentLanguage.code}
                </span>
                <FiChevronDown
                    size={14}
                    className={`text-foreground/50 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-background border border-foreground/10 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right backdrop-blur-xl"
                    >
                        {/* Search Input */}
                        <div className="p-3 border-b border-foreground/5 relative bg-bg-2/50">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/40" size={14} />
                            <input
                                type="text"
                                placeholder={t("search")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-background border border-foreground/10 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        {/* Language List */}
                        <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                            {filteredLanguages.length > 0 ? (
                                filteredLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${i18n.resolvedLanguage === lang.code
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "text-foreground hover:bg-bg-2"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{lang.flag}</span>
                                            <span>{t(`languages.${lang.code}`)}</span>
                                        </div>
                                        {i18n.resolvedLanguage === lang.code && (
                                            <FiCheck size={16} className="text-primary" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center text-sm text-foreground/50">
                                    No languages found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
