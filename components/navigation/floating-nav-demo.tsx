"use client";

import React from "react";
import { FloatingNav } from "../ui/floating-navbar";
import { Home, Zap, DollarSign, Shield, HelpCircle } from "lucide-react";

export function FloatingNavDemo() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: "Features",
      link: "#features",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      name: "Pricing",
      link: "#pricing",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      name: "About",
      link: "#about",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      name: "FAQ",
      link: "#contact",
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="relative w-full">
      <FloatingNav navItems={navItems} />
    </div>
  );
}

export default FloatingNavDemo;