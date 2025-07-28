"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Users, Eye, EyeOff, Mail, Lock } from "lucide-react"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await login(email, password)

    if (result.success) {
      toast({
        title: "Welcome back! 🎉",
        description: "You have been successfully logged in.",
      })
    } else {
      toast({
        title: "Login failed",
        description: result.error || "Please check your credentials and try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await register(name, email, password)

    if (result.success) {
      toast({
        title: "Account created! 🎉",
        description: "Welcome to CollabBoard. You can now start collaborating.",
      })
    } else {
      toast({
        title: "Registration failed",
        description: result.error || "Please try again with different credentials.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-indigo-200/40 relative">
              <Users className="h-7 w-7 sm:h-10 sm:w-10 text-white drop-shadow-lg" />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 sm:w-16 bg-indigo-400/30 rounded-full blur-sm" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
            CollabBoard
          </h1>
          <p className="text-gray-500 mt-2 text-base sm:text-lg font-light">Collaborative Project Management, redefined.</p>
        </div>
        {/* Auth Tabs */}
        <Tabs defaultValue="login" className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-white/60 backdrop-blur-md rounded-lg shadow-sm overflow-hidden">
            <TabsTrigger value="login" className="text-xs sm:text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-200">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="text-xs sm:text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-200">
              Create Account
            </TabsTrigger>
          </TabsList>
          {/* Login Tab */}
          <TabsContent value="login" className="animate-fade-in">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl transition-all duration-300">
              <CardHeader className="space-y-1 pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-center tracking-tight">Welcome</CardTitle>
                <CardDescription className="text-center text-gray-500 text-sm sm:text-base">Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="h-11 pl-10 focus:ring-2 focus:ring-indigo-400/60 transition-all rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        className="h-11 pl-10 pr-10 focus:ring-2 focus:ring-indigo-400/60 transition-all rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg rounded-lg transition-transform duration-150 active:scale-95"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Register Tab */}
          <TabsContent value="register" className="animate-fade-in">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl transition-all duration-300">
              <CardHeader className="space-y-1 pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-center tracking-tight">Create Account</CardTitle>
                <CardDescription className="text-center text-gray-500 text-sm sm:text-base">
                  Join CollabBoard and start collaborating with your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input id="name" name="name" type="text" placeholder="Enter your name" required className="h-11 rounded-lg focus:ring-2 focus:ring-indigo-400/60 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="h-11 pl-10 focus:ring-2 focus:ring-indigo-400/60 transition-all rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <Input
                        id="password"
                        name="password"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        required
                        className="h-11 pl-10 pr-10 focus:ring-2 focus:ring-indigo-400/60 transition-all rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        tabIndex={-1}
                        aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg rounded-lg transition-transform duration-150 active:scale-95"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
                {/* Terms */}
                <p className="mt-3 sm:mt-4 text-xs text-center text-gray-500">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-purple-600 hover:underline font-medium">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-purple-600 hover:underline font-medium">
                    Privacy Policy
                  </a>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Footer */}
        <div className="mt-8 sm:mt-10 border-t border-indigo-100 pt-4 sm:pt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Need help?{" "}
            <a href="#" className="text-purple-600 hover:underline font-semibold">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
