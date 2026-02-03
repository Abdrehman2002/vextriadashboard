'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('vextria_role')
    if (role !== 'user') {
      window.location.href = '/'
    } else {
      setIsAuthorized(true)

      // Prefetch commonly accessed routes
      const routes = ['/user/overview', '/user/data', '/user/appointments', '/user/business-info']
      routes.forEach(route => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = route
        document.head.appendChild(link)
      })
    }
  }, [])

  if (!isAuthorized) {
    return null
  }

  return <DashboardLayout mode="user">{children}</DashboardLayout>
}
