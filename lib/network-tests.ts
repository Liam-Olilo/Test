// Network testing utility functions

/**
 * Performs an HTTP ping test to measure latency
 * @param url The URL to ping
 * @param timeout Timeout in milliseconds
 * @returns Promise with latency in milliseconds or error
 */
export async function measurePing(url: string, timeout = 5000): Promise<number> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      reject(new Error("Request timed out"))
    }, timeout)

    const startTime = performance.now()

    fetch(url, {
      method: "HEAD",
      mode: "cors",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(() => {
        clearTimeout(timeoutId)
        const endTime = performance.now()
        resolve(Math.round(endTime - startTime))
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

/**
 * Performs a ping test to multiple servers
 * @param servers Array of server URLs to ping
 * @returns Promise with results for each server
 */
export async function pingTest(servers: string[]): Promise<Record<string, { latency: number; status: string }>> {
  const results: Record<string, { latency: number; status: string }> = {}

  const tests = servers.map(async (server) => {
    try {
      // Use a proxy service or CORS-enabled endpoint
      // In production, you would use your own backend proxy or a service that allows CORS
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${server}`
      const latency = await measurePing(proxyUrl)

      let status = "good"
      if (latency > 50) status = "poor"
      else if (latency > 30) status = "warning"

      results[server] = { latency, status }
    } catch (error) {
      results[server] = { latency: 0, status: "error" }
    }
  })

  await Promise.allSettled(tests)
  return results
}

/**
 * Measures download speed by fetching a file
 * @param testFileUrl URL of a test file to download
 * @param fileSizeInBytes Size of the test file in bytes
 * @param maxTime Maximum test time in milliseconds
 * @returns Promise with download speed in Mbps
 */
export async function measureDownloadSpeed(
  testFileUrl: string,
  fileSizeInBytes: number,
  maxTime = 10000,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      reject(new Error("Test timed out"))
    }, maxTime)

    const startTime = performance.now()

    fetch(testFileUrl, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.blob())
      .then((blob) => {
        clearTimeout(timeoutId)
        const endTime = performance.now()
        const durationInSeconds = (endTime - startTime) / 1000
        const bitsLoaded = fileSizeInBytes * 8
        const speedBps = bitsLoaded / durationInSeconds
        const speedMbps = speedBps / 1000000
        resolve(speedMbps)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

/**
 * Measures upload speed by posting data
 * @param uploadUrl URL to upload data to
 * @param sizeInBytes Size of data to upload in bytes
 * @param maxTime Maximum test time in milliseconds
 * @returns Promise with upload speed in Mbps
 */
export async function measureUploadSpeed(
  uploadUrl: string,
  sizeInBytes = 2 * 1024 * 1024, // 2MB by default
  maxTime = 10000,
): Promise<number> {
  return new Promise((resolve, reject) => {
    // Create a blob with random data of specified size
    const blob = new Blob([new ArrayBuffer(sizeInBytes)])

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      reject(new Error("Test timed out"))
    }, maxTime)

    const startTime = performance.now()

    fetch(uploadUrl, {
      method: "POST",
      body: blob,
      signal: controller.signal,
    })
      .then(() => {
        clearTimeout(timeoutId)
        const endTime = performance.now()
        const durationInSeconds = (endTime - startTime) / 1000
        const bitsUploaded = sizeInBytes * 8
        const speedBps = bitsUploaded / durationInSeconds
        const speedMbps = speedBps / 1000000
        resolve(speedMbps)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

/**
 * Performs a complete speed test
 * @returns Promise with download and upload speeds in Mbps
 */
export async function speedTest(): Promise<{ download: number; upload: number; timestamp: string }> {
  try {
    // For a real implementation, you would use your own test files and upload endpoints
    // These are example URLs and would need to be replaced with actual endpoints
    const downloadTestUrl = "https://speed.cloudflare.com/__down?bytes=10000000" // 10MB test file
    const uploadTestUrl = "https://speed.cloudflare.com/__up"

    const downloadSpeed = await measureDownloadSpeed(downloadTestUrl, 10000000)
    const uploadSpeed = await measureUploadSpeed(uploadTestUrl)

    return {
      download: downloadSpeed,
      upload: uploadSpeed,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Speed test failed:", error)
    throw error
  }
}

/**
 * Measures DNS resolution time
 * @param domain Domain to resolve
 * @returns Promise with resolution time in milliseconds
 */
export async function measureDnsResolution(domain: string): Promise<number> {
  const startTime = performance.now()

  try {
    // We can't directly measure DNS resolution in the browser,
    // so we'll measure the time it takes to connect to the domain
    await fetch(`https://${domain}`, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    })

    const endTime = performance.now()
    return Math.round(endTime - startTime)
  } catch (error) {
    // Even if the fetch fails, we still got a DNS resolution time
    const endTime = performance.now()
    return Math.round(endTime - startTime)
  }
}

/**
 * Checks if the connection is online
 * @returns Promise with connection status
 */
export function checkConnectionStatus(): Promise<"good" | "unstable" | "offline"> {
  return new Promise((resolve) => {
    if (!navigator.onLine) {
      resolve("offline")
      return
    }

    // Test connection stability by pinging multiple servers
    Promise.allSettled([
      measurePing("https://www.google.com"),
      measurePing("https://www.cloudflare.com"),
      measurePing("https://www.amazon.com"),
    ]).then((results) => {
      const successfulPings = results.filter((r) => r.status === "fulfilled").length

      if (successfulPings === 0) {
        resolve("offline")
      } else if (successfulPings < 3) {
        resolve("unstable")
      } else {
        resolve("good")
      }
    })
  })
}
