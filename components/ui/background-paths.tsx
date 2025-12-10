"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-primary/30"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

interface BackgroundPathsProps {
  title?: string
  subtitle?: string
  onUserClick?: () => void
  onAdminClick?: () => void
}

export default function BackgroundPaths({
  title = 'CLARIO',
  subtitle = 'ALWAYS ON. ALWAYS PROFESSIONAL.',
  onUserClick,
  onAdminClick,
}: BackgroundPathsProps) {
    const words = title.split(" ");

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-radial from-primary via-secondary to-background">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-6 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-foreground"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>

                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="text-sm sm:text-base md:text-lg text-muted-foreground mb-16 tracking-widest uppercase"
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
                    >
                        <div className="group relative bg-gradient-to-b from-primary/20 to-accent/20 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-auto">
                            <Button
                                onClick={onUserClick}
                                className="rounded-[1.15rem] px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl font-semibold backdrop-blur-md
                                bg-card/95 hover:bg-card text-foreground transition-all duration-300
                                group-hover:-translate-y-0.5 border border-border hover:shadow-md w-full sm:min-w-[200px]
                                hover:border-primary"
                            >
                                <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                    User View
                                </span>
                            </Button>
                        </div>

                        <div className="group relative bg-gradient-to-b from-primary/20 to-accent/20 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-auto">
                            <Button
                                onClick={onAdminClick}
                                className="rounded-[1.15rem] px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl font-semibold backdrop-blur-md
                                bg-primary hover:bg-accent text-primary-foreground transition-all duration-300
                                group-hover:-translate-y-0.5 border border-primary hover:shadow-md w-full sm:min-w-[200px]
                                hover:border-accent"
                            >
                                <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                    Admin View
                                </span>
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
