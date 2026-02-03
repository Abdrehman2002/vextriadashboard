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
      localStorage.setItem('vextria_role', selectedRole)
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Primary button - User View */}
          <button
            onClick={() => handleRoleClick('user')}
            className="min-w-[160px] px-8 py-3 rounded-full text-white text-sm sm:text-base font-semibold
                       border border-blue-400/30
                       shadow-[0_0_30px_rgba(59,130,246,0.3)]
                       bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700
                       hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]
                       hover:from-blue-400 hover:via-blue-500 hover:to-blue-600
                       transition-all duration-1000 ease-out
                       hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400/70
                       animate-fade-in opacity-0"
            style={{ animationDelay: '2000ms', animationFillMode: 'forwards' }}
          >
            User View
          </button>

          {/* Secondary button - Admin View */}
          <button
            onClick={() => handleRoleClick('admin')}
            className="min-w-[160px] px-8 py-3 rounded-full text-blue-100 text-sm sm:text-base font-semibold
                       border border-blue-400/50
                       bg-white/5 backdrop-blur-md
                       shadow-[0_0_20px_rgba(59,130,246,0.2)]
                       hover:bg-blue-500/10
                       hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]
                       transition-all duration-1000 ease-out
                       hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400/70
                       animate-fade-in opacity-0"
            style={{ animationDelay: '2100ms', animationFillMode: 'forwards' }}
          >
            Admin View
          </button>
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] border-blue-400/30 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
