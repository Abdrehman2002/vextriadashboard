'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NeonOrbs } from '@/components/ui/neon-orbs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function Home() {
  const router = useRouter()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Preload data when landing page mounts
  useEffect(() => {
    // Prefetch overview data
    fetch('/api/overview').catch(() => {})
    fetch('/api/calendar/summary').catch(() => {})
    fetch('/api/sheets/rows').catch(() => {})

    // Prefetch calendar events for current month
    const now = new Date()
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    fetch(`/api/calendar/events?from=${now.toISOString()}&to=${nextMonth.toISOString()}`).catch(() => {})
  }, [])

  const handleRoleClick = (role: 'admin' | 'user') => {
    setSelectedRole(role)
    setPassword('')
    setError('')
    setShowPasswordDialog(true)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const isAdmin = selectedRole === 'admin'
    const expectedPassword = isAdmin ? 'admin123' : 'user123'

    if (password === expectedPassword) {
      localStorage.setItem('clario_role', selectedRole)
      console.log('Navigating to:', `/${selectedRole}/overview`)
      window.location.href = `/${selectedRole}/overview`
    } else {
      setError('Incorrect password')
      setIsLoading(false)
    }
  }

  return (
    <>
      <NeonOrbs>
        <div className="text-center max-w-3xl mx-auto px-4 w-full">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            Clario AI
          </h1>

          {/* Tagline */}
          <p className="mt-4 text-sm sm:text-base md:text-lg font-medium uppercase tracking-[0.25em] text-indigo-100/80">
            Beyond Limits
          </p>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-gray-200/80 max-w-xl mx-auto">
            Smart, always-on AI agents that book appointments, qualify leads, and keep
            your business running while you focus on the work that matters.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {/* Primary button */}
            <button
              onClick={() => handleRoleClick('user')}
              className="min-w-[160px] px-8 py-3 rounded-full text-white text-sm sm:text-base font-semibold
                         border border-white/15
                         shadow-[0_18px_45px_rgba(0,0,0,0.7)]
                         bg-gradient-to-br from-indigo-400 via-indigo-600 to-indigo-900
                         hover:from-indigo-300 hover:via-indigo-500 hover:to-indigo-900
                         transition-all duration-200
                         hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-300/70"
            >
              User View
            </button>

            {/* Secondary button */}
            <button
              onClick={() => handleRoleClick('admin')}
              className="min-w-[160px] px-8 py-3 rounded-full text-indigo-100 text-sm sm:text-base font-semibold
                         border border-indigo-400/60
                         bg-white/5 backdrop-blur-md
                         shadow-[0_18px_45px_rgba(0,0,0,0.65)]
                         hover:bg-white/10
                         transition-all duration-200
                         hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-300/70"
            >
              Admin View
            </button>
          </div>
        </div>
      </NeonOrbs>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedRole === 'admin' ? 'Admin' : 'User'} Login
            </DialogTitle>
            <DialogDescription>
              Enter your password to access the {selectedRole} dashboard
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Continue'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
