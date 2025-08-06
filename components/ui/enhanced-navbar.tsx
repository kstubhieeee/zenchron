"use client";

import { cn } from "@/lib/utils";
import { Menu, X, Zap } from "lucide-react";
import { AnimatePresence, motion, useScroll } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const INITIAL_WIDTH = "90%";
const MAX_WIDTH = "800px";

// Animation variants
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const drawerVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
        opacity: 1,
        y: 0,
        rotate: 0,
        transition: {
            type: "spring" as const,
            damping: 15,
            stiffness: 200,
            staggerChildren: 0.03,
        },
    },
    exit: {
        opacity: 0,
        y: 100,
        transition: { duration: 0.1 },
    },
};

const drawerMenuContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const drawerMenuVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

// Navigation items
const navItems = [
    { id: "hero", name: "Home", href: "#hero" },
    { id: "features", name: "Features", href: "#features" },
    { id: "pricing", name: "Pricing", href: "#pricing" },
    { id: "about", name: "About", href: "#about" },
    { id: "contact", name: "Contact", href: "#contact" },
];

export function EnhancedNavbar() {
    const { scrollY } = useScroll();
    const [hasScrolled, setHasScrolled] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");

    useEffect(() => {
        const handleScroll = () => {
            const sections = navItems.map((item) => item.href.substring(1));

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150 && rect.bottom >= 150) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const unsubscribe = scrollY.on("change", (latest) => {
            setHasScrolled(latest > 10);
        });
        return unsubscribe;
    }, [scrollY]);

    const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
    const handleOverlayClick = () => setIsDrawerOpen(false);

    return (
        <header
            className={cn(
                "sticky z-50 mx-4 flex justify-center transition-all duration-300 md:mx-0",
                hasScrolled ? "top-6" : "top-0 mx-0",
            )}
        >
            <motion.div
                initial={{ width: INITIAL_WIDTH }}
                animate={{ width: hasScrolled ? MAX_WIDTH : INITIAL_WIDTH }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <div
                    className={cn(
                        "mx-auto max-w-7xl rounded-2xl transition-all duration-300 xl:px-0",
                        hasScrolled
                            ? "px-2 border border-blue-200/50 backdrop-blur-lg bg-white/90 shadow-lg"
                            : "px-4 bg-transparent border-0 shadow-none",
                    )}
                >
                    <div className="flex h-[56px] items-center justify-between p-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <img 
                                    src="/zenn.png" 
                                    alt="Zenchron Logo" 
                                    className="h-6 w-6 object-contain"
                                />
                            </div>
                            <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                Zenchron
                            </p>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.href.substring(1);
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const element = document.getElementById(
                                                item.href.substring(1),
                                            );
                                            element?.scrollIntoView({ behavior: "smooth" });
                                        }}
                                        className={cn(
                                            "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50/50",
                                            isActive
                                                ? "text-blue-600 bg-blue-50"
                                                : "text-gray-600 hover:text-blue-600"
                                        )}
                                    >
                                        {item.name}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeSection"
                                                className="absolute inset-0 bg-blue-100/50 rounded-lg -z-10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="flex flex-row items-center gap-1 md:gap-3 shrink-0">
                            <div className="flex items-center space-x-6">
                                <Link
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-8 hidden md:flex items-center justify-center text-sm font-medium tracking-wide rounded-full text-white w-fit px-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                    href="/dashboard/tasks"
                                >
                                    Try for free
                                </Link>
                            </div>
                            <button
                                className="md:hidden border border-blue-200 size-8 rounded-lg cursor-pointer flex items-center justify-center hover:bg-blue-50 transition-colors"
                                onClick={toggleDrawer}
                            >
                                {isDrawerOpen ? (
                                    <X className="size-5 text-blue-600" />
                                ) : (
                                    <Menu className="size-5 text-blue-600" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={overlayVariants}
                            transition={{ duration: 0.2 }}
                            onClick={handleOverlayClick}
                        />

                        <motion.div
                            className="fixed inset-x-0 w-[95%] mx-auto bottom-3 bg-white border border-blue-200/50 p-4 rounded-xl shadow-xl backdrop-blur-lg"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={drawerVariants}
                        >
                            {/* Mobile menu content */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <Link href="/" className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg">
                                            <img 
                                                src="/zenn.png" 
                                                alt="Zenchron Logo" 
                                                className="h-6 w-6 object-contain"
                                            />
                                        </div>
                                        <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                            Zenchron
                                        </p>
                                    </Link>
                                    <button
                                        onClick={toggleDrawer}
                                        className="border border-blue-200 rounded-lg p-1 cursor-pointer hover:bg-blue-50 transition-colors"
                                    >
                                        <X className="size-5 text-blue-600" />
                                    </button>
                                </div>

                                <motion.ul
                                    className="flex flex-col text-sm mb-4 border border-blue-200/50 rounded-lg bg-blue-50/30"
                                    variants={drawerMenuContainerVariants}
                                >
                                    <AnimatePresence>
                                        {navItems.map((item) => {
                                            const isActive = activeSection === item.href.substring(1);
                                            return (
                                                <motion.li
                                                    key={item.id}
                                                    className="p-2.5 border-b border-blue-200/50 last:border-b-0"
                                                    variants={drawerMenuVariants}
                                                >
                                                    <a
                                                        href={item.href}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const element = document.getElementById(
                                                                item.href.substring(1),
                                                            );
                                                            element?.scrollIntoView({ behavior: "smooth" });
                                                            setIsDrawerOpen(false);
                                                        }}
                                                        className={cn(
                                                            "block underline-offset-4 hover:text-blue-600 transition-colors",
                                                            isActive
                                                                ? "text-blue-600 font-semibold"
                                                                : "text-gray-700"
                                                        )}
                                                    >
                                                        {item.name}
                                                    </a>
                                                </motion.li>
                                            );
                                        })}
                                    </AnimatePresence>
                                </motion.ul>

                                {/* Action buttons */}
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href="/dashboard/tasks"
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-10 flex items-center justify-center text-sm font-medium tracking-wide rounded-lg text-white w-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                    >
                                        Try for free
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
} 