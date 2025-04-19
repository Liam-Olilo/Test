"use client"

import { X } from "lucide-react"
import { motion } from "framer-motion"

interface LatencyAlertProps {
  onClose: () => void
}

export function LatencyAlert({ onClose }: LatencyAlertProps) {
  return (
    <motion.div
      className="bg-red-500 dark:bg-red-600 text-white p-3 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.1 2.182a10 10 0 0 1 3.8 0"></path>
              <path d="M13.9 21.818a10 10 0 0 1-3.8 0"></path>
              <path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"></path>
              <path d="M3.701 17.579a10 10 0 0 1-2.7-2.69"></path>
              <path d="M21.819 13.9a10 10 0 0 1 0 3.8"></path>
              <path d="M2.181 10.1a10 10 0 0 1 0-3.8"></path>
              <path d="M20.279 20.299a10 10 0 0 1-2.69 2.7"></path>
              <path d="M6.39 3.701a10 10 0 0 1 2.7-2.7"></path>
              <path d="M12 12v.01"></path>
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Latency is spiking!</h3>
            <p className="text-sm text-white/80">Response times have increased by 65%</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
