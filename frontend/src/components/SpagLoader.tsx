"use client";

import { useEffect, useState } from "react";

export default function SpagLoader() {
    const [phase, setPhase] = useState<"border" | "reveal">("border");

    useEffect(() => {
        // After border trace finishes (~1.8s), switch to reveal phase
        const t = setTimeout(() => setPhase("reveal"), 1800);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="spag-root">

            {/*
       * ── BORDER TRACE ──
       * A single thin blue line traces the perimeter of the screen
       * using an SVG rect with stroke-dashoffset animation.
       * The rect covers the full viewport (100vw × 100vh).
       * Perimeter ≈ 2*(100+100) = 400 vw/vh units — handled via
       * a viewBox that keeps the numbers simple.
       */}
            <svg
                className="border-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <style>{`
            /*
             * Perimeter of rect (1,1) → (99,99) in viewBox units:
             * 2 * (98 + 98) = 392.  Use 400 to be safe.
             * Trace starts from top-left, goes clockwise.
             */
            .border-rect {
              fill: none;
              stroke: #3B82F6;
              stroke-width: 1.5;
              vector-effect: non-scaling-stroke;
              stroke-dasharray: 400;
              stroke-dashoffset: 400;
              stroke-linecap: butt;
              animation: traceBorder 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.1s;
            }
            @keyframes traceBorder {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
                </defs>
                {/* Rect inset by 1 unit so the stroke stays just inside screen edge */}
                <rect className="border-rect" x="0.75" y="0.75" width="98.5" height="98.5" rx="0" />
            </svg>

            {/*
       * ── S LETTER (center) ──
       * Hidden while border traces, then fades + draws in.
       */}
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
            /* S draws ONLY when reveal class is applied */
            .spag-reveal .s-main {
              animation: drawS 1.8s cubic-bezier(0.4, 0, 0.15, 1) forwards 0.1s;
            }
            @keyframes drawS { to { stroke-dashoffset: 0; } }

            .cap-top {
              stroke-dasharray: 70;
              stroke-dashoffset: 70;
              animation: none;
            }
            .spag-reveal .cap-top {
              animation: drawCap 0.3s cubic-bezier(0.4, 0, 0.15, 1) forwards 2.05s;
            }

            .cap-bottom {
              stroke-dasharray: 70;
              stroke-dashoffset: 70;
              animation: none;
            }
            .spag-reveal .cap-bottom {
              animation: drawCap 0.3s cubic-bezier(0.4, 0, 0.15, 1) forwards 2.3s;
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
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Top floating cap */}
                <line
                    className="cap-top"
                    x1="18" y1="4" x2="86" y2="4"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="butt"
                />

                {/* Bottom floating cap */}
                <line
                    className="cap-bottom"
                    x1="18" y1="152" x2="86" y2="152"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="butt"
                />
            </svg>

            <style>{`
        .spag-root {
          position: fixed;
          inset: 0;
          background: #0d0d14;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        }

        /* Stretches to exact screen edges */
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
        </div>
    );
}
