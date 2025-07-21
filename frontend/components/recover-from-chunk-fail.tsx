"use client"

import { useEffect, useRef } from "react"

/**
 * Automatically reloads the page once when Next.js split-chunk fetching fails.
 * This prevents the “Loading chunk XXX failed” white-screen problem after
 * a new deployment.
 */
export function RecoverFromChunkFail() {
  const hasReloaded = useRef(false)

  useEffect(() => {
    function shouldReload(e: any) {
      // Webpack 5 / Next 15 error signature
      const msg = (e?.reason && e.reason.message) || e?.message || (typeof e === "string" ? e : "")

      if (msg && /Loading chunk [\d]+ failed|ChunkLoadError/i.test(msg) && !hasReloaded.current) {
        hasReloaded.current = true
        // Clear caches so the browser doesn’t keep the bad reference
        if ("caches" in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
        }
        // Give the event loop one tick before reloading
        setTimeout(() => {
          window.location.reload()
        }, 50)
      }
    }

    window.addEventListener("error", shouldReload)
    window.addEventListener("unhandledrejection", shouldReload)
    return () => {
      window.removeEventListener("error", shouldReload)
      window.removeEventListener("unhandledrejection", shouldReload)
    }
  }, [])

  // Renders nothing – it’s just side-effects.
  return null
}
