"use client";

import { useEffect, useState } from "react";
import { useLoader } from "@/app/context/LoaderContext";
import { motion, AnimatePresence } from "framer-motion";

export default function SpagLoader() {
  const [phase, setPhase] = useState<"border" | "reveal">("border");
  const { isLoaderDone, completeLoader } = useLoader();

  useEffect(() => {
    // Prevent re-triggering if loader is already complete (e.g. from fast navigation)
    if (isLoaderDone) return;

    // Phase 1: Border trace lasts 1.6s
    const t1 = setTimeout(() => setPhase("reveal"), 1600);

    // Phase 2 (Reveal): S draws (1.2s) -> top cap (0.3s) -> bot cap (0.3s)
    // Total animation = 1.6s (border) + 1.8s (S and caps) = 3.4s
    // We complete the loader right as the bottom cap finishes drawing!
    const t2 = setTimeout(() => completeLoader(), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isLoaderDone, completeLoader]);

  // Don't render the loader AT ALL if it's strictly finished in context
  return (
    <AnimatePresence>
      {!isLoaderDone && (
        <motion.div
          className="spag-root"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* Border trace SVG */}
          <svg
            className="border-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <style>{`
            .border-rect {
              fill: none;
              stroke: #0229BF;
              stroke-width: 1.5;
              vector-effect: non-scaling-stroke;
              stroke-dasharray: 400;
              stroke-dashoffset: 400;
              stroke-linecap: butt;
              /* Traces the border over 1.5s */
              animation: traceBorder 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 0s;
            }
            @keyframes traceBorder {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
            </defs>
            <rect className="border-rect" x="0.75" y="0.75" width="98.5" height="98.5" rx="0" />
          </svg>

          {/* Main S and Outlines */}
          <svg
            className={`spag-svg ${phase === "reveal" ? "spag-reveal" : ""}`}
            viewBox="0 0 110 165"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="S"
          >
            <defs>
              <style>{`
            .spag-svg {
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            .spag-reveal {
              opacity: 1;
            }

            .s-main {
              stroke-dasharray: 520;
              stroke-dashoffset: 520;
              animation: none;
            }
            /* S draws starting immediately when reveal phase begins */
            .spag-reveal .s-main {
              animation: drawS 1.2s cubic-bezier(0.4, 0, 0.15, 1) forwards 0s;
            }
            @keyframes drawS { to { stroke-dashoffset: 0; } }

            .cap-top {
              stroke-dasharray: 70;
              stroke-dashoffset: 70;
              animation: none;
            }
            /* Top cap draws slightly after the S completes */
            .spag-reveal .cap-top {
              animation: drawCap 0.3s cubic-bezier(0.4, 0, 0.15, 1) forwards 1.2s;
            }

            .cap-bottom {
              stroke-dasharray: 70;
              stroke-dashoffset: 70;
              animation: none;
            }
            /* Bottom cap draws slightly after top cap */
            .spag-reveal .cap-bottom {
              animation: drawCap 0.3s cubic-bezier(0.4, 0, 0.15, 1) forwards 1.4s;
            }

            @keyframes drawCap { to { stroke-dashoffset: 0; } }
          `}</style>
            </defs>

            {/* Main S */}
            <path
              className="s-main"
              d="M 82,34
             C 82,20  70,13  54,13
             C 34,13  18,26  18,44
             C 18,62  34,72  60,80
             C 84,88  94,100 88,118
             C 82,134 68,143 50,143
             C 32,143 18,134 18,122"
              fill="none"
              stroke="#0229BF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Top floating cap */}
            <line
              className="cap-top"
              x1="18" y1="4" x2="86" y2="4"
              stroke="#0229BF"
              strokeWidth="2.5"
              strokeLinecap="butt"
            />

            {/* Bottom floating cap */}
            <line
              className="cap-bottom"
              x1="18" y1="152" x2="86" y2="152"
              stroke="#0229BF"
              strokeWidth="2.5"
              strokeLinecap="butt"
            />
          </svg>

          <style>{`
        .spag-root {
          position: fixed;
          inset: 0;
          background: #F7F4EF;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        }

        .border-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .spag-svg {
          position: relative;
          z-index: 2;
          width: 200px;
          height: 300px;
        }
      `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
