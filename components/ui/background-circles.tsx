"use client";

import clsx from "clsx";
import ShaderBackground from "./shader-background";

interface BackgroundCirclesProps {
    title?: string;
    description?: string;
    className?: string;
    onUserClick?: () => void;
    onAdminClick?: () => void;
}

export function BackgroundCircles({
    title = "Vextria AI",
    description = "Beyond Limits",
    className,
    onUserClick,
    onAdminClick,
}: BackgroundCirclesProps) {

    return (
        <div
            className={clsx(
                "relative flex min-h-screen w-full items-center justify-center overflow-hidden",
                "bg-black",
                className
            )}
        >
            {/* Background with shader */}
            <ShaderBackground />

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#150826]/90 to-black/95 z-[1]" />

            {/* Soft glow behind content */}
            <div
                className="pointer-events-none absolute -inset-x-40 top-1/2 -translate-y-1/2 blur-3xl opacity-70 z-[2]"
                style={{
                    background: 'radial-gradient(circle at center, #a855f7 0%, transparent 60%)'
                }}
            />

            {/* Content */}
            <div className="relative z-10 text-center max-w-3xl mx-auto px-4 w-full">
                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                    {title}
                </h1>

                {/* Tagline */}
                <p className="mt-4 text-sm sm:text-base md:text-lg font-medium uppercase tracking-[0.25em] text-purple-100/80">
                    {description}
                </p>

                {/* Description */}
                <p className="mt-6 text-base sm:text-lg text-gray-200/80 max-w-xl mx-auto">
                    Smart, always-on AI agents that book appointments, qualify leads, and keep
                    your business running while you focus on the work that matters.
                </p>

                {/* Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    {/* Primary button */}
                    <button
                        onClick={onUserClick}
                        className="min-w-[160px] px-8 py-3 rounded-full text-white text-sm sm:text-base font-semibold
                                   border border-white/15
                                   shadow-[0_18px_45px_rgba(0,0,0,0.7)]
                                   bg-gradient-to-br from-purple-400 via-purple-600 to-purple-900
                                   hover:from-purple-300 hover:via-purple-500 hover:to-purple-900
                                   transition-all duration-200
                                   hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-300/70"
                    >
                        User View
                    </button>

                    {/* Secondary button */}
                    <button
                        onClick={onAdminClick}
                        className="min-w-[160px] px-8 py-3 rounded-full text-purple-100 text-sm sm:text-base font-semibold
                                   border border-purple-400/60
                                   bg-white/5 backdrop-blur-md
                                   shadow-[0_18px_45px_rgba(0,0,0,0.65)]
                                   hover:bg-white/10
                                   transition-all duration-200
                                   hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-300/70"
                    >
                        Admin View
                    </button>
                </div>
            </div>
        </div>
    );
}
