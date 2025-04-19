"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff } from "lucide-react"
import { motion } from "framer-motion"

interface OutageReportProps {
  outages: number
}

export function OutageReport({ outages }: OutageReportProps) {
  return (
    <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-red-500/50 dark:hover:border-red-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Outage Report</CardTitle>
        <CardDescription>Connection stability today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-semibold"
            >
              {outages} brief disconnects
            </motion.h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Today, lasting less than 30 seconds each</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between mb-1 text-xs">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>Now</span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full relative">
            {/* Outage markers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute h-3 w-1.5 bg-red-500 rounded-full top-1/2 -translate-y-1/2"
              style={{ left: "15%" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute h-3 w-1.5 bg-red-500 rounded-full top-1/2 -translate-y-1/2"
              style={{ left: "32%" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute h-3 w-1.5 bg-red-500 rounded-full top-1/2 -translate-y-1/2"
              style={{ left: "58%" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute h-3 w-1.5 bg-red-500 rounded-full top-1/2 -translate-y-1/2"
              style={{ left: "76%" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
