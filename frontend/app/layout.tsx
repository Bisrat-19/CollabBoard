import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
/* NEW: */
import { RecoverFromChunkFail } from "@/components/recover-from-chunk-fail"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CollabBoard",
  description: "Manage projects, assign tasks, and collaborate efficiently with your team",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* Reload helper – must be a Client Component */}
          <RecoverFromChunkFail />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
