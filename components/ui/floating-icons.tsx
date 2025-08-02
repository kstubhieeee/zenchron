"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FloatingIconsProps {
  className?: string
}

export function FloatingIcons({ className }: FloatingIconsProps) {
  const icons = [
    { id: 1, x: "10%", y: "20%", delay: 0 },
    { id: 2, x: "80%", y: "15%", delay: 0.5 },
    { id: 3, x: "15%", y: "70%", delay: 1 },
    { id: 4, x: "85%", y: "75%", delay: 1.5 },
    { id: 5, x: "50%", y: "10%", delay: 2 },
    { id: 6, x: "70%", y: "50%", delay: 2.5 },
  ]

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {icons.map((icon) => (
        <motion.div
          key={icon.id}
          className="absolute w-8 h-8 bg-blue-500/10 rounded-full"
          style={{ left: icon.x, top: icon.y }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            delay: icon.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
