"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Link
        href="/"
        className="fixed top-6 left-6 text-purple-600 hover:text-purple-800 transition-colors z-50"
        aria-label="Back to Home"
      >
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <LoginForm />
    </>
  )
} 
