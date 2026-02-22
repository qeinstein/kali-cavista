"use client";

import GlobalHealthMap from "@/components/dashboard/GlobalHealthMap";
import CompositeTwin from "@/components/dashboard/CompositeTwin";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
    const { t } = useTranslation();

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
                {/* Page header */}
                <div>
                    <h1 className="text-3xl font-black text-ink-2 font-outfit tracking-tight">
                        {t('dashboard.title', "Intelligence Dashboard")}
                    </h1>
                    <p className="text-sm text-muted mt-1 font-outfit">
                        {t('dashboard.desc', "Aggregate health signals from connected devices, anonymised and analysed in real time.")}
                    </p>
                </div>

                {/* Global Health Map */}
                <GlobalHealthMap />

                {/* Composite Digital Twin */}
                <CompositeTwin />
            </div>
        </main>
    );
}
