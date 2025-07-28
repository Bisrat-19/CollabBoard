"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Users } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 p-2 sm:p-4">
      <div className="flex-1 w-full max-w-2xl mx-auto text-center flex flex-col justify-center">
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-indigo-200/40 relative">
            <Users className="h-8 w-8 sm:h-12 sm:w-12 text-white drop-shadow-lg" />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 sm:w-20 bg-indigo-400/30 rounded-full blur-sm" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent tracking-tight drop-shadow-sm mb-3 sm:mb-4">
          CollabBoard
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 font-light max-w-xs sm:max-w-xl mx-auto">
          The next-generation collaborative project management platform. Organize, track, and succeed together with your team in real time.
        </p>
        <Link href="/login">
          <button className="px-6 py-2 sm:px-8 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-base sm:text-lg shadow-lg hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-150">
            Get Started
          </button>
        </Link>
      </div>
      <footer className="text-gray-400 text-xs sm:text-sm text-center mt-10 sm:mt-16">
        &copy; {new Date().getFullYear()} CollabBoard. All rights reserved.
      </footer>
    </main>
  )
}
