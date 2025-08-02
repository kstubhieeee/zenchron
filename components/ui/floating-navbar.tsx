"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JSX } from "react/jsx-runtime";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["features", "pricing", "about", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }

      if (window.scrollY < 100) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (link.startsWith("#")) {
      e.preventDefault();
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className={cn(
        "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-gray-200/50 rounded-full bg-white/90 backdrop-blur-md shadow-xl z-[5000] px-6 py-3 items-center justify-center space-x-2",
        className
      )}
    >
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-4 pr-4 border-r border-gray-200">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 hidden sm:block">Zenchron</span>
        </Link>

        {navItems.map((navItem: any, idx: number) => {
          const isActive = activeSection === navItem.link.substring(1) || (navItem.link === "/" && activeSection === "");

          return (
            <Link
              key={`link-${idx}`}
              href={navItem.link}
              onClick={(e) => handleClick(e, navItem.link)}
              className={cn(
                "relative items-center flex space-x-2 transition-all duration-200 px-3 py-2 rounded-full group",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
              )}
            >
              <span className={cn(
                "block sm:hidden transition-colors duration-200",
                isActive ? "text-blue-600" : "group-hover:text-blue-600"
              )}>
                {navItem.icon}
              </span>
              <span className="hidden sm:block text-sm font-medium">{navItem.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeSection"
                  className="absolute inset-0 bg-blue-100/50 rounded-full -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          );
        })}

        {/* CTA Button */}
        <div className="ml-4 pl-4 border-l border-gray-200">
          <Link href="/dashboard/tasks">
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium h-8"
            >
              Try Free
            </Button>
          </Link>
        </div>
    </motion.div>
  );
};