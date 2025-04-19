"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { motion } from "framer-motion"

interface SpeedComparisonProps {
  percentage: number
  location: string
  provider: string
}

export function SpeedComparison({ percentage, location, provider }: SpeedComparisonProps) {
  return (
    <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-yellow-500/50 dark:hover:border-yellow-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Speed Comparison</CardTitle>
        <CardDescription>How you compare to others</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-semibold"
            >
              {percentage}% faster
            </motion.h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              than other {provider} users in {location}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between mb-2 text-xs">
            <span>Slower</span>
            <span>Average</span>
            <span>Faster</span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${50 + percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-2 bg-yellow-500 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-zinc-500">-50%</span>
            <span className="text-xs text-zinc-500">+50%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
