"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AnimatedBeamProps {
  className?: string
  duration?: number
  delay?: number
}

export function AnimatedBeam({ className, duration = 3, delay = 0 }: AnimatedBeamProps) {
  return (
    <motion.div
      className={cn("absolute inset-0 rounded-lg", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-lg blur-sm" />
    </motion.div>
  )
}
