"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LoaderContextType {
    isLoaderDone: boolean;
    completeLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType>({
    isLoaderDone: false,
    completeLoader: () => { },
});

export function LoaderProvider({ children }: { children: React.ReactNode }) {
    const [isLoaderDone, setIsLoaderDone] = useState(false);

    // In case the loader never mounts or we navigate back later, we ensure to set true
    // But usually, SpagLoader will call completeLoader() after its 2.6s timer.
    useEffect(() => {
        // If the component mounts and we want a fallback just in case something fails:
        const fallbackTimer = setTimeout(() => {
            if (!isLoaderDone) {
                setIsLoaderDone(true);
            }
        }, 4000); // 4 seconds fallback

        return () => clearTimeout(fallbackTimer);
    }, [isLoaderDone]);

    const completeLoader = () => setIsLoaderDone(true);

    return (
        <LoaderContext.Provider value={{ isLoaderDone, completeLoader }}>
            {children}
        </LoaderContext.Provider>
    );
}

export const useLoader = () => useContext(LoaderContext);
