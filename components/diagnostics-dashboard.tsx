"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Clock,
  Gauge,
  RotateCw,
  Wifi,
  WifiOff,
  Moon,
  Sun,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HistoricalLatencyChart } from "@/components/historical-latency-chart"
import { PingResult } from "@/components/ping-result"
import { toast } from "@/components/ui/use-toast"
import { checkConnectionStatus, measureDnsResolution, pingTest, speedTest } from "@/lib/network-tests"
import { useTheme } from "next-themes"
import { OutageReport } from "@/components/outage-report"
import { SpeedComparison } from "@/components/speed-comparison"
import { LatencyAlert } from "@/components/latency-alert"
import { SupportButton } from "@/components/support-button"

// DNS servers to test
const DNS_SERVERS = ["1.1.1.1", "8.8.8.8", "9.9.9.9"]

// Initial state for detailed stats
const INITIAL_DETAILED_STATS = {
  packetLoss: "0.2%",
  jitter: "3.5ms",
  dnsResolution: "28ms",
  mtu: 1500,
  ipAddress: "192.168.1.105",
  gateway: "192.168.1.1",
  isp: "Olilo Fiber",
}

type ConnectionStatus = "good" | "unstable" | "offline"
type ErrorType = "connectivity" | "speed" | "general" | null

