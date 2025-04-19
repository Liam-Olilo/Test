"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"

interface HistoricalLatencyChartProps {
  data?: any[]
}

// Generate mock historical data if no real data is provided
const generateHistoricalData = () => {
  const data = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now)
    time.setHours(now.getHours() - i)

    // Generate random latency values for each DNS server
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      "1.1.1.1": Math.floor(Math.random() * 20) + 10,
      "8.8.8.8": Math.floor(Math.random() * 30) + 15,
      "9.9.9.9": Math.floor(Math.random() * 40) + 20,
    })
  }

  return data
}

export function HistoricalLatencyChart({ data }: HistoricalLatencyChartProps) {
  // Use provided data or generate mock data if none is provided
  const chartData = data && data.length > 0 ? data : generateHistoricalData()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="h-full">
      <ChartContainer
        config={{
          "1.1.1.1": {
            label: "Cloudflare DNS",
            color: "hsl(var(--chart-1))",
          },
          "8.8.8.8": {
            label: "Google DNS",
            color: "hsl(var(--chart-2))",
          },
          "9.9.9.9": {
            label: "Quad9 DNS",
            color: "hsl(var(--chart-3))",
          },
        }}
        className="h-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 20,
            }}
          >
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={30}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              domain={[0, "dataMax + 10"]}
              tickFormatter={(value) => `${value}ms`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="1.1.1.1" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
            <Line type="monotone" dataKey="8.8.8.8" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
            <Line type="monotone" dataKey="9.9.9.9" strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  )
}
