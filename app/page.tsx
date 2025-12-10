'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BackgroundCircles } from '@/components/ui/background-circles'
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
      <BackgroundCircles
        onUserClick={() => handleRoleClick('user')}
        onAdminClick={() => handleRoleClick('admin')}
      />

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
