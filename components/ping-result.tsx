"use client"

import { Check, X } from "lucide-react"
import { motion } from "framer-motion"

interface PingResultProps {
  server: string
  latency: number
  status?: string
}

export function PingResult({ server, latency, status = "good" }: PingResultProps) {
  // Determine color based on latency
  let color = "text-emerald-500"
  let bgColor = "bg-emerald-100 dark:bg-emerald-900/30"

  if (status === "error") {
    color = "text-red-500"
    bgColor = "bg-red-100 dark:bg-red-900/30"
  } else if (latency > 50) {
    color = "text-red-500"
    bgColor = "bg-red-100 dark:bg-red-900/30"
  } else if (latency > 30) {
    color = "text-amber-500"
    bgColor = "bg-amber-100 dark:bg-amber-900/30"
  } else if (status === "pending") {
    color = "text-zinc-400"
    bgColor = "bg-zinc-100 dark:bg-zinc-800"
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <motion.div
          className={`h-2 w-2 rounded-full ${bgColor}`}
          animate={status === "pending" ? { scale: [1, 1.5, 1] } : {}}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        />
        <span className="text-sm font-medium">{server}</span>
      </div>
      <div className="flex items-center gap-1">
        {status === "pending" ? (
          <span className="text-zinc-400 text-sm">Pending...</span>
        ) : status === "error" ? (
          <div className="flex items-center">
            <X className="h-3 w-3 text-red-500" />
            <span className={`font-mono font-medium ${color} ml-1`}>Error</span>
          </div>
        ) : (
          <>
            <motion.span
              key={latency}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`font-mono font-medium ${color}`}
            >
              {latency}ms
            </motion.span>
            {latency < 30 && <Check className="h-3 w-3 text-emerald-500" />}
          </>
        )}
      </div>
    </div>
  )
}
