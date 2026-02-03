'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('vextria_role')
    if (role !== 'admin') {
      window.location.href = '/'
    } else {
      setIsAuthorized(true)

      // Prefetch commonly accessed routes
      const routes = ['/admin/overview', '/admin/data', '/admin/appointments', '/admin/business-info']
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

  return <DashboardLayout mode="admin">{children}</DashboardLayout>
}