export default function DiagnosticsDashboard() {
  const { theme, setTheme } = useTheme()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("good")
  const [pingResults, setPingResults] = useState<Record<string, { latency: number; status: string }>>({
    "1.1.1.1": { latency: 18, status: "good" },
    "8.8.8.8": { latency: 24, status: "good" },
    "9.9.9.9": { latency: 32, status: "good" },
  })
  const [speedTestResults, setSpeedTestResults] = useState({
    download: 245.8,
    upload: 23.4,
    timestamp: new Date().toISOString(),
  })
  const [detailedStats, setDetailedStats] = useState(INITIAL_DETAILED_STATS)
  const [isRunningPingTest, setIsRunningPingTest] = useState(false)
  const [isRunningSpeedTest, setIsRunningSpeedTest] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [showLatencyAlert, setShowLatencyAlert] = useState(false)
  const [outages, setOutages] = useState(4)
  const [speedComparison, setSpeedComparison] = useState(12)
  const [testError, setTestError] = useState<ErrorType>(null)

  // Generate initial historical data
  useEffect(() => {
    const now = new Date()
    const initialData = []

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now)
      time.setHours(now.getHours() - i)

      // Generate random latency values with a spike around the middle
      let latency1 = Math.floor(Math.random() * 20) + 10
      let latency2 = Math.floor(Math.random() * 30) + 15
      let latency3 = Math.floor(Math.random() * 40) + 20

      // Create a latency spike around the middle of the data
      if (i === 12 || i === 11 || i === 10) {
        latency1 = Math.floor(Math.random() * 60) + 40
        latency2 = Math.floor(Math.random() * 70) + 50
        latency3 = Math.floor(Math.random() * 80) + 60
      }

      initialData.push({
        time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        "1.1.1.1": latency1,
        "8.8.8.8": latency2,
        "9.9.9.9": latency3,
      })
    }

    setHistoricalData(initialData)
  }, [])

  // Run initial tests on component mount
  useEffect(() => {
    const runInitialTests = async () => {
      try {
        // Check connection status
        const status = await checkConnectionStatus()
        setConnectionStatus(status)

        // Set test error if connection is not good
        if (status !== "good") {
          setTestError("connectivity")
        }

        // Run ping tests
        runPingTest()

        // Get network information if available
        if ("connection" in navigator && navigator.connection) {
          const connection = navigator.connection as any
          if (connection.downlink) {
            setSpeedTestResults((prev) => ({
              ...prev,
              download: connection.downlink,
            }))
          }
        }

        // Measure DNS resolution time
        const dnsTime = await measureDnsResolution("example.com")
        setDetailedStats((prev) => ({
          ...prev,
          dnsResolution: `${dnsTime}ms`,
        }))

        // Show latency alert after a delay
        setTimeout(() => {
          setShowLatencyAlert(true)

          // Auto-hide after 5 seconds
          setTimeout(() => {
            setShowLatencyAlert(false)
          }, 5000)
        }, 3000)
      } catch (error) {
        console.error("Initial tests failed:", error)
        setTestError("general")
      }
    }

    runInitialTests()

    // Set up periodic connection status check
    const statusInterval = setInterval(async () => {
      try {
        const status = await checkConnectionStatus()
        setConnectionStatus(status)

        // Update test error state based on connection status
        if (status !== "good") {
          setTestError("connectivity")
        } else if (testError === "connectivity") {
          setTestError(null)
        }
      } catch (error) {
        console.error("Status check failed:", error)
        setTestError("general")
      }
    }, 30000) // Check every 30 seconds

    return () => {
      clearInterval(statusInterval)
    }
  }, [testError])

  // Run ping test
  const runPingTest = async () => {
    setIsRunningPingTest(true)

    try {
      // Create URLs for each DNS server
      // In a real app, you would use a backend proxy to handle these requests
      const serverUrls = DNS_SERVERS.map((server) => `http://${server}`)

      // Run the ping test
      const results = await pingTest(serverUrls)

      // Update state with results
      setPingResults(results)

      // Check if any ping tests failed
      const hasFailedPings = Object.values(results).some((result) => result.status === "error")
      if (hasFailedPings) {
        setTestError("connectivity")
      }

      // Add to historical data
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      setHistoricalData((prev) => {
        const newData = [
          ...prev,
          {
            time: timestamp,
            "1.1.1.1": results["1.1.1.1"]?.latency || 0,
            "8.8.8.8": results["8.8.8.8"]?.latency || 0,
            "9.9.9.9": results["9.9.9.9"]?.latency || 0,
          },
        ]

        // Keep only the last 24 data points
        if (newData.length > 24) {
          return newData.slice(newData.length - 24)
        }
        return newData
      })

      toast({
        title: "Ping Test Complete",
        description: "Successfully measured latency to DNS servers.",
      })
    } catch (error) {
      console.error("Ping test failed:", error)
      setTestError("connectivity")
      toast({
        title: "Ping Test Failed",
        description: "Could not complete ping test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRunningPingTest(false)
    }
  }

  // Run speed test
  const runSpeedTest = async () => {
    setIsRunningSpeedTest(true)

    try {
      const results = await speedTest()
      setSpeedTestResults(results)

      // Check if speed test results indicate a problem
      if (results.download < 10 || results.upload < 1) {
        setTestError("speed")
      }

      toast({
        title: "Speed Test Complete",
        description: `Download: ${results.download.toFixed(1)} Mbps, Upload: ${results.upload.toFixed(1)} Mbps`,
      })
    } catch (error) {
      console.error("Speed test failed:", error)
      setTestError("speed")
      toast({
        title: "Speed Test Failed",
        description: "Could not complete speed test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRunningSpeedTest(false)
    }
  }

  // Calculate connection quality percentage based on ping and speed
  const calculateConnectionQuality = () => {
    // Simple algorithm - can be made more sophisticated
    const avgPing =
      Object.values(pingResults).reduce((sum, result) => sum + result.latency, 0) / Object.values(pingResults).length

    const downloadScore = Math.min(speedTestResults.download / 100, 1) * 40 // 40% weight
    const uploadScore = Math.min(speedTestResults.upload / 20, 1) * 20 // 20% weight
    const pingScore = Math.max(0, 1 - avgPing / 100) * 40 // 40% weight

    const totalScore = downloadScore + uploadScore + pingScore
    return Math.round(totalScore)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Network Diagnostics
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Real-time monitoring and analysis of your broadband connection
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </header>

      {/* Latency Alert */}
      <AnimatePresence>
        {showLatencyAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <LatencyAlert onClose={() => setShowLatencyAlert(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
        {/* Connection Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-3 lg:col-span-4"
        >
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-emerald-500/50 dark:hover:border-emerald-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Connection Status</CardTitle>
              <CardDescription>Current network health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      connectionStatus === "good"
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : connectionStatus === "unstable"
                          ? "bg-amber-100 dark:bg-amber-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {connectionStatus === "good" ? (
                      <Wifi className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    ) : connectionStatus === "unstable" ? (
                      <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold capitalize">{connectionStatus}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Last updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    try {
                      const status = await checkConnectionStatus()
                      setConnectionStatus(status)
                    } catch (error) {
                      console.error("Status check failed:", error)
                    }
                  }}
                  disabled={isRunningPingTest || isRunningSpeedTest}
                  className="rounded-full"
                >
                  <RotateCw className={`h-4 w-4 ${isRunningPingTest ? "animate-spin" : ""}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Outage Report Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="md:col-span-3 lg:col-span-4"
        >
          <OutageReport outages={outages} />
        </motion.div>

        {/* Speed Comparison Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="md:col-span-6 lg:col-span-4"
        >
          <SpeedComparison percentage={speedComparison} location="Blackpool" provider="Olilo" />
        </motion.div>

        {/* Speed Test Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="md:col-span-3 lg:col-span-4"
        >
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Speed Test</CardTitle>
              <CardDescription>Download & upload speeds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Download</span>
                  </div>
                  <motion.span
                    key={speedTestResults.download}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-lg font-semibold"
                  >
                    {speedTestResults.download.toFixed(1)}{" "}
                    <span className="text-sm font-normal text-zinc-500">Mbps</span>
                  </motion.span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Upload</span>
                  </div>
                  <motion.span
                    key={speedTestResults.upload}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-lg font-semibold"
                  >
                    {speedTestResults.upload.toFixed(1)} <span className="text-sm font-normal text-zinc-500">Mbps</span>
                  </motion.span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full rounded-full"
                onClick={runSpeedTest}
                disabled={isRunningSpeedTest || isRunningPingTest}
              >
                {isRunningSpeedTest ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Running Test...
                  </>
                ) : (
                  <>
                    <Gauge className="mr-2 h-4 w-4" />
                    Run Speed Test
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Ping Test Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="md:col-span-3 lg:col-span-4"
        >
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-violet-500/50 dark:hover:border-violet-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Ping Test</CardTitle>
              <CardDescription>Latency to DNS servers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DNS_SERVERS.map((server, index) => (
                  <motion.div
                    key={server}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <PingResult
                      server={server}
                      latency={pingResults[server]?.latency || 0}
                      status={pingResults[server]?.status || "pending"}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={runPingTest}
                disabled={isRunningPingTest || isRunningSpeedTest}
              >
                {isRunningPingTest ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Pinging...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Run Ping Test
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Connection Quality Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="md:col-span-6 lg:col-span-4"
        >
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-amber-500/50 dark:hover:border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Connection Quality</CardTitle>
              <CardDescription>Overall network performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-zinc-100 dark:text-zinc-800 stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    ></circle>
                    <motion.circle
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: calculateConnectionQuality() / 100 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="text-emerald-500 stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      style={{
                        transformOrigin: "center",
                        rotate: "-90deg",
                      }}
                    ></motion.circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="text-3xl font-bold"
                    >
                      {calculateConnectionQuality()}%
                    </motion.span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Based on latency, speed, and stability</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Historical Data Chart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="md:col-span-6 lg:col-span-12"
        >
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-cyan-500/50 dark:hover:border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Historical Latency</CardTitle>
              <CardDescription>Ping response times over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <HistoricalLatencyChart data={historicalData} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Stats Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="md:col-span-6 lg:col-span-12"
        >
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-zinc-500/50 dark:hover:border-zinc-500/30">
            <CardHeader
              className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              onClick={() => setIsStatsOpen(!isStatsOpen)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Nerdy Stats</CardTitle>
                  <CardDescription>Advanced network metrics</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full">
                  {isStatsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>

            {isStatsOpen && (
              <CardContent className="pt-2">
                <Tabs defaultValue="metrics">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="metrics">Network Metrics</TabsTrigger>
                    <TabsTrigger value="config">Network Config</TabsTrigger>
                  </TabsList>
                  <TabsContent value="metrics" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-zinc-500" />
                          <span className="text-sm font-medium">Packet Loss</span>
                        </div>
                        <p className="font-mono text-lg">{detailedStats.packetLoss}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-zinc-500" />
                          <span className="text-sm font-medium">Jitter</span>
                        </div>
                        <p className="font-mono text-lg">{detailedStats.jitter}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          <span className="text-sm font-medium">DNS Resolution</span>
                        </div>
                        <p className="font-mono text-lg">{detailedStats.dnsResolution}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Connection Quality</h4>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${calculateConnectionQuality()}%` }}
                            transition={{ duration: 1 }}
                            className="h-2 rounded-full bg-emerald-500"
                          ></motion.div>
                        </div>
                        <span className="text-sm font-medium">{calculateConnectionQuality()}%</span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="config" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-zinc-500">IP Address</h4>
                          <p className="font-mono">{detailedStats.ipAddress}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-zinc-500">Gateway</h4>
                          <p className="font-mono">{detailedStats.gateway}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-zinc-500">ISP</h4>
                          <p className="font-mono">{detailedStats.isp}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-zinc-500">MTU</h4>
                          <p className="font-mono">{detailedStats.mtu}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-zinc-500">DNS Servers</h4>
                          <div className="space-y-1">
                            {DNS_SERVERS.map((server) => (
                              <Badge key={server} variant="outline" className="font-mono mr-1">
                                {server}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Support Button - Shows when tests fail */}
      <AnimatePresence>{testError && <SupportButton errorType={testError} />}</AnimatePresence>
    </div>
  )
}
